param (
    [string]$AppDir = "",
    [int]$Port = 5000
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

# 1. Cek apakah server pada port ini sudah berjalan
try {
    $testReq = [System.Net.WebRequest]::Create("http://localhost:$Port/")
    $testReq.Timeout = 1000
    $testResp = $testReq.GetResponse()
    $testResp.Close()
    Write-Host "[INFO] Server Kiosk lokal sudah berjalan di http://localhost:$Port/"
    exit 0
} catch {
    # Port belum terpakai, lanjutkan inisialisasi
}

# Simpan PID untuk shutdown instan
$pidFile = Join-Path $PSScriptRoot "server.pid"
Set-Content -Path $pidFile -Value $PID -Force

# 2. Inisialisasi HttpListener
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")

try {
    $listener.Start()
} catch {
    $msg = $_.Exception.Message
    Write-Error "[ERROR] Gagal mengaktifkan HttpListener pada port ${Port}: $msg"
    Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
    exit 1
}

Write-Host "=========================================================="
Write-Host "  SERVER LOKAL OFFLINE KIOSK GUDANG PLN"
Write-Host "  Direktori: $AppDir"
Write-Host "  URL: http://localhost:$Port/"
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
            $response.AddHeader("Access-Control-Allow-Origin", "*")
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
