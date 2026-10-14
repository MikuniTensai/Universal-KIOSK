import { test } from '@e2e-dev/web';
import { credentials, expect } from 'e2e';
import type { Screen, Secret } from 'e2e';

async function masuk(screen: Screen, sandi: Secret) {
  await screen.getByPlaceholder('Masukkan email atau username').fill(credentials.user('admin').username);
  await screen.getByPlaceholder('Masukkan kata sandi').fill(sandi);
  await screen.getByRole('button', 'Masuk Konsol Admin').tap();
}

test('"Ingat saya pada perangkat ini" menjaga sesi admin setelah muat ulang', { tags: ['bugbash'] }, async ({ app, screen }) => {
  await app.open('/?mode=admin');
  await expect(screen.getByRole('checkbox', 'Ingat saya pada perangkat ini')).toBeChecked();
  await masuk(screen, credentials.user('admin').password);
  await expect(screen.getByRole('button', 'Keluar')).toBeVisible();

  await app.open('/?mode=admin');
  await expect(screen.getByRole('button', 'Keluar')).toBeVisible({ timeout: 10_000 });
});

test('sandi lama admin ditolak setelah diganti di Profil & Ubah Password', { tags: ['bugbash'] }, async ({ app, screen }) => {
  const admin = credentials.user('admin');
  await app.open('/?mode=admin');
  await masuk(screen, admin.password);
  await screen.getByRole('button', 'Profil & Ubah Password').tap();
  await screen.getByPlaceholder('Masukkan kata sandi saat ini').fill(admin.password);
  await screen.getByPlaceholder('Masukkan kata sandi baru (minimal 4 karakter)').fill('Gudang-Baru-2026');
  await screen.getByPlaceholder('Ulangi kata sandi baru persis sama').fill('Gudang-Baru-2026');
  await screen.getByRole('button', 'Simpan Kata Sandi Baru').tap();
  await expect(screen.getByText('Kata sandi berhasil diperbarui!', { exact: false })).toBeVisible();

  // Data pengguna tersimpan di localStorage, sesi login hanya di memori: buka ulang = sesi baru.
  await app.open('/?mode=admin');
  await masuk(screen, admin.password);
  await expect(screen.getByRole('button', 'Masuk Konsol Admin')).toBeVisible();
});
