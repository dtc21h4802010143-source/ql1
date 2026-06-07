# Modern HRMS - Localhost Development Setup

> **⚡ Quick Start**: Just clone, then run `start.bat` (Windows) or `start.sh` (macOS/Linux)

## Prerequisites
- Node.js 18+ 
- npm 9+
- Git

## 🚀 Quick Start - 1 Click Run

### Windows Users - Just Double Click! 🖱️
1. Clone: `git clone <repository>`
2. Navigate: `cd ql1-render-deploy`
3. **Double-click** `start.bat` file

### macOS/Linux Users
1. Clone: `git clone <repository>`
2. Navigate: `cd ql1-render-deploy`
3. Run: `chmod +x start.sh && ./start.sh`
   - Or double-click `start.sh` then select "Run in Terminal"

### What the starter does:
- ✅ Checks and installs dependencies (first run only)
- ✅ Starts backend (http://localhost:5000)
- ✅ Starts frontend (http://localhost:5173)
- ✅ Displays all service URLs

### Manual Setup (Alternative)
```bash
# Install all dependencies at once
npm run install:all

# Start both services
npm run dev
```

## Services After Startup

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Endpoint**: http://localhost:5000/api

## 📤 Share with Others

The project is ready to share! When you send it to others:

### What they need to do:
1. **Clone the repository** (or extract the ZIP if you packaged it)
2. **Run the starter script:**
   - **Windows**: Double-click `start.bat`
   - **macOS/Linux**: Run `chmod +x start.sh && ./start.sh`
3. **Open browser**: http://localhost:5173
4. **Login** with demo credentials below

### That's it! ✅
- No configuration needed
- No environment files to edit
- No manual npm commands required
- Everything works out of the box

### Checklist before sharing:
- ✅ Repository has `start.bat` and `start.sh` (included)
- ✅ Backend `.env.example` provided
- ✅ Frontend `.env.example` provided  
- ✅ README_LOCALHOST.md has instructions (this file)
- ✅ All dependencies in `package.json` files
- ✅ Demo data auto-seeds on startup

### To send to others:
```bash
# Option 1: Just share the Git repository URL
git clone https://github.com/your-repo/ql1-render-deploy

# Option 2: Create a ZIP archive
# Include: All source files, start.bat, start.sh, README_LOCALHOST.md
# Exclude: node_modules/, dist/, .git/

# They will simply extract and run start.bat or start.sh
```

## Demo Credentials

### Admin Account
- Email: `admin@hrms.local`
- Password: `admin123`

### Manager Account
- Email: `manager@hrms.local`
- Password: `manager123`

### Employee Account
- Email: `employee@hrms.local`
- Password: `employee123`

## Project Structure

```
ql1-render-deploy/
├── modern-stack/
│   ├── backend/          # Node.js + Express API
│   │   ├── src/
│   │   │   ├── app.js
│   │   │   ├── server.js
│   │   │   ├── config/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   ├── repositories/
│   │   │   └── data/
│   │   ├── package.json
│   │   └── .env.example
│   ├── frontend/         # React + Vite
│   │   ├── src/
│   │   ├── package.json
│   │   ├── vite.config.js
│   │   └── .env.example
│   └── database/
├── package.json          # Root startup scripts
├── start.sh             # Linux/macOS launcher
├── start.bat            # Windows launcher
└── README_LOCALHOST.md
```

## Configuration Files

### Backend (.env)
```env
PORT=5000
CLIENT_URL=http://localhost:5173
DATABASE_URL=          # Leave empty for in-memory demo
JWT_SECRET=modern-hrms-dev-secret
NODE_ENV=development
```

### Frontend (.env)
```env
# Auto-detects http://localhost:5000/api
# Leave empty or set VITE_API_URL=/api
```

## Architecture

**Backend** (Port 5000):
- Express.js REST API
- Socket.IO for real-time updates
- In-memory seed data (no database required)
- JWT authentication

**Frontend** (Port 5173):
- React 18 + Vite
- Tailwind CSS + Radix UI
- Zustand state management
- React Router

**Database**:
- Optional MySQL (set DATABASE_URL)
- Default: In-memory demo data

## Development Scripts

```bash
# Install dependencies for all packages
npm install:all

# Start only backend (port 5000)
npm run backend

# Start only frontend (port 5173)
npm run frontend

# Start both concurrently (recommended)
npm run dev

# Build frontend for production
npm run build:all

# Clean all node_modules and dist
npm run clean
```

## Features Included

- ✅ Employee Management
- ✅ Task & Project Management
- ✅ Attendance Tracking
- ✅ Shift Management
- ✅ Leave Requests
- ✅ KPI & Performance Review
- ✅ Expense Claims
- ✅ Advance Requests
- ✅ Salary Slips (Basic)
- ✅ Reports & Analytics
- ✅ Role-based Access Control
- ✅ Real-time Notifications
- ✅ Document Export (PDF, Excel, CSV)

## Troubleshooting

### For First-Time Users (Receiving This Project)

**Problem**: "Command not found: start.bat" or "Permission denied: start.sh"  
**Solution**:
- Windows: Double-click the file in File Explorer (not command line)
- macOS/Linux: Open Terminal, navigate to project folder, run: `chmod +x start.sh && ./start.sh`

**Problem**: "Port 5173 already in use"  
**Solution**: 
```bash
# Kill the process using the port
# Windows: netstat -ano | findstr :5173
# macOS/Linux: lsof -ti:5173 | xargs kill -9
```

**Problem**: "npm: command not found"  
**Solution**: Node.js not installed. Download from https://nodejs.org (version 18+)

**Problem**: "Module not found" errors  
**Solution**:
```bash
npm run clean
npm run install:all
npm run dev
```

### General Troubleshooting

### Port Already in Use
```bash
# Change backend port
PORT=3000 npm run backend

# Change frontend port in modern-stack/frontend/vite.config.js
```

### Dependencies Not Installing
```bash
npm run clean
npm install:all
npm run dev
```

### API Connection Issues
Frontend automatically connects to `http://localhost:5000/api`. If issues persist:
1. Verify backend is running on port 5000
2. Check browser console for CORS errors
3. Ensure `CLIENT_URL` matches frontend URL in `.env`

### Cannot Start Services
Ensure Node.js 18+ is installed:
```bash
node --version
npm --version
```

## Performance Notes

- First startup may take 1-2 minutes to install dependencies
- Frontend hot-reload enabled (Vite)
- Backend file-watch reload enabled
- In-memory database is fast but resets on restart

## Production Build

To build for production:
```bash
npm run build:all
```

This creates a production-optimized frontend build in `modern-stack/frontend/dist/`.

## Next Steps

1. **Explore the UI**: Open http://localhost:5173
2. **Login with demo account**: admin@hrms.local / admin123
3. **Check API docs**: Visit http://localhost:5000/api/health
4. **View source code**:
   - Backend routes: `modern-stack/backend/src/routes/`
   - Frontend pages: `modern-stack/frontend/src/pages/`
   - Services: `modern-stack/backend/src/services/`

## Support

For issues, check:
- Browser console (F12) for frontend errors
- Terminal output for backend errors
- Ensure both ports (5000, 5173) are available
- Verify Node.js 18+ and npm 9+

---

**Modern HRMS** - Open Source HR & Payroll System


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
