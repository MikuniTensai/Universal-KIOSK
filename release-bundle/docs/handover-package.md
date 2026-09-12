# Paket Serah Terima MVP Universal-KIOSK (K32)

## 1. Identitas Rilis & Repositori
- **Nama Proyek:** Universal-KIOSK (Kiosk Informasi & Scanner Gudang PLN)
- **Target Hardware:** Kassen WK-215 Self-Service Kiosk Series
- **Versi Rilis:** 1.0.0-MVP
- **Pengembang Bertugas:** `develop-mikunitensai`
- **Tanggal Penyelesaian:** 11 September 2026

## 2. Struktur Berkas & Artefak yang Diserahterimakan
1. **Kode Sumber Lengkap:**
   - `src/` (Komponen UI, arsitektur modular, domain validation, storage adapter, scanner wedge handler, idle timer).
   - `tests/` (46 unit & integration tests dengan cakupan DATA-01–04, R01–R15, WCAG contrast, dan flow navigasi).
2. **Paket Distribusi Offline (`release-bundle/`):**
   - `release-bundle/app/` (Hasil build siap saji `dist/` HTML, CSS, JS teroptimasi).
   - `release-bundle/scripts/launch-kiosk.bat` (Peluncur mode kiosk layar penuh via Microsoft Edge).
   - `release-bundle/scripts/setup-windows-kiosk.ps1` (Skrip konfigurasi Windows auto-start & lock-down).
   - `release-bundle/BACA_DULU_PETUNJUK_INSTALASI.txt` (Panduan ringkas pemasangan di lokasi).
3. **Dokumentasi Lengkap (`docs/`):**
   - `docs/kassen-inventory.md` (Inventarisasi periferal Kassen WK-215).
   - `docs/quality-baseline.md` (Baseline kualitas K06).
   - `docs/runbook-operator.md` (Panduan penggunaan petugas lapangan).
   - `docs/runbook-admin.md` (Panduan impor data & manajemen snapshot).
   - `docs/runbook-troubleshooting.md` (Panduan troubleshooting hardware & recovery).
   - `docs/qa-device-verification.md` (Laporan pengujian QA & bukti verifikasi).
   - `docs/go-no-go-evaluation.md` (Evaluasi Quality Gate & Keputusan Go).

## 3. Langkah Pemasangan di Terminal Kassen WK-215 Lapangan
1. Salin seluruh isi folder `release-bundle/` ke drive lokal mesin Kassen (contoh: `C:\Universal-KIOSK\`).
2. Jalankan PowerShell sebagai Administrator, lalu eksekusi `C:\Universal-KIOSK\scripts\setup-windows-kiosk.ps1`.
3. Restart mesin Kassen WK-215. Kiosk PLN akan otomatis menyala dan siap melayani petugas gudang!
