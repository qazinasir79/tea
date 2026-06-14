#!/usr/bin/env bash
# OpenPyTEA Web App — unified launcher
# Usage:
#   ./start.sh              # development (frontend + backend)
#   ./start.sh --prod       # production  (backend serves built frontend)
#   ./start.sh --build      # build frontend, then run production
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
VENV="$ROOT/.venv"
MODE="${1:---dev}"

if [[ ! -d "$VENV" ]]; then
  echo "→ Creating .venv (one-time setup)"
  PY="$(command -v python3.13 || command -v python3.12 || command -v python3.11 || command -v python3.10)"
  if [[ -z "$PY" ]]; then
    echo "✗ Need Python >= 3.10 (system python3 is too old). Install via Homebrew: brew install python@3.13" >&2
    exit 1
  fi
  "$PY" -m venv "$VENV"
  "$VENV/bin/pip" install --upgrade pip
  "$VENV/bin/pip" install -e "$ROOT" -r "$ROOT/backend/requirements.txt"
fi

# shellcheck disable=SC1091
source "$VENV/bin/activate"

# ── Production mode ──────────────────────────────────────────────
if [[ "$MODE" == "--prod" || "$MODE" == "--build" ]]; then
  if [[ "$MODE" == "--build" || ! -d "$ROOT/frontend/dist" ]]; then
    echo "→ Building frontend for production…"
    (cd "$ROOT/frontend" && npm install && npx vite build)
  fi

  PORT="${PORT:-8000}"
  echo "→ Starting OpenPyTEA on http://0.0.0.0:$PORT"
  cd "$ROOT/backend"
  PYTHONPATH="$ROOT/src:$PYTHONPATH" exec python -m uvicorn app.main:app --host 0.0.0.0 --port "$PORT"
fi

# ── Development mode ─────────────────────────────────────────────
if [[ ! -d "$ROOT/frontend/node_modules" ]]; then
  echo "→ Installing frontend deps (one-time setup)"
  (cd "$ROOT/frontend" && npm install)
fi

cleanup() {
  if [[ -n "${BACKEND_PID:-}" ]] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    kill "$BACKEND_PID" 2>/dev/null || true
    wait "$BACKEND_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

echo "→ Starting backend on http://localhost:8000"
(
  cd "$ROOT/backend"
  PYTHONPATH="$ROOT/src" python -m uvicorn app.main:app --reload --port 8000
) &
BACKEND_PID=$!

echo "→ Starting frontend on http://localhost:5173"

URL="http://localhost:5173"
if command -v open >/dev/null 2>&1; then OPENER=open
elif command -v xdg-open >/dev/null 2>&1; then OPENER=xdg-open
else OPENER=""; fi
if [[ -n "$OPENER" ]]; then
  (
    for _ in $(seq 1 40); do
      if curl -s -o /dev/null "$URL"; then
        "$OPENER" "$URL"
        exit 0
      fi
      sleep 0.5
    done
  ) &
fi

cd "$ROOT/frontend"
exec npm run dev
