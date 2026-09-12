#!/usr/bin/env bash
# ==============================================================================
# Peluncur Server Dual-Port Linux (Universal Kiosk Gudang PLN)
# Port 5000: Layar Kiosk Publik (21.5" Touchscreen)
# Port 5001: Portal Admin Mandiri & Kontrol LAN
# ==============================================================================

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PID_FILE="$DIR/scripts/server.pid"
KIOSK_PORT=5000
ADMIN_PORT=5001

# 1. Pastikan bundle build produksi dist/ tersedia
if [ ! -f "$DIR/dist/index.html" ]; then
    echo "[INFO] Folder dist/ belum tersedia. Melakukan kompilasi build produksi..."
    cd "$DIR" && npm run build
fi

# 2. Cek apakah server dual-port sudah berjalan
ALREADY_RUNNING=0
if curl -s --max-time 1 "http://localhost:$KIOSK_PORT/" > /dev/null 2>&1; then
    ALREADY_RUNNING=1
fi

if [ $ALREADY_RUNNING -eq 0 ]; then
    echo "[INFO] Menjalankan Server Dual-Port (Node.js) di latar belakang..."
    cd "$DIR" && nohup node scripts/serve-dual.mjs </dev/null > "$DIR/scripts/server.log" 2>&1 &
    SERVER_PID=$!
    disown $SERVER_PID 2>/dev/null || true
    echo "$SERVER_PID" > "$PID_FILE"
    sleep 1.5
else
    echo "[INFO] Server Dual-Port sudah aktif berjalan."
fi

# 3. Deteksi Alamat IP Lokal Jaringan (LAN)
LOCAL_IPS=$(ip -4 addr show scope global 2>/dev/null | grep inet | awk '{print $2}' | cut -d/ -f1 | grep -v '^172\.' || hostname -I 2>/dev/null | tr ' ' '\n' | grep -v '^$')

echo "=========================================================="
echo "  SERVER LINUX UNIVERSAL-KIOSK GUDANG PLN AKTIF"
echo "=========================================================="
echo "  [1] LAYAR KIOSK PUBLIK (Layar Sentuh Kassen WK-215):"
echo "      -> http://localhost:$KIOSK_PORT/"
echo ""
echo "  [2] PORTAL ADMIN MANDIRI (Tanpa Hambatan PIN):"
echo "      -> http://localhost:$ADMIN_PORT/"
echo ""
if [ -n "$LOCAL_IPS" ]; then
    echo "  [3] KONTROL JARINGAN LOKAL (Buka dari Laptop/HP di LAN):"
    for IP in $LOCAL_IPS; do
        echo "      -> http://$IP:$ADMIN_PORT/  (Admin Console)"
        echo "      -> http://$IP:$KIOSK_PORT/  (Kiosk Display)"
    done
fi
echo "=========================================================="
echo "  * Log server tersimpan di: scripts/server.log"
echo "  * Hentikan server kapan saja dengan: kill \$(cat scripts/server.pid)"
echo "=========================================================="

# 4. Buka di browser jika opsi diberikan atau jika desktop browser tersedia
if [ "$1" == "--admin" ]; then
    echo "[INFO] Membuka Portal Admin di browser..."
    if command -v xdg-open >/dev/null 2>&1; then
        xdg-open "http://localhost:$ADMIN_PORT/" &
    fi
elif [ "$1" == "--kiosk" ]; then
    echo "[INFO] Membuka Layar Kiosk di browser..."
    if command -v xdg-open >/dev/null 2>&1; then
        xdg-open "http://localhost:$KIOSK_PORT/" &
    fi
elif [ "$1" == "--open" ]; then
    echo "[INFO] Membuka kedua port di tab browser..."
    if command -v xdg-open >/dev/null 2>&1; then
        xdg-open "http://localhost:$KIOSK_PORT/" &
        sleep 0.5
        xdg-open "http://localhost:$ADMIN_PORT/" &
    fi
fi
