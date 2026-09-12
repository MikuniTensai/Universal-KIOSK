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
Versi: 1.0.0
Target OS: Windows 10 / 11 64-bit

## Cara Menjalankan Aplikasi di Unit Kassen WK-215:
1. Pastikan folder ini disalin ke harddisk unit (misal: C:\\PLN-Kiosk\\).
2. Klik ganda 'scripts/launch-kiosk.bat' untuk meluncurkan aplikasi layar penuh.
3. Untuk setup otomatis menyala saat boot, klik kanan 'scripts/setup-windows-kiosk.ps1' lalu pilih 'Run with PowerShell'.
4. Default PIN untuk akses petugas/admin: 123456.

Dokumentasi lengkap terdapat di folder docs/.
`;

fs.writeFileSync(path.join(bundleDir, 'BACA_DULU_PETUNJUK_INSTALASI.txt'), readmeText, 'utf8');

console.log(`[SUKSES] Paket rilis offline berhasil dibuat di: ${bundleDir}`);
console.log('Semua aset font, media, skrip, dan bundle aplikasi siap dipindahkan ke unit Kassen tanpa internet!');
