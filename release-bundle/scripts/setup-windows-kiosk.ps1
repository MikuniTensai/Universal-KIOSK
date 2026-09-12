<#
.SYNOPSIS
    Script Pemasangan & Konfigurasi Kiosk Gudang PLN pada Terminal Windows 10/11 (Kassen WK-215).
.DESCRIPTION
    Script ini melakukan instalasi:
    1. Registrasi startup shortcut di shell:startup agar Kiosk otomatis menyala saat mesin booting.
    2. Pembuatan shortcut desktop untuk akses langsung petugas.
    3. Menonaktifkan gesture tepi layar sentuh (touch edge swiping) agar tidak membuka Action Center Windows.
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
$DesktopShortcutPath = Join-Path $DesktopFolder "Kiosk Gudang PLN.lnk"

if ($Uninstall) {
    Write-Host "[INFO] Menghapus shortcut Kiosk..." -ForegroundColor Cyan
    if (Test-Path $StartupShortcutPath) {
        Remove-Item $StartupShortcutPath -Force
        Write-Host "[OK] Shortcut Startup dihapus." -ForegroundColor Green
    }
    if (Test-Path $DesktopShortcutPath) {
        Remove-Item $DesktopShortcutPath -Force
        Write-Host "[OK] Shortcut Desktop dihapus." -ForegroundColor Green
    }
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

# 1. Daftarkan Shortcut di Startup (Auto-Start saat Boot)
$StartupShortcut = $WshShell.CreateShortcut($StartupShortcutPath)
$StartupShortcut.TargetPath = $AppPath
$StartupShortcut.WorkingDirectory = Split-Path -Path $AppPath
$StartupShortcut.WindowStyle = 7 # Minimized launch
$StartupShortcut.IconLocation = "msedge.exe,0"
$StartupShortcut.Description = "Kiosk Mandiri Gudang PLN (Auto-Start)"
$StartupShortcut.Save()
Write-Host "[OK] Auto-Start saat booting terdaftar di: $StartupShortcutPath" -ForegroundColor Green

# 2. Buat Shortcut di Desktop
$DesktopShortcut = $WshShell.CreateShortcut($DesktopShortcutPath)
$DesktopShortcut.TargetPath = $AppPath
$DesktopShortcut.WorkingDirectory = Split-Path -Path $AppPath
$DesktopShortcut.WindowStyle = 1 # Normal window
$DesktopShortcut.IconLocation = "msedge.exe,0"
$DesktopShortcut.Description = "Luncurkan Kiosk Mandiri Gudang PLN"
$DesktopShortcut.Save()
Write-Host "[OK] Shortcut Desktop berhasil dibuat di: $DesktopShortcutPath" -ForegroundColor Green

# 3. Nonaktifkan Touch Edge Gestures jika dijalankan sebagai Administrator
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
Write-Host "  INSTALASI BERHASIL!" -ForegroundColor Green
Write-Host "  - Kiosk akan otomatis menyala setiap kali komputer dihidupkan." -ForegroundColor Cyan
Write-Host "  - Untuk meluncurkan sekarang: Jalankan shortcut di Desktop atau launch-kiosk.bat" -ForegroundColor Cyan
Write-Host "  - Default PIN Admin: 123456" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
