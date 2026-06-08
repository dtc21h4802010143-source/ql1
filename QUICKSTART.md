# 🚀 One-Click Startup Reference

## 📊 Quick Summary

Your project is now set up for **1-click startup** with automatic browser opening!

---

## 🎯 How to Run

### Windows - Just Double-Click! 🖱️
```
ql1-render-deploy/
├── start.bat  ← DOUBLE-CLICK THIS
├── ...
```
**What happens:**
1. Checks Node.js installation
2. Installs dependencies (first time only)
3. Starts backend (port 5000)
4. Starts frontend (port 5173)
5. **Browser opens automatically** ✨

### macOS/Linux - Run in Terminal
```bash
chmod +x start.sh && ./start.sh
```
**What happens:**
- Same as above, browser opens automatically ✨

---

## 🔑 Login Credentials

Once the browser opens:

| Account | Email | Password |
|---------|-------|----------|
| Admin | admin@hrms.local | admin123 |
| Manager | manager@hrms.local | manager123 |
| Employee | employee@hrms.local | employee123 |

---

## ⚡ Manual Commands (If Needed)

```bash
# Install all dependencies once
npm run install:all

# Start both services
npm run dev

# Start only backend (port 5000)
npm run backend

# Start only frontend (port 5173)
npm run frontend

# Clean everything and start fresh
npm run clean && npm run install:all
```

---

## 🔗 Service URLs

After startup, these are automatically available:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health
- **Demo Login**: admin@hrms.local / admin123

---

## 📤 To Share with Others

Two options:

### Option 1: GitHub (Easiest)
```
"Here's the link: https://github.com/your-repo/ql1-render-deploy
Just clone, then run start.bat (Windows) or start.sh (Mac/Linux)"
```

### Option 2: ZIP Archive
```
Include in ZIP:
✓ modern-stack/      (all source)
✓ start.bat
✓ start.sh
✓ package.json
✓ README_LOCALHOST.md
✓ SHARE_GUIDE.md

Exclude:
✗ node_modules/
✗ dist/
✗ .env (use .env.example)

They extract and run the starter script!
```

See **SHARE_GUIDE.md** for detailed sharing instructions.

---

## ✅ What's Included

- ✅ **Backend**: Node.js + Express (port 5000)
- ✅ **Frontend**: React + Vite (port 5173)
- ✅ **Demo Data**: Auto-seeds on startup
- ✅ **Auth**: JWT with demo accounts
- ✅ **Real-time**: Socket.IO support
- ✅ **UI**: Tailwind CSS + Radix UI
- ✅ **Startup**: One-click with auto browser opening
- ✅ **Docs**: README + SHARE_GUIDE included

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# macOS/Linux: Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Windows: Use Task Manager or restart
```

### Module Not Found
```bash
npm run clean
npm run install:all
```

### Node.js Not Found
Download from https://nodejs.org (version 18+)

### More Issues?
Check **README_LOCALHOST.md** or **SHARE_GUIDE.md**

---

## 📁 Project Structure

```
ql1-render-deploy/
├── modern-stack/
│   ├── backend/            # Express API
│   │   ├── src/
│   │   │   ├── server.js
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   └── data/
│   │   └── package.json
│   └── frontend/           # React App
│       ├── src/
│       ├── vite.config.js
│       └── package.json
├── start.bat              # Windows launcher
├── start.sh               # macOS/Linux launcher
├── package.json           # Root config
├── README_LOCALHOST.md    # Setup guide
└── SHARE_GUIDE.md         # Sharing instructions
```

---

## 💡 Pro Tips

1. **First run takes 3-5 minutes** (npm install)
2. **Subsequent runs take 10-15 seconds**
3. **Hot reload enabled** - Edit files and see changes instantly
4. **Backend auto-restart** - Save backend file → auto restarted
5. **No database needed** - Demo data in memory
6. **CORS enabled** - Frontend can call backend freely

---

## 🎓 Next Steps

1. ✅ Run `start.bat` or `start.sh`
2. ✅ Login with demo account
3. ✅ Explore the dashboard
4. ✅ Check different user roles
5. ✅ Review source code
6. ✅ Try making changes
7. ✅ Share with your team!

---

## 📞 Support

- **For setup issues**: Check SHARE_GUIDE.md
- **For development**: Check README_LOCALHOST.md
- **For code**: Check source comments in modern-stack/
- **For API**: Visit http://localhost:5000/api/health

---

**You're all set! 🎉 Just run start.bat or start.sh and go!**
