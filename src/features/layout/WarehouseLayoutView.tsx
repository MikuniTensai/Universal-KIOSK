import React, { useState } from 'react';
import { ArrowLeft, Compass, Navigation, MapPin, Layers, CheckCircle2, Box, Info } from 'lucide-react';
import { ImportPackage, KioskConfig } from '../../domain/types';

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
  const [selectedZone, setSelectedZone] = useState<string>('blok-c');

  const zones = [
    {
      id: 'blok-c',
      code: 'BLOK C',
      name: 'Ruang Bersih Kalibrasi APP & kWh Meter',
      icon: '⚡',
      color: 'border-amber-400 bg-amber-500/10',
      activeColor: 'ring-4 ring-amber-400 border-amber-500 bg-amber-500/20',
      racks: ['Rak A-001 (Smart Meter / kWh)', 'Rak A-002 (Modem AMI)', 'Lemari Kalibrasi 1'],
      highlightRack: 'Rak A-001',
      description: 'Penyimpanan berpendingin udara dan suhu terkontrol untuk Smart Meter AMI 1 & 3 Fasa, Current Transformer (CT), dan perangkat pengukur presisi.',
      sampleMaterials: ['Smart Meter Listrik (kWh Meter) AMI 1 Fasa 5(60)A', 'Modem Komunikasi AMI 4G'],
    },
    {
      id: 'blok-a',
      code: 'BLOK A',
      name: 'Perlengkapan Gardu & Jaringan Distribusi',
      icon: '🔌',
      color: 'border-blue-400 bg-blue-500/10',
      activeColor: 'ring-4 ring-blue-400 border-blue-500 bg-blue-500/20',
      racks: ['Rak A1', 'Rak A2', 'Rak A3', 'Rak A4', 'Rak A5', 'Rak A6'],
      highlightRack: 'Rak A3',
      description: 'Penyimpanan perlengkapan gardu distribusi tegangan 20 kV: Isolator Tumpu, Fused Cut Out (FCO), Lightning Arrester, dan Lightning Conductor.',
      sampleMaterials: ['Isolator Tumpu Keramik 20 kV', 'Fused Cut Out (FCO) Polymer 24 kV'],
    },
    {
      id: 'blok-b',
      code: 'BLOK B',
      name: 'Heavy Material, Trafo & Drum Kabel',
      icon: '🏗️',
      color: 'border-purple-400 bg-purple-500/10',
      activeColor: 'ring-4 ring-purple-400 border-purple-500 bg-purple-500/20',
      racks: ['Jalur Hoist 1', 'Jalur Hoist 2 (Blok H-04)', 'Blok Drum D-01 s/d D-05'],
      highlightRack: 'Blok H-04',
      description: 'Lantai beton bertulang dengan overhead crane hoist untuk penanganan Transformator Distribusi 50-250 kVA dan gulungan drum kabel MVTIC/SKTM.',
      sampleMaterials: ['Transformator Distribusi 3 Fasa 100 kVA', 'Kabel MVTIC 3x150 mm² + 1x95 mm²'],
    },
    {
      id: 'blok-d',
      code: 'BLOK D',
      name: 'Gudang APD & Alat Kerja K3 Zero Accident',
      icon: '🦺',
      color: 'border-emerald-400 bg-emerald-500/10',
      activeColor: 'ring-4 ring-emerald-400 border-emerald-500 bg-emerald-500/20',
      racks: ['Rak K3-01', 'Rak K3-02', 'Lemari Alat Ukur Insulasi'],
      highlightRack: 'Rak K3-01',
      description: 'Penyimpanan Alat Pelindung Diri (APD), Helm Safety V-Gard, Sepatu Safety Dielektrik, Sarung Tangan Tahan 20kV, Full Body Harness, dan grounding kit.',
      sampleMaterials: ['Helm Safety K3 Proyek V-Gard Putih', 'Sarung Tangan Dielektrik 20 kV'],
    },
  ];

  const activeZoneObj = zones.find(z => z.id === selectedZone) || zones[0];

  return (
    <div className="flex flex-col min-h-full bg-[#F8FAFC] p-6 lg:p-8 overflow-y-auto no-scrollbar">
      {/* Top Header & Back Button */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 shrink-0">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/30 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-amber-900 mb-1.5 shadow-2xs">
            <Layers className="h-3.5 w-3.5 text-amber-600" />
            <span>VISUALISASI DENAH GUDANG LOGISTIK PLN</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-black text-[#0F172A] tracking-tight">
            Denah Tata Letak Blok &amp; Rak Material
          </h2>
          <p className="text-sm lg:text-base font-medium text-slate-600 mt-1">
            Visualisasi blok penyimpanan material, nomor rak (misal: kWh Meter di Rak A-001), dan alur lintas gudang.
          </p>
        </div>

        <button
          onClick={onBack}
          className="flex h-14 items-center gap-2 rounded-control bg-white border border-slate-200 px-6 text-base font-bold text-slate-700 shadow-sm active:scale-95 active:bg-slate-100 shrink-0 hover:border-amber-400"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Kembali ke Beranda</span>
        </button>
      </div>

      {/* Client Clarification Notice Banner */}
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-amber-50 via-white to-amber-50 border-2 border-amber-200 p-4 shadow-xs flex items-center gap-3.5 shrink-0">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FACC15] text-[#0F172A] shadow-xs">
          <Info className="h-5 w-5" />
        </div>
        <div className="text-xs lg:text-sm text-slate-700">
          <strong className="text-amber-950 font-extrabold">Catatan Integrasi Layout:</strong> Tata letak visual di bawah mengacu pada peta pembagian blok gudang logistik PLN UP3 Malang. Sentuh salah satu blok untuk melihat daftar rak, penomoran rak (seperti <span className="font-mono font-bold text-amber-900 bg-amber-200/70 px-1.5 py-0.5 rounded">Rak A-001</span>), dan kategori material di dalamnya.
        </div>
      </div>

      {/* Main Layout Content: Grid 2 Columns (Interactive Map Left, Detail Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1">
        {/* Left: Interactive Warehouse Schematic Map (7 cols) */}
        <div className="xl:col-span-7 flex flex-col rounded-card border-2 border-slate-200 bg-slate-950 p-6 text-white shadow-lg">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
            <div className="flex items-center gap-2.5">
              <Compass className="h-6 w-6 text-[#FACC15]" />
              <div>
                <h3 className="font-black text-base text-white uppercase tracking-wide">
                  Peta Denah Lantai (Floor Plan Schematic)
                </h3>
                <span className="text-xs text-slate-400">
                  {config.organizationName} &bull; {pkg.materials.length} Material Terdaftar
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 px-3.5 py-1 text-xs font-bold text-amber-400">
              <Navigation className="h-3.5 w-3.5" />
              <span>Titik Kiosk: Pintu Utama Depan</span>
            </div>
          </div>

          {/* Warehouse Layout Map Container */}
          <div className="relative flex-1 min-h-[380px] bg-slate-900 rounded-2xl border-2 border-slate-800 p-4 flex flex-col justify-between overflow-hidden">
            {/* Ambient Grid Lines */}
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(circle, #FACC15 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />

            {/* Top Row: Loading Dock & Entrance */}
            <div className="relative z-10 flex items-center justify-between bg-slate-800/90 rounded-xl px-4 py-2.5 border border-slate-700 text-xs font-bold text-slate-300">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FACC15]"></span>
                </span>
                <span className="text-[#FACC15] font-extrabold uppercase">POS KIOSK KASSEN WK-215</span>
              </div>
              <span className="text-slate-400 uppercase tracking-wider">GATE PINTU UTAMA &amp; LOADING DOCK TRUK</span>
            </div>

            {/* Main Warehouse Floor Grid: 4 Interactive Blocks */}
            <div className="relative z-10 grid grid-cols-2 gap-4 my-4 flex-1">
              {zones.map((zone) => {
                const isSelected = selectedZone === zone.id;
                return (
                  <button
                    key={zone.id}
                    onClick={() => setSelectedZone(zone.id)}
                    className={`relative flex flex-col justify-between rounded-xl p-4 text-left transition-all duration-300 border-2 ${
                      isSelected
                        ? `${zone.activeColor} shadow-xl shadow-amber-500/10`
                        : `${zone.color} opacity-75 hover:opacity-100 hover:border-slate-500`
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{zone.icon}</span>
                          <span className="font-black text-sm lg:text-base tracking-wider text-white">
                            {zone.code}
                          </span>
                        </div>
                        {isSelected && (
                          <span className="flex items-center gap-1 rounded-full bg-[#FACC15] px-2.5 py-0.5 text-[10px] font-black uppercase text-[#0F172A] shadow-xs animate-pulse">
                            <CheckCircle2 className="h-3 w-3" /> AKTIF
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-slate-200 line-clamp-2">
                        {zone.name}
                      </h4>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-1 text-[11px]">
                      <span className="text-slate-400">Rak Utama:</span>
                      <span className="font-mono font-bold text-amber-300 bg-black/40 px-2 py-0.5 rounded">
                        {zone.highlightRack}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bottom Row: Forklift Lane & Assembly Point */}
            <div className="relative z-10 flex items-center justify-between bg-slate-950/80 rounded-xl px-4 py-2 border border-slate-800 text-[11px] font-semibold text-slate-400">
              <span className="flex items-center gap-1.5 text-amber-300">
                <span>🚧</span> Marka Kuning: Jalur Lintasan Forklift &amp; Material Handler
              </span>
              <span className="text-emerald-400 font-bold">
                🟢 Assembly Point Lapangan Depan
              </span>
            </div>
          </div>
        </div>

        {/* Right: Selected Zone Details & Rak Material Index (5 cols) */}
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

            {/* List of Racks in This Block */}
            <div className="mb-5">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-2.5 flex items-center gap-1.5">
                <Box className="h-4 w-4 text-amber-600" />
                <span>Daftar Rak Material di {activeZoneObj.code}:</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeZoneObj.racks.map((rackName, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 p-3 hover:border-[#FACC15] transition"
                  >
                    <span className="font-mono text-xs font-extrabold text-[#0F172A]">
                      {rackName}
                    </span>
                    <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                      Tersedia
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sample Materials in This Block */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-amber-600" />
                <span>Contoh Material yang Disimpan:</span>
              </h4>
              <ul className="space-y-1.5">
                {activeZoneObj.sampleMaterials.map((matName, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-amber-50/50 rounded-lg p-2.5 border border-amber-100"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                    <span>{matName}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action Footer */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              Ingin melihat stok riil barang? Buka Katalog Material di bawah.
            </div>
            <button
              onClick={() => {
                if (onSelectRack) {
                  onSelectRack(activeZoneObj.highlightRack);
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
    </div>
  );
};
