import React, { useState, useEffect, useMemo } from 'react';
import { Scan, AlertCircle, ArrowLeft, RefreshCw, CheckCircle2, MapPin, Sparkles, BookOpen, ShieldCheck, Smartphone, Layers } from 'lucide-react';
import { ScanResolveResult, ImportPackage } from '../../domain/types';
import { ContentService } from '../programs/contentService';
import { WarehouseMiniMap } from '../../shared/ui/WarehouseMiniMap';
import { MobileHandoverModal } from '../../shared/ui/MobileHandoverModal';
import { getCategoryIcon } from '../../shared/utils/categoryIcons';

interface ScanStandbyViewProps {
  pkg?: ImportPackage | null;
  onBack: () => void;
  onNavigateToCatalog: () => void;
  lastScanResult: ScanResolveResult | null;
  onClearScanResult: () => void;
  onSimulateScan: (rawCode: string) => void;
}

export const ScanStandbyView: React.FC<ScanStandbyViewProps> = ({
  pkg,
  onBack,
  onNavigateToCatalog,
  lastScanResult,
  onClearScanResult,
  onSimulateScan,
}) => {
  const [manualCode, setManualCode] = useState('');
  const [recentScans, setRecentScans] = useState<ScanResolveResult[]>([]);
  const [selectedScan, setSelectedScan] = useState<ScanResolveResult | null>(null);
  const [mobileModalVisible, setMobileModalVisible] = useState(false);

  const presetList = useMemo(() => {
    const list: { label: string; code: string; isCustom?: boolean }[] = [
      { label: 'TRF Dudukan (1060798)', code: '1060798' },
      { label: 'MCB 10A Rak A11', code: '3250052' },
      { label: 'Cable Shoe Rak H12', code: '3120159' },
      { label: 'Box 105 kVA', code: '4120470' },
      { label: 'Trafo 100kVA', code: 'PLN-TRF-100KVA-2026' },
      { label: 'Kode Nol Depan', code: '000123' },
      { label: 'Asset Serial', code: 'TRF-TRAFOINDO-2026-081' },
      { label: 'Isolator 20kV', code: '000456' },
    ];

    // Tambahkan preset dinamis hanya untuk material kustom baru yang didaftarkan oleh petugas
    if (pkg && pkg.materials) {
      const standardCodes = new Set(['000123', '000456', '000789', '001012', '001345', '001678', '1060798', '3250052', '3120159', '4120470']);
      pkg.materials.forEach((m) => {
        if (!m.id.startsWith('mat-csv-') && !standardCodes.has(m.code)) {
          const alias = pkg.barcodeAliases?.find(a => a.targetId === m.id && a.targetType === 'material');
          const codeToUse = alias?.value || m.code;
          list.push({
            label: m.name.length > 25 ? m.name.substring(0, 23) + '...' : m.name,
            code: codeToUse,
            isCustom: true,
          });
        }
      });
    }
    return list;
  }, [pkg]);

  useEffect(() => {
    if (lastScanResult && lastScanResult.status === 'found' && lastScanResult.material) {
      setSelectedScan(lastScanResult);
      setRecentScans(prev => {
        const filtered = prev.filter(s => s.rawCode !== lastScanResult.rawCode);
        return [lastScanResult, ...filtered].slice(0, 5);
      });
    } else if (lastScanResult && lastScanResult.status === 'not_found') {
      setSelectedScan(lastScanResult);
    } else if (!lastScanResult) {
      setSelectedScan(null);
    }
  }, [lastScanResult]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onSimulateScan(manualCode.trim());
      setManualCode('');
    }
  };

  const activeResult = selectedScan || lastScanResult;

  // If there's an active scan result, show Result Card (Price & Item Checker ala Minimarket)
  if (activeResult) {
    if (activeResult.status === 'found' && activeResult.material) {
      const mat = activeResult.material;
      const primaryLoc = mat.locations[0]?.location;

      return (
        <div className="flex flex-col min-h-full bg-[#F8FAFC] p-8 overflow-y-auto no-scrollbar">
          {/* Header Action */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50 px-4 sm:px-5 py-2.5 rounded-control border border-emerald-300 shadow-sm">
              <CheckCircle2 className="h-5 sm:h-6 w-5 sm:w-6 text-emerald-600 shrink-0" />
              <span className="font-bold text-sm sm:text-base">Hasil Pemindaian Barcode Material</span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={() => setMobileModalVisible(true)}
                className="flex h-12 sm:h-14 items-center justify-center gap-2 rounded-xl bg-sky-700 text-white px-4 sm:px-5 text-sm sm:text-base font-bold shadow-md hover:bg-sky-800 active:scale-95 transition-all flex-1 sm:flex-initial"
              >
                <Smartphone className="h-5 w-5 text-sky-200" />
                <span>Bawa ke HP</span>
              </button>
              <button
                onClick={onClearScanResult}
                className="flex h-12 sm:h-14 items-center justify-center gap-2 rounded-xl bg-[#FACC15] px-4 sm:px-6 text-sm sm:text-base font-bold text-[#0F172A] shadow-md active:scale-95 hover:bg-amber-400 transition-all flex-1 sm:flex-initial"
              >
                <RefreshCw className="h-5 w-5" />
                <span>Scan Lain</span>
              </button>
              <button
                onClick={onBack}
                className="flex h-12 sm:h-14 items-center justify-center gap-2 rounded-xl bg-white border border-slate-300 px-4 sm:px-6 text-sm sm:text-base font-bold text-slate-700 shadow-sm active:scale-95 hover:bg-slate-50 transition-all flex-1 sm:flex-initial"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Menu Utama</span>
              </button>
            </div>
          </div>

          {/* Multi-Scan Session History Tray (Benchmark Decathlon & Uniqlo) */}
          {recentScans.length > 1 && (
            <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                <Layers className="h-4 w-4 text-amber-600" />
                <span>Riwayat Scan Sesi Ini ({recentScans.length} Material Terpindai):</span>
              </div>
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {recentScans.map((scanItem) => {
                  const isActive = scanItem.rawCode === activeResult.rawCode;
                  return (
                    <button
                      key={scanItem.rawCode}
                      onClick={() => setSelectedScan(scanItem)}
                      className={`flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-xs font-bold border transition-all ${
                        isActive
                          ? 'bg-[#FACC15] text-[#0F172A] border-[#FACC15] shadow-md ring-2 ring-amber-400'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span className="font-mono bg-black/10 px-1.5 py-0.5 rounded text-[11px]">
                        {scanItem.material?.code || scanItem.rawCode}
                      </span>
                      <span className="max-w-[150px] truncate">
                        {scanItem.material?.name || 'Material'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Result Card: Price / Item Checker Layout */}
          <div className="rounded-card bg-white p-8 shadow-xl border-2 border-slate-200 space-y-6 max-w-6xl mx-auto w-full">
            {/* Banner Top Title */}
            <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
                  CEK SPESIFIKASI & LOKASI MANDIRI
                </span>
                <h3 className="text-xl font-black text-[#0F172A] mt-2">
                  Spesifikasi Resmi Material Gudang PLN
                </h3>
              </div>
              <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded border border-slate-200">
                Barcode: {activeResult.rawCode}
              </span>
            </div>

            {/* Photo and Product Details Grid */}
            <div className="grid md:grid-cols-3 gap-8">
              <div className="h-64 rounded-material overflow-hidden bg-slate-100 border border-slate-200 shadow-inner">
                <img
                  src={mat.photoPath || ContentService.getFallbackImage()}
                  alt={mat.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = ContentService.getFallbackImage();
                  }}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="md:col-span-2 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="rounded bg-[#0F172A] px-2.5 py-1 font-mono text-xs font-bold text-white">
                      KODE: {mat.code}
                    </span>
                    {mat.sapCode && (
                      <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                        SAP: {mat.sapCode}
                      </span>
                    )}
                    {(() => {
                      const CatIcon = getCategoryIcon(mat.categoryId || mat.categoryName);
                      return (
                        <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-900 border border-amber-200">
                          <CatIcon className="h-3.5 w-3.5 text-amber-800 shrink-0" />
                          <span>{mat.categoryName}</span>
                        </span>
                      );
                    })()}
                  </div>

                  <h3 className="text-2xl font-black text-[#0F172A] leading-tight">
                    {mat.name}
                  </h3>

                  <div className="mt-3 rounded-control bg-slate-50 p-4 border border-slate-200">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Standar Spesifikasi SPLN:
                    </span>
                    <p className="text-sm font-medium text-slate-800 leading-relaxed">
                      {mat.specification || 'Spesifikasi teknis SPLN belum terdaftar.'}
                    </p>
                  </div>
                </div>

                {/* Stock Status Box */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs uppercase font-bold tracking-wider text-slate-400 block">
                      Ketersediaan Fisik Gudang:
                    </span>
                    <div className="text-3xl font-black text-emerald-700">
                      {mat.totalQuantity !== null ? `${mat.totalQuantity} ${mat.unit}` : 'Data stok belum tersedia'}
                    </div>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    <div>Teralokasi / Proyek: <strong>{mat.totalReserved ?? 0} {mat.unit}</strong></div>
                    <div className="text-emerald-700 font-bold">Siap Pakai: {mat.totalAvailable ?? mat.totalQuantity ?? 0} {mat.unit}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Location & Rack Position (Paling Penting untuk Petugas Lapangan) */}
            <div className="rounded-control bg-amber-50/70 p-5 border-2 border-amber-300 flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FACC15] text-[#0F172A] shadow">
                <MapPin className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900 block">
                  Posisi Rak & Alamat Lokasi Gudang:
                </span>
                <div className="flex flex-wrap items-center gap-2.5 mt-1.5">
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-100 border border-amber-300 px-3.5 py-1 text-sm font-black text-amber-950">
                    <MapPin className="h-4 w-4 text-amber-700 shrink-0" />
                    <span>{primaryLoc?.zone?.replace(/\s*\(.*\)/, '').toUpperCase() || 'BLOK C'}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#0F172A] border border-slate-800 px-3.5 py-1 text-sm font-mono font-black text-[#FACC15]">
                    <span>RAK: {primaryLoc?.bin && primaryLoc.bin !== 'Luar Rak' && primaryLoc.bin !== 'Tanpa Rak' ? primaryLoc.bin : (primaryLoc?.rack && primaryLoc.rack !== '-' ? primaryLoc.rack : 'Area Terbuka (Tanpa Rak)')}</span>
                  </span>
                </div>
                <span className="text-xs text-amber-900/80 mt-1.5 block">
                  {primaryLoc?.zone || 'Gudang Aris Munandar UP3 Malang'} &bull; Menuju ke lorong rak di atas untuk pengambilan fisik material.
                </span>
              </div>
            </div>

            {/* Visual Warehouse Mini-Map (Benchmark Home Depot / Lowe's) */}
            <div className="pt-1">
              <WarehouseMiniMap
                activeZone={primaryLoc?.zone}
                blok={primaryLoc?.zone}
                rack={primaryLoc?.rack}
                bin={primaryLoc?.bin}
                subRak={primaryLoc?.bin}
              />
            </div>

            {/* Target Asset Serial if matched */}
            {activeResult.asset && (
              <div className="rounded-control bg-blue-50 p-4 border border-blue-200 text-sm text-blue-900 font-semibold flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0" />
                <span>Unit Fisik Terverifikasi: Nomor Seri Pabrikan <strong>{activeResult.asset.serialNumber}</strong></span>
              </div>
            )}
          </div>

          {/* Mobile Handover Modal (QR Code) */}
          <MobileHandoverModal
            material={mat}
            visible={mobileModalVisible}
            onClose={() => setMobileModalVisible(false)}
          />
        </div>
      );
    } else {
      // Not Found or Invalid
      return (
        <div className="flex flex-col items-center justify-center h-full bg-[#F8FAFC] p-8 text-center">
          <div className="w-full max-w-lg rounded-card bg-white p-8 shadow-xl border border-slate-200 space-y-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-rose-100 text-rose-600">
              <AlertCircle className="h-10 w-10" />
            </div>

            <h3 className="text-2xl font-extrabold text-[#0F172A]">
              Material Tidak Ditemukan
            </h3>

            <p className="text-base text-slate-600 leading-relaxed">
              Barcode / QR Code: <span className="font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">{activeResult.rawCode}</span> tidak terdaftar dalam database persediaan gudang PLN saat ini.
            </p>

            <div className="flex flex-col gap-3 pt-4">
              <button
                onClick={onClearScanResult}
                className="flex h-14 items-center justify-center gap-2 rounded-control bg-[#FACC15] text-base font-bold text-[#0F172A] shadow-md active:scale-95"
              >
                <RefreshCw className="h-5 w-5" />
                <span>Coba Scan Ulang</span>
              </button>

              <button
                onClick={onNavigateToCatalog}
                className="flex h-14 items-center justify-center gap-2 rounded-control bg-white border border-slate-300 text-base font-bold text-slate-700 shadow-sm active:scale-95"
              >
                <BookOpen className="h-5 w-5" />
                <span>Cari Manual di E-Katalog</span>
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  // Standby Scanning Screen
  return (
    <div className="flex flex-col min-h-full bg-[#F8FAFC] p-8 items-center justify-between no-scrollbar overflow-y-auto">
      {/* Top Banner */}
      <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 max-w-6xl shrink-0">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
            Scan Item (Cek Spesifikasi Mandiri)
          </h2>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
            Arahkan barcode atau QR material ke pemindai optik di bawah layar terminal Kassen WK-215
          </p>
        </div>

        <button
          onClick={onBack}
          className="flex h-12 sm:h-14 items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 px-5 sm:px-6 text-sm sm:text-base font-bold text-slate-700 shadow-sm active:scale-95 hover:bg-slate-50 shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Kembali</span>
        </button>
      </div>

      {/* Center Viewfinder Target Frame */}
      <div className="my-auto flex flex-col items-center">
        {/* Status indicator badge */}
        <div className="mb-6 flex items-center gap-2 rounded-full bg-emerald-100 px-5 py-2 text-sm font-bold text-emerald-900 border border-emerald-300 shadow-sm">
          <span className="h-3 w-3 rounded-full bg-emerald-500 animate-ping" />
          <span>SIAGA MEMINDAI (SCANNER READY)</span>
        </div>

        {/* Framing Box with Corner Accents */}
        <div className="relative flex h-72 w-80 md:h-80 md:w-96 items-center justify-center rounded-2xl bg-white shadow-xl border-2 border-slate-200 overflow-hidden">
          {/* Corner Markers */}
          <div className="absolute top-4 left-4 h-8 w-8 border-t-4 border-l-4 border-[#FACC15] rounded-tl" />
          <div className="absolute top-4 right-4 h-8 w-8 border-t-4 border-r-4 border-[#FACC15] rounded-tr" />
          <div className="absolute bottom-4 left-4 h-8 w-8 border-b-4 border-l-4 border-[#FACC15] rounded-bl" />
          <div className="absolute bottom-4 right-4 h-8 w-8 border-b-4 border-r-4 border-[#FACC15] rounded-br" />

          {/* Animated Scanning Beam */}
          <div className="absolute inset-x-8 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_15px_rgba(250,204,21,1)] animate-pulse-beam" />

          <div className="flex flex-col items-center text-center p-6 text-slate-400">
            <Scan className="h-16 w-16 mb-2 text-slate-300" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Sensor Optik USB HID
            </span>
            <span className="text-xs text-slate-400 mt-1">
              Mendeteksi Code 128, QR Code, DataMatrix
            </span>
          </div>
        </div>

        <p className="mt-6 text-center text-base font-semibold text-slate-700 max-w-md">
          Dekatkan fisik barcode material sekitar 10–15 cm di depan kaca scanner hingga berbunyi "Beep".
        </p>
      </div>

      {/* Bottom Simulator & Manual Code Entry (For Testing & Verification) */}
      <div className="w-full max-w-6xl rounded-2xl bg-white p-4 sm:p-5 border border-slate-200 shadow-sm shrink-0">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-amber-500" />
            Uji Coba Cepat (Preset Barcode):
          </span>
        </div>

        {/* Quick simulation pills */}
        <div className="flex flex-wrap gap-2 mb-3">
          {presetList.map((preset) => (
            <button
              key={preset.code}
              onClick={() => onSimulateScan(preset.code)}
              className="min-h-[38px] rounded-xl bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-900 border border-amber-200 hover:bg-amber-100 active:scale-95 transition"
            >
              {preset.label} ({preset.code})
            </button>
          ))}
          <button
            onClick={() => onSimulateScan('KODE-SALAH-999')}
            className="min-h-[38px] rounded-xl bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-800 border border-rose-200 hover:bg-rose-100 active:scale-95 transition"
          >
            Simulasi Tidak Terdaftar
          </button>
        </div>

        {/* Manual typing fallback */}
        <form onSubmit={handleManualSubmit} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Atau ketik nilai barcode / nomor serial..."
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            className="h-12 flex-1 rounded-xl border border-slate-300 bg-slate-50 px-4 text-sm font-mono text-slate-800 focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-300 focus:outline-none transition"
          />
          <button
            type="submit"
            className="h-12 px-6 rounded-xl bg-[#FACC15] text-sm font-bold text-[#0F172A] shadow active:scale-95 hover:bg-amber-400 transition"
          >
            Tes Scan
          </button>
        </form>
      </div>
    </div>
  );
};
