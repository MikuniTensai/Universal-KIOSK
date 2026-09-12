Add-Type -AssemblyName System.Drawing

function CreateRoundedRectanglePath([float]$x, [float]$y, [float]$width, [float]$height, [float]$radius) {
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $diameter = $radius * 2.0
    $arc = New-Object System.Drawing.RectangleF($x, $y, $diameter, $diameter)
    
    $path.AddArc($arc, [float]180, [float]90)
    $arc.X = ($x + $width) - $diameter
    $path.AddArc($arc, [float]270, [float]90)
    $arc.Y = ($y + $height) - $diameter
    $path.AddArc($arc, [float]0, [float]90)
    $arc.X = $x
    $path.AddArc($arc, [float]90, [float]90)
    $path.CloseFigure()
    return $path
}

$srcPath = "C:\PLN-Kiosk\app\pln_logo.png"
if (-not (Test-Path $srcPath)) {
    $srcPath = "C:\Nusamanda\Universal-KIOSK-main\public\pln_logo.png"
}

$src = [System.Drawing.Bitmap]::FromFile($srcPath)
$emblemRect = New-Object System.Drawing.Rectangle(0, 0, 1371, $src.Height)
$emblemBmp = $src.Clone($emblemRect, $src.PixelFormat)

$sizes = @(256, 128, 64, 48, 32, 16)
$pngBytesList = @()

foreach ($size in $sizes) {
    $fSize = [float]$size
    $bmp = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    $pad = [float]([Math]::Max(1.0, $size * 0.045))
    $radius = [float]([Math]::Max(2.0, $size * 0.14))
    $drawW = $fSize - ($pad * 2.0)
    $drawH = $fSize - ($pad * 2.0)

    $rect = New-Object System.Drawing.RectangleF($pad, $pad, $drawW, $drawH)
    $path = CreateRoundedRectanglePath $pad $pad $drawW $drawH $radius

    $g.SetClip($path)
    $g.DrawImage($emblemBmp, $rect)
    $g.ResetClip()

    if ($size -ge 32) {
        $penWidth = [float]([Math]::Max(1.0, $size * 0.008))
        $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(40, 0, 0, 0), $penWidth)
        $g.DrawPath($pen, $path)
        $pen.Dispose()
    }
    $path.Dispose()
    $g.Dispose()

    $ms = New-Object System.IO.MemoryStream
    $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
    $bytes = $ms.ToArray()
    $pngBytesList += ,$bytes
    $ms.Dispose()
    $bmp.Dispose()
}

$emblemBmp.Dispose()
$src.Dispose()

# Assemble Multi-Resolution ICO
$icoMs = New-Object System.IO.MemoryStream
$bw = New-Object System.IO.BinaryWriter($icoMs)

# ICONDIR Header (6 bytes)
$bw.Write([UInt16]0) # Reserved
$bw.Write([UInt16]1) # Type: 1 = Icon
$bw.Write([UInt16]$sizes.Length) # Count

# Header size = 6 + (N * 16)
$headerSize = 6 + ($sizes.Length * 16)
$offset = $headerSize

# Directory entries (16 bytes each)
for ($i = 0; $i -lt $sizes.Length; $i++) {
    $size = $sizes[$i]
    $bytes = $pngBytesList[$i]
    $w = if ($size -ge 256) { [Byte]0 } else { [Byte]$size }
    $h = if ($size -ge 256) { [Byte]0 } else { [Byte]$size }

    $bw.Write($w)             # Width
    $bw.Write($h)             # Height
    $bw.Write([Byte]0)        # ColorCount
    $bw.Write([Byte]0)        # Reserved
    $bw.Write([UInt16]1)      # Planes
    $bw.Write([UInt16]32)     # BitCount
    $bw.Write([UInt32]$bytes.Length) # BytesInRes
    $bw.Write([UInt32]$offset)       # ImageOffset

    $offset += $bytes.Length
}

# Write PNG byte arrays
foreach ($bytes in $pngBytesList) {
    $bw.Write($bytes)
}

$bw.Flush()
$allIcoBytes = $icoMs.ToArray()
$bw.Dispose()
$icoMs.Dispose()

$targetPaths = @(
    "C:\PLN-Kiosk\app\pln.ico",
    "C:\PLN-Kiosk\scripts\pln.ico",
    "C:\Nusamanda\Universal-KIOSK-main\public\pln.ico"
)

foreach ($p in $targetPaths) {
    $dir = Split-Path $p
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    [System.IO.File]::WriteAllBytes($p, $allIcoBytes)
    Write-Host "[OK] Icon saved to $p ($($allIcoBytes.Length) bytes)" -ForegroundColor Green
}
