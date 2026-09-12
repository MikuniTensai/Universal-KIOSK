import React from 'react';
import { Zap, ArrowRight, Power } from 'lucide-react';
import { ImportPackage, KioskConfig } from '../../domain/types';
import { WALLPAPER_PRESETS } from '../../data/mockPlnPackage';
import { DanantaraLogo } from '../../shared/ui/DanantaraLogo';
import { PlnLogo } from '../../shared/ui/PlnLogo';

interface IdleScreensaverProps {
  pkg: ImportPackage;
  config: KioskConfig;
  onStart: () => void;
  onOpenShutdown?: () => void;
}

export const IdleScreensaver: React.FC<IdleScreensaverProps> = ({
  pkg,
  config,
  onStart,
  onOpenShutdown,
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
          {/* High contrast balanced dark overlay for clear visual of Gudang Aris Munandar illustration & text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/65 to-slate-950/55 backdrop-blur-[0.5px]" />
        </div>
      )}

      {/* Top Banner: Danantara Kiri & PLN Kanan */}
      <div className="flex items-center justify-between z-10 w-full">
        <DanantaraLogo variant="dark" />
        <PlnLogo variant="dark" showSubtitle={false} />
      </div>

      {/* Main Center Message (Centered) */}
      <div className="my-auto flex flex-col items-center justify-center text-center max-w-4xl mx-auto space-y-4 z-10">
        <h2 className="text-6xl md:text-7xl lg:text-8xl font-black leading-tight tracking-tight text-white drop-shadow-2xl">
          SELAMAT DATANG
        </h2>

        <p className="text-2xl md:text-3xl lg:text-4xl font-black text-[#FACC15] leading-relaxed max-w-3xl drop-shadow-md tracking-wide">
          di Gudang Aris Munandar PLN UP3 Malang
        </p>
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

      {/* Tombol Shutdown / Keluar Samar di Pojok Kanan Bawah */}
      {onOpenShutdown && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenShutdown();
          }}
          title="Menu Daya & Matikan Komputer"
          aria-label="Menu Daya & Matikan Komputer"
          className="absolute bottom-3 right-3 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-slate-900/30 text-white/30 border border-white/10 backdrop-blur-xs opacity-25 hover:opacity-100 hover:bg-slate-900/80 hover:text-red-400 hover:border-red-400/40 transition-all duration-300 active:scale-95 shadow-sm"
        >
          <Power className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

