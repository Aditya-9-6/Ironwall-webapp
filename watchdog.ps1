# IronWall+ Backend Watchdog — auto-restarts within 1 second on any crash
$binary = "C:\ironwall-gamethon-target\debug\ironwall-gamethon.exe"
$workdir = "G:\My Drive\IronWall-Gamethon\backend"

Write-Host "=================================" -ForegroundColor Cyan
Write-Host "  IronWall+ WAF Engine Watchdog  " -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "Backend: $binary" -ForegroundColor Gray
Write-Host "DO NOT CLOSE THIS WINDOW" -ForegroundColor Yellow
Write-Host ""

while ($true) {
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Starting IronWall+ backend..." -ForegroundColor Green
    & $binary
    $exitCode = $LASTEXITCODE
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Backend stopped (exit code: $exitCode). Restarting in 1 second..." -ForegroundColor Yellow
    Start-Sleep -Seconds 1
}
