import type { E2EConfig } from 'e2e';
import { web } from '@e2e-dev/web';
import { chatgpt } from 'e2e/oauth/chatgpt';

// Password akun seed admin dibaca dari .env.e2e.local (di-ignore git), bukan ditulis di sini.
try {
  process.loadEnvFile('.env.e2e.local');
} catch {}

const context =
  'The app is a public touch-screen information kiosk for the PLN warehouse "Gudang Aris Munandar PLN UP3 Malang", shown on a 1920x1080 screen; all copy is Indonesian. ' +
  'Two modes: the public kiosk at / (it starts on a screensaver; tapping it opens the home screen with four cards: "Katalog Blok & Rak Baru", "Katalog Blok & Rak Return", "SOP", "Visualisasi Denah & Tata Letak Gudang"), ' +
  'and the admin console at /?mode=admin (sign in with email or username plus password, then a sidebar: Ringkasan & Overview, Kelola & Tambah Stok (Baru, Return, Checker Stok), Kelola Kategori, Tata Letak Blok & Rak, Impor Paket Baru, Riwayat & Restore, Manajemen Pengguna, Profil & Ubah Password, Pengaturan Kiosk, Akses WiFi & IP LAN, Log Diagnostik). ' +
  'All data lives in the browser localStorage and every session starts from the shipped seed data; seed materials and the seed admin account are not bugs. ' +
  'This is a local dev server without the kiosk backend: /api/sync, /api/network-info, /api/system/backup-sql and the power endpoints do not exist here, so sync, LAN IP info and SQL backup fall back to offline behaviour; that alone is not a bug. ' +
  'In the power menu ("Menu Daya & Keluar Kiosk") you may open it and cancel, but never confirm Matikan, Restart or Keluar Kiosk. ' +
  'The kiosk returns to the screensaver after a period of inactivity; the barcode scanner is a keyboard wedge and the scan screen offers a simulated scan.';

export default {
  agents: {
    default: {
      model: chatgpt('gpt-6-luna'),
      system: 'You are a thorough QA agent. Verify every outcome.',
      context,
    },
  },
  targets: [
    {
      name: 'web',
      engine: web({ viewport: { width: 1920, height: 1080 }, locale: 'id-ID', timezoneId: 'Asia/Jakarta' }),
      app: {
        url: 'http://127.0.0.1:3000',
        command: {
          executable: 'node',
          args: ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '{port}', '--strictPort'],
          log: '.e2e/logs/app.log',
          reuseExisting: true,
        },
      },
    },
  ],
  credentials: {
    admin: { username: 'admin@pln-kiosk.id', password: () => process.env.E2E_USER_ADMIN_PASSWORD ?? '' },
  },
} satisfies E2EConfig;
