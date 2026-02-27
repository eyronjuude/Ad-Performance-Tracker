"""Settings API backed by Postgres (Neon) or SQLite for shared persistence."""

import json
import os
import sqlite3
from pathlib import Path
from typing import Any

from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/settings", tags=["settings"])

_USE_POSTGRES = bool(os.environ.get("DATABASE_URL", "").strip())


def _get_sqlite_db_path() -> Path:
    path = os.environ.get("DATABASE_PATH")
    if path:
        return Path(path)
    base = Path(__file__).resolve().parent.parent
    data_dir = base / "data"
    data_dir.mkdir(exist_ok=True)
    return data_dir / "settings.db"


def _default_settings() -> dict[str, Any]:
    """Default settings when no stored value exists."""
    return {
        "employees": [
            {
                "acronym": "HM",
                "name": "Employee HM",
                "status": "tenured",
                "startDate": None,
                "reviewDate": None,
            },
            {
                "acronym": "ABC",
                "name": "Employee ABC",
                "status": "tenured",
                "startDate": None,
                "reviewDate": None,
            },
            {
                "acronym": "XYZ",
                "name": "Employee XYZ",
                "status": "tenured",
                "startDate": None,
                "reviewDate": None,
            },
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


def _get_settings_postgres() -> dict[str, Any]:
    import psycopg

    url = os.environ["DATABASE_URL"]
    with psycopg.connect(url) as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS settings (
                    key TEXT PRIMARY KEY,
                    value TEXT NOT NULL,
                    updated_at TIMESTAMPTZ DEFAULT now()
                )
                """
            )
            conn.commit()
            cur.execute("SELECT value FROM settings WHERE key = %s", ("app",))
            row = cur.fetchone()
    raw = row[0] if row else None
    if raw is None:
        return _default_settings()
    return json.loads(raw)


def _save_settings_postgres(settings: dict[str, Any]) -> dict[str, Any]:
    import psycopg

    url = os.environ["DATABASE_URL"]
    value = json.dumps(settings)
    with psycopg.connect(url) as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS settings (
                    key TEXT PRIMARY KEY,
                    value TEXT NOT NULL,
                    updated_at TIMESTAMPTZ DEFAULT now()
                )
                """
            )
            cur.execute(
                """
                INSERT INTO settings (key, value, updated_at)
                VALUES ('app', %s, now())
                ON CONFLICT (key) DO UPDATE SET
                    value = EXCLUDED.value,
                    updated_at = EXCLUDED.updated_at
                """,
                (value,),
            )
            conn.commit()
    return settings


def _get_settings_sqlite() -> dict[str, Any]:
    db_path = _get_sqlite_db_path()
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    try:
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
        cur = conn.execute("SELECT value FROM settings WHERE key = 'app'")
        row = cur.fetchone()
        raw = row["value"] if row else None
        if raw is None:
            return _default_settings()
        return json.loads(raw)
    finally:
        conn.close()


def _save_settings_sqlite(settings: dict[str, Any]) -> dict[str, Any]:
    value = json.dumps(settings)
    db_path = _get_sqlite_db_path()
    conn = sqlite3.connect(str(db_path))
    try:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL,
                updated_at TEXT DEFAULT (datetime('now'))
            )
            """
        )
        conn.execute(
            """
            INSERT OR REPLACE INTO settings (key, value, updated_at)
            VALUES ('app', ?, datetime('now'))
            """,
            (value,),
        )
        conn.commit()
        return settings
    finally:
        conn.close()


@router.get("", response_model=dict[str, Any])
def get_settings() -> dict[str, Any]:
    """
    Return app settings (employee mapping, evaluation thresholds, periods).
    Uses Postgres (Neon) when DATABASE_URL is set, else SQLite.
    """
    try:
        if _USE_POSTGRES:
            return _get_settings_postgres()
        return _get_settings_sqlite()
    except (sqlite3.Error, json.JSONDecodeError) as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to load settings: {e!s}"
        ) from e
    except Exception as e:
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
        if _USE_POSTGRES:
            return _save_settings_postgres(settings)
        return _save_settings_sqlite(settings)
    except (sqlite3.Error, TypeError, ValueError) as e:
        raise HTTPException(
            status_code=400, detail=f"Failed to save settings: {e!s}"
        ) from e
    except Exception as e:
        raise HTTPException(
            status_code=400, detail=f"Failed to save settings: {e!s}"
        ) from e
