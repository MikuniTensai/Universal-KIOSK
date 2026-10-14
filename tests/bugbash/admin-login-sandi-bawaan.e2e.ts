import { describe, test } from '@e2e-dev/web';
import { expect } from 'e2e';

// "tidakada@pln-kiosk.id" tidak ada di data seed, jadi sandi apa pun harus ditolak
// dan form login harus tetap tampil.
describe('login konsol admin', { tags: ['bugbash'] }, () => {
  for (const sandi of ['admin', 'pln2026', 'adms2026']) {
    test(`akun tak terdaftar dengan sandi "${sandi}" ditolak`, async ({ app, screen }) => {
      await app.open('/?mode=admin');
      await screen.getByPlaceholder('Masukkan email atau username').fill('tidakada@pln-kiosk.id');
      await screen.getByPlaceholder('Masukkan kata sandi').fill(sandi);
      await screen.getByRole('button', 'Masuk Konsol Admin').tap();
      await app.screenshot(`setelah-login-${sandi}`);

      await expect(screen.getByRole('button', 'Masuk Konsol Admin')).toBeVisible();
    });
  }
});
