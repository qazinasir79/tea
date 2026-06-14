#!/usr/bin/env bash
# Deploy OpenPyTEA to Hostinger shared hosting (Passenger)
#
# 1. Edit the variables below to match your server paths
# 2. Upload the entire project to your Hostinger account (e.g. via Git or FTP)
# 3. SSH into your hosting and run: bash deploy.sh
#
# Directory structure expected on the server:
#   /home/user/domain.com/
#     ├── passenger_wsgi.py   ← this is the Passenger entry point
#     ├── .htaccess           ← Apache config
#     ├── public_html/        ← built frontend (copied here by this script)
#     ├── backend/            ← Python backend
#     ├── src/                ← openpytea library
#     └── .venv/              ← Python virtual env
#
# ===== CONFIGURE THESE ============================================
DOMAIN_DIR="/home/user/domain.com"
PYTHON_BIN="python3.12"
# ==================================================================

set -e
cd "$DOMAIN_DIR" || { echo "✗ Domain directory not found: $DOMAIN_DIR"; exit 1; }

echo "→ Setting up Python virtual environment…"
if [[ ! -d .venv ]]; then
  "$PYTHON_BIN" -m venv .venv
  source .venv/bin/activate
  pip install --upgrade pip
  pip install -e "$DOMAIN_DIR" -r "$DOMAIN_DIR/backend/requirements.txt"
else
  source .venv/bin/activate
fi

echo "→ Building frontend…"
cd "$DOMAIN_DIR/frontend"
npm install --silent
npx vite build

echo "→ Copying built frontend to public_html…"
rm -rf "$DOMAIN_DIR/public_html"
cp -r dist "$DOMAIN_DIR/public_html"

echo "→ Setting permissions…"
find "$DOMAIN_DIR/public_html" -type f -exec chmod 644 {} \;
find "$DOMAIN_DIR/public_html" -type d -exec chmod 755 {} \;
chmod 755 "$DOMAIN_DIR/.venv/bin/python"

echo ""
echo "✓ Deployment complete!"
echo "  App:  https://yourdomain.com"
echo "  API:  https://yourdomain.com/api/health"
echo ""
echo "  If Passenger is not detected, restart your app in Hostinger's"
echo "  hosting panel or run: touch passenger_wsgi.py"