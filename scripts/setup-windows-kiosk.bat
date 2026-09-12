@echo off
TITLE Setup Kiosk Mandiri Gudang PLN - Kassen WK-215

echo [INFO] Menjalankan konfigurasi Kiosk dengan ExecutionPolicy Bypass...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0setup-windows-kiosk.ps1" -AppPath "%~dp0launch-kiosk.bat"

pause
exit /b 0
