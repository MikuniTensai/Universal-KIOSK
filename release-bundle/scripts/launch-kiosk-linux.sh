#!/usr/bin/env bash
# ==============================================================================
# Peluncur Kiosk Mandiri Gudang PLN untuk Pengujian di Lingkungan Linux
# ==============================================================================

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
URL="http://localhost:3000"

# 1. Cek apakah server lokal sudah aktif
if ! curl -s --head "$URL" | grep "200" > /dev/null 2>&1; then
    echo "[INFO] Memulai server Kiosk di background..."
    cd "$DIR" && nohup npx vite preview --port 3000 --host > /dev/null 2>&1 &
    sleep 2
fi

echo "=========================================================="
echo "  MELUNCURKAN UNIVERSAL-KIOSK PLN DI LINUX"
echo "  URL: $URL"
echo "=========================================================="

# 2. Pilihan Mode: Kiosk Fullscreen atau Tab Biasa
if [ "$1" == "--kiosk" ]; then
    echo "[INFO] Membuka mode Kiosk Layar Penuh (Tekan Alt+F4 untuk keluar)..."
    firefox --kiosk "$URL" &
else
    echo "[INFO] Membuka di browser default..."
    if command -v xdg-open >/dev/null 2>&1; then
        xdg-open "$URL" > /dev/null 2>&1 &
    elif command -v firefox >/dev/null 2>&1; then
        firefox "$URL" > /dev/null 2>&1 &
    else
        echo "Buka di browser: $URL"
    fi
fi
