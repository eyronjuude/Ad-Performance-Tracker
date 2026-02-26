"""BigQuery sample and performance data API."""

import json
import os
import re
import threading
import time as _time
from datetime import date, datetime, time
from decimal import Decimal
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from google.cloud import bigquery
from google.oauth2 import service_account

router = APIRouter(prefix="/bigquery", tags=["bigquery"])

SAMPLE_LIMIT = 5
PERFORMANCE_CACHE_TTL_SECONDS = int(os.environ.get("PERFORMANCE_CACHE_TTL", "300"))

COL_AD_NAME = "ad_name"
COL_ADSET_NAME = "adset_name"
COL_SPEND = "spend_sum"
COL_REVENUE = "placed_order_total_revenue_sum_direct_session"


def _get_bigquery_credentials():
    """
    Resolve credentials for BigQuery.
    - If GOOGLE_CREDENTIALS_JSON is set: use JSON from env (for Railway/serverless).
    - Else if GOOGLE_APPLICATION_CREDENTIALS is set: use file path (standard).
    - Else: use Application Default Credentials.
    """
    credentials_json = os.environ.get("GOOGLE_CREDENTIALS_JSON", "").strip()
    if credentials_json:
        info = json.loads(credentials_json)
        return service_account.Credentials.from_service_account_info(info)
    return None


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


_bq_client: bigquery.Client | None = None
_bq_client_lock = threading.Lock()


def get_bigquery_client() -> bigquery.Client:
    """Return a shared BigQuery client, creating it once on first use."""
    global _bq_client
    if _bq_client is not None:
        return _bq_client
    with _bq_client_lock:
        if _bq_client is not None:
            return _bq_client
        project = os.environ.get("GCP_PROJECT")
        if not project:
            raise HTTPException(
                status_code=503,
                detail="GCP_PROJECT is not set; BigQuery is not configured",
            )
        credentials = _get_bigquery_credentials()
        try:
            if credentials:
                _bq_client = bigquery.Client(project=project, credentials=credentials)
            else:
                _bq_client = bigquery.Client(project=project)
        except Exception as e:
            raise HTTPException(
                status_code=503,
                detail=f"BigQuery client failed: {e!s}",
            ) from e
        return _bq_client


_performance_cache: dict[str, tuple[float, list[dict[str, Any]]]] = {}
_cache_lock = threading.Lock()


def _get_cached_performance(
    acronym: str,
) -> list[dict[str, Any]] | None:
    """Return cached result if present and not expired, else None."""
    with _cache_lock:
        entry = _performance_cache.get(acronym)
        if entry is None:
            return None
        cached_at, data = entry
        if _time.monotonic() - cached_at > PERFORMANCE_CACHE_TTL_SECONDS:
            del _performance_cache[acronym]
            return None
        return data


def _set_cached_performance(acronym: str, data: list[dict[str, Any]]) -> None:
    with _cache_lock:
        _performance_cache[acronym] = (_time.monotonic(), data)


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


def _acronym_word_regex(acronym: str) -> str:
    """Build RE2 regex for acronym as word in adset_name (non-letters only)."""
    escaped = re.escape(acronym.strip().lower())
    return f"(^|[^a-zA-Z]){escaped}([^a-zA-Z]|$)"


def _build_performance_query(full_table: str) -> str:
    """Build SQL for P1 + employee_acronym filter, dedup by ad_name, adset_name.

    - P1: substring 'P1' in ad_name (case-insensitive; may be surrounded by symbols).
    - employee_acronym: substring in adset_name as a word—surrounded only by non-letters
      (e.g. CPA does not match CP; SC_P_HM_US matches HM).
    """
    # Filter: P1 in ad_name; acronym as word in adset_name (@acronym_regex).
    # Dedupe: GROUP BY ad_name, adset_name; SUM(spend); cROAS = SUM(revenue)/SUM(spend).
    return f"""
    SELECT
        {COL_AD_NAME} AS ad_name,
        {COL_ADSET_NAME} AS adset_name,
        SUM({COL_SPEND}) AS spend,
        SAFE_DIVIDE(SUM({COL_REVENUE}), SUM({COL_SPEND})) AS croas
    FROM {full_table}
    WHERE LOWER({COL_AD_NAME}) LIKE '%p1%'
      AND REGEXP_CONTAINS(LOWER({COL_ADSET_NAME}), @acronym_regex)
    GROUP BY {COL_AD_NAME}, {COL_ADSET_NAME}
    ORDER BY spend DESC
    """


@router.get("/performance", response_model=list[dict[str, Any]])
def get_performance(
    client: bigquery.Client = Depends(get_bigquery_client),
    employee_acronym: str = Query(
        ...,
        min_length=1,
        description="Acronym as word in adset_name (non-letters only)",
    ),
) -> list[dict[str, Any]]:
    """
    Return deduplicated ad performance for P1 campaigns by employee acronym.

    Results are cached in-memory for PERFORMANCE_CACHE_TTL seconds (default 300)
    to avoid redundant BigQuery round-trips.
    """
    cache_key = employee_acronym.strip().lower()
    cached = _get_cached_performance(cache_key)
    if cached is not None:
        return cached

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
    acronym_regex = _acronym_word_regex(employee_acronym)
    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("acronym_regex", "STRING", acronym_regex),
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

    _set_cached_performance(cache_key, out)
    return out
