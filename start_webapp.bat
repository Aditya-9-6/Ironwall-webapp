@echo off
title IronWall+ Web Server
color 0B
cls

echo.
echo  ====================================================
echo   ⚡  IRONWALL+  GAMETHON  WEB  LAUNCHER  ⚡
echo  ====================================================
echo.

:: ── 1. Launch Rust Backend ──────────────────────────────────────────────────
echo  [1/2] Starting Rust backend (WebSocket + game engine)...
cd /d "%~dp0backend"
start /B "IronWall-Backend" cargo run --release 2>nul
if %errorlevel% neq 0 (
    echo      [WARN] Cargo not found or backend failed — continuing without it.
    echo      Attacks will still animate but won't hit real backend.
) else (
    echo      Backend starting in background...
)

:: Wait for backend to start
timeout /t 3 /nobreak >nul

:: ── 2. Launch Node Web Server ────────────────────────────────────────────────
echo.
echo  [2/2] Starting cross-device web server...
cd /d "%~dp0frontend"

:: Check if node is available
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo  [ERROR] Node.js is NOT installed. Please install from nodejs.org
    echo  Trying to open index.html directly as fallback...
    start index.html
    pause
    exit /b 1
)

echo.
echo  ====================================================
echo   HOW TO JOIN FROM YOUR PHONE:
echo.
echo   1. Make sure phone is on SAME Wi-Fi network
echo   2. Open the URL printed below in your browser
echo   3. Use /attacker for the red team control panel
echo  ====================================================
echo.

node serve.js

pause
