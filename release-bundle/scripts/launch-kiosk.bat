@echo off
TITLE Peluncur Kiosk Mandiri Gudang PLN - Kassen WK-215

SET PORT=5000
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

:: 2. Direktori profil terisolasi untuk Kiosk
SET PROFILE_DIR=%SCRIPT_DIR%..\edge-profile
IF NOT EXIST "%PROFILE_DIR%" mkdir "%PROFILE_DIR%"

:: 3. Jalankan background HTTP server lokal jika belum menyala
echo [INFO] Memastikan server lokal Kiosk aktif di port %PORT%...
start "" powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "%SCRIPT_DIR%serve-kiosk.ps1" -AppDir "%APP_DIR%" -Port %PORT% <nul >nul 2>&1

:: Beri waktu sejenak agar socket server siap
ping 127.0.0.1 -n 2 >nul

:: 4. Deteksi binary Microsoft Edge
SET EDGE_EXE=msedge.exe
IF EXIST "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    SET EDGE_EXE="C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
) ELSE IF EXIST "C:\Program Files\Microsoft\Edge\Application\msedge.exe" (
    SET EDGE_EXE="C:\Program Files\Microsoft\Edge\Application\msedge.exe"
)

:: 5. Luncurkan Microsoft Edge dalam mode Kiosk Fullscreen
echo [INFO] Meluncurkan Kiosk Mandiri PLN pada Kassen WK-215 (Port %PORT%)...
start "" %EDGE_EXE% --user-data-dir="%PROFILE_DIR%" --kiosk "http://localhost:%PORT%" --edge-kiosk-type=fullscreen --no-first-run --disable-pinch --disable-translate --disable-features=TranslateUI --overscroll-history-navigation=0

exit /b 0
