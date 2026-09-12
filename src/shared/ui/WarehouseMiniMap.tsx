import React from 'react';
import { MapPin, Navigation, Compass, CheckCircle2 } from 'lucide-react';

interface WarehouseMiniMapProps {
  activeZone?: string | null;
  rack?: string | null;
  bin?: string | null;
}

export const WarehouseMiniMap: React.FC<WarehouseMiniMapProps> = ({
  activeZone = '',
  rack = '',
  bin = '',
}) => {
  const safeZone = (activeZone || '').toLowerCase();

  const isZoneA = safeZone.includes('zona a') || safeZone.includes('blok a');
  const isZoneB = safeZone.includes('zona b') || safeZone.includes('blok b');
  const isZoneC = safeZone.includes('zona c') || safeZone.includes('blok c');
  const isZoneD = safeZone.includes('zona d') || safeZone.includes('blok d');

  return (
    <div className="rounded-2xl border-2 border-slate-200 bg-slate-900 p-5 text-white shadow-lg">
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Compass className="h-5 w-5 text-[#FACC15]" />
          <h4 className="font-extrabold text-sm tracking-wide text-slate-100 uppercase">
            Denah Visual Lokasi Rak Gudang Aris Munandar
          </h4>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
          <Navigation className="h-3.5 w-3.5" />
          <span>Titik Anda: Kiosk Kassen Pintu Utama</span>
        </div>
      </div>

      {/* Warehouse Schematic Grid */}
      <div className="grid grid-cols-2 gap-3.5 relative bg-slate-950/80 p-4 rounded-xl border border-slate-800">
        {/* Entrance Gate Indicator */}
        <div className="col-span-2 flex items-center justify-between px-3 py-1.5 bg-slate-800/80 rounded-lg text-xs font-bold text-slate-300 border border-slate-700">
          <span className="flex items-center gap-1.5 text-[#FACC15]">
            <span className="h-2 w-2 rounded-full bg-[#FACC15] animate-ping" />
            POSISI KIOSK KASSEN
          </span>
          <span className="text-slate-400">PINTU MASUK & LOADING DOCK UTAMA</span>
        </div>

        {/* Zona A: Gardu & Jaringan */}
        <div
          className={`relative flex flex-col justify-between rounded-xl p-4 transition-all duration-300 border-2 ${
            isZoneA
              ? 'bg-amber-500/20 border-[#FACC15] shadow-lg shadow-amber-500/20 ring-2 ring-[#FACC15]/50'
              : 'bg-slate-900 border-slate-800 opacity-60'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="font-black text-sm tracking-wider text-amber-300">ZONA A</span>
              {isZoneA && (
                <span className="flex items-center gap-1 text-[11px] font-bold bg-[#FACC15] text-[#0F172A] px-2 py-0.5 rounded-full animate-pulse">
                  <CheckCircle2 className="h-3 w-3" /> LOKASI MATERIAL
                </span>
              )}
            </div>
            <p className="text-xs font-semibold text-slate-300 mt-1">
              Perlengkapan Gardu & Jaringan
            </p>
          </div>
          <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
            <span>Rak A1 – A6</span>
            {isZoneA && rack && (
              <span className="font-mono font-bold text-white bg-amber-600/60 px-1.5 py-0.5 rounded">
                Target: {rack}
              </span>
            )}
          </div>
        </div>

        {/* Zona B: Heavy Material & Trafo */}
        <div
          className={`relative flex flex-col justify-between rounded-xl p-4 transition-all duration-300 border-2 ${
            isZoneB
              ? 'bg-amber-500/20 border-[#FACC15] shadow-lg shadow-amber-500/20 ring-2 ring-[#FACC15]/50'
              : 'bg-slate-900 border-slate-800 opacity-60'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="font-black text-sm tracking-wider text-amber-300">ZONA B</span>
              {isZoneB && (
                <span className="flex items-center gap-1 text-[11px] font-bold bg-[#FACC15] text-[#0F172A] px-2 py-0.5 rounded-full animate-pulse">
                  <CheckCircle2 className="h-3 w-3" /> LOKASI MATERIAL
                </span>
              )}
            </div>
            <p className="text-xs font-semibold text-slate-300 mt-1">
              Heavy Material (Trafo & Drum Kabel)
            </p>
          </div>
          <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
            <span>Jalur Hoist 1 – 4</span>
            {isZoneB && rack && (
              <span className="font-mono font-bold text-white bg-amber-600/60 px-1.5 py-0.5 rounded">
                Target: {rack} &bull; {bin}
              </span>
            )}
          </div>
        </div>

        {/* Zona C: Ruang Bersih APP (Smart Meter) */}
        <div
          className={`relative flex flex-col justify-between rounded-xl p-4 transition-all duration-300 border-2 ${
            isZoneC
              ? 'bg-amber-500/20 border-[#FACC15] shadow-lg shadow-amber-500/20 ring-2 ring-[#FACC15]/50'
              : 'bg-slate-900 border-slate-800 opacity-60'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="font-black text-sm tracking-wider text-amber-300">ZONA C</span>
              {isZoneC && (
                <span className="flex items-center gap-1 text-[11px] font-bold bg-[#FACC15] text-[#0F172A] px-2 py-0.5 rounded-full animate-pulse">
                  <CheckCircle2 className="h-3 w-3" /> LOKASI MATERIAL
                </span>
              )}
            </div>
            <p className="text-xs font-semibold text-slate-300 mt-1">
              Ruang Bersih Kalibrasi APP & AMI
            </p>
          </div>
          <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
            <span>Lemari Suhu Terkontrol</span>
            {isZoneC && rack && (
              <span className="font-mono font-bold text-white bg-amber-600/60 px-1.5 py-0.5 rounded">
                Target: {rack}
              </span>
            )}
          </div>
        </div>

        {/* Zona D: APD & K3 */}
        <div
          className={`relative flex flex-col justify-between rounded-xl p-4 transition-all duration-300 border-2 ${
            isZoneD
              ? 'bg-amber-500/20 border-[#FACC15] shadow-lg shadow-amber-500/20 ring-2 ring-[#FACC15]/50'
              : 'bg-slate-900 border-slate-800 opacity-60'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="font-black text-sm tracking-wider text-amber-300">ZONA D</span>
              {isZoneD && (
                <span className="flex items-center gap-1 text-[11px] font-bold bg-[#FACC15] text-[#0F172A] px-2 py-0.5 rounded-full animate-pulse">
                  <CheckCircle2 className="h-3 w-3" /> LOKASI MATERIAL
                </span>
              )}
            </div>
            <p className="text-xs font-semibold text-slate-300 mt-1">
              Gudang APD & Tool K3 Zero Accident
            </p>
          </div>
          <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
            <span>Rak Standar 5S</span>
            {isZoneD && rack && (
              <span className="font-mono font-bold text-white bg-amber-600/60 px-1.5 py-0.5 rounded">
                Target: {rack}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Target Pin Callout Footer */}
      {activeZone && (
        <div className="mt-4 flex items-center gap-3 bg-amber-500/10 border border-[#FACC15]/30 px-4 py-2.5 rounded-xl">
          <MapPin className="h-5 w-5 text-[#FACC15] shrink-0 animate-bounce" />
          <div className="text-xs text-slate-200">
            Panduan Arah: Dari posisi Kiosk, berjalan lurus menuju{' '}
            <strong className="text-[#FACC15] font-bold">{activeZone}</strong>, cari{' '}
            <strong className="text-white">{rack}</strong> pada{' '}
            <strong className="text-white">{bin}</strong>.
          </div>
        </div>
      )}
    </div>
  );
};
