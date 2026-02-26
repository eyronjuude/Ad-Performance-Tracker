"""Pytest fixtures for FastAPI tests."""

import pytest
from fastapi.testclient import TestClient

from main import app
from routers.bigquery import _performance_cache


@pytest.fixture(autouse=True)
def _clear_performance_cache():
    """Ensure the in-memory performance cache is empty for each test."""
    _performance_cache.clear()
    yield
    _performance_cache.clear()


@pytest.fixture
def client() -> TestClient:
    """Provide an in-memory HTTP client for the FastAPI app."""
    return TestClient(app)
