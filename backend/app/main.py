"""OpenPyTEA GUI - FastAPI Backend."""

import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.routers import equipment, plant, analysis, io

app = FastAPI(title="OpenPyTEA GUI", version="2.0.0")

# Production mode: STATIC_DIR env var overrides auto-detection
STATIC_DIR = os.environ.get("STATIC_DIR")
if STATIC_DIR:
    FRONTEND_DIST = Path(STATIC_DIR)
    PRODUCTION = True
else:
    FRONTEND_DIST = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
    PRODUCTION = FRONTEND_DIST.exists() and (FRONTEND_DIST / "index.html").exists()

if PRODUCTION:
    origins = ["*"]
else:
    origins = ["http://localhost:5173", "http://127.0.0.1:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(equipment.router, prefix="/api/equipment", tags=["equipment"])
app.include_router(plant.router, prefix="/api/plant", tags=["plant"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["analysis"])
app.include_router(io.router, prefix="/api/project", tags=["project"])


@app.get("/api/health")
def health():
    return {"status": "ok"}


# Serve production frontend (SPA fallback)
if PRODUCTION:
    assets_dir = FRONTEND_DIST / "assets"
    if assets_dir.is_dir():
        app.mount(
            "/assets",
            StaticFiles(directory=str(assets_dir)),
            name="assets",
        )

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        file = FRONTEND_DIST / full_path
        if file.is_file() and file.suffix in {
            ".html", ".js", ".css", ".json", ".png", ".svg",
            ".ico", ".webp", ".mp4", ".ipynb", ".txt",
        }:
            return FileResponse(str(file))
        return FileResponse(str(FRONTEND_DIST / "index.html"))
