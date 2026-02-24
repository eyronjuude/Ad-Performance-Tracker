from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI

from routers import bigquery

load_dotenv(Path(__file__).resolve().parent / ".env")

app = FastAPI(title="Ad Performance Tracker API", version="0.1.0")
app.include_router(bigquery.router, prefix="/api")


@app.get("/health")
def health() -> dict[str, str]:
    """Health check endpoint for readiness probes."""
    return {"status": "ok"}


@app.get("/")
def root() -> dict[str, str]:
    """Root endpoint."""
    return {"message": "Ad Performance Tracker API"}
