#!/usr/bin/env bash
# ==============================================================================
# Peluncur Kiosk Mandiri Gudang PLN untuk Pengujian di Lingkungan Linux
# Menggunakan Dual-Port: Port 5000 (Kiosk) & Port 5001 (Admin)
# ==============================================================================

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
KIOSK_URL="http://localhost:5000"
ADMIN_URL="http://localhost:5001"

# 1. Jalankan server background jika belum aktif
bash "$DIR/scripts/start-server-linux.sh"

echo "=========================================================="
echo "  MELUNCURKAN UNIVERSAL-KIOSK PLN DI LINUX"
echo "  Kiosk URL: $KIOSK_URL"
echo "  Admin URL: $ADMIN_URL"
echo "=========================================================="

# 2. Pilihan Mode
if [ "$1" == "--kiosk" ]; then
    echo "[INFO] Membuka mode Kiosk Layar Penuh (Tekan Alt+F4 atau F11 untuk keluar)..."
    if command -v firefox >/dev/null 2>&1; then
        firefox --kiosk "$KIOSK_URL" &
    elif command -v google-chrome >/dev/null 2>&1; then
        google-chrome --kiosk "$KIOSK_URL" &
    elif command -v chromium >/dev/null 2>&1; then
        chromium --kiosk "$KIOSK_URL" &
    fi
elif [ "$1" == "--admin" ]; then
    echo "[INFO] Membuka Portal Admin di browser..."
    if command -v xdg-open >/dev/null 2>&1; then
        xdg-open "$ADMIN_URL" &
    fi
else
    echo "[INFO] Membuka di browser default..."
    if command -v xdg-open >/dev/null 2>&1; then
        xdg-open "$KIOSK_URL" &
    elif command -v firefox >/dev/null 2>&1; then
        firefox "$KIOSK_URL" &
    else
        echo "Buka di browser:"
        echo "  - Layar Kiosk: $KIOSK_URL"
        echo "  - Portal Admin: $ADMIN_URL"
    fi
fi
