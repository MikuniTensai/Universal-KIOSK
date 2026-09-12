import { ImportPackage } from '../../domain/types';

export interface WarehouseSlot {
  code: string; // Contoh: "A.1.1", "A.3.1", "H.2.5"
  name?: string;
  materialId?: string | null;
  materialName?: string | null;
  status: 'available' | 'occupied' | 'reserved';
}

export interface WarehouseSubBlock {
  code: string; // Contoh: "A.1", "A.2", "A.3", "H.1"
  name?: string;
  slots: WarehouseSlot[];
}

export interface WarehouseBlock {
  id: string; // Contoh: "blok-a", "blok-h"
  code: string; // Contoh: "BLOK A", "BLOK H"
  letter: string; // "A" s/d "Z"
  name: string;
  description: string;
  icon: string;
  color: string;
  activeColor: string;
  subBlocks: WarehouseSubBlock[];
  highlightRack: string;
  sampleMaterials: string[];
}

const STORAGE_KEY = 'kiosk_warehouse_blocks_v1';

// Preset tema warna untuk blok dinamis
const BLOCK_COLORS = [
  { color: 'border-blue-400 bg-blue-500/10', activeColor: 'ring-4 ring-blue-400 border-blue-500 bg-blue-500/20', icon: '🔌' },
  { color: 'border-purple-400 bg-purple-500/10', activeColor: 'ring-4 ring-purple-400 border-purple-500 bg-purple-500/20', icon: '🏗️' },
  { color: 'border-amber-400 bg-amber-500/10', activeColor: 'ring-4 ring-amber-400 border-amber-500 bg-amber-500/20', icon: '⚡' },
  { color: 'border-emerald-400 bg-emerald-500/10', activeColor: 'ring-4 ring-emerald-400 border-emerald-500 bg-emerald-500/20', icon: '🦺' },
  { color: 'border-cyan-400 bg-cyan-500/10', activeColor: 'ring-4 ring-cyan-400 border-cyan-500 bg-cyan-500/20', icon: '📦' },
  { color: 'border-rose-400 bg-rose-500/10', activeColor: 'ring-4 ring-rose-400 border-rose-500 bg-rose-500/20', icon: '🛡️' },
  { color: 'border-indigo-400 bg-indigo-500/10', activeColor: 'ring-4 ring-indigo-400 border-indigo-500 bg-indigo-500/20', icon: '⚙️' },
  { color: 'border-orange-400 bg-orange-500/10', activeColor: 'ring-4 ring-orange-400 border-orange-500 bg-orange-500/20', icon: '🏭' },
];

/**
 * Membuat sub-blok dan slot standar (contoh: A.1, A.2, A.3 dan A.1.1 - A.1.5)
 */
export function generateSubBlocks(letter: string, subBlockCount = 3, slotsPerSubBlock = 5): WarehouseSubBlock[] {
  const cleanLetter = letter.trim().toUpperCase();
  const subBlocks: WarehouseSubBlock[] = [];

  for (let s = 1; s <= subBlockCount; s++) {
    const subCode = `${cleanLetter}.${s}`;
    const slots: WarehouseSlot[] = [];

    for (let slotIdx = 1; slotIdx <= slotsPerSubBlock; slotIdx++) {
      slots.push({
        code: `${subCode}.${slotIdx}`,
        name: `Slot ${subCode}.${slotIdx}`,
        status: 'available',
      });
    }

    subBlocks.push({
      code: subCode,
      name: `Baris ${subCode}`,
      slots,
    });
  }

  return subBlocks;
}

/**
 * Daftar default blok A sampai H (sebagaimana ditemukan di gudang lapangan PLN)
 */
export function getDefaultWarehouseBlocks(): WarehouseBlock[] {
  return [
    {
      id: 'blok-c',
      code: 'BLOK C',
      letter: 'C',
      name: 'Ruang Bersih Kalibrasi APP & kWh Meter',
      description: 'Penyimpanan berpendingin udara dan suhu terkontrol untuk Smart Meter AMI 1 & 3 Fasa, Modem Komunikasi, dan perangkat pengukur presisi.',
      icon: '⚡',
      color: 'border-amber-400 bg-amber-500/10',
      activeColor: 'ring-4 ring-amber-400 border-amber-500 bg-amber-500/20',
      highlightRack: 'Rak A-001 (Smart Meter / kWh)',
      sampleMaterials: ['Smart Meter Listrik (kWh Meter) AMI 1 Fasa 5(60)A', 'Modem Komunikasi AMI 4G'],
      subBlocks: [
        {
          code: 'C.1',
          name: 'Baris Rak C.1 (Smart Meter & kWh)',
          slots: [
            { code: 'C.1.1', name: 'Rak A-001 (Smart Meter / kWh)', materialName: 'Smart Meter Listrik AMI 1 Fasa', status: 'occupied' },
            { code: 'C.1.2', name: 'Rak A-002 (Modem AMI)', materialName: 'Modem Komunikasi AMI 4G', status: 'occupied' },
            { code: 'C.1.3', name: 'Slot C.1.3 (Cadangan APP)', status: 'available' },
            { code: 'C.1.4', name: 'Slot C.1.4 (CT/PT Metering)', status: 'available' },
            { code: 'C.1.5', name: 'Slot C.1.5 (Buffer Stock)', status: 'available' },
          ],
        },
        {
          code: 'C.2',
          name: 'Baris Rak C.2 (Meter Prabayar & Pascabayar)',
          slots: [
            { code: 'C.2.1', name: 'Slot C.2.1 (kWh 3 Fasa)', status: 'available' },
            { code: 'C.2.2', name: 'Slot C.2.2 (Komponen Relay)', status: 'available' },
            { code: 'C.2.3', name: 'Slot C.2.3 (Alat Tera Metrologi)', status: 'available' },
            { code: 'C.2.4', name: 'Slot C.2.4', status: 'available' },
            { code: 'C.2.5', name: 'Slot C.2.5', status: 'available' },
          ],
        },
        {
          code: 'C.3',
          name: 'Baris Rak C.3 (Lemari Kalibrasi)',
          slots: [
            { code: 'C.3.1', name: 'Lemari Kalibrasi 1', status: 'occupied' },
            { code: 'C.3.2', name: 'Lemari Kalibrasi 2', status: 'available' },
            { code: 'C.3.3', name: 'Slot C.3.3', status: 'available' },
            { code: 'C.3.4', name: 'Slot C.3.4', status: 'available' },
            { code: 'C.3.5', name: 'Slot C.3.5', status: 'available' },
          ],
        },
      ],
    },
    {
      id: 'blok-a',
      code: 'BLOK A',
      letter: 'A',
      name: 'Perlengkapan Gardu & Jaringan Distribusi',
      description: 'Penyimpanan perlengkapan gardu distribusi tegangan 20 kV: Isolator Tumpu, Fused Cut Out (FCO), Lightning Arrester, dan Lightning Conductor.',
      icon: '🔌',
      color: 'border-blue-400 bg-blue-500/10',
      activeColor: 'ring-4 ring-blue-400 border-blue-500 bg-blue-500/20',
      highlightRack: 'Rak A3 (A.3.1)',
      sampleMaterials: ['Isolator Tumpu Keramik 20 kV', 'Fused Cut Out (FCO) Polymer 24 kV'],
      subBlocks: [
        {
          code: 'A.1',
          name: 'Baris A.1 (Isolator & Bushing)',
          slots: [
            { code: 'A.1.1', name: 'Slot A.1.1 (Isolator Tarik)', status: 'available' },
            { code: 'A.1.2', name: 'Slot A.1.2 (Isolator Tumpu)', status: 'available' },
            { code: 'A.1.3', name: 'Slot A.1.3', status: 'available' },
            { code: 'A.1.4', name: 'Slot A.1.4', status: 'available' },
            { code: 'A.1.5', name: 'Slot A.1.5', status: 'available' },
          ],
        },
        {
          code: 'A.2',
          name: 'Baris A.2 (Arrester & FCO)',
          slots: [
            { code: 'A.2.1', name: 'Slot A.2.1 (FCO Polymer)', materialName: 'Fused Cut Out 24 kV', status: 'occupied' },
            { code: 'A.2.2', name: 'Slot A.2.2 (Lightning Arrester)', status: 'available' },
            { code: 'A.2.3', name: 'Slot A.2.3', status: 'available' },
            { code: 'A.2.4', name: 'Slot A.2.4', status: 'available' },
            { code: 'A.2.5', name: 'Slot A.2.5', status: 'available' },
          ],
        },
        {
          code: 'A.3',
          name: 'Baris A.3 (Perlengkapan Gardu 20kV)',
          slots: [
            { code: 'A.3.1', name: 'Rak A3 - Tingkat 2', materialName: 'Isolator Tumpu Keramik 20 kV', status: 'occupied' },
            { code: 'A.3.2', name: 'Slot A.3.2 (Fuse Link)', status: 'available' },
            { code: 'A.3.3', name: 'Slot A.3.3', status: 'available' },
            { code: 'A.3.4', name: 'Slot A.3.4', status: 'available' },
            { code: 'A.3.5', name: 'Slot A.3.5', status: 'available' },
          ],
        },
      ],
    },
    {
      id: 'blok-b',
      code: 'BLOK B',
      letter: 'B',
      name: 'Heavy Material, Trafo & Drum Kabel',
      description: 'Lantai beton bertulang dengan overhead crane hoist untuk penanganan Transformator Distribusi 50-250 kVA dan gulungan drum kabel MVTIC/SKTM.',
      icon: '🏗️',
      color: 'border-purple-400 bg-purple-500/10',
      activeColor: 'ring-4 ring-purple-400 border-purple-500 bg-purple-500/20',
      highlightRack: 'Jalur Hoist 2 (B.2.1)',
      sampleMaterials: ['Transformator Distribusi 3 Fasa 100 kVA', 'Kabel MVTIC 3x150 mm²'],
      subBlocks: [
        {
          code: 'B.1',
          name: 'Baris B.1 (Area Hoist Crane 1)',
          slots: [
            { code: 'B.1.1', name: 'Slot B.1.1 (Trafo 50 kVA)', status: 'available' },
            { code: 'B.1.2', name: 'Slot B.1.2 (Trafo 100 kVA)', status: 'available' },
            { code: 'B.1.3', name: 'Slot B.1.3', status: 'available' },
            { code: 'B.1.4', name: 'Slot B.1.4', status: 'available' },
            { code: 'B.1.5', name: 'Slot B.1.5', status: 'available' },
          ],
        },
        {
          code: 'B.2',
          name: 'Baris B.2 (Jalur Hoist 2 & Blok H-04)',
          slots: [
            { code: 'B.2.1', name: 'Blok H-04 (Trafo 100kVA)', materialName: 'Transformator Distribusi 100 kVA', status: 'occupied' },
            { code: 'B.2.2', name: 'Slot B.2.2 (Trafo 160 kVA)', status: 'available' },
            { code: 'B.2.3', name: 'Slot B.2.3 (Trafo 250 kVA)', status: 'available' },
            { code: 'B.2.4', name: 'Slot B.2.4', status: 'available' },
            { code: 'B.2.5', name: 'Slot B.2.5', status: 'available' },
          ],
        },
        {
          code: 'B.3',
          name: 'Baris B.3 (Blok Drum Kabel D-01 s/d D-05)',
          slots: [
            { code: 'B.3.1', name: 'Drum D-01 (Kabel TM)', status: 'available' },
            { code: 'B.3.2', name: 'Drum D-02 (Kabel MVTIC 150mm)', materialName: 'Kabel MVTIC 3x150mm', status: 'occupied' },
            { code: 'B.3.3', name: 'Drum D-03', status: 'available' },
            { code: 'B.3.4', name: 'Drum D-04', status: 'available' },
            { code: 'B.3.5', name: 'Drum D-05', status: 'available' },
          ],
        },
      ],
    },
    {
      id: 'blok-d',
      code: 'BLOK D',
      letter: 'D',
      name: 'Gudang APD & Alat Kerja K3 Zero Accident',
      description: 'Penyimpanan Alat Pelindung Diri (APD), Helm Safety V-Gard, Sepatu Safety Dielektrik, Sarung Tangan Tahan 20kV, Full Body Harness, dan grounding kit.',
      icon: '🦺',
      color: 'border-emerald-400 bg-emerald-500/10',
      activeColor: 'ring-4 ring-emerald-400 border-emerald-500 bg-emerald-500/20',
      highlightRack: 'Rak K3-01 (D.1.1)',
      sampleMaterials: ['Helm Safety K3 Proyek V-Gard Putih', 'Sarung Tangan Dielektrik 20 kV'],
      subBlocks: generateSubBlocks('D', 3, 5),
    },
    {
      id: 'blok-e',
      code: 'BLOK E',
      letter: 'E',
      name: 'Kabel Distribusi, Jointing & Aksesoris',
      description: 'Penyimpanan gulungan kabel tegangan rendah (LVTC), sambungan jointing kit, sepatu kabel (cable lug), dan konektor kedap air (tap connector).',
      icon: '📦',
      color: 'border-cyan-400 bg-cyan-500/10',
      activeColor: 'ring-4 ring-cyan-400 border-cyan-500 bg-cyan-500/20',
      highlightRack: 'Rak E.1.1',
      sampleMaterials: ['Jointing Kit 20 kV Raychem', 'Konektor Piercing Tap 50-70mm'],
      subBlocks: generateSubBlocks('E', 3, 5),
    },
    {
      id: 'blok-f',
      code: 'BLOK F',
      letter: 'F',
      name: 'Tiang Beton, Cross Arm & Travers Baja',
      description: 'Area outdoor terbuka khusus untuk penyimpanan tiang beton 9m/11m/12m, travers profil UNP galvanis, dan kawat baja span guy wire.',
      icon: '🏭',
      color: 'border-orange-400 bg-orange-500/10',
      activeColor: 'ring-4 ring-orange-400 border-orange-500 bg-orange-500/20',
      highlightRack: 'Rak F.1.1',
      sampleMaterials: ['Cross Arm Travers UNP 2000mm', 'Tiang Beton Bulat 12m 350daN'],
      subBlocks: generateSubBlocks('F', 3, 5),
    },
    {
      id: 'blok-g',
      code: 'BLOK G',
      letter: 'G',
      name: 'Isolator Tarik & Minyak Trafo Dielektrik',
      description: 'Penyimpanan drum minyak isolasi transformator (Shell Diala), tabung uji dielektrik, dan aksesoris gardu tahan korosi.',
      icon: '🛡️',
      color: 'border-indigo-400 bg-indigo-500/10',
      activeColor: 'ring-4 ring-indigo-400 border-indigo-500 bg-indigo-500/20',
      highlightRack: 'Rak G.1.1',
      sampleMaterials: ['Minyak Trafo Uninhibited Shell Diala S4 ZX-I', 'Isolator Tarik Disc Suspension 20kV'],
      subBlocks: generateSubBlocks('G', 3, 5),
    },
    {
      id: 'blok-h',
      code: 'BLOK H',
      letter: 'H',
      name: 'Gudang Siaga Tanggap Darurat & Rekondisi',
      description: 'Gudang material siaga respon cepat pemulihan bencana (gangguan penyulang/badai) dan penampungan material rekondisi layak pakai.',
      icon: '⚙️',
      color: 'border-rose-400 bg-rose-500/10',
      activeColor: 'ring-4 ring-rose-400 border-rose-500 bg-rose-500/20',
      highlightRack: 'Rak H.1.1',
      sampleMaterials: ['Trafo Emergency Mobile 100 kVA', 'Kabel Twisted Darurat 70mm'],
      subBlocks: generateSubBlocks('H', 3, 5),
    },
  ];
}

export class WarehouseLayoutService {
  private static blocksCache: WarehouseBlock[] | null = null;

  /**
   * Mengambil semua blok gudang dari storage (atau inisialisasi default)
   */
  public static getBlocks(): WarehouseBlock[] {
    if (this.blocksCache) return [...this.blocksCache];

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.blocksCache = parsed;
            return [...parsed];
          }
        }
      } catch (e) {
        console.error('Error loading warehouse blocks, falling back to default:', e);
      }
    }

    const defaults = getDefaultWarehouseBlocks();
    this.blocksCache = defaults;
    this.saveBlocks(defaults);
    return [...defaults];
  }

  /**
   * Menyimpan daftar blok ke cache & localStorage
   */
  public static saveBlocks(blocks: WarehouseBlock[]): void {
    this.blocksCache = blocks;
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(blocks));
      } catch (e) {
        console.error('Failed to persist warehouse blocks:', e);
      }
    }
  }

  /**
   * Menambahkan Blok baru secara fleksibel (A sampai Z atau custom)
   */
  public static addBlock(params: {
    letter: string;
    name: string;
    description?: string;
    subBlockCount?: number;
    slotsPerSubBlock?: number;
  }): WarehouseBlock {
    const cleanLetter = params.letter.trim().toUpperCase();
    const blocks = this.getBlocks();

    // Cek apakah blok sudah ada
    const existingIndex = blocks.findIndex(b => b.letter === cleanLetter);
    const colorIndex = (cleanLetter.charCodeAt(0) - 65) % BLOCK_COLORS.length;
    const theme = BLOCK_COLORS[Math.max(0, colorIndex)] || BLOCK_COLORS[0];

    const subCount = params.subBlockCount || 3;
    const slotsCount = params.slotsPerSubBlock || 5;

    const newBlock: WarehouseBlock = {
      id: `blok-${cleanLetter.toLowerCase()}`,
      code: `BLOK ${cleanLetter}`,
      letter: cleanLetter,
      name: params.name.trim() || `Area Blok ${cleanLetter}`,
      description: params.description?.trim() || `Zona penyimpanan material gudang PLN untuk Blok ${cleanLetter}.`,
      icon: theme.icon,
      color: theme.color,
      activeColor: theme.activeColor,
      highlightRack: `Rak ${cleanLetter}.1.1`,
      sampleMaterials: [],
      subBlocks: generateSubBlocks(cleanLetter, subCount, slotsCount),
    };

    if (existingIndex >= 0) {
      blocks[existingIndex] = newBlock;
    } else {
      blocks.push(newBlock);
      // Urutkan berdasarkan huruf
      blocks.sort((a, b) => a.letter.localeCompare(b.letter));
    }

    this.saveBlocks(blocks);
    return newBlock;
  }

  /**
   * Menambahkan Sub-Blok baru pada suatu Blok (contoh: A.4)
   */
  public static addSubBlock(blockLetter: string, customSubNum?: number, slotsCount = 5): WarehouseSubBlock {
    const cleanLetter = blockLetter.trim().toUpperCase();
    const blocks = this.getBlocks();
    const block = blocks.find(b => b.letter === cleanLetter);
    if (!block) {
      throw new Error(`Blok ${cleanLetter} tidak ditemukan.`);
    }

    const nextNum = customSubNum ?? (block.subBlocks.length + 1);
    const subCode = `${cleanLetter}.${nextNum}`;

    const slots: WarehouseSlot[] = [];
    for (let i = 1; i <= slotsCount; i++) {
      slots.push({
        code: `${subCode}.${i}`,
        name: `Slot ${subCode}.${i}`,
        status: 'available',
      });
    }

    const newSubBlock: WarehouseSubBlock = {
      code: subCode,
      name: `Baris ${subCode}`,
      slots,
    };

    block.subBlocks.push(newSubBlock);
    this.saveBlocks(blocks);
    return newSubBlock;
  }

  /**
   * Menambahkan Slot baru pada suatu Sub-Blok (contoh: A.1.6)
   */
  public static addSlotToSubBlock(subBlockCode: string, slotName?: string): WarehouseSlot {
    const cleanSub = subBlockCode.trim().toUpperCase();
    const [letter] = cleanSub.split('.');
    const blocks = this.getBlocks();
    const block = blocks.find(b => b.letter === letter);
    if (!block) throw new Error(`Blok untuk ${cleanSub} tidak ditemukan.`);

    const subBlock = block.subBlocks.find(sb => sb.code === cleanSub);
    if (!subBlock) throw new Error(`Sub-blok ${cleanSub} tidak ditemukan.`);

    const nextSlotIdx = subBlock.slots.length + 1;
    const slotCode = `${cleanSub}.${nextSlotIdx}`;
    const newSlot: WarehouseSlot = {
      code: slotCode,
      name: slotName || `Slot ${slotCode}`,
      status: 'available',
    };

    subBlock.slots.push(newSlot);
    this.saveBlocks(blocks);
    return newSlot;
  }

  /**
   * Inisialisasi instan Blok A sampai Z secara lengkap
   */
  public static initializeAllBlocksAtoZ(): WarehouseBlock[] {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const current = this.getBlocks();
    const map = new Map<string, WarehouseBlock>();
    current.forEach(b => map.set(b.letter, b));

    const defaultNames: Record<string, string> = {
      I: 'Panel Hubung Bagi TM/TR & Cubicle',
      J: 'Gardu Portal & Cantol 20kV',
      K: 'Kabel Tanah SKTM & SKTR',
      L: 'Lampu Penerangan Jalan Umum (PJU)',
      M: 'Material Sipil & Pondasi Gardu',
      N: 'Rel Hubung Singkat & Busbar Tembaga',
      O: 'Oli & Minyak Transformator Cadangan',
      P: 'Peralatan SCADA & Remote Terminal Unit',
      Q: 'Quality Control & Karantina Barang Retur',
      R: 'Recloser & Sectionalizer Otomatis',
      S: 'Switchgear & Pemutus Tenaga (PMT)',
      T: 'Tangga Teleskopik & Derek Angkat',
      U: 'Unit Gardu Bergerak (UGB/UPS Mobile)',
      V: 'Voltage Regulator & Tap Changer',
      W: 'Wiring Harness & Terminal Kabel',
      X: 'Gudang Khusus Logistik Non-MDU',
      Y: 'Yard Luar Tiang Besi & Tower Baja',
      Z: 'Zona Karantina Scrap & Limbah B3 Berizin',
    };

    for (const letter of alphabet) {
      if (!map.has(letter)) {
        const colorIndex = (letter.charCodeAt(0) - 65) % BLOCK_COLORS.length;
        const theme = BLOCK_COLORS[colorIndex] || BLOCK_COLORS[0];
        map.set(letter, {
          id: `blok-${letter.toLowerCase()}`,
          code: `BLOK ${letter}`,
          letter,
          name: defaultNames[letter] || `Area Blok ${letter}`,
          description: `Penyimpanan material terstandarisasi PLN untuk Blok ${letter}.`,
          icon: theme.icon,
          color: theme.color,
          activeColor: theme.activeColor,
          highlightRack: `Rak ${letter}.1.1`,
          sampleMaterials: [],
          subBlocks: generateSubBlocks(letter, 3, 5),
        });
      }
    }

    const fullList = Array.from(map.values()).sort((a, b) => a.letter.localeCompare(b.letter));
    this.saveBlocks(fullList);
    return fullList;
  }

  /**
   * Sinkronisasi material dari ImportPackage ke slot-slot denah gudang
   */
  public static syncWithPackage(pkg: ImportPackage): void {
    const blocks = this.getBlocks();

    // Reset status occupied pada slot
    blocks.forEach(b => {
      b.subBlocks.forEach(sb => {
        sb.slots.forEach(s => {
          if (s.code !== 'C.1.1' && s.code !== 'A.3.1' && s.code !== 'B.2.1') {
            s.materialId = null;
            s.materialName = null;
            s.status = 'available';
          }
        });
      });
    });

    // Petakan setiap material di stockSnapshots yang memiliki lokasi
    for (const stock of pkg.stockSnapshots) {
      const loc = pkg.locations.find(l => l.id === stock.locationId);
      const mat = pkg.materials.find(m => m.id === stock.materialId);
      if (!loc || !mat) continue;

      // Cek apakah di rack atau bin ada notasi kode seperti A.1.1 atau C.1.1
      const textToScan = `${loc.zone || ''} ${loc.rack || ''} ${loc.bin || ''}`;
      const codeMatch = textToScan.match(/\b([A-Z])\.(\d+)\.(\d+)\b/);

      if (codeMatch) {
        const slotCode = codeMatch[0];
        const [letter, subNum] = slotCode.split('.');
        const block = blocks.find(b => b.letter === letter);
        if (block) {
          const subBlock = block.subBlocks.find(sb => sb.code === `${letter}.${subNum}`);
          if (subBlock) {
            const slot = subBlock.slots.find(s => s.code === slotCode);
            if (slot) {
              slot.materialId = mat.id;
              slot.materialName = mat.name;
              slot.status = 'occupied';
            }
          }
        }
      }
    }

    this.saveBlocks(blocks);
  }

  /**
   * Reset ke default (Blok A s/d H)
   */
  public static resetDefaults(): WarehouseBlock[] {
    const defaults = getDefaultWarehouseBlocks();
    this.saveBlocks(defaults);
    return defaults;
  }
}
