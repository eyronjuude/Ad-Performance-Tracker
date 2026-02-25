"""Settings API backed by SQLite for shared persistence across users."""

import json
import os
import sqlite3
from pathlib import Path
from typing import Any

from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/settings", tags=["settings"])


def _get_db_path() -> Path:
    path = os.environ.get("DATABASE_PATH")
    if path:
        return Path(path)
    # Default: backend/data/settings.db (persists across deploys if volume mounted)
    base = Path(__file__).resolve().parent.parent
    data_dir = base / "data"
    data_dir.mkdir(exist_ok=True)
    return data_dir / "settings.db"


def _get_connection() -> sqlite3.Connection:
    db_path = _get_db_path()
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    return conn


def _init_db(conn: sqlite3.Connection) -> None:
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            updated_at TEXT DEFAULT (datetime('now'))
        )
        """
    )
    conn.commit()


def _get_settings_raw(conn: sqlite3.Connection) -> str | None:
    cur = conn.execute("SELECT value FROM settings WHERE key = 'app'")
    row = cur.fetchone()
    return row["value"] if row else None


def _save_settings(conn: sqlite3.Connection, value: str) -> None:
    conn.execute(
        """
        INSERT OR REPLACE INTO settings (key, value, updated_at)
        VALUES ('app', ?, datetime('now'))
        """,
        (value,),
    )
    conn.commit()


def _default_settings() -> dict[str, Any]:
    """Default settings when no stored value exists."""
    return {
        "employees": [
            {"acronym": "HM", "name": "Employee HM"},
            {"acronym": "ABC", "name": "Employee ABC"},
            {"acronym": "XYZ", "name": "Employee XYZ"},
        ],
        "spendEvaluationKey": [
            {"min": 20000, "max": None, "color": "green"},
            {"min": 10000, "max": 20000, "color": "yellow"},
            {"min": 0, "max": 10000, "color": "red"},
        ],
        "croasEvaluationKey": [
            {"min": 3, "max": None, "color": "green"},
            {"min": 1, "max": 3, "color": "yellow"},
            {"min": 0, "max": 1, "color": "red"},
        ],
        "periods": ["P1"],
    }


@router.get("", response_model=dict[str, Any])
def get_settings() -> dict[str, Any]:
    """
    Return app settings (employee mapping, evaluation thresholds, periods).
    Stored in SQLite; shared across all users.
    """
    try:
        conn = _get_connection()
        try:
            _init_db(conn)
            raw = _get_settings_raw(conn)
            if raw is None:
                return _default_settings()
            return json.loads(raw)
        finally:
            conn.close()
    except (sqlite3.Error, json.JSONDecodeError) as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to load settings: {e!s}"
        ) from e


@router.put("", response_model=dict[str, Any])
def put_settings(settings: dict[str, Any]) -> dict[str, Any]:
    """
    Update app settings. Replaces stored settings with the request body.
    Shared across all users.
    """
    try:
        serialized = json.dumps(settings)
        conn = _get_connection()
        try:
            _init_db(conn)
            _save_settings(conn, serialized)
            return settings
        finally:
            conn.close()
    except (sqlite3.Error, TypeError, ValueError) as e:
        raise HTTPException(
            status_code=400, detail=f"Failed to save settings: {e!s}"
        ) from e
