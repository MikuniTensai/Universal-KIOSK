@echo off
TITLE Peluncur Portal Administrator Gudang PLN - Port 5001

SET PORT=5000
SET ADMIN_PORT=5001
SET SCRIPT_DIR=%~dp0
SET APP_DIR=

:: 1. Temukan direktori bundle aplikasi
IF EXIST "%SCRIPT_DIR%..\dist\index.html" (
    SET APP_DIR=%SCRIPT_DIR%..\dist
) ELSE IF EXIST "%SCRIPT_DIR%..\app\index.html" (
    SET APP_DIR=%SCRIPT_DIR%..\app
) ELSE IF EXIST "%SCRIPT_DIR%dist\index.html" (
    SET APP_DIR=%SCRIPT_DIR%dist
) ELSE IF EXIST "%SCRIPT_DIR%app\index.html" (
    SET APP_DIR=%SCRIPT_DIR%app
)

IF "%APP_DIR%"=="" (
    echo [ERROR] Berkas aplikasi index.html tidak ditemukan!
    echo Pastikan folder dist/ atau app/ tersedia.
    pause
    exit /b 1
)

:: 2. Pastikan server lokal aktif di background melayani kedua port
echo [INFO] Memastikan server lokal Kiosk ^& Admin aktif...
start "" powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "%SCRIPT_DIR%serve-kiosk.ps1" -AppDir "%APP_DIR%" -Port %PORT% -AdminPort %ADMIN_PORT% <nul >nul 2>&1

:: Beri waktu sejenak agar socket server siap
ping 127.0.0.1 -n 2 >nul

:: 3. Buka browser default atau Microsoft Edge ke Portal Admin (Port 5001)
echo ==========================================================
echo   MEMBUKA PORTAL ADMINISTRATOR GUDANG PLN
echo   URL Lokal: http://localhost:%ADMIN_PORT%/
echo   Akses LAN: Buka IP Komputer ini di port :%ADMIN_PORT%
echo ==========================================================

start "" "http://localhost:%ADMIN_PORT%"

exit /b 0
