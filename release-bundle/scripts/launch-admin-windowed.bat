@echo off
TITLE Portal Administrator Gudang PLN - Mode Jendela Petugas

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
    pause
    exit /b 1
)

:: 2. Pastikan server lokal aktif
start "" powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "%SCRIPT_DIR%serve-kiosk.ps1" -AppDir "%APP_DIR%" -Port %PORT% -AdminPort %ADMIN_PORT% <nul >nul 2>&1
ping 127.0.0.1 -n 2 >nul

:: 3. Deteksi Microsoft Edge
SET EDGE_EXE=msedge.exe
IF EXIST "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    SET EDGE_EXE="C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
) ELSE IF EXIST "C:\Program Files\Microsoft\Edge\Application\msedge.exe" (
    SET EDGE_EXE="C:\Program Files\Microsoft\Edge\Application\msedge.exe"
)

:: 4. Buka portal admin di jendela aplikasi tersendiri (App Mode)
echo [INFO] Membuka Portal Administrator di jendela mandiri (Port %ADMIN_PORT%)...
start "" %EDGE_EXE% --app="http://localhost:%ADMIN_PORT%" --window-size=1400,900

exit /b 0
