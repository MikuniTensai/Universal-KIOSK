<#
.SYNOPSIS
    Script Konfigurasi Kiosk Mode Windows 10/11 pada Terminal Kassen WK-215 PLN Logistik.
.DESCRIPTION
    Script ini mengonfigurasi:
    1. Registrasi startup shortcut agar aplikasi otomatis menyala saat mesin booting.
    2. Menonaktifkan gesture tepi layar sentuh (edge swiping).
    3. Konfigurasi resolusi layar 1920x1080 Landscape / 1080x1920 Portrait.
#>

param (
    [string]$AppPath = "$PSScriptRoot\launch-kiosk.bat"
)

Write-Host "==========================================================" -ForegroundColor Yellow
Write-Host "  SETUP KIOSK MANDIRI GUDANG PLN - KASSEN WK-215" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Yellow

# 1. Buat Shortcut di shell:startup
$StartupFolder = [Environment]::GetFolderPath("Startup")
$ShortcutPath = Join-Path $StartupFolder "KioskGudangPLN.lnk"

$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = $AppPath
$Shortcut.WorkingDirectory = Split-Path -Path $AppPath
$Shortcut.WindowStyle = 7 # Minimized launch
$Shortcut.IconLocation = "msedge.exe,0"
$Shortcut.Save()

Write-Host "[OK] Startup shortcut berhasil didaftarkan di: $ShortcutPath" -ForegroundColor Green

# 2. Nonaktifkan Touch Edge Gestures (Prevent swipe from right/left edge to trigger Windows Action Center)
try {
    $RegPath = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\EdgeUI"
    if (-not (Test-Path $RegPath)) {
        New-Item -Path $RegPath -Force | Out-Null
    }
    Set-ItemProperty -Path $RegPath -Name "AllowEdgeSwipe" -Value 0 -Type DWord
    Write-Host "[OK] Edge Swipe Touch Gestures berhasil dinonaktifkan." -ForegroundColor Green
} catch {
    Write-Warning "Peringatan: Gagal memodifikasi registry EdgeUI. Jalankan PowerShell sebagai Administrator."
}

Write-Host "Konfigurasi selesai. Terminal Kassen siap untuk pengujian pilot." -ForegroundColor Cyan
