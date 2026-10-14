import { describe, it, expect } from 'vitest';
import { matchesMaterialSearch } from '../../src/features/admin/materialSearch';

const mcb = {
  name: 'MCB;230/400V;1P;10A;50Hz;',
  code: '3150001',
  sapCode: '3150001',
  unit: 'BH',
  status: 'Baru',
};
const mcbLoc = { blokDisplay: 'C', rakDisplay: 'H', subRakDisplay: 'H12' };

const trafo = {
  name: 'UNIV ACC;COVER BUSHING TRAFO',
  code: '4120470',
  sapCode: null,
  unit: 'SET',
  status: 'USUL HAPUS',
};
const trafoLoc = { blokDisplay: 'Gudang Bululawang', rakDisplay: '-', subRakDisplay: '-' };

describe('Pencarian Daftar & Kelola Stok Material', () => {
  it('tidak memunculkan material hanya karena huruf query ada di satuan, blok, atau rak', () => {
    // Sebelumnya "bh" dan "h" cocok ke satuan BH sehingga hampir seluruh daftar muncul.
    expect(matchesMaterialSearch(mcb, mcbLoc, 'bh')).toBe(true);
    expect(matchesMaterialSearch(trafo, trafoLoc, 'bh')).toBe(false);
    expect(matchesMaterialSearch(trafo, trafoLoc, 'b')).toBe(true); // "B" ada di nama BUSHING
    expect(matchesMaterialSearch({ ...trafo, name: 'COVER TRAFO' }, trafoLoc, 'b')).toBe(false);
    expect(matchesMaterialSearch(mcb, mcbLoc, '-')).toBe(false);
  });

  it('mencari lokasi dengan kode utuh maupun label blok/rak/sub rak', () => {
    for (const q of ['c', 'Blok C', 'blok  c', 'h', 'rak h', 'h12', 'sub rak h12', 'SUB RAK H12']) {
      expect(matchesMaterialSearch(mcb, mcbLoc, q), q).toBe(true);
    }
    expect(matchesMaterialSearch(mcb, mcbLoc, 'blok h')).toBe(false);
    expect(matchesMaterialSearch(mcb, mcbLoc, 'rak c')).toBe(false);
  });

  it('tetap mencocokkan sebagian untuk query minimal 3 huruf', () => {
    expect(matchesMaterialSearch(trafo, trafoLoc, 'bululawang')).toBe(true);
    expect(matchesMaterialSearch(trafo, trafoLoc, 'hapus')).toBe(true);
    expect(matchesMaterialSearch(mcb, mcbLoc, 'hapus')).toBe(false);
  });

  it('nama, kode normalisasi, dan kode SAP tetap dicari sebagian', () => {
    expect(matchesMaterialSearch(mcb, mcbLoc, 'mcb')).toBe(true);
    expect(matchesMaterialSearch(mcb, mcbLoc, '3150')).toBe(true);
    expect(matchesMaterialSearch(trafo, trafoLoc, 'trafo')).toBe(true);
    expect(matchesMaterialSearch(trafo, trafoLoc, 'zzzz')).toBe(false);
  });

  it('query kosong atau spasi saja menampilkan semua material', () => {
    expect(matchesMaterialSearch(mcb, mcbLoc, '')).toBe(true);
    expect(matchesMaterialSearch(mcb, mcbLoc, '   ')).toBe(true);
  });
});
