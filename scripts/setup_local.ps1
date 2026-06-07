<#
Minimal Windows setup helper. This script prints guided steps to run services locally.
Run from PowerShell: .\scripts\setup_local.ps1
#>
Write-Host "This script provides guidance to run the project locally without Docker.`n"

Write-Host "1) Install system dependencies:`n  - Node.js (>=18) and npm`n  - Yarn (optional)`n  - Python 3.10+ (for parts of repo that use Python)`n  - If you need full Frappe: install MariaDB, Redis, wkhtmltopdf (use WSL recommended)"

Write-Host "`n2) Run modern-stack backend (in-memory demo):"
Write-Host "   cd modern-stack\backend"
Write-Host "   npm install"
Write-Host "   Copy-Item .env.example .env"
Write-Host "   npm run dev"

Write-Host "`n3) Run modern-stack frontend:"
Write-Host "   cd modern-stack\frontend"
Write-Host "   npm install"
Write-Host "   Copy-Item .env.example .env"
Write-Host "   npm run dev"

Write-Host "`n4) Optional: run dev fake auth server to support legacy hrms frontend login (only needed if you open the Ionic frontend):"
Write-Host "   cd ..  # repo root"
Write-Host "   .\.venv\Scripts\python.exe dev_fake_auth_server.py  # or python dev_fake_auth_server.py"

Write-Host "`nSee README_LOCALHOST.md for full instructions and troubleshooting."
