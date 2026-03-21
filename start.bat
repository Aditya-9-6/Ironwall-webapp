@echo off
setlocal enabledelayedexpansion
title 🛡️ IRONWALL+ TOTAL DEFENSE SYSTEM 🛡️
color 0b
set CARGO_TARGET_DIR=C:\Users\om laptop house\AppData\Local\ironwall-target
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

:: 1. Cleanup old instances
echo [1/3] Terminating persistent background instances (Node + Rust)...
taskkill /F /IM ironwall-gamethon.exe /T >nul 2>&1
taskkill /F /IM node.exe /T >nul 2>&1

:: 2. Start the Rust Backend (WAF + Engine)
echo [2/3] Launching Unified WAF Backend (Pingora + Axum)...
cd /d "%~dp0backend"
start "IronWall+ Unified Backend" cmd /c "cargo run --release"

:: 3. Open the Dashboard
echo.
echo 🚀 Opening Unified Command Center (Port 8080) in 5 seconds...
timeout /t 5 >nul
start http://localhost:8080/


echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo  ✅ SYSTEM IS LIVE!
echo.
echo  🖥️  LAPTOP: Drag the browser windows to your monitors.
echo  📱  MOBILE: Scan or type this on your phone:
echo      http://%IP%:8080/
echo.
echo  📱  DIRECT ATTACK PANEL (for Phone):
echo  =============================================================
echo  http://%IP%:8080/attacker.html
echo  =============================================================
echo.
echo  ⚠️  IF YOU SEE "RECONNECTING":
echo  1. Check the "IronWall Backend" black window for errors.
echo  2. Ensure you pressed "Allow" on any Firewall popups.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo  PRESS ANY KEY TO EXIT THIS LAUNCHER (Servers will keep running)
pause >nul
