"""Tests for settings API."""

import os
import tempfile

import pytest
from fastapi.testclient import TestClient

from main import app


@pytest.fixture
def temp_db(monkeypatch):
    """Use a temporary SQLite file for settings tests."""
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as f:
        path = f.name
    try:
        monkeypatch.setenv("DATABASE_PATH", path)
        yield path
    finally:
        if os.path.exists(path):
            os.unlink(path)


@pytest.fixture
def client(temp_db):
    return TestClient(app)


def test_get_settings_returns_defaults_when_empty(client):
    resp = client.get("/api/settings")
    assert resp.status_code == 200
    data = resp.json()
    assert "employees" in data
    assert "spendEvaluationKey" in data
    assert "croasEvaluationKey" in data
    assert "periods" in data
    assert data["periods"] == ["P1"]


def test_put_and_get_settings(client):
    settings = {
        "employees": [{"acronym": "HM", "name": "Heather Miller"}],
        "spendEvaluationKey": [{"min": 1000, "max": None, "color": "green"}],
        "croasEvaluationKey": [{"min": 2, "max": None, "color": "green"}],
        "periods": ["P1", "P2"],
    }
    resp = client.put("/api/settings", json=settings)
    assert resp.status_code == 200
    assert resp.json() == settings

    resp2 = client.get("/api/settings")
    assert resp2.status_code == 200
    assert resp2.json() == settings


def test_put_settings_persists_across_requests(client):
    settings = {"employees": [{"acronym": "X", "name": "Test"}], "periods": ["P1"]}
    client.put("/api/settings", json=settings)
    resp = client.get("/api/settings")
    assert resp.json()["employees"][0]["name"] == "Test"
