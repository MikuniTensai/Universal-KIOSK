# Panduan Troubleshooting & Pemeliharaan Kiosk
### Terminal Kassen WK-215 Gudang PLN

## 1. Masalah: Scanner Tidak Merespon
1. **Pemeriksaan Kabel:** Periksa kabel USB scanner built-in di dalam kompartemen bawah Kassen WK-215 apakah terpasang kokoh pada port motherboard.
2. **Uji Virtual COM / HID:** Buka Notepad di Windows. Tembakkan salah satu barcode material. Jika teks barcode muncul di Notepad dan diakhiri Enter, berarti hardware scanner dalam kondisi baik.
3. **Kaca Pemindai Kotor:** Bersihkan kaca sensor pemindai dengan kain mikrofiber lembut. Debu gudang yang tebal dapat mengganggu pembacaan garis barcode.

## 2. Masalah: Aplikasi Menampilkan "Konfigurasi Awal Diperlukan"
- Kondisi ini terjadi jika basis data lokal kosong (misalnya setelah instalasi pertama).
- **Solusi:** Klik tombol "Buka Panel Petugas", masukkan PIN `123456`, lalu lakukan impor paket perdana sesuai `docs/runbook-admin.md`.

## 3. Masalah: Layar Sentuh Kurang Responsif
- Kassen WK-215 menggunakan layar capacitive multi-touch.
- Bersihkan permukaan kaca layar dari noda minyak atau debu kering menggunakan pembersih layar khusus.
- Pastikan grounding listrik unit terhubung (ketiadaan grounding dapat menimbulkan *ghost touch* pada layar capacitive).

## 4. Masalah: Kiosk Ingin Dimatikan untuk Maintenance
1. Buka panel admin (PIN `123456`).
2. Tekan kombinasi keyboard fisik `Ctrl+W` atau `Alt+F4` dari keyboard maintenance.
3. Shutdown Windows melalui menu Start Windows.
