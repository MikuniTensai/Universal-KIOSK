import { test } from '@e2e-dev/web';
import { credentials, expect } from 'e2e';

// Warning 1 detik ditolak karena di bawah minimum 3 detik, bukan karena lebih besar dari idle 99999;
// pesan error tidak boleh menyebut alasan yang salah.
test('pesan validasi Timeout Warning menyebut alasan yang benar', { tags: ['bugbash'] }, async ({ app, screen }) => {
  const admin = credentials.user('admin');
  await app.open('/?mode=admin');
  await screen.getByPlaceholder('Masukkan email atau username').fill(admin.username);
  await screen.getByPlaceholder('Masukkan kata sandi').fill(admin.password);
  await screen.getByRole('button', 'Masuk Konsol Admin').tap();
  await screen.getByRole('button', 'Pengaturan Kiosk').tap();

  await screen.getByDisplayValue('60').fill('99999');
  await screen.getByDisplayValue('10').fill('1');
  await screen.getByRole('button', 'Simpan Konfigurasi').tap();

  await expect(screen.getByText('Warning timeout', { exact: false })).toBeVisible();
  await expect(screen.getByText('harus lebih kecil dari idle timeout', { exact: false })).toHaveCount(0);
});
