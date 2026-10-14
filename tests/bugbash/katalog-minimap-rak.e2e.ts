import { test } from '@e2e-dev/web';
import { expect } from 'e2e';

// BOX 105 KVA di data seed tersimpan di Blok C tanpa rak (kartu dan detail: "RAK -"),
// jadi denah dan panduan arah tidak boleh menyebut "RAK C".
test('mini map tidak mengarang rak untuk material tanpa rak', { tags: ['bugbash'] }, async ({ app, screen }) => {
  await app.open('/');
  await screen.tapAt({ x: 960, y: 400 });
  await screen.getByRole('button', 'Lihat Daftar Item Return').tap();
  await screen.getByText('BOX 105 KVA - BOX;APPMCCB160A+STRIP;AL2MM;1205X420X250').tap();
  await expect(screen.getByText('Denah Visual Lokasi Rak Gudang Aris Munandar')).toBeVisible();
  await app.screenshot('detail-box-105-kva');

  await expect(screen.getByText('BLOK C RAK C')).toHaveCount(0);
});
