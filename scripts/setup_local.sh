#!/usr/bin/env bash
# Minimal local setup helper (WSL / Linux / macOS)
set -e

echo "This script provides guidance to run the project locally without Docker."
echo "It does not install system packages automatically. Follow the steps below."

cat <<'EOF'
1) Install system dependencies:
   - Node.js (>=18) and npm
   - Yarn (optional)
   - Python 3.10+ (for parts of repo that use Python)
   - If you need full Frappe: MariaDB, Redis, wkhtmltopdf (see README_LOCALHOST.md)

2) Run modern-stack backend (in-memory demo):
   cd modern-stack/backend
   npm install
   cp .env.example .env
   npm run dev

3) Run modern-stack frontend:
   cd modern-stack/frontend
   npm install
   cp .env.example .env
   npm run dev

4) Optional: run dev fake auth server to support `hrms` ionic frontend login (only needed if you open the legacy frontend):
   cd ..  # repo root
   python3 dev_fake_auth_server.py

EOF

echo "Done. See README_LOCALHOST.md for full instructions and troubleshooting."
