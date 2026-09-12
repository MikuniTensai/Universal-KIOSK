import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');
const bundleDir = path.resolve(rootDir, 'release-bundle');

console.log('=== MEMBUAT PAKET DISTRIBUSI OFFLINE UNIVERSAL-KIOSK PLN ===');

if (!fs.existsSync(distDir)) {
  console.error('[ERROR] Folder dist/ belum ada. Jalankan npm run build terlebih dahulu!');
  process.exit(1);
}

// 1. Buat direktori release-bundle
if (fs.existsSync(bundleDir)) {
  fs.rmSync(bundleDir, { recursive: true, force: true });
}
fs.mkdirSync(bundleDir, { recursive: true });

// 2. Salin dist ke release-bundle/app
fs.cpSync(distDir, path.join(bundleDir, 'app'), { recursive: true });

// 3. Salin scripts peluncur
fs.cpSync(path.join(rootDir, 'scripts'), path.join(bundleDir, 'scripts'), { recursive: true });

// 4. Salin panduan docs
fs.cpSync(path.join(rootDir, 'docs'), path.join(bundleDir, 'docs'), { recursive: true });

// 5. Buat file petunjuk instalasi cepat
const readmeText = `# PAKET RILIS OFFLINE KIOSK MANDIRI GUDANG PLN (KASSEN WK-215)
Versi: 1.1.0 (Dual-Port Architecture & LAN Management)
Target OS: Windows 10 / 11 64-bit

## 1. Arsitektur Port Terpisah (Dual-Port):
- **PORT 5000 (Layar Kiosk Publik 21.5")**:
  - URL: http://localhost:5000/
  - Tombol admin disembunyikan dari layar publik agar aman dari intip PIN (zero shoulder-surfing).
  - Jalankan via: 'scripts/launch-kiosk.bat'.
  - Akses darurat di layar kios: Ketuk logo PLN 5x cepat.

- **PORT 5001 (Portal Administrator & Kontrol LAN)**:
  - URL Lokal: http://localhost:5001/
  - Akses Jaringan LAN: http://<IP-Komputer-Kiosk>:5001/ (dari laptop/PC kantor supervisor)
  - Bebas PIN, langsung membuka Full-Page Management Console:
    * Manajemen Stok & Quick Add
    * Tambah/Hapus Material Masuk (Clean Cascade Deletion)
    * Kelola Hirarki Blok A sampai Z
    * Impor Paket SAP JSON & Riwayat Snapshot
    * Pengaturan Sistem Kiosk
  - Jalankan via: 'scripts/launch-admin.bat' atau 'scripts/launch-admin-windowed.bat'.

## 2. Cara Pemasangan di Unit Kassen WK-215:
1. Salin seluruh isi folder ini ke harddisk unit (contoh: C:\\PLN-Kiosk\\).
2. Klik kanan 'scripts/setup-windows-kiosk.ps1' lalu pilih 'Run with PowerShell' (sebagai Administrator).
   Skrip ini otomatis mendaftarkan auto-start saat Windows booting dan membuat 4 shortcut di Desktop:
   - Jalankan Kiosk PLN (Port 5000 Fullscreen)
   - Portal Admin Gudang PLN (Port 5001)
   - Kiosk PLN (Mode Jendela)
   - Tutup Kiosk PLN

Dokumentasi teknis lengkap terdapat di folder docs/.
`;

fs.writeFileSync(path.join(bundleDir, 'BACA_DULU_PETUNJUK_INSTALASI.txt'), readmeText, 'utf8');

console.log(`[SUKSES] Paket rilis offline berhasil dibuat di: ${bundleDir}`);
console.log('Semua aset font, media, skrip, dan bundle aplikasi siap dipindahkan ke unit Kassen tanpa internet!');
