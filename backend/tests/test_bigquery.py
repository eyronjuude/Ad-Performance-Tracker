"""Tests for BigQuery sample and performance endpoints."""

import os
from unittest.mock import MagicMock

from fastapi.testclient import TestClient

from main import app
from routers.bigquery import (
    _acronym_word_regex,
    _build_performance_query,
    get_bigquery_client,
)


def test_get_sample_returns_up_to_five_rows(client: TestClient) -> None:
    """GET /api/bigquery/sample returns 200 with a list of at most 5 rows."""
    mock_rows = [
        {"id": 1, "name": "a"},
        {"id": 2, "name": "b"},
    ]
    mock_job = MagicMock()
    mock_job.result.return_value = mock_rows
    mock_bq = MagicMock()
    mock_bq.query.return_value = mock_job

    app.dependency_overrides[get_bigquery_client] = lambda: mock_bq
    os.environ["GCP_PROJECT"] = "test-project"
    os.environ["BIGQUERY_DATASET"] = "test_dataset"
    os.environ["BIGQUERY_TABLE"] = "test_table"
    try:
        with client:
            response = client.get("/api/bigquery/sample")
    finally:
        app.dependency_overrides.clear()
        for key in ("GCP_PROJECT", "BIGQUERY_DATASET", "BIGQUERY_TABLE"):
            os.environ.pop(key, None)

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 2
    assert data[0]["id"] == 1 and data[0]["name"] == "a"
    assert data[1]["id"] == 2 and data[1]["name"] == "b"


def test_get_sample_requires_bigquery_config(client: TestClient) -> None:
    """GET /api/bigquery/sample returns 503 when BigQuery env vars are unset."""
    mock_bq = MagicMock()
    app.dependency_overrides[get_bigquery_client] = lambda: mock_bq
    orig_project = os.environ.pop("GCP_PROJECT", None)
    orig_dataset = os.environ.pop("BIGQUERY_DATASET", None)
    orig_table = os.environ.pop("BIGQUERY_TABLE", None)
    try:
        with client:
            response = client.get("/api/bigquery/sample")
        assert response.status_code == 503
        assert "not configured" in response.json()["detail"].lower()
    finally:
        app.dependency_overrides.clear()
        if orig_project is not None:
            os.environ["GCP_PROJECT"] = orig_project
        if orig_dataset is not None:
            os.environ["BIGQUERY_DATASET"] = orig_dataset
        if orig_table is not None:
            os.environ["BIGQUERY_TABLE"] = orig_table


def test_get_sample_returns_503_when_client_dependency_fails(
    client: TestClient,
) -> None:
    """GET /api/bigquery/sample returns 503 when BigQuery client cannot be created."""
    from fastapi import HTTPException

    def fail_client() -> None:
        raise HTTPException(
            status_code=503,
            detail="GCP_PROJECT is not set; BigQuery is not configured",
        )

    app.dependency_overrides[get_bigquery_client] = fail_client
    try:
        with client:
            response = client.get("/api/bigquery/sample")
        assert response.status_code == 503
    finally:
        app.dependency_overrides.clear()


# --- Performance endpoint (filter P1 + employee acronym, deduplication) ---


def test_get_performance_returns_200_with_deduplicated_shape(
    client: TestClient,
) -> None:
    """Performance returns 200 with ad_name, adset_name, spend, croas per row."""
    mock_rows = [
        {"ad_name": "Ad A", "adset_name": "Adset X", "spend": 100.0, "croas": 2.5},
        {"ad_name": "Ad B", "adset_name": "Adset Y", "spend": 50.0, "croas": 1.8},
    ]
    mock_job = MagicMock()
    mock_job.result.return_value = mock_rows
    mock_bq = MagicMock()
    mock_bq.query.return_value = mock_job

    app.dependency_overrides[get_bigquery_client] = lambda: mock_bq
    os.environ["GCP_PROJECT"] = "p"
    os.environ["BIGQUERY_DATASET"] = "d"
    os.environ["BIGQUERY_TABLE"] = "t"
    try:
        with client:
            response = client.get("/api/bigquery/performance?employee_acronym=ABC")
    finally:
        app.dependency_overrides.clear()
        for key in ("GCP_PROJECT", "BIGQUERY_DATASET", "BIGQUERY_TABLE"):
            os.environ.pop(key, None)

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 2
    assert (
        data[0]["ad_name"] == "Ad A"
        and data[0]["adset_name"] == "Adset X"
        and data[0]["spend"] == 100.0
        and data[0]["croas"] == 2.5
    )
    assert (
        data[1]["ad_name"] == "Ad B"
        and data[1]["adset_name"] == "Adset Y"
        and data[1]["spend"] == 50.0
        and data[1]["croas"] == 1.8
    )


def test_get_performance_query_uses_filter_and_dedup(client: TestClient) -> None:
    """Performance query: P1 + employee_acronym filter, dedup by ad_name, adset_name."""
    mock_job = MagicMock()
    mock_job.result.return_value = []
    mock_bq = MagicMock()
    mock_bq.query.return_value = mock_job

    app.dependency_overrides[get_bigquery_client] = lambda: mock_bq
    os.environ["GCP_PROJECT"] = "p"
    os.environ["BIGQUERY_DATASET"] = "d"
    os.environ["BIGQUERY_TABLE"] = "t"
    try:
        with client:
            client.get("/api/bigquery/performance?employee_acronym=XY")
        call_args = mock_bq.query.call_args
        query = call_args[0][0]
        job_config = call_args[1]["job_config"]
    finally:
        app.dependency_overrides.clear()
        for key in ("GCP_PROJECT", "BIGQUERY_DATASET", "BIGQUERY_TABLE"):
            os.environ.pop(key, None)

    assert "p1" in query.lower() and "ad_name" in query
    assert "adset_name" in query and "REGEXP_CONTAINS" in query
    assert "GROUP BY" in query and "ad_name" in query and "adset_name" in query
    assert "SUM(" in query and "spend_sum" in query
    assert (
        "SAFE_DIVIDE" in query
        and "placed_order_total_revenue_sum_direct_session" in query
    )
    params = {p.name: p.value for p in job_config.query_parameters}
    assert params.get("acronym_regex") == "(^|[^a-zA-Z])xy([^a-zA-Z]|$)"


def test_get_performance_requires_employee_acronym(client: TestClient) -> None:
    """GET /api/bigquery/performance without employee_acronym returns 422."""
    mock_bq = MagicMock()
    app.dependency_overrides[get_bigquery_client] = lambda: mock_bq
    os.environ["GCP_PROJECT"] = "p"
    os.environ["BIGQUERY_DATASET"] = "d"
    os.environ["BIGQUERY_TABLE"] = "t"
    try:
        with client:
            response = client.get("/api/bigquery/performance")
        assert response.status_code == 422
    finally:
        app.dependency_overrides.clear()
        for key in ("GCP_PROJECT", "BIGQUERY_DATASET", "BIGQUERY_TABLE"):
            os.environ.pop(key, None)


def test_acronym_word_regex() -> None:
    """Acronym regex matches word-boundary only (surrounded by non-letters)."""
    assert _acronym_word_regex("HM") == "(^|[^a-zA-Z])hm([^a-zA-Z]|$)"
    assert _acronym_word_regex("CP") == "(^|[^a-zA-Z])cp([^a-zA-Z]|$)"


def test_build_performance_query_deduplication_and_blend() -> None:
    """Query merges by ad_name, adset_name; sums spend; cROAS = revenue/spend."""
    full_table = "`p`.`d`.`t`"
    query = _build_performance_query(full_table)
    assert "GROUP BY" in query and "ad_name" in query and "adset_name" in query
    assert "SUM(spend_sum)" in query or "SUM( spend_sum )" in query
    assert "SAFE_DIVIDE" in query
    assert "placed_order_total_revenue_sum_direct_session" in query
    assert "ORDER BY spend DESC" in query
    assert "adset_name" in query and "REGEXP_CONTAINS" in query
    assert "%p1%" in query


def test_get_performance_returns_503_when_not_configured(client: TestClient) -> None:
    """GET /api/bigquery/performance returns 503 when BigQuery env vars are unset."""
    mock_bq = MagicMock()
    app.dependency_overrides[get_bigquery_client] = lambda: mock_bq
    orig = {
        k: os.environ.pop(k, None)
        for k in ("GCP_PROJECT", "BIGQUERY_DATASET", "BIGQUERY_TABLE")
    }
    try:
        with client:
            response = client.get("/api/bigquery/performance?employee_acronym=A")
        assert response.status_code == 503
        assert "not configured" in response.json()["detail"].lower()
    finally:
        app.dependency_overrides.clear()
        for k, v in orig.items():
            if v is not None:
                os.environ[k] = v
