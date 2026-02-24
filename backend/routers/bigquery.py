"""BigQuery sample and performance data API."""

import os
from datetime import date, datetime, time
from decimal import Decimal
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from google.cloud import bigquery

router = APIRouter(prefix="/bigquery", tags=["bigquery"])

SAMPLE_LIMIT = 5

# Column names for the ad performance table (used in filtering and deduplication)
COL_AD_NAME = "ad_name"
COL_SPEND = "spend"
COL_CROAS = "croas"
COL_PRIORITY = "priority"
COL_EMPLOYEE_ACRONYM = "employee_acronym"
PRIORITY_P1 = "P1"


def _json_serial(value: Any) -> Any:
    """Convert a value to a JSON-serializable form."""
    if value is None:
        return None
    if isinstance(value, (datetime, date, time)):
        return value.isoformat()
    if isinstance(value, Decimal):
        return float(value)
    if isinstance(value, bytes):
        return value.hex()
    if isinstance(value, dict):
        return {k: _json_serial(v) for k, v in value.items()}
    if isinstance(value, (list, tuple)):
        return [_json_serial(v) for v in value]
    return value


def get_bigquery_client() -> bigquery.Client:
    """Provide a BigQuery client using env-configured project and credentials."""
    project = os.environ.get("GCP_PROJECT")
    if not project:
        raise HTTPException(
            status_code=503,
            detail="GCP_PROJECT is not set; BigQuery is not configured",
        )
    try:
        return bigquery.Client(project=project)
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"BigQuery client failed: {e!s}",
        ) from e


@router.get("/sample", response_model=list[dict[str, Any]])
def get_sample_rows(
    client: bigquery.Client = Depends(get_bigquery_client),
) -> list[dict[str, Any]]:
    """
    Return up to 5 rows from the configured BigQuery table.
    Requires GCP_PROJECT, BIGQUERY_DATASET, and BIGQUERY_TABLE to be set.
    """
    project = os.environ.get("GCP_PROJECT")
    dataset = os.environ.get("BIGQUERY_DATASET")
    table = os.environ.get("BIGQUERY_TABLE")
    if not project or not dataset or not table:
        raise HTTPException(
            status_code=503,
            detail=(
                "BigQuery table not configured: set GCP_PROJECT, "
                "BIGQUERY_DATASET, BIGQUERY_TABLE"
            ),
        )
    # Use backticks for safe identifier quoting (project.dataset.table)
    full_table = f"`{project}`.`{dataset}`.`{table}`"
    query = f"SELECT * FROM {full_table} LIMIT {SAMPLE_LIMIT}"
    try:
        query_job = client.query(query)
        rows = list(query_job.result(max_results=SAMPLE_LIMIT))
    except Exception as e:
        raise HTTPException(
            status_code=502, detail=f"BigQuery request failed: {e!s}"
        ) from e
    # Convert Row to dict and ensure JSON-serializable values
    out: list[dict[str, Any]] = []
    for row in rows:
        raw = dict(row)
        out.append({k: _json_serial(v) for k, v in raw.items()})
    return out


def _build_performance_query(full_table: str) -> str:
    """Build parameterized SQL for P1 + employee_acronym filter and dedup by ad_name."""
    # Filter: P1 only, specific employee_acronym (param @acronym).
    # Dedupe: GROUP BY ad_name; SUM(spend); blend cROAS as spend-weighted average.
    return f"""
    SELECT
        {COL_AD_NAME} AS ad_name,
        SUM({COL_SPEND}) AS spend,
        SAFE_DIVIDE(SUM({COL_CROAS} * {COL_SPEND}), SUM({COL_SPEND})) AS croas
    FROM {full_table}
    WHERE LOWER(TRIM({COL_PRIORITY})) = LOWER(TRIM(@priority))
      AND LOWER(TRIM({COL_EMPLOYEE_ACRONYM})) = LOWER(TRIM(@acronym))
    GROUP BY {COL_AD_NAME}
    ORDER BY spend DESC
    """


@router.get("/performance", response_model=list[dict[str, Any]])
def get_performance(
    client: bigquery.Client = Depends(get_bigquery_client),
    employee_acronym: str = Query(
        ..., min_length=1, description="Employee acronym to filter by"
    ),
) -> list[dict[str, Any]]:
    """
    Return deduplicated ad performance for P1 campaigns by employee acronym.
    Same ad_name merged: spend summed, cROAS spend-weighted average.
    Requires GCP_PROJECT, BIGQUERY_DATASET, BIGQUERY_TABLE.
    """
    project = os.environ.get("GCP_PROJECT")
    dataset = os.environ.get("BIGQUERY_DATASET")
    table = os.environ.get("BIGQUERY_TABLE")
    if not project or not dataset or not table:
        raise HTTPException(
            status_code=503,
            detail=(
                "BigQuery table not configured: set GCP_PROJECT, "
                "BIGQUERY_DATASET, BIGQUERY_TABLE"
            ),
        )
    full_table = f"`{project}`.`{dataset}`.`{table}`"
    query = _build_performance_query(full_table)
    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("priority", "STRING", PRIORITY_P1),
            bigquery.ScalarQueryParameter(
                "acronym", "STRING", employee_acronym.strip()
            ),
        ]
    )
    try:
        query_job = client.query(query, job_config=job_config)
        rows = list(query_job.result())
    except Exception as e:
        raise HTTPException(
            status_code=502, detail=f"BigQuery request failed: {e!s}"
        ) from e
    out: list[dict[str, Any]] = []
    for row in rows:
        raw = dict(row)
        out.append({k: _json_serial(v) for k, v in raw.items()})
    return out
