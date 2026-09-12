$wsh = New-Object -ComObject WScript.Shell
$desktop = [Environment]::GetFolderPath('Desktop')
$startup = [Environment]::GetFolderPath('Startup')
$plnIcon = 'C:\PLN-Kiosk\scripts\pln.ico'

if (-not (Test-Path $plnIcon)) {
    Write-Error "Berkas icon PLN tidak ditemukan di $plnIcon"
    exit 1
}

# 1. Jalankan Kiosk PLN.lnk
$runPath = Join-Path $desktop 'Jalankan Kiosk PLN.lnk'
if (Test-Path $runPath) {
    $scRun = $wsh.CreateShortcut($runPath)
    $scRun.IconLocation = "$plnIcon,0"
    $scRun.Save()
    Write-Host "[OK] Jalankan Kiosk PLN.lnk -> Icon PLN diterapkan." -ForegroundColor Green
}

# 2. Kiosk PLN (Mode Jendela).lnk
$winPath = Join-Path $desktop 'Kiosk PLN (Mode Jendela).lnk'
if (Test-Path $winPath) {
    $scWin = $wsh.CreateShortcut($winPath)
    $scWin.IconLocation = "$plnIcon,0"
    $scWin.Save()
    Write-Host "[OK] Kiosk PLN (Mode Jendela).lnk -> Icon PLN diterapkan." -ForegroundColor Green
}

# 3. Portal Admin PLN.lnk
$adminPath = Join-Path $desktop 'Portal Admin PLN.lnk'
if (Test-Path $adminPath) {
    $scAdmin = $wsh.CreateShortcut($adminPath)
    $scAdmin.IconLocation = "$plnIcon,0"
    $scAdmin.Save()
    Write-Host "[OK] Portal Admin PLN.lnk -> Icon PLN diterapkan." -ForegroundColor Green
}

# 4. KioskGudangPLN.lnk di Startup Folder
$startupPath = Join-Path $startup 'KioskGudangPLN.lnk'
if (Test-Path $startupPath) {
    $scStartup = $wsh.CreateShortcut($startupPath)
    $scStartup.IconLocation = "$plnIcon,0"
    $scStartup.Save()
    Write-Host "[OK] Startup KioskGudangPLN.lnk -> Icon PLN diterapkan." -ForegroundColor Green
}

# 5. Refresh Windows Desktop Icon Cache
try {
    Add-Type -TypeDefinition @"
    using System;
    using System.Runtime.InteropServices;
    public class ShellIconRefresher {
        [DllImport("shell32.dll")]
        public static extern void SHChangeNotify(int wEventId, uint uFlags, IntPtr dwItem1, IntPtr dwItem2);
    }
"@
    [ShellIconRefresher]::SHChangeNotify(0x08000000, 0, [IntPtr]::Zero, [IntPtr]::Zero)
    Write-Host "[OK] Cache icon Desktop Windows berhasil di-refresh." -ForegroundColor Green
} catch {
    # Fallback ie4uinit
    Start-Process ie4uinit.exe -ArgumentList "-show" -Wait -ErrorAction SilentlyContinue
}
