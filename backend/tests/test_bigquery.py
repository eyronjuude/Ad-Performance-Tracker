"""Tests for BigQuery sample endpoint."""

import os
from unittest.mock import MagicMock

from fastapi.testclient import TestClient

from main import app
from routers.bigquery import get_bigquery_client


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
            status_code=503, detail="GCP_PROJECT is not set; BigQuery is not configured"
        )

    app.dependency_overrides[get_bigquery_client] = fail_client
    try:
        with client:
            response = client.get("/api/bigquery/sample")
        assert response.status_code == 503
    finally:
        app.dependency_overrides.clear()
