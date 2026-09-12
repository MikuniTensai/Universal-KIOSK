@echo off
TITLE Izinkan Akses Jaringan LAN & WiFi - Kiosk Gudang PLN

:: Cek apakah dijalankan sebagai Administrator
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Meminta izin Administrator untuk membuka port firewall...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

echo ==========================================================
echo   MENGIZINKAN AKSES JARINGAN & WIFI GUDANG PLN
echo   Port Kiosk: 5000 (TCP)
echo   Port Admin: 5001 (TCP)
echo ==========================================================
echo.
echo [1/2] Menambahkan aturan Windows Firewall untuk Port 5000 (Kiosk Display)...
netsh advfirewall firewall delete rule name="PLN Kiosk Web Server (Port 5000)" >nul 2>&1
netsh advfirewall firewall add rule name="PLN Kiosk Web Server (Port 5000)" dir=in action=allow protocol=TCP localport=5000 profile=any >nul 2>&1

echo [2/2] Menambahkan aturan Windows Firewall untuk Port 5001 (Portal Admin)...
netsh advfirewall firewall delete rule name="PLN Admin Portal (Port 5001)" >nul 2>&1
netsh advfirewall firewall add rule name="PLN Admin Portal (Port 5001)" dir=in action=allow protocol=TCP localport=5001 profile=any >nul 2>&1

echo.
echo ==========================================================
echo [SUKSES] Windows Firewall berhasil dibuka untuk port 5000 & 5001!
echo Perangkat lain di jaringan WiFi/LAN sekarang dapat mengakses:
echo.
powershell -NoProfile -Command "$ips = [System.Net.Dns]::GetHostAddresses([System.Net.Dns]::GetHostName()) | Where-Object { $_.AddressFamily -eq [System.Net.Sockets.AddressFamily]::InterNetwork -and -not [System.Net.IPAddress]::IsLoopback($_) } | ForEach-Object { $_.IPAddressToString }; foreach ($ip in $ips) { Write-Host \"  -> Kiosk Display : http://${ip}:5000/\"; Write-Host \"  -> Admin Portal  : http://${ip}:5001/\"; Write-Host '' }"
echo ==========================================================
echo Tekan tombol apa saja untuk menutup jendela ini...
pause >nul
exit /b 0
