"""
Phusion Passenger WSGI entry point for Hostinger shared hosting.

Place this file in your domain root (e.g. /home/user/domain.com/)
and set STATIC_DIR to point to your public_html directory.

Usage:
  1. Build the frontend:  cd frontend && npm install && npx vite build
  2. Copy dist/* to your public_html/ directory
  3. Upload this project to your hosting (excluding .venv, node_modules)
  4. Set up the virtual environment on the server
  5. Set STATIC_DIR env var to the public_html path
"""

import os
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))

# Ensure our packages are importable
sys.path.insert(0, os.path.join(ROOT, "src"))
sys.path.insert(0, os.path.join(ROOT, "backend"))

# Point the app to the public_html directory for static files
os.environ.setdefault("STATIC_DIR", os.path.join(ROOT, "public_html"))

from app.main import app as application  # noqa: E402
