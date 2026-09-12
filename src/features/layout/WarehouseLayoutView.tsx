import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Compass,
  Navigation,
  MapPin,
  Layers,
  Box,
  PlusCircle,
  Sparkles,
  Plus,
  X,
  FolderTree,
} from 'lucide-react';
import { ImportPackage, KioskConfig } from '../../domain/types';
import {
  WarehouseLayoutService,
  WarehouseBlock,
  WarehouseSubBlock,
  WarehouseSlot,
} from './warehouseLayoutService';

interface WarehouseLayoutViewProps {
  pkg: ImportPackage;
  config: KioskConfig;
  onBack: () => void;
  onSelectRack?: (rack: string) => void;
}

export const WarehouseLayoutView: React.FC<WarehouseLayoutViewProps> = ({
  pkg,
  config,
  onBack,
  onSelectRack,
}) => {
  const [blocks, setBlocks] = useState<WarehouseBlock[]>(() => {
    return WarehouseLayoutService.getBlocks();
  });
  const [selectedZone, setSelectedZone] = useState<string>('blok-c');
  const [selectedSlot, setSelectedSlot] = useState<WarehouseSlot | null>(null);

  // Modal states
  const [showAddBlockModal, setShowAddBlockModal] = useState<boolean>(false);
  const [newBlockLetter, setNewBlockLetter] = useState<string>('I');
  const [newBlockName, setNewBlockName] = useState<string>('');
  const [newBlockSubCount, setNewBlockSubCount] = useState<number>(3);
  const [newBlockSlotCount, setNewBlockSlotCount] = useState<number>(5);
  const [addBlockError, setAddBlockError] = useState<string | null>(null);

  useEffect(() => {
    WarehouseLayoutService.syncWithPackage(pkg);
    setBlocks(WarehouseLayoutService.getBlocks());
  }, [pkg]);

  const activeZoneObj = blocks.find(z => z.id === selectedZone) || blocks[0] || {
    id: 'blok-c',
    code: 'BLOK C',
    letter: 'C',
    name: 'Ruang Bersih Kalibrasi APP & kWh Meter',
    description: 'Penyimpanan APP & kWh Meter',
    icon: '⚡',
    color: 'border-amber-400 bg-amber-500/10',
    activeColor: 'ring-4 ring-amber-400 border-amber-500 bg-amber-500/20',
    subBlocks: [],
    highlightRack: 'Rak A-001 (Smart Meter / kWh)',
    sampleMaterials: [],
  };

  const handleSelectBlock = (blockId: string) => {
    setSelectedZone(blockId);
    setSelectedSlot(null);
  };

  const handleAddCustomBlock = (e: React.FormEvent) => {
    e.preventDefault();
    setAddBlockError(null);

    const cleanLetter = newBlockLetter.trim().toUpperCase();
    if (!cleanLetter || cleanLetter.length > 2) {
      setAddBlockError('Huruf/Kode Blok harus 1-2 karakter (contoh: I, J, Z).');
      return;
    }

    try {
      const created = WarehouseLayoutService.addBlock({
        letter: cleanLetter,
        name: newBlockName.trim() || `Area Blok ${cleanLetter}`,
        subBlockCount: newBlockSubCount,
        slotsPerSubBlock: newBlockSlotCount,
      });

      const updated = WarehouseLayoutService.getBlocks();
      setBlocks(updated);
      setSelectedZone(created.id);
      setShowAddBlockModal(false);
      setNewBlockLetter('');
      setNewBlockName('');
    } catch (err: unknown) {
      setAddBlockError(err instanceof Error ? err.message : 'Gagal menambah blok');
    }
  };

  const handleInitializeAtoZ = () => {
    const updated = WarehouseLayoutService.initializeAllBlocksAtoZ();
    WarehouseLayoutService.syncWithPackage(pkg);
    setBlocks(updated);
  };

  const handleAddSlot = (subBlockCode: string) => {
    try {
      WarehouseLayoutService.addSlotToSubBlock(subBlockCode);
      const updated = WarehouseLayoutService.getBlocks();
      setBlocks(updated);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-[#F8FAFC] p-6 lg:p-8 overflow-y-auto no-scrollbar">
      {/* Top Header & Navigation Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5 shrink-0">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/30 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-amber-900 mb-1.5 shadow-2xs">
            <Layers className="h-3.5 w-3.5 text-amber-600" />
            <span>VISUALISASI DENAH GUDANG LOGISTIK PLN (BLOK A s/d Z)</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-black text-[#0F172A] tracking-tight">
            Denah Tata Letak Blok &amp; Rak Material
          </h2>
          <p className="text-sm lg:text-base font-medium text-slate-600 mt-1">
            Visualisasi hierarki lokasi terstandarisasi PLN: <span className="font-bold text-amber-900">Blok (A-Z) &rarr; Sub-Blok (.1, .2, .3) &rarr; Slot (.1 - .5)</span>. Contoh: <span className="font-mono font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">A.1.1 - A.1.5</span> atau <span className="font-mono font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">A.3.1 - A.3.5</span>.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setShowAddBlockModal(true)}
            className="flex h-14 items-center gap-2 rounded-control bg-white border-2 border-amber-400/80 px-5 text-sm font-bold text-amber-950 shadow-sm active:scale-95 hover:bg-amber-50"
          >
            <PlusCircle className="h-5 w-5 text-amber-600" />
            <span>Tambah Blok &amp; Rak Sendiri</span>
          </button>

          {blocks.length < 26 && (
            <button
              onClick={handleInitializeAtoZ}
              className="flex h-14 items-center gap-2 rounded-control bg-amber-100 border border-amber-300 px-4 text-xs font-bold text-amber-900 shadow-sm active:scale-95 hover:bg-amber-200"
              title="Aktifkan seluruh Blok A sampai Z otomatis"
            >
              <Sparkles className="h-4 w-4 text-amber-600" />
              <span>Inisialisasi A s/d Z</span>
            </button>
          )}

          <button
            onClick={onBack}
            className="flex h-14 items-center gap-2 rounded-control bg-white border border-slate-200 px-6 text-base font-bold text-slate-700 shadow-sm active:scale-95 active:bg-slate-100 hover:border-amber-400"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Kembali ke Beranda</span>
          </button>
        </div>
      </div>

      {/* Dynamic Block Selector Tabs (Horizontally Scrollable Carousel for A-Z) */}
      <div className="mb-5 bg-white rounded-2xl border-2 border-slate-200 p-3 shadow-xs">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <FolderTree className="h-4 w-4 text-amber-600" />
            <span>PILIH BLOK AREA GUDANG (Tersedia {blocks.length} Blok Aktif):</span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
            Ketuk salah satu blok di bawah untuk membuka skema sub-blok dan slot rak
          </span>
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 no-scrollbar">
          {blocks.map((b) => {
            const isSelected = selectedZone === b.id;
            const totalSlots = b.subBlocks.reduce((acc, sb) => acc + sb.slots.length, 0);
            return (
              <button
                key={b.id}
                onClick={() => handleSelectBlock(b.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition shrink-0 border-2 ${
                  isSelected
                    ? 'bg-[#0F172A] text-[#FACC15] border-[#FACC15] shadow-md scale-105'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <span>{b.icon}</span>
                <span>{b.code}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                    isSelected ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {totalSlots} slot
                </span>
              </button>
            );
          })}

          <button
            onClick={() => setShowAddBlockModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-amber-800 bg-amber-50 border-2 border-dashed border-amber-300 hover:bg-amber-100 shrink-0 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>+ Blok Baru</span>
          </button>
        </div>
      </div>

      {/* Main Layout Content: 2 Columns */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1">
        {/* Left Column: Floor Plan Schematic + Interactive Sub-Block & Slot Matrix (7 cols) */}
        <div className="xl:col-span-7 flex flex-col rounded-card border-2 border-slate-200 bg-slate-950 p-6 text-white shadow-lg">
          {/* Header Map */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
            <div className="flex items-center gap-2.5">
              <Compass className="h-6 w-6 text-[#FACC15]" />
              <div>
                <h3 className="font-black text-base text-white uppercase tracking-wide">
                  Peta Denah Lantai (Floor Plan Schematic)
                </h3>
                <span className="text-xs text-slate-400">
                  {config.organizationName} &bull; {activeZoneObj.code}: {activeZoneObj.name}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 px-3.5 py-1 text-xs font-bold text-amber-400">
              <Navigation className="h-3.5 w-3.5" />
              <span>Titik Kiosk: Pintu Utama</span>
            </div>
          </div>

          {/* Map Container */}
          <div className="relative flex-1 min-h-[420px] bg-slate-900 rounded-2xl border-2 border-slate-800 p-4 flex flex-col justify-between overflow-hidden">
            {/* Ambient Grid Background */}
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(circle, #FACC15 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />

            {/* Top Loading Dock Row */}
            <div className="relative z-10 flex items-center justify-between bg-slate-800/90 rounded-xl px-4 py-2 border border-slate-700 text-xs font-bold text-slate-300">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FACC15]"></span>
                </span>
                <span className="text-[#FACC15] font-extrabold uppercase">POS KIOSK KASSEN WK-215</span>
              </div>
              <span className="text-slate-400 uppercase tracking-wider text-[11px]">
                GERBANG UTAMA &bull; AREA LOADING DOCK
              </span>
            </div>

            {/* Middle: Interactive Sub-Blocks and Slots of Active Block */}
            <div className="relative z-10 my-4 space-y-4 flex-1 overflow-y-auto max-h-[400px] pr-1 no-scrollbar">
              <div className="flex items-center justify-between bg-slate-950/70 rounded-xl p-3 border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{activeZoneObj.icon}</span>
                  <div>
                    <span className="text-xs font-black text-[#FACC15] uppercase tracking-wider">
                      {activeZoneObj.code}
                    </span>
                    <h4 className="text-sm font-bold text-white line-clamp-1">
                      {activeZoneObj.name}
                    </h4>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      try {
                        WarehouseLayoutService.addSubBlock(activeZoneObj.letter);
                        setBlocks(WarehouseLayoutService.getBlocks());
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    className="flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-500/20 border border-amber-500/40 px-2.5 py-1 rounded-lg hover:bg-amber-500/30 transition"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Tambah Baris Sub-Blok</span>
                  </button>
                </div>
              </div>

              {/* Render Sub-Blocks: e.g. A.1, A.2, A.3 */}
              {activeZoneObj.subBlocks.map((subBlock: WarehouseSubBlock) => (
                <div
                  key={subBlock.code}
                  className="bg-slate-950/90 rounded-xl p-3.5 border border-slate-800 space-y-2.5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-xs text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded border border-amber-400/30">
                        {subBlock.code}
                      </span>
                      <span className="text-xs font-bold text-slate-200">
                        {subBlock.name || `Baris ${subBlock.code}`}
                      </span>
                    </div>

                    <button
                      onClick={() => handleAddSlot(subBlock.code)}
                      className="text-[10px] font-bold text-slate-400 hover:text-amber-400 flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 transition"
                      title={`Tambah slot ke baris ${subBlock.code}`}
                    >
                      <Plus className="h-3 w-3" />
                      <span>+ Slot ({subBlock.code}.{subBlock.slots.length + 1})</span>
                    </button>
                  </div>

                  {/* Slot Matrix: e.g. A.1.1 - A.1.5 or A.3.1 - A.3.5 */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    {subBlock.slots.map((slot: WarehouseSlot) => {
                      const isSlotActive = selectedSlot?.code === slot.code;
                      const isOccupied = slot.status === 'occupied' || Boolean(slot.materialName);
                      return (
                        <button
                          key={slot.code}
                          onClick={() => setSelectedSlot(slot)}
                          className={`flex flex-col p-2 rounded-lg text-left transition border ${
                            isSlotActive
                              ? 'bg-[#FACC15] text-[#0F172A] border-white shadow-md scale-105 ring-2 ring-amber-400'
                              : isOccupied
                              ? 'bg-amber-950/40 border-amber-600/60 text-amber-200 hover:bg-amber-900/50'
                              : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-500'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="font-mono font-black text-xs">
                              {slot.code}
                            </span>
                            {isOccupied && (
                              <span className="h-2 w-2 rounded-full bg-amber-400 shrink-0" />
                            )}
                          </div>
                          <span
                            className={`text-[10px] truncate mt-1 ${
                              isSlotActive
                                ? 'text-slate-900 font-bold'
                                : isOccupied
                                ? 'text-amber-300 font-semibold'
                                : 'text-slate-400'
                            }`}
                          >
                            {slot.materialName || slot.name || 'Kosong'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Row: Forklift Line */}
            <div className="relative z-10 flex items-center justify-between bg-slate-950/80 rounded-xl px-4 py-2 border border-slate-800 text-[11px] font-semibold text-slate-400">
              <span className="flex items-center gap-1.5 text-amber-300">
                <span>🚧</span> Marka Kuning: Jalur Forklift Antar-Blok ({blocks.map(b => b.letter).join(' &bull; ')})
              </span>
              <span className="text-emerald-400 font-bold">
                🟢 Assembly Point Lapangan Depan
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Selected Zone Details, Racks & Slot Info (5 cols) */}
        <div className="xl:col-span-5 flex flex-col rounded-card border-2 border-slate-200 bg-white p-6 lg:p-7 shadow-md justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
              <span className="text-3xl p-2.5 rounded-2xl bg-amber-50 border border-amber-200">
                {activeZoneObj.icon}
              </span>
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-md border border-amber-300">
                  {activeZoneObj.code}
                </span>
                <h3 className="text-xl lg:text-2xl font-black text-[#0F172A] tracking-tight mt-1">
                  {activeZoneObj.name}
                </h3>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed mb-5">
              {activeZoneObj.description}
            </p>

            {/* Interactive Selected Slot Inspector (if clicked) */}
            {selectedSlot ? (
              <div className="mb-5 rounded-2xl border-2 border-[#FACC15] bg-amber-50/80 p-4 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Box className="h-5 w-5 text-amber-700" />
                    <span className="font-mono text-sm font-black text-amber-950">
                      SLOT TERPILIH: {selectedSlot.code}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedSlot(null)}
                    className="text-xs text-slate-400 hover:text-slate-700"
                  >
                    Tutup
                  </button>
                </div>
                <p className="text-xs text-slate-700 font-medium">
                  {selectedSlot.name || `Slot penyimpanan di ${activeZoneObj.code}`}
                </p>
                {selectedSlot.materialName ? (
                  <div className="mt-2.5 bg-white rounded-xl p-2.5 border border-amber-200 text-xs">
                    <span className="font-bold text-slate-800 block">Material Tersimpan:</span>
                    <span className="text-amber-900 font-semibold">{selectedSlot.materialName}</span>
                  </div>
                ) : (
                  <div className="mt-2 text-xs font-bold text-emerald-700">
                    &bull; Slot ini kosong dan siap dialokasikan untuk material baru.
                  </div>
                )}
              </div>
            ) : null}

            {/* List of Sub-Blocks and Racks in This Block */}
            <div className="mb-5">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-2.5 flex items-center gap-1.5">
                <Box className="h-4 w-4 text-amber-600" />
                <span>Daftar Baris &amp; Rak di {activeZoneObj.code}:</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[220px] overflow-y-auto no-scrollbar">
                {activeZoneObj.subBlocks.map((sb) => (
                  <div
                    key={sb.code}
                    className="flex flex-col rounded-xl bg-slate-50 border border-slate-200 p-3 hover:border-[#FACC15] transition"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-extrabold text-[#0F172A]">
                        Baris {sb.code}
                      </span>
                      <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                        {sb.slots.length} Slot
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium truncate">
                      {sb.slots.map(s => s.code).join(', ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Backward Compatibility: Highlight Rack Display */}
            {activeZoneObj.highlightRack && (
              <div className="mb-4 rounded-xl bg-slate-100 border border-slate-200 p-3 flex items-center justify-between">
                <div className="text-xs font-medium text-slate-600">
                  Rak Acuan Utama:
                </div>
                <div className="font-mono text-xs font-bold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded">
                  {activeZoneObj.highlightRack}
                </div>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              Lihat katalog lengkap untuk memeriksa spesifikasi &amp; stok riil.
            </div>
            <button
              onClick={() => {
                const targetSearch = selectedSlot ? selectedSlot.code : activeZoneObj.code;
                if (onSelectRack) {
                  onSelectRack(targetSearch);
                } else {
                  onBack();
                }
              }}
              className="flex h-12 items-center gap-2 rounded-xl bg-[#FACC15] px-5 text-xs lg:text-sm font-bold text-[#0F172A] shadow-sm hover:bg-amber-400 active:scale-95 transition whitespace-nowrap"
            >
              <span>Lihat di Katalog</span>
              <MapPin className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal: Tambah Blok Baru Mandiri */}
      {showAddBlockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border-2 border-amber-400 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-amber-600" />
                <h3 className="font-black text-lg text-slate-900">
                  Tambah Blok &amp; Rak Baru Sendiri
                </h3>
              </div>
              <button
                onClick={() => setShowAddBlockModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {addBlockError && (
              <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-bold text-rose-700">
                {addBlockError}
              </div>
            )}

            <form onSubmit={handleAddCustomBlock} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Huruf / Kode Blok (Misal: I, J, K, H, s/d Z):
                </label>
                <input
                  type="text"
                  maxLength={2}
                  value={newBlockLetter}
                  onChange={(e) => setNewBlockLetter(e.target.value.toUpperCase())}
                  placeholder="Contoh: I atau Z"
                  required
                  className="w-full rounded-xl border border-slate-300 p-3 text-base font-mono font-black text-slate-900 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Nama Area / Kategori Blok:
                </label>
                <input
                  type="text"
                  value={newBlockName}
                  onChange={(e) => setNewBlockName(e.target.value)}
                  placeholder="Contoh: Gardu Hubung &amp; Trafo Khusus"
                  required
                  className="w-full rounded-xl border border-slate-300 p-3 text-sm font-medium text-slate-900 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Jumlah Sub-Blok (Baris):
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={newBlockSubCount}
                    onChange={(e) => setNewBlockSubCount(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-bold text-slate-900"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Misal 3 baris: {newBlockLetter || '?'}.1, {newBlockLetter || '?'}.2, {newBlockLetter || '?'}.3
                  </span>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Slot per Baris:
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={newBlockSlotCount}
                    onChange={(e) => setNewBlockSlotCount(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-bold text-slate-900"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Misal 5 slot: {newBlockLetter || '?'}.1.1 s/d {newBlockLetter || '?'}.1.5
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddBlockModal(false)}
                  className="h-12 px-5 rounded-xl border border-slate-300 font-bold text-slate-700 active:scale-95"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="h-12 px-6 rounded-xl bg-[#FACC15] font-black text-slate-950 shadow-md active:scale-95 hover:bg-amber-400"
                >
                  Simpan &amp; Buat Blok
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
