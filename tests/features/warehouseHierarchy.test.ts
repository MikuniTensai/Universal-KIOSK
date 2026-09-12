import { describe, it, expect, beforeEach } from 'vitest';
import {
  WarehouseLayoutService,
  generateSubBlocks,
} from '../../src/features/layout/warehouseLayoutService';
import { CatalogService } from '../../src/features/catalog/catalogService';
import { samplePlnPackage, defaultKioskConfig } from '../../src/data/mockPlnPackage';

describe('Warehouse Hierarchy & Dynamic A-Z Block Management', () => {
  beforeEach(() => {
    localStorage.clear();
    WarehouseLayoutService.resetDefaults();
  });

  it('generates standard sub-blocks (X.1, X.2, X.3) and slots (X.1.1 - X.1.5)', () => {
    const subBlocks = generateSubBlocks('A', 3, 5);
    expect(subBlocks.length).toBe(3);
    expect(subBlocks[0].code).toBe('A.1');
    expect(subBlocks[1].code).toBe('A.2');
    expect(subBlocks[2].code).toBe('A.3');

    // A.1 has A.1.1 to A.1.5
    expect(subBlocks[0].slots.length).toBe(5);
    expect(subBlocks[0].slots[0].code).toBe('A.1.1');
    expect(subBlocks[0].slots[4].code).toBe('A.1.5');

    // A.3 has A.3.1 to A.3.5
    expect(subBlocks[2].slots.length).toBe(5);
    expect(subBlocks[2].slots[0].code).toBe('A.3.1');
    expect(subBlocks[2].slots[4].code).toBe('A.3.5');
  });

  it('initializes default warehouse blocks up to Blok H as observed in UP3 warehouse', () => {
    const blocks = WarehouseLayoutService.getBlocks();
    expect(blocks.length).toBeGreaterThanOrEqual(8);

    const blockLetters = blocks.map(b => b.letter);
    expect(blockLetters).toContain('A');
    expect(blockLetters).toContain('B');
    expect(blockLetters).toContain('C');
    expect(blockLetters).toContain('D');
    expect(blockLetters).toContain('E');
    expect(blockLetters).toContain('F');
    expect(blockLetters).toContain('G');
    expect(blockLetters).toContain('H');

    // Check Blok A hierarchy
    const blokA = blocks.find(b => b.letter === 'A');
    expect(blokA).toBeDefined();
    expect(blokA?.code).toBe('BLOK A');
    const subCodesA = blokA?.subBlocks.map(sb => sb.code);
    expect(subCodesA).toContain('A.1');
    expect(subCodesA).toContain('A.2');
    expect(subCodesA).toContain('A.3');

    // Check A.3 contains A.3.1 - A.3.5
    const subA3 = blokA?.subBlocks.find(sb => sb.code === 'A.3');
    expect(subA3?.slots.some(s => s.code === 'A.3.1')).toBe(true);
    expect(subA3?.slots.some(s => s.code === 'A.3.5')).toBe(true);

    // Check Blok H hierarchy
    const blokH = blocks.find(b => b.letter === 'H');
    expect(blokH).toBeDefined();
    expect(blokH?.code).toBe('BLOK H');
    expect(blokH?.subBlocks.some(sb => sb.code === 'H.1')).toBe(true);
    expect(blokH?.subBlocks[0].slots.some(s => s.code === 'H.1.1')).toBe(true);
  });

  it('allows adding custom blocks flexibly (e.g. Blok I, J, through Z)', () => {
    const createdI = WarehouseLayoutService.addBlock({
      letter: 'I',
      name: 'Panel Hubung Bagi 20kV',
      subBlockCount: 3,
      slotsPerSubBlock: 5,
    });

    expect(createdI.letter).toBe('I');
    expect(createdI.code).toBe('BLOK I');
    expect(createdI.subBlocks.length).toBe(3);
    expect(createdI.subBlocks[0].code).toBe('I.1');
    expect(createdI.subBlocks[0].slots[0].code).toBe('I.1.1');
    expect(createdI.subBlocks[0].slots[4].code).toBe('I.1.5');

    const blocks = WarehouseLayoutService.getBlocks();
    expect(blocks.some(b => b.letter === 'I')).toBe(true);
  });

  it('supports dynamically expanding sub-blocks and slots on demand', () => {
    // Add sub-block A.4 to Blok A
    const newSubBlock = WarehouseLayoutService.addSubBlock('A', 4, 5);
    expect(newSubBlock.code).toBe('A.4');
    expect(newSubBlock.slots.length).toBe(5);
    expect(newSubBlock.slots[0].code).toBe('A.4.1');

    // Add extra slot A.1.6 to sub-block A.1
    const newSlot = WarehouseLayoutService.addSlotToSubBlock('A.1', 'Slot Khusus Ekstra');
    expect(newSlot.code).toBe('A.1.6');
    expect(newSlot.name).toBe('Slot Khusus Ekstra');

    const blocks = WarehouseLayoutService.getBlocks();
    const blokA = blocks.find(b => b.letter === 'A');
    const subA1 = blokA?.subBlocks.find(sb => sb.code === 'A.1');
    expect(subA1?.slots.some(s => s.code === 'A.1.6')).toBe(true);
  });

  it('allows instant 1-click initialization of all blocks from A through Z', () => {
    const fullAtoZ = WarehouseLayoutService.initializeAllBlocksAtoZ();
    expect(fullAtoZ.length).toBe(26);

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    alphabet.forEach(letter => {
      const b = fullAtoZ.find(x => x.letter === letter);
      expect(b).toBeDefined();
      expect(b?.code).toBe(`BLOK ${letter}`);
      expect(b?.subBlocks.length).toBeGreaterThanOrEqual(1);
    });

    // Check last block Z
    const blokZ = fullAtoZ.find(b => b.letter === 'Z');
    expect(blokZ?.code).toBe('BLOK Z');
    expect(blokZ?.subBlocks[0].code).toBe('Z.1');
    expect(blokZ?.subBlocks[0].slots[0].code).toBe('Z.1.1');
  });

  it('enables searching and filtering catalog materials by slot code and block', () => {
    // Search by slot code 'A.3.1'
    const searchSlotA31 = CatalogService.searchMaterials(samplePlnPackage, defaultKioskConfig, {
      query: 'A.3.1',
    });
    expect(searchSlotA31.items.length).toBeGreaterThan(0);
    expect(searchSlotA31.items[0].name).toContain('Isolator');

    // Search by slot code 'C.1.1'
    const searchSlotC11 = CatalogService.searchMaterials(samplePlnPackage, defaultKioskConfig, {
      query: 'C.1.1',
    });
    expect(searchSlotC11.items.length).toBeGreaterThan(0);
    expect(searchSlotC11.items[0].name).toContain('Smart Meter');

    // Filter by block code 'A'
    const blockAItems = CatalogService.searchMaterials(samplePlnPackage, defaultKioskConfig, {
      blockCode: 'A',
    });
    expect(blockAItems.items.length).toBeGreaterThan(0);
    expect(blockAItems.items.some(m => m.name.includes('Isolator'))).toBe(true);

    // Filter by block code 'C'
    const blockCItems = CatalogService.searchMaterials(samplePlnPackage, defaultKioskConfig, {
      blockCode: 'C',
    });
    expect(blockCItems.items.length).toBeGreaterThan(0);
    expect(blockCItems.items.some(m => m.name.includes('Smart Meter'))).toBe(true);
  });
});
