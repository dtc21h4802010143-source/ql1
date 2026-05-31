README — Run project locally (no Docker)
=======================================

Overview
--------
This repository contains two main development stacks:

- `modern-stack` — a Node.js + React demo backend/frontend. Backend can run in-memory using built-in seed data (no DB required), or connect to a MySQL DB via `DATABASE_URL`.
- `hrms` — a Frappe-based Python application (heavy; recommended to run in WSL for full local installs).

This README explains how to remove Docker and run the modern-stack locally for development. Full migration of `hrms` (Frappe) off Docker requires installing MariaDB/Redis/Python toolchain and is documented below.

Quick start — modern-stack (recommended path)
-------------------------------------------
1. Open a terminal and install Node.js (v18+).
2. Backend (in-memory demo):

```bash
cd modern-stack/backend
npm install
cp .env.example .env
npm run dev
```

The backend will start on `http://localhost:5050` by default.

3. Frontend:

```bash
cd modern-stack/frontend
npm install
cp .env.example .env
npm run dev
```

The frontend will start on `http://localhost:5173` and will use `VITE_API_URL` (default `http://localhost:5050`).

Notes about data and seeding
---------------------------
- `modern-stack/backend/src/data/seed.js` contains demo seed data (Admin, Managers, Employees, Projects, Tasks, KPI). The backend uses this in-memory seed when `DATABASE_URL` is not set.
- To reset in-memory state, hit the backend endpoint `POST /api/admin/reset-seed` (if available) or restart the backend.

Running the legacy `hrms` frontend (Ionic / Frappe)
-------------------------------------------------
The `hrms` Ionic frontend expects a Frappe backend. Running full Frappe locally is a heavy process on Windows — use WSL2 (Ubuntu) or a VM. Steps (high level):

1. Install WSL2 and Ubuntu.
2. Follow Frappe installation docs: install Python, Node, MariaDB, Redis, wkhtmltopdf, install `bench` and create a site.
3. Clone the repo inside WSL and run `bench start` or the relevant site commands.

If you only need the legacy frontend for UI development, run the provided `dev_fake_auth_server.py` to emulate login endpoints:

```bash
python dev_fake_auth_server.py
# or: .venv\Scripts\python.exe dev_fake_auth_server.py on Windows
```

This starts a small local server on `http://localhost:8000/` that responds to legacy and modern login shapes and the `frappe.auth.get_logged_user` method. Use this for frontend testing while Frappe builds.

Removing Docker artifacts
-------------------------
Per migration request, the repository's `docker/docker-compose.yml` has been removed and a backup saved at `docker/docker-compose.yml.bak`.

If you need to re-create containers, restore that file.

Full Frappe migration notes & troubleshooting
-------------------------------------------
- Running Frappe fully locally on Windows requires Visual C++ Build Tools (for some Python packages) and proper MySQL/MariaDB setup. Use WSL2 for a smoother experience.
- If you intend to run a production-like stack locally (Frappe + MariaDB + Redis), follow official Frappe installation steps inside WSL.

Files changed for localhost migration
-----------------------------------
- `docker/docker-compose.yml` deleted (backup created `docker/docker-compose.yml.bak`)
- `modern-stack/frontend/src/lib/api.js` updated to use `VITE_API_URL` env var
- Added `.env.example` at repo root with common localhost variables
- Added `scripts/setup_local.sh` and `scripts/setup_local.ps1` — guided helpers
- Added `README_LOCALHOST.md` (this file)

Next steps (recommended)
------------------------
1. Start `modern-stack/backend` and `modern-stack/frontend` as above — they should work locally without Docker.
2. If you need full `hrms` functionality, install Frappe inside WSL and follow the `hrms` app setup.

If you want, I can now:
- Run `npm install` and `npm run dev` for `modern-stack` here and report build issues.
- Add small shell scripts to automate starting both frontend and backend.
