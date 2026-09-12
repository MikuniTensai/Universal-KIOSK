param (
    [string]$AppDir = "",
    [int]$Port = 5000,
    [int]$AdminPort = 5001,
    [string]$DataDir = ""
)

# Tentukan direktori aplikasi secara otomatis jika tidak dispesifikasikan
if ([string]::IsNullOrWhiteSpace($AppDir) -or -not (Test-Path $AppDir)) {
    if (Test-Path "$PSScriptRoot\..\dist") {
        $AppDir = "$PSScriptRoot\..\dist"
    } elseif (Test-Path "$PSScriptRoot\..\app") {
        $AppDir = "$PSScriptRoot\..\app"
    } elseif (Test-Path "$PSScriptRoot\app") {
        $AppDir = "$PSScriptRoot\app"
    } elseif (Test-Path "$PSScriptRoot\dist") {
        $AppDir = "$PSScriptRoot\dist"
    } else {
        $AppDir = $PSScriptRoot
    }
}

$AppDir = (Resolve-Path $AppDir).Path

# Direktori runtime data untuk shared state synchronization
if ([string]::IsNullOrWhiteSpace($DataDir)) {
    $DataDir = Join-Path $PSScriptRoot "..\data-runtime"
}
if (-not (Test-Path $DataDir)) {
    New-Item -ItemType Directory -Path $DataDir -Force | Out-Null
}
$SyncFile = Join-Path $DataDir "kiosk-sync-state.json"

# 1. Cek apakah server pada port ini sudah berjalan
try {
    $testReq = [System.Net.WebRequest]::Create("http://localhost:$Port/")
    $testReq.Timeout = 1000
    $testResp = $testReq.GetResponse()
    $testResp.Close()
    Write-Host "[INFO] Server Kiosk & Admin sudah berjalan di http://localhost:$Port/ dan :$AdminPort"
    exit 0
} catch {
    # Port belum terpakai, lanjutkan inisialisasi
}

# 1.1 Cek apakah Bun atau Node tersedia untuk menjalankan server native 0.0.0.0 (Akses LAN Tanpa Batasan URL ACL)
$bunPath = if (Test-Path "$env:USERPROFILE\.bun\bin\bun.exe") { "$env:USERPROFILE\.bun\bin\bun.exe" } elseif (Get-Command bun -ErrorAction SilentlyContinue) { (Get-Command bun).Source } else { $null }
$nodePath = if (Get-Command node -ErrorAction SilentlyContinue) { (Get-Command node).Source } else { $null }
$runtime = if ($bunPath) { $bunPath } elseif ($nodePath) { $nodePath } else { $null }

$dualMjs = Join-Path $PSScriptRoot "serve-dual.mjs"
if ($runtime -and (Test-Path $dualMjs)) {
    Write-Host "[INFO] Menjalankan Dual-Port Server (0.0.0.0) via $runtime..."
    & $runtime $dualMjs
    exit $LASTEXITCODE
}

# Simpan PID untuk shutdown instan
$pidFile = Join-Path $PSScriptRoot "server.pid"
Set-Content -Path $pidFile -Value $PID -Force

# 2. Inisialisasi HttpListener dengan Dual-Port (Kiosk Port 5000 & Admin Port 5001)
$listener = New-Object System.Net.HttpListener

# Loopback listener prefixes
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Prefixes.Add("http://localhost:$AdminPort/")
$listener.Prefixes.Add("http://127.0.0.1:$Port/")
$listener.Prefixes.Add("http://127.0.0.1:$AdminPort/")

# 3. Deteksi semua IP Lokal jaringan (LAN) agar bisa dikontrol via IP lokal
$detectedIps = @()
try {
    $hostName = [System.Net.Dns]::GetHostName()
    $localIps = [System.Net.Dns]::GetHostAddresses($hostName) | Where-Object { 
        $_.AddressFamily -eq [System.Net.Sockets.AddressFamily]::InterNetwork -and -not [System.Net.IPAddress]::IsLoopback($_)
    } | ForEach-Object { $_.IPAddressToString }

    foreach ($ip in $localIps) {
        $detectedIps += $ip
        $listener.Prefixes.Add("http://${ip}:${Port}/")
        $listener.Prefixes.Add("http://${ip}:${AdminPort}/")
    }
} catch {
    Write-Host "[WARN] Tidak dapat mendeteksi IP lokal, mengaktifkan loopback mode."
}

try {
    $listener.Start()
} catch {
    # Jika gagal karena batasan Windows URL ACL pada LAN IP, fallback ke loopback
    Write-Host "[WARN] Membutuhkan hak Admin untuk bind LAN IP di HttpListener ($($_.Exception.Message)). Beralih ke loopback..."
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add("http://localhost:$Port/")
    $listener.Prefixes.Add("http://localhost:$AdminPort/")
    $listener.Prefixes.Add("http://127.0.0.1:$Port/")
    $listener.Prefixes.Add("http://127.0.0.1:$AdminPort/")
    try {
        $listener.Start()
    } catch {
        $msg = $_.Exception.Message
        Write-Error "[ERROR] Gagal mengaktifkan HttpListener pada port ${Port}/${AdminPort}: $msg"
        Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
        exit 1
    }
}

Write-Host "=========================================================="
Write-Host "  SERVER DUAL-PORT KIOSK & ADMIN GUDANG PLN"
Write-Host "  Direktori App: $AppDir"
Write-Host "  Kiosk Display (Publik):   http://localhost:$Port/"
Write-Host "  Admin Portal (Supervisor): http://localhost:$AdminPort/"
foreach ($ip in $detectedIps) {
    Write-Host "  Akses LAN Petugas Gudang: http://${ip}:${AdminPort}/"
}
Write-Host "=========================================================="

$mimeTypes = @{
    ".html"  = "text/html; charset=utf-8"
    ".htm"   = "text/html; charset=utf-8"
    ".js"    = "application/javascript; charset=utf-8"
    ".mjs"   = "application/javascript; charset=utf-8"
    ".css"   = "text/css; charset=utf-8"
    ".json"  = "application/json; charset=utf-8"
    ".png"   = "image/png"
    ".jpg"   = "image/jpeg"
    ".jpeg"  = "image/jpeg"
    ".svg"   = "image/svg+xml"
    ".ico"   = "image/x-icon"
    ".webp"  = "image/webp"
    ".woff"  = "font/woff"
    ".woff2" = "font/woff2"
    ".ttf"   = "font/ttf"
    ".mp3"   = "audio/mpeg"
    ".mp4"   = "video/mp4"
    ".webm"  = "video/webm"
}

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        # Universal CORS Header untuk sinkronisasi antar-port dan LAN
        $response.AddHeader("Access-Control-Allow-Origin", "*")
        $response.AddHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        $response.AddHeader("Access-Control-Allow-Headers", "Content-Type, Accept")

        if ($request.HttpMethod -eq "OPTIONS") {
            $response.StatusCode = 204
            $response.OutputStream.Close()
            continue
        }

        $localPath = $request.Url.LocalPath.ToLower()

        # 1. API: Data Synchronization Antar-Port & Jaringan LAN
        if ($localPath -eq "/api/sync") {
            if ($request.HttpMethod -eq "POST") {
                try {
                    $reader = New-Object System.IO.StreamReader($request.InputStream, [System.Text.Encoding]::UTF8)
                    $body = $reader.ReadToEnd()
                    $reader.Close()

                    [System.IO.File]::WriteAllText($SyncFile, $body, [System.Text.Encoding]::UTF8)
                    $respBytes = [System.Text.Encoding]::UTF8.GetBytes('{"success":true,"message":"Data berhasil disinkronkan ke server"}')
                    $response.ContentType = "application/json; charset=utf-8"
                    $response.StatusCode = 200
                    $response.OutputStream.Write($respBytes, 0, $respBytes.Length)
                } catch {
                    $errBytes = [System.Text.Encoding]::UTF8.GetBytes('{"success":false,"message":"' + $_.Exception.Message + '"}')
                    $response.ContentType = "application/json; charset=utf-8"
                    $response.StatusCode = 500
                    $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
                }
                $response.OutputStream.Close()
                continue
            } elseif ($request.HttpMethod -eq "GET") {
                if (Test-Path $SyncFile) {
                    $bytes = [System.IO.File]::ReadAllBytes($SyncFile)
                    $response.ContentType = "application/json; charset=utf-8"
                    $response.StatusCode = 200
                    $response.OutputStream.Write($bytes, 0, $bytes.Length)
                } else {
                    $emptyBytes = [System.Text.Encoding]::UTF8.GetBytes('{"hasState":false}')
                    $response.ContentType = "application/json; charset=utf-8"
                    $response.StatusCode = 200
                    $response.OutputStream.Write($emptyBytes, 0, $emptyBytes.Length)
                }
                $response.OutputStream.Close()
                continue
            }
        }

        # 2. API: Info Status Server
        if ($localPath -eq "/api/status") {
            $statusObj = @{
                kioskPort = $Port
                adminPort = $AdminPort
                serverTime = (Get-Date).ToString("o")
                localIps = $detectedIps
            }
            $jsonStr = $statusObj | ConvertTo-Json
            $statusBytes = [System.Text.Encoding]::UTF8.GetBytes($jsonStr)
            $response.ContentType = "application/json; charset=utf-8"
            $response.StatusCode = 200
            $response.OutputStream.Write($statusBytes, 0, $statusBytes.Length)
            $response.OutputStream.Close()
            continue
        }

        # 3. Static Files & SPA Fallback
        $cleanPath = $request.Url.LocalPath.TrimStart('/')
        if ([string]::IsNullOrWhiteSpace($cleanPath)) {
            $cleanPath = "index.html"
        }

        $filePath = Join-Path $AppDir $cleanPath
        if (-not (Test-Path $filePath -PathType Leaf)) {
            # SPA Fallback ke index.html
            $filePath = Join-Path $AppDir "index.html"
        }

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $mime = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "application/octet-stream" }

            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentType = $mime
            $response.ContentLength64 = $bytes.Length
            $response.AddHeader("Cache-Control", "no-cache")
            $response.StatusCode = 200
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $errBytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
        }

        $response.OutputStream.Close()
    }
} finally {
    if ($listener.IsListening) {
        $listener.Stop()
        $listener.Close()
    }
    Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
}
