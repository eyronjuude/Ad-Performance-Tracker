from fastapi import FastAPI

app = FastAPI(title="Ad Performance Tracker API", version="0.1.0")


@app.get("/health")
def health() -> dict[str, str]:
    """Health check endpoint for readiness probes."""
    return {"status": "ok"}


@app.get("/")
def root() -> dict[str, str]:
    """Root endpoint."""
    return {"message": "Ad Performance Tracker API"}
