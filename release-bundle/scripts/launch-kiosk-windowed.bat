@echo off
TITLE Kiosk Mandiri Gudang PLN - Mode Pengujian Windowed

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
    pause
    exit /b 1
)

:: 2. Direktori profil terisolasi untuk Kiosk
SET PROFILE_DIR=%SCRIPT_DIR%..\edge-profile
IF NOT EXIST "%PROFILE_DIR%" mkdir "%PROFILE_DIR%"

:: 3. Jalankan server lokal
start "" powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "%SCRIPT_DIR%serve-kiosk.ps1" -AppDir "%APP_DIR%" -Port %PORT% <nul >nul 2>&1
ping 127.0.0.1 -n 2 >nul

:: 4. Deteksi Microsoft Edge
SET EDGE_EXE=msedge.exe
IF EXIST "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    SET EDGE_EXE="C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
) ELSE IF EXIST "C:\Program Files\Microsoft\Edge\Application\msedge.exe" (
    SET EDGE_EXE="C:\Program Files\Microsoft\Edge\Application\msedge.exe"
)

:: 5. Buka tab aplikasi tersendiri (mode windowed untuk pengujian/preview dengan tombol X)
echo [INFO] Membuka Kiosk di jendela aplikasi (windowed)...
start "" %EDGE_EXE% --user-data-dir="%PROFILE_DIR%" --app="http://localhost:%PORT%" --window-size=1280,800

exit /b 0
