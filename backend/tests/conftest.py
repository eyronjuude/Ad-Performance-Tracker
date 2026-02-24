"""Pytest fixtures for FastAPI tests."""

import pytest
from fastapi.testclient import TestClient

from main import app


@pytest.fixture
def client() -> TestClient:
    """Provide an in-memory HTTP client for the FastAPI app."""
    return TestClient(app)
