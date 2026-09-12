import React from 'react';
import { Zap, ShieldCheck, Sparkles, Scan, ArrowRight } from 'lucide-react';
import { ImportPackage, KioskConfig } from '../../domain/types';
import { WALLPAPER_PRESETS } from '../../data/mockPlnPackage';
import { DanantaraLogo } from '../../shared/ui/DanantaraLogo';
import { PlnLogo } from '../../shared/ui/PlnLogo';

interface IdleScreensaverProps {
  pkg: ImportPackage;
  config: KioskConfig;
  onStart: () => void;
}

export const IdleScreensaver: React.FC<IdleScreensaverProps> = ({
  pkg,
  config,
  onStart,
}) => {
  const wallpaperUrl =
    config.customWallpaperUrl ||
    (config.wallpaperPreset && (WALLPAPER_PRESETS as any)[config.wallpaperPreset]?.url) ||
    WALLPAPER_PRESETS.warehouse.url;

  return (
    <div
      onClick={onStart}
      className="fixed inset-0 h-full w-full z-30 flex flex-col justify-between p-12 text-white bg-gradient-to-br from-slate-950/95 via-slate-900/90 to-slate-950/95 cursor-pointer select-none relative overflow-hidden transition-all duration-700"
    >
      {/* Background Wallpaper */}
      {wallpaperUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000 -z-10 scale-105"
          style={{ backgroundImage: `url(${wallpaperUrl})` }}
        >
          {/* High contrast dark overlay for readability and WCAG AAA compliance */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-slate-900/80 backdrop-blur-[2px]" />
        </div>
      )}

      {/* Top Banner: Danantara Kiri & PLN Kanan */}
      <div className="flex items-center justify-between z-10 w-full">
        <DanantaraLogo variant="dark" />

        <div className="hidden md:flex items-center gap-2 rounded-full bg-white/10 px-5 py-2 backdrop-blur-md border border-white/20 shadow-sm">
          <ShieldCheck className="h-4 w-4 text-[#FACC15]" />
          <span className="text-xs font-bold tracking-wider text-slate-200 uppercase">
            Holding BUMN Ketenagalistrikan &bull; {config.warehouseCode}
          </span>
        </div>

        <PlnLogo variant="dark" />
      </div>

      {/* Main Center Message (Centered) */}
      <div className="my-auto flex flex-col items-center justify-center text-center max-w-4xl mx-auto space-y-6 z-10">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#FACC15]/20 px-5 py-2 border border-[#FACC15]/40 text-[#FACC15] text-xs md:text-sm font-black tracking-widest uppercase shadow-lg">
          <Sparkles className="h-4 w-4 text-[#FACC15]" />
          TERMINAL MANDIRI KASSEN WK-215
        </div>

        <h2 className="text-6xl md:text-7xl lg:text-8xl font-black leading-tight tracking-tight text-white drop-shadow-2xl">
          SELAMAT DATANG
        </h2>

        <p className="text-2xl md:text-3xl font-semibold text-slate-200 leading-relaxed max-w-3xl drop-shadow-md">
          Gudang Aris Munandar &bull; PT PLN (Persero) UP3 Malang
        </p>

        {/* Quick hint for scanner */}
        <div className="mt-6 flex items-center justify-center gap-3 text-amber-300 bg-black/50 px-8 py-3.5 rounded-2xl border border-amber-500/30 backdrop-blur-md shadow-xl">
          <Scan className="h-6 w-6 animate-pulse text-[#FACC15]" />
          <span className="text-base md:text-lg font-semibold text-amber-200">
            Dekatkan Barcode / QR Material langsung ke scanner kapan saja
          </span>
        </div>
      </div>

      {/* Bottom Ticker & Tap Prompt */}
      <div className="space-y-6 z-10 w-full">
        {/* Animated Tap to Start Button */}
        <div className="flex items-center justify-center">
          <div className="flex h-20 items-center gap-4 rounded-full bg-[#FACC15] px-10 text-xl font-extrabold text-[#0F172A] shadow-2xl transition hover:scale-105 active:scale-95 animate-bounce">
            <span>Sentuh Layar di Mana Saja untuk Memulai</span>
            <ArrowRight className="h-7 w-7" />
          </div>
        </div>

        {/* Running Text Ticker */}
        <div className="overflow-hidden rounded-xl bg-black/50 py-3 backdrop-blur-sm border border-white/10">
          <div className="animate-marquee text-sm font-semibold text-slate-300 flex items-center">
            <span className="inline-flex items-center gap-1.5 font-bold text-[#FACC15] mr-2">
              <Zap className="h-4 w-4 fill-current text-[#FACC15]" />
              INFORMASI GUDANG PLN:
            </span>
            <span>Database Terakhir Diperbarui {new Date(pkg.sourceAt).toLocaleDateString('id-ID', { dateStyle: 'full' })} &bull; Kode Gudang: {config.warehouseCode} &bull; Total Material Aktif: {pkg.materials.length} Jenis &bull; Utamakan Keselamatan & Kesehatan Kerja (Zero Accident).</span>
          </div>
        </div>
      </div>
    </div>
  );
};

