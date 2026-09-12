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

:: 4. Tunggu hingga socket server lokal benar-benar merespon (hingga 15 detik pada saat boot dingin komputer)
echo [INFO] Menunggu server lokal siap melayani halaman...
FOR /L %%i IN (1,1,15) DO (
    curl.exe -s -o nul "http://localhost:%PORT%/" && goto SERVER_READY
    ping 127.0.0.1 -n 2 >nul
)
:SERVER_READY

:: 5. Deteksi binary Microsoft Edge
SET EDGE_EXE=msedge.exe
IF EXIST "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    SET EDGE_EXE="C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
) ELSE IF EXIST "C:\Program Files\Microsoft\Edge\Application\msedge.exe" (
    SET EDGE_EXE="C:\Program Files\Microsoft\Edge\Application\msedge.exe"
)

:: 6. Luncurkan Microsoft Edge dalam mode Kiosk Fullscreen
echo [INFO] Meluncurkan Kiosk Mandiri PLN pada Kassen WK-215 (Port %PORT%)...
start "" %EDGE_EXE% --user-data-dir="%PROFILE_DIR%" --kiosk "http://localhost:%PORT%" --edge-kiosk-type=fullscreen --no-first-run --no-default-browser-check --hide-crash-restore-bubble --disable-session-crashed-bubble --disable-pinch --disable-translate --disable-features=TranslateUI,PreloadMediaEngagementData --overscroll-history-navigation=0

exit /b 0
