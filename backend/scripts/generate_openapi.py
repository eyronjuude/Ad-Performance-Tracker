"""
Export FastAPI OpenAPI schema to docs/openapi.json.

Run from the backend directory:
    python scripts/generate_openapi.py
"""

import json
import sys
from pathlib import Path

# Ensure backend is on path so main is importable
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from main import app  # noqa: E402  # pylint: disable=import-error (run from backend/)

repo_root = backend_dir.parent
out_path = repo_root / "docs" / "openapi.json"
out_path.parent.mkdir(parents=True, exist_ok=True)
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(app.openapi(), f, indent=2)
print(f"Wrote {out_path}")
