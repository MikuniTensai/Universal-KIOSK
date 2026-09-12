import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CatalogService } from '../../src/features/catalog/catalogService';
import { KioskStorage } from '../../src/adapters/storage/kioskStorage';
import { defaultKioskConfig } from '../../src/data/mockPlnPackage';
import { ImportPackage, Material } from '../../src/domain/types';

const sourceAt = '2026-09-12T00:00:00Z';

function inventory(): ImportPackage {
  const material = (id: string, fields: Partial<Material> = {}): Material => ({
    id,
    code: id,
    name: id,
    categoryId: 'electrical',
    sapCode: null,
    specification: null,
    photoPath: null,
    unit: 'Unit',
    ...fields,
  });

  return {
    schemaVersion: '1.0',
    datasetVersion: 1,
    sourceName: 'Catalog regression fixture',
    sourceAt,
    categories: [{ id: 'electrical', name: 'Kelistrikan', active: true, sortOrder: 1 }],
    materials: [
      material('new', { code: '000001', name: 'Transformator', sapCode: 'SAP-01', specification: '20kV' }),
      material('standby', { code: '000002', name: 'Meter cadangan', condition: 'RETURN' }),
      material('warranty', { name: 'Panel', condition: 'RETURN', status: 'GARANSI' }),
      material('repair', { name: 'Kabel', condition: 'RETURN', status: 'PERBAIKAN' }),
      material('scrap', { name: 'Isolator', condition: 'RETURN', status: 'USUL HAPUS' }),
    ],
    locations: [
      { id: 'a', warehouseCode: 'PLN', zone: 'Blok A', rack: 'Rak A11', bin: 'A.1.1' },
      { id: 'b', warehouseCode: 'PLN', zone: 'Blok B', rack: 'Rak B12', bin: 'B.1.2' },
    ],
    stockSnapshots: [
      { materialId: 'new', locationId: 'a', quantity: 2, reserved: 1, available: 1, sourceAt },
      { materialId: 'new', locationId: 'b', quantity: 3, reserved: 0, available: 3, sourceAt },
      { materialId: 'standby', locationId: 'b', quantity: 0, reserved: 0, available: 0, sourceAt },
      { materialId: 'warranty', locationId: 'missing', quantity: null, reserved: null, available: null, sourceAt },
    ],
    assets: [
      { id: 'asset-1', materialId: 'new', serialNumber: 'SERIAL-01', locationId: 'a' },
      { id: 'asset-2', materialId: 'new', serialNumber: 'SERIAL-02', locationId: 'b' },
      { id: 'asset-3', materialId: 'new', serialNumber: 'SERIAL-03', locationId: 'a' },
    ],
    barcodeAliases: [
      { value: 'BAR-NEW', targetType: 'material', targetId: 'new' },
      { value: 'BAR-ASSET', targetType: 'asset', targetId: 'asset-1' },
    ],
    contentItems: [],
  };
}

describe('Catalog indexing preserves search and scan behavior', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-12T01:00:00Z'));
  });

  afterEach(() => vi.useRealTimers());

  it.each([
    ['transformator', ['new']],
    ['000001', ['new']],
    ['sap-01', ['new']],
    ['20kv', ['new']],
    ['unit', ['new', 'standby', 'warranty', 'repair', 'scrap']],
    ['garansi', ['warranty']],
    ['blok b', ['new', 'standby']],
    ['rak a11', ['new']],
    ['b.1.2', ['new', 'standby']],
    ['stok habis', ['standby']],
    ['stok 2', ['new']],
    ['3 unit', ['new']],
    ['bar-new', ['new']],
    ['standby', []],
  ])('keeps matches and source order for %s', (query, ids) => {
    const result = CatalogService.searchMaterials(inventory(), defaultKioskConfig, { query });
    expect(result.items.map(item => item.id)).toEqual(ids);
    expect(result.total).toBe(ids.length);
  });

  it('keeps condition/status defaults, combined filters, and pagination', () => {
    const pkg = inventory();
    const search = (options: Parameters<typeof CatalogService.searchMaterials>[2]) =>
      CatalogService.searchMaterials(pkg, defaultKioskConfig, options);
    expect(search({ condition: 'BARU' }).items.map(item => item.id)).toEqual(['new']);
    expect(search({ condition: 'RETURN', status: 'standby' }).items.map(item => item.id)).toEqual(['standby']);
    expect(search({ condition: 'RETURN', status: 'GARANSI' }).items.map(item => item.id)).toEqual(['warranty']);
    expect(search({ condition: 'RETURN', status: 'PERBAIKAN' }).items.map(item => item.id)).toEqual(['repair']);
    expect(search({ condition: 'RETURN', status: 'USUL HAPUS' }).items.map(item => item.id)).toEqual(['scrap']);
    expect(search({ condition: 'RETURN', categoryId: 'electrical', blockCode: 'B' }).items.map(item => item.id))
      .toEqual(['standby']);
    const page = search({ condition: 'RETURN', page: 2, pageSize: 2 });
    expect(page.items.map(item => item.id)).toEqual(['repair', 'scrap']);
    expect(page).toMatchObject({ total: 4, page: 2, totalPages: 2 });
  });

  it('preserves stock totals, null/zero, location order, fallback, and asset order', () => {
    const result = CatalogService.searchMaterials(inventory(), defaultKioskConfig);
    expect(result.items[0]).toMatchObject({
      categoryName: 'Kelistrikan', totalQuantity: 5, totalReserved: 1, totalAvailable: 4,
      condition: 'BARU', status: 'Baru', isStale: false,
    });
    expect(result.items[0].locations.map(item => item.location.id)).toEqual(['a', 'b']);
    expect(result.items[0].locations[0].assets.map(asset => asset.id)).toEqual(['asset-1', 'asset-3']);
    expect(result.items[0].locations[1].assets.map(asset => asset.id)).toEqual(['asset-2']);
    expect(result.items[1]).toMatchObject({ totalQuantity: 0, totalAvailable: 0, status: 'STANDBY' });
    expect(result.items[2]).toMatchObject({ totalQuantity: null, totalReserved: null, totalAvailable: null });
    expect(result.items[2].locations[0].location).toEqual({
      id: 'missing', warehouseCode: defaultKioskConfig.warehouseCode, zone: 'Gudang Utama', rack: '-', bin: '-',
    });
    expect(result.items[3].totalQuantity).toBeNull();
  });

  it('preserves first-match precedence for aliases and duplicate IDs', () => {
    const pkg = inventory();
    pkg.barcodeAliases.push(
      { value: '000001', targetType: 'material', targetId: 'warranty' },
      { value: '000001', targetType: 'material', targetId: 'repair' },
    );
    pkg.categories.push({ ...pkg.categories[0], name: 'Duplicate category' });
    pkg.locations.push({ ...pkg.locations[0], rack: 'Duplicate location' });
    expect(CatalogService.resolveScan(' 000001 ', pkg, defaultKioskConfig).material?.id).toBe('warranty');
    for (const code of ['bar-new', 'SAP-01', 'SERIAL-01', 'bar-asset']) {
      const scan = CatalogService.resolveScan(code, pkg, defaultKioskConfig);
      expect(scan.material?.id).toBe('new');
      expect(scan.material?.categoryName).toBe('Kelistrikan');
      expect(scan.material?.locations[0].location.rack).toBe('Rak A11');
    }
    expect(CatalogService.resolveScan('BAR-ASSET', pkg, defaultKioskConfig).asset?.id).toBe('asset-1');
    expect(CatalogService.resolveScan(' ', pkg, defaultKioskConfig).status).toBe('invalid');
    expect(CatalogService.resolveScan('unknown', pkg, defaultKioskConfig).status).toBe('not_found');
  });

  it('reads in-place stock replacements and additions even within the same timestamp', () => {
    const pkg = inventory();
    const storage = new KioskStorage();
    storage.setActivePackageDirectly(pkg);
    const scan = () => CatalogService.resolveScan('BAR-NEW', pkg, defaultKioskConfig).material;
    expect(scan()?.totalQuantity).toBe(5);
    CatalogService.searchMaterials(pkg, defaultKioskConfig, { query: 'stok 2' });

    storage.addOrAdjustStock({ materialId: 'new', locationId: 'a', quantityDelta: 8, setExact: true });
    expect(scan()?.totalQuantity).toBe(11);
    const firstHash = pkg.packageHash;
    storage.addOrAdjustStock({ materialId: 'new', locationId: 'a', quantityDelta: 1 });
    expect(pkg.packageHash).toBe(firstHash);
    expect(scan()?.totalQuantity).toBe(12);
    expect(CatalogService.searchMaterials(pkg, defaultKioskConfig, { query: 'stok 2' }).total).toBe(0);

    storage.addOrAdjustStock({ materialId: 'new', zone: 'Blok Z', rack: 'Rak Z99', quantityDelta: 4 });
    expect(scan()?.totalQuantity).toBe(16);
    expect(CatalogService.searchMaterials(pkg, defaultKioskConfig, { query: 'z99' }).items[0].id).toBe('new');
  });

  it('uses changed relation keys, conditions, statuses, and replacement packages', () => {
    const pkg = inventory();
    CatalogService.searchMaterials(pkg, defaultKioskConfig);
    CatalogService.resolveScan('BAR-NEW', pkg, defaultKioskConfig);
    pkg.stockSnapshots[0].materialId = 'repair';
    pkg.locations[0].rack = 'Rak C99';
    pkg.barcodeAliases[0].targetId = 'repair';
    pkg.assets[0].materialId = 'repair';
    pkg.materials[0].condition = 'RETURN';
    pkg.materials[0].status = 'GARANSI';
    const scan = CatalogService.resolveScan('BAR-NEW', pkg, defaultKioskConfig);
    expect(scan.material?.id).toBe('repair');
    expect(scan.material?.totalQuantity).toBe(2);
    expect(scan.material?.locations[0].assets[0].id).toBe('asset-1');
    expect(CatalogService.searchMaterials(pkg, defaultKioskConfig, { query: 'c99' }).items[0].id).toBe('repair');
    expect(CatalogService.searchMaterials(pkg, defaultKioskConfig, { condition: 'RETURN', status: 'GARANSI' })
      .items.map(item => item.id)).toEqual(['new', 'warranty']);

    const replacement = inventory();
    replacement.stockSnapshots[0].quantity = 40;
    expect(CatalogService.resolveScan('BAR-NEW', replacement, defaultKioskConfig).material?.totalQuantity).toBe(43);
  });

  it('recomputes stock age and configuration without caching enriched results', () => {
    const pkg = inventory();
    const config = { ...defaultKioskConfig, staleAfterHours: 2, warehouseCode: 'FIRST' };
    const enrich = () => CatalogService.enrichMaterial(pkg.materials[2], pkg, config);
    expect(enrich().isStale).toBe(false);
    vi.setSystemTime(new Date('2026-09-12T03:00:00Z'));
    expect(enrich().isStale).toBe(true);
    config.staleAfterHours = 24;
    config.warehouseCode = 'SECOND';
    expect(enrich().isStale).toBe(false);
    expect(enrich().locations[0].location.warehouseCode).toBe('SECOND');
  });
});
