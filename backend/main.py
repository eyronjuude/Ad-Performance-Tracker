import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import bigquery, settings

load_dotenv(Path(__file__).resolve().parent / ".env")

app = FastAPI(title="Ad Performance Tracker API", version="0.1.0")
_cors_origins = ["http://localhost:3000", "http://127.0.0.1:3000"]
if extra := os.environ.get("CORS_ORIGINS", "").strip():
    _cors_origins.extend(o.strip() for o in extra.split(",") if o.strip())
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(bigquery.router, prefix="/api")
app.include_router(settings.router, prefix="/api")


@app.get("/health")
def health() -> dict[str, str]:
    """Health check endpoint for readiness probes."""
    return {"status": "ok"}


@app.get("/")
def root() -> dict[str, str]:
    """Root endpoint."""
    return {"message": "Ad Performance Tracker API"}
