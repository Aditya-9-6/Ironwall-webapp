@echo off
setlocal enabledelayedexpansion
title 🛡️ IRONWALL+ TOTAL DEFENSE SYSTEM 🛡️
color 0b

echo.
echo    ██╗██████╗  ██████╗ ███╗   ██╗██╗    ██╗ █████╗ ██╗     ██╗     ██╗
echo    ██║██╔══██╗██╔═══██╗████╗  ██║██║    ██║██╔══██╗██║     ██║     ██║
echo    ██║██████╔╝██║   ██║██╔██╗ ██║██║ █╗ ██║███████║██║     ██║     ██║
echo    ██║██╔══██╗██║   ██║██║╚██╗██║██║███╗██║██╔══██║██║     ██║     ╚═╝
echo    ██║██║  ██║╚██████╔╝██║ ╚████║╚███╔███╔╝██║  ██║███████╗███████╗██╗
echo    ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝ ╚══╝╚══╝ ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝
echo.
echo    [ PREPARING ONE-CLICK LAUNCH FOR THE GAMETHON ]
echo.

:: Get Local IP Address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set IP=%%a
    goto :found_ip
)
:found_ip
set IP=%IP: =%

echo 📡 NETWORK DETECTED: %IP%
echo.

:: 1. Start the Rust Backend via Watchdog (auto-restarts in 1s on any crash)
echo [1/2] Launching IronWall+ Watchdog (keeps backend alive forever)...
taskkill /F /IM ironwall-gamethon.exe /T >nul 2>&1
start "IronWall+ Backend [DO NOT CLOSE]" powershell -NoExit -ExecutionPolicy Bypass -File "g:\My Drive\IronWall-Gamethon\watchdog.ps1"

:: 2. Start the Frontend Server
echo [2/2] 🔷 Serving Frontend UI (Port 3000)...
cd frontend
start "🛡️ IronWall Frontend" cmd /k "node serve.js"
cd ..

:: 3. Open the Launcher
echo.
echo 🚀 Opening Launcher Portal in 5 seconds...
timeout /t 5 >nul
start http://localhost:3000/launcher.html

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo  ✅ SYSTEM IS LIVE!
echo.
echo  🖥️  LAPTOP: Drag the browser windows to your monitors.
echo  📱  MOBILE: Scan or type this on your phone:
echo      http://%IP%:3000/launcher.html
echo.
echo  📱  DIRECT ATTACK PANEL (for Phone):
echo  =============================================================
echo  http://%IP%:3000/attacker.html
echo  =============================================================
echo.
echo  ⚠️  IF YOU SEE "RECONNECTING":
echo  1. Check the "IronWall Backend" black window for errors.
echo  2. Ensure you pressed "Allow" on any Firewall popups.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo  PRESS ANY KEY TO EXIT THIS LAUNCHER (Servers will keep running)
pause >nul
