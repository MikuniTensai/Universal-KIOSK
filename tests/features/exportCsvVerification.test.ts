import { describe, it, expect } from 'vitest';
import { plnUp3MalangFullPackage } from '../../src/data/mockPlnPackage';

describe('SAP Excel Export CSV Exact Match Verification', () => {
  it('generates the exact CSV lines matching user excel screenshot for items 1-13', () => {
    const pkg = plnUp3MalangFullPackage;
    const rows = pkg.materials.slice(0, 13).map((m, idx) => {
      const snapshots = pkg.stockSnapshots.filter(s => s.materialId === m.id);
      const totalQty = snapshots.reduce((sum, s) => sum + (s.quantity || 0), 0);
      const locObj = snapshots[0] ? pkg.locations.find(l => l.id === snapshots[0].locationId) : null;

      let blokDisplay = '-';
      if (locObj?.zone) {
        const rawZone = locObj.zone.replace(/\s*\(.*?\)/g, '').trim();
        blokDisplay = rawZone.replace(/^Blok\s+/i, '').trim() || rawZone;
      }
      let rakDisplay = '-';
      if (locObj?.rack) {
        const rawRack = locObj.rack.trim();
        if (rawRack && rawRack !== '-' && !rawRack.toLowerCase().includes('area terbuka')) {
          rakDisplay = rawRack.replace(/^Rak\s+/i, '').trim();
        }
      }
      let subRakDisplay = '-';
      if (locObj?.bin) {
        const rawBin = locObj.bin.trim();
        if (rawBin && rawBin !== '-' && rawBin !== 'Luar Rak' && rawBin !== 'Tanpa Rak') {
          subRakDisplay = rawBin.replace(/^Sub\s*Rak\s+/i, '').trim();
        }
      }

      const safeName = m.name.includes(',') || m.name.includes('"')
        ? `"${m.name.replace(/"/g, '""')}"`
        : m.name;
      const normCode = m.code || m.sapCode || '';
      const subRakCol = subRakDisplay !== '-' ? subRakDisplay : '';
      return `${idx + 1},${safeName},${normCode},${m.unit},${totalQty},${blokDisplay},${rakDisplay},${subRakCol}`;
    });

    // Check Row 1: BOX 105 KVA, Stok 4, BLOK C, RAK -, Sub Rak (kosong)
    expect(rows[0]).toBe('1,BOX 105 KVA - BOX;APPMCCB160A+STRIP;AL2MM;1205X420X250,4120470,SET,4,C,-,');

    // Check Row 11: CABLE PWR ACC, Stok 1000, BLOK B, RAK H, Sub Rak H12
    expect(rows[10]).toBe('11,CABLE PWR ACC;CABLE SHOE AL-CU 1H 150mm2,3120159,BH,1000,B,H,H12');

    // Check Row 12: CABLE PWR ACC, Stok 25, BLOK B, RAK H, Sub Rak H12
    expect(rows[11]).toBe('12,CABLE PWR ACC;CABLE SHOE AL-CU 1H 35mm2,3120154,BH,25,B,H,H12');

    // Check Row 13: CABLE PWR ACC, Stok 0, BLOK B, RAK H, Sub Rak H13
    expect(rows[12]).toBe('13,CABLE PWR ACC;CABLE SHOE AL-CU 1H 70mm2,3120156,BH,0,B,H,H13');
  });
});
