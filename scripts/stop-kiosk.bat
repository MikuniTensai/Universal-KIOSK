@echo off
TITLE Hentikan Kiosk Mandiri Gudang PLN

echo ==========================================================
echo   MENGHENTIKAN KIOSK MANDIRI GUDANG PLN
echo ==========================================================
echo [INFO] Menutup browser Kiosk dan menghentikan server lokal...

:: 1. Tutup browser Edge
taskkill /F /IM msedge.exe >nul 2>&1

:: 2. Hentikan server lokal secara instan lewat PID
SET SCRIPT_DIR=%~dp0
IF EXIST "%SCRIPT_DIR%server.pid" (
    FOR /F %%i IN (%SCRIPT_DIR%server.pid) DO taskkill /F /PID %%i >nul 2>&1
    DEL "%SCRIPT_DIR%server.pid" >nul 2>&1
)

:: 3. Pembersihan cadangan jika ada proses PowerShell atau Bun/Node yang masih memegang server
powershell -NoProfile -Command "Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*serve-kiosk.ps1*' -or $_.CommandLine -like '*serve-dual.mjs*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }" >nul 2>&1

echo [OK] Aplikasi Kiosk Mandiri PLN berhasil ditutup sepenuhnya.
exit /b 0
