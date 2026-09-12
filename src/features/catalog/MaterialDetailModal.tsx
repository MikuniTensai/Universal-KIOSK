import React, { useState } from 'react';
import { MaterialWithStock } from '../../domain/types';
import { X, MapPin, Scan, Smartphone, Layers, Boxes } from 'lucide-react';
import { WarehouseMiniMap } from '../../shared/ui/WarehouseMiniMap';
import { MobileHandoverModal } from '../../shared/ui/MobileHandoverModal';
import { getCategoryIcon } from '../../shared/utils/categoryIcons';
import { ContentService } from '../programs/contentService';

interface MaterialDetailModalProps {
  material: MaterialWithStock | null;
  onClose: () => void;
  onScanAnother: () => void;
}

export const MaterialDetailModal: React.FC<MaterialDetailModalProps> = ({
  material,
  onClose,
  onScanAnother,
}) => {
  const [mobileModalVisible, setMobileModalVisible] = useState(false);

  if (!material) return null;

  const primaryLoc = material.locations[0]?.location;
  const CatIcon = getCategoryIcon(material.categoryId || material.categoryName);

  // Extract clean Blok, Rak, and Sub Rak codes persis master Excel CSV (contoh: BLOK A, RAK A, SUB RAK A11)
  const rawZone = primaryLoc?.zone || 'Blok C';
  let cleanBlok = rawZone.replace(/\s*\(.*?\)/g, '').trim();
  if (cleanBlok.toLowerCase().startsWith('blok ')) {
    cleanBlok = cleanBlok.substring(5).trim();
  }
  if (!cleanBlok) cleanBlok = 'C';

  let cleanRak = (primaryLoc?.rack || '-').replace(/\s*\(.*?\)/g, '').trim();
  if (cleanRak.toLowerCase().startsWith('rak ')) {
    cleanRak = cleanRak.substring(4).trim();
  }
  if (cleanRak.toLowerCase().includes('area terbuka') || cleanRak.toLowerCase().includes('tanpa rak')) {
    cleanRak = '-';
  }

  let cleanSubRak = (primaryLoc?.bin || '').replace(/\s*\(.*?\)/g, '').trim();
  if (cleanSubRak.toLowerCase().startsWith('sub rak ')) {
    cleanSubRak = cleanSubRak.substring(8).trim();
  }
  if (cleanSubRak === 'Luar Rak' || cleanSubRak === 'Tanpa Rak' || cleanSubRak === '-') {
    cleanSubRak = '';
  }

  const normalizationNumber = material.code || material.sapCode || '-';
  const stockAmount = material.totalQuantity !== null ? material.totalQuantity : 0;
  const stockDisplay = `${stockAmount} ${material.unit}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl overflow-hidden border border-slate-200 my-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-3.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-xs font-bold text-amber-900">
              <CatIcon className="h-3.5 w-3.5 text-amber-600 shrink-0" />
              <span>{material.categoryName}</span>
            </span>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200/80 text-slate-700 transition hover:bg-slate-300 active:scale-95"
            aria-label="Keluar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body: Desain Persis WhatsApp Client Volta Malang + Tambahan Kode Rak */}
        <div className="p-6 sm:p-8 max-h-[78vh] overflow-y-auto space-y-6">
          
          {/* Card Utama Berpenampilan Persis Permintaan WhatsApp */}
          <div className="rounded-3xl bg-white p-2 text-center flex flex-col items-center">
            
            {/* Foto Material Produk Nyata atau Ikon Kotak Biru Volta */}
            {material.photoPath ? (
              <div className="mb-5 h-44 w-full max-w-[280px] rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-slate-100 relative group">
                <img
                  src={material.photoPath}
                  alt={material.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = ContentService.getFallbackImage();
                  }}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 shadow-sm border border-sky-200/60">
                <Boxes className="h-10 w-10 text-sky-600 stroke-[2.2]" />
              </div>
            )}

            {/* Nama Material (Bold Besar di Tengah Sesuai Gambar) */}
            <h3 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight leading-snug max-w-lg mb-6 uppercase">
              {material.name}
            </h3>

            {/* Kotak Putih Keabuan Di Dalam (Inner Section) */}
            <div className="w-full rounded-2xl bg-slate-50/90 p-5 sm:p-6 border border-slate-200/70 text-left space-y-4 shadow-xs">
              
              {/* Baris 1: NOMOR NORMALISASI */}
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
                  NOMOR NORMALISASI
                </span>
                <div className="inline-block bg-[#E2E8F0] border border-slate-300/60 text-slate-900 font-mono font-black text-base sm:text-lg px-4 py-1 rounded-xl shadow-2xs">
                  {normalizationNumber}
                </div>
              </div>

              {/* Garis Pembatas Putus-putus Dotted */}
              <div className="border-b border-dashed border-slate-200" />

              {/* Baris 2: JUMLAH (STOK SAAT INI) */}
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
                  JUMLAH (STOK SAAT INI)
                </span>
                <div className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
                  {stockDisplay}
                </div>
              </div>

              {/* Garis Pembatas Putus-putus Dotted */}
              <div className="border-b border-dashed border-slate-200" />

              {/* Baris 3: LOKASI PENYIMPANAN & KODE RAK (TAMBAHAN UTAMA PERMINTAAN USER) */}
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                  LOKASI PENYIMPANAN & KODE RAK
                </span>
                
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Badge BLOK */}
                  <div className="inline-flex items-center gap-1.5 rounded-xl bg-amber-100 border border-amber-300 px-3.5 py-1.5 text-xs sm:text-sm font-black text-amber-950 shadow-2xs">
                    <MapPin className="h-4 w-4 text-amber-700 shrink-0" />
                    <span>BLOK {cleanBlok.toUpperCase()}</span>
                  </div>

                  {/* Badge RAK */}
                  <div className="inline-flex items-center gap-1.5 rounded-xl bg-[#0F172A] border border-slate-800 px-4 py-1.5 text-xs sm:text-sm font-black font-mono text-[#FACC15] shadow-sm">
                    <Layers className="h-4 w-4 text-[#FACC15] shrink-0" />
                    <span>RAK {cleanRak.toUpperCase()}</span>
                  </div>

                  {/* Badge SUB RAK (Format Master Excel SAP) */}
                  {cleanSubRak && cleanSubRak !== '-' ? (
                    <div className="inline-flex items-center gap-1.5 rounded-xl bg-sky-100 border border-sky-300 px-3.5 py-1.5 text-xs sm:text-sm font-black font-mono text-sky-950 shadow-2xs">
                      <Boxes className="h-4 w-4 text-sky-700 shrink-0" />
                      <span>SUB RAK {cleanSubRak.toUpperCase()}</span>
                    </div>
                  ) : null}
                </div>

                <p className="mt-2 text-xs text-slate-500 font-medium">
                  Gudang Aris Munandar UP3 Malang &bull; Kode Gudang: {primaryLoc?.warehouseCode || 'GUD-PLN-MLG-AM01'}
                </p>
              </div>

            </div>
          </div>

          {/* Lokasi Rak & Rincian Persediaan (Dihapus sesuai instruksi client karena sudah ada di kartu ringkasan atas) */}
          <span className="sr-only">Lokasi Rak & Rincian Persediaan</span>

          {/* Spesifikasi Teknis SPLN & Visual Mini Map */}
          <div className="space-y-4 pt-2">

            {/* Spesifikasi Teknis SPLN */}
            {material.specification && (
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Spesifikasi Standar SPLN:
                </span>
                <p className="text-xs sm:text-sm font-medium text-slate-800 leading-relaxed">
                  {material.specification}
                </p>
              </div>
            )}

            {/* Visual Mini Map */}
            <div>
              <WarehouseMiniMap
                activeZone={primaryLoc?.zone}
                rack={cleanRak}
                bin={primaryLoc?.bin}
              />
            </div>
          </div>

        </div>

        {/* Modal Footer Controls (Kiosk Optimized, Touch Friendly) */}
        <div className="flex flex-wrap items-center justify-between border-t border-slate-200 bg-slate-50 p-4 gap-3">
          <div className="flex gap-2.5">
            <button
              onClick={onScanAnother}
              className="flex h-12 items-center gap-2 rounded-xl bg-[#FACC15] px-5 text-sm font-black text-[#0F172A] shadow-md transition active:scale-95 hover:bg-[#EAB308]"
            >
              <Scan className="h-4 w-4" />
              <span>Scan Material Lain</span>
            </button>

            <button
              onClick={() => setMobileModalVisible(true)}
              className="flex h-12 items-center gap-2 rounded-xl bg-sky-700 text-white px-4 text-sm font-bold shadow-md transition active:scale-95 hover:bg-sky-800"
            >
              <Smartphone className="h-4 w-4 text-sky-200" />
              <span>Bawa ke HP</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="flex h-12 items-center justify-center rounded-xl bg-white border border-slate-300 px-6 text-sm font-bold text-slate-700 shadow-xs transition active:scale-95 hover:bg-slate-100"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* Mobile Handover Modal (QR Code) */}
      <MobileHandoverModal
        material={material}
        visible={mobileModalVisible}
        onClose={() => setMobileModalVisible(false)}
      />
    </div>
  );
};
