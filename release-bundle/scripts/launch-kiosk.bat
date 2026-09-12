@echo off
TITLE Peluncur Kiosk Mandiri Gudang PLN - Kassen WK-215

:: 1. Tentukan direktori aplikasi
SET APP_DIR=%~dp0..\dist
SET INDEX_FILE=%APP_DIR%\index.html

IF NOT EXIST "%INDEX_FILE%" (
    echo [ERROR] Berkas aplikasi index.html tidak ditemukan di %APP_DIR%!
    echo Jalankan 'npm run build' terlebih dahulu sebelum peluncuran.
    pause
    exit /b 1
)

:: 2. Jalankan Edge Kiosk Mode Fullscreen (Bawaan Windows 10/11 Kassen WK-215)
echo [INFO] Meluncurkan Kiosk Mandiri PLN pada Kassen WK-215...
start msedge.exe --kiosk "%INDEX_FILE%" --edge-kiosk-type=fullscreen --no-first-run --disable-pinch --disable-translate --disable-features=TranslateUI --overscroll-history-navigation=0

exit /b 0
