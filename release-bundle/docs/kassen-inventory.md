# Inventarisasi Perangkat Kiosk Kassen WK-215 (PLN Logistik)

## 1. Identifikasi & Spesifikasi Hardware Kassen WK-215

- **Perangkat:** Kassen WK-215 Self-Service Kiosk Series
- **Sistem Operasi Target:** Windows 10 / 11 64-bit (IoT Enterprise / Pro)
- **Processor & RAM:** Intel Core i3, RAM 4 GB DDR4, SSD 64 GB M.2 NVMe/SATA
- **Layar:** 21.5 inci Full HD Touch Screen (1920x1080 Landscape / 1080x1920 Portrait Capacitive Multi-touch)
- **Scanner:** Built-in 2D CMOS Imager Barcode/QR Reader (USB HID Keyboard Wedge Mode, akhiran string `Enter` / `\n`, kecepatan transmisi burst < 50ms per karakter)
- **Printer:** 80mm Thermal Printer with Auto-Cutter (USB / Virtual COM Port, status out-of-paper sensor) - *Opsional diluar MVP inti*
- **Speaker:** Built-in 3W Stereo untuk audio alert (Beep sukses & notifikasi)
- **Antarmuka Jaringan:** Gigabit Ethernet RJ-45 & Wi-Fi 802.11 b/g/n/ac

## 2. Karakteristik Operasional Kiosk Gudang PLN

1. **Jaringan Terputus (Offline-First):**
   - Terminal kiosk berada di gudang logistik PLN yang sering mengalami fluktuasi atau putus sinyal jaringan. Seluruh data material, spek SPLN, foto, dan lokasi rak harus dapat diakses secara lokal tanpa ketergantungan koneksi server/cloud.
2. **Scanner USB HID Wedge Handling:**
   - Scanner mengirim keystroke dalam durasi sangat singkat (<50ms jeda).
   - Buffer scanner harus membedakan ketikan manual pengguna di layar sentuh dengan tembakan barcode berkecepatan tinggi.
   - Karakter penutup wajib `Enter` (`\n`).
3. **Data Material & Definisi Stok:**
   - Nol (`0`) berarti fisik kosong tetapi tercatat.
   - `null` berarti data stok belum tersedia / belum dilaporkan. Keduanya tidak boleh disamakan.
   - Waktu sumber data (`sourceAt`) wajib ditampilkan agar petugas mengetahui kesegaran data.
   - Jika melewati `staleAfterHours` (default 24 jam), sistem menampilkan peringatan "Data Stok Lama".
4. **Keamanan Terminal Kiosk (Lockdown):**
   - Menonaktifkan context menu (klik kanan).
   - Memblokir tombol keluar pintasan browser (`F11`, `F12`, `Alt+F4`, `Ctrl+R`, `Ctrl+N`, `Ctrl+W`).
   - Sesi publik otomatis timeout ke layar screensaver/idle jika tidak ada aktivitas selama 60 detik (dengan dialog hitung mundur peringatan 10 detik).
