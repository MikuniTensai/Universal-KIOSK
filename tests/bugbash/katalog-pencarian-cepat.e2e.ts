import { test } from '@e2e-dev/web';
import { expect } from 'e2e';

// Setiap tombol "Pencarian Cepat Lokasi" harus menemukan minimal satu material di data seed.
const CHIP = [
  ['⚡ kWh Meter (Rak A-001)', 'Rak A-001'],
  ['📦 TRF Dudukan (1060798)', '1060798'],
  ['⚡ MCB 10A (Rak A11)', 'A11'],
  ['🔌 Cable Shoe 150mm² (Rak H12)', 'H12'],
  ['⚡ Box 105 kVA (4120470)', '4120470'],
  ['📦 kWh Meter E-PR (Rak C11)', 'C11'],
  ['⚡ Fuse Link 20kV (Rak I13)', 'I13'],
  ['📦 Kabel NFA2X (3110542)', '3110542'],
  ['🔌 Trafo 160kVA (1030075)', '1030075'],
  ['⚡ NH Fuse 125A (2240029)', '2240029'],
  ['🦺 Tang K3 (202608)', '202608'],
] as const;

test('semua tombol Pencarian Cepat Lokasi menemukan material', { tags: ['bugbash'] }, async ({ app, screen }) => {
  await app.open('/');
  await screen.tapAt({ x: 960, y: 400 });
  await screen.getByRole('button', 'Lihat Daftar Item Baru').tap();
  const cari = screen.getByPlaceholder('Cari nama material, kode normalisasi SAP (misal: 4120470), rak, atau blok...');

  const kosong: string[] = [];
  for (const [label, query] of CHIP) {
    await screen.getByRole('button', label).tap();
    await expect(cari).toHaveValue(query);
    if (await screen.getByText('Tidak Ada Material yang Cocok').isVisible()) kosong.push(label);
  }

  expect(kosong).toEqual([]);
});
