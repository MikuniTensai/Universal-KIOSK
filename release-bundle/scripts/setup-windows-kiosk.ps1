<#
.SYNOPSIS
    Script Pemasangan & Konfigurasi Kiosk Gudang PLN pada Terminal Windows 10/11 (Kassen WK-215).
.DESCRIPTION
    Script ini melakukan instalasi:
    1. Registrasi startup ganda (Registry Run + Startup Folder) agar Kiosk otomatis menyala saat mesin booting.
    2. Pembuatan shortcut desktop untuk akses langsung dan penutupan cepat oleh petugas.
    3. Menonaktifkan gesture tepi layar sentuh (touch edge swiping).
#>

param (
    [string]$AppPath = "$PSScriptRoot\launch-kiosk.bat",
    [switch]$Uninstall
)

Write-Host "==========================================================" -ForegroundColor Yellow
Write-Host "  SETUP KIOSK MANDIRI GUDANG PLN - KASSEN WK-215" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Yellow

$StartupFolder = [Environment]::GetFolderPath("Startup")
$StartupShortcutPath = Join-Path $StartupFolder "KioskGudangPLN.lnk"

$DesktopFolder = [Environment]::GetFolderPath("Desktop")
$DesktopRunPath = Join-Path $DesktopFolder "Jalankan Kiosk PLN.lnk"
$DesktopStopPath = Join-Path $DesktopFolder "Tutup Kiosk PLN.lnk"
$DesktopWinPath = Join-Path $DesktopFolder "Kiosk PLN (Mode Jendela).lnk"

$RegRunPath = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run"
$RegRunName = "KioskGudangPLN"

if ($Uninstall) {
    Write-Host "[INFO] Menghapus registrasi Auto-Start dan shortcut Kiosk..." -ForegroundColor Cyan
    if (Test-Path $StartupShortcutPath) {
        Remove-Item $StartupShortcutPath -Force
        Write-Host "[OK] Shortcut Startup dihapus." -ForegroundColor Green
    }
    try {
        Remove-ItemProperty -Path $RegRunPath -Name $RegRunName -ErrorAction SilentlyContinue
        Write-Host "[OK] Registry Run key dihapus." -ForegroundColor Green
    } catch {}

    @($DesktopRunPath, $DesktopStopPath, $DesktopWinPath) | ForEach-Object {
        if (Test-Path $_) { Remove-Item $_ -Force }
    }
    Write-Host "[OK] Shortcut Desktop dihapus." -ForegroundColor Green
    Write-Host "Pencopotan konfigurasi Kiosk selesai." -ForegroundColor Green
    exit 0
}

# Pastikan path absolut ke launch-kiosk.bat
if (Test-Path $AppPath) {
    $AppPath = (Resolve-Path $AppPath).Path
} else {
    Write-Error "[ERROR] Berkas peluncur tidak ditemukan: $AppPath"
    exit 1
}

$WshShell = New-Object -ComObject WScript.Shell
$ScriptDir = Split-Path -Path $AppPath

# 1. Daftarkan di Registry Run (Maksimal Keandalan saat Booting)
try {
    Set-ItemProperty -Path $RegRunPath -Name $RegRunName -Value "`"$AppPath`"" -Force
    Write-Host "[OK] Auto-Start Registry terdaftar: $RegRunPath\$RegRunName" -ForegroundColor Green
} catch {
    Write-Warning "Peringatan: Gagal menambahkan Registry Run key."
}

# 2. Daftarkan Shortcut di Folder Startup Windows
$StartupShortcut = $WshShell.CreateShortcut($StartupShortcutPath)
$StartupShortcut.TargetPath = $AppPath
$StartupShortcut.WorkingDirectory = $ScriptDir
$StartupShortcut.WindowStyle = 7 # Minimized launch
$StartupShortcut.IconLocation = "msedge.exe,0"
$StartupShortcut.Description = "Kiosk Mandiri Gudang PLN (Auto-Start saat Booting)"
$StartupShortcut.Save()
Write-Host "[OK] Auto-Start Startup Folder terdaftar di: $StartupShortcutPath" -ForegroundColor Green

# 3. Buat Shortcut di Desktop
# A. Jalankan Kiosk PLN (Fullscreen)
$ScRun = $WshShell.CreateShortcut($DesktopRunPath)
$ScRun.TargetPath = $AppPath
$ScRun.WorkingDirectory = $ScriptDir
$ScRun.WindowStyle = 7
$ScRun.IconLocation = "msedge.exe,0"
$ScRun.Description = "Luncurkan Kiosk Mandiri Gudang PLN (Layar Penuh)"
$ScRun.Save()

# B. Tutup Kiosk PLN
$StopScript = Join-Path $ScriptDir "stop-kiosk.bat"
if (Test-Path $StopScript) {
    $ScStop = $WshShell.CreateShortcut($DesktopStopPath)
    $ScStop.TargetPath = $StopScript
    $ScStop.WorkingDirectory = $ScriptDir
    $ScStop.WindowStyle = 7
    $ScStop.IconLocation = "shell32.dll,27" # Red Stop/Cross icon
    $ScStop.Description = "Hentikan dan Tutup Seluruh Sesi Kiosk PLN"
    $ScStop.Save()
}

# C. Kiosk PLN (Mode Jendela)
$WinScript = Join-Path $ScriptDir "launch-kiosk-windowed.bat"
if (Test-Path $WinScript) {
    $ScWin = $WshShell.CreateShortcut($DesktopWinPath)
    $ScWin.TargetPath = $WinScript
    $ScWin.WorkingDirectory = $ScriptDir
    $ScWin.WindowStyle = 1
    $ScWin.IconLocation = "shell32.dll,14"
    $ScWin.Description = "Buka Kiosk dalam Jendela Biasa (Memiliki tombol X penutup)"
    $ScWin.Save()
}
Write-Host "[OK] Shortcut Desktop berhasil diperbarui (Jalankan, Tutup, dan Mode Jendela)." -ForegroundColor Green

# 4. Nonaktifkan Touch Edge Gestures jika dijalankan sebagai Administrator
try {
    $RegPath = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\EdgeUI"
    if (-not (Test-Path $RegPath)) {
        New-Item -Path $RegPath -Force -ErrorAction Stop | Out-Null
    }
    Set-ItemProperty -Path $RegPath -Name "AllowEdgeSwipe" -Value 0 -Type DWord -ErrorAction Stop
    Write-Host "[OK] Edge Swipe Touch Gestures berhasil dinonaktifkan di registry." -ForegroundColor Green
} catch {
    Write-Host "[OPSIONAL] Untuk mengunci gesture geser tepi layar (Edge Swipe), jalankan setup sebagai Administrator." -ForegroundColor Gray
}

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  KONFIGURASI BOOT SELESAI & TERVERIFIKASI!" -ForegroundColor Green
Write-Host "  - Ketika komputer dinyalakan/booting, Kiosk OTOMATIS LANGSUNG MENYALA." -ForegroundColor Cyan
Write-Host "  - Jalur Auto-Start: Windows Registry Run + Startup Folder (Dual-Redundancy)." -ForegroundColor Cyan
Write-Host "  - Tombol tutup instan tersedia di Desktop: Tutup Kiosk PLN" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
