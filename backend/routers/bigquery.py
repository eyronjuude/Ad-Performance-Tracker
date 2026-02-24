"""BigQuery sample data API."""

import os
from datetime import date, datetime, time
from decimal import Decimal
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from google.cloud import bigquery

router = APIRouter(prefix="/bigquery", tags=["bigquery"])

SAMPLE_LIMIT = 5


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
