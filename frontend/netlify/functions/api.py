"""Netlify Function entry point — wraps the FastAPI app with Mangum."""

import sys
import os
from pathlib import Path

# Ensure backend/ and src/ are importable.  This file lives at
# frontend/netlify/functions/api.py, so we go up 4 levels to reach the repo root.
REPO_ROOT = Path(__file__).resolve().parent.parent.parent.parent

for subdir in ("backend", "src"):
    p = str(REPO_ROOT / subdir)
    if p not in sys.path:
        sys.path.insert(0, p)

# Tell the backend it's running inside a Netlify Function so it skips
# static-file serving (Netlify's CDN handles the frontend).
os.environ["NETLIFY_FUNCTION"] = "1"

from app.main import app          # noqa: E402
from mangum import Mangum         # noqa: E402

handler = Mangum(app, lifespan="off")
