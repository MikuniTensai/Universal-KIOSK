import React, { useState, useEffect } from 'react';
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
  const slides = [
    {
      title: 'SELAMAT DATANG DI GUDANG LOGISTIK PLN',
      subtitle: 'Terminal Mandiri Pengecekan Material, Spesifikasi SPLN & Tata Letak Rak',
      theme: 'bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-amber-950/90',
      tag: 'TERMINAL MANDIRI KASSEN WK-215',
    },
    {
      title: 'BUDAYA K3 ADALAH PRIORITAS UTAMA',
      subtitle: 'Gunakan APD Lengkap: Helm Safety, Sepatu Safety, dan Rompi Reflektif di Area Gudang',
      theme: 'bg-gradient-to-br from-slate-950/90 via-slate-900/80 to-emerald-950/90',
      tag: 'KESELAMATAN & KESEHATAN KERJA',
    },
    {
      title: 'PENERAPAN STANDAR 5S PERGUDANGAN',
      subtitle: 'Ringkas, Rapi, Resik, Rawat, Rajin untuk Efisiensi & Kecepatan Suplai Material',
      theme: 'bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-blue-950/90',
      tag: 'TATA KELOLA LOGISTIK CERDAS',
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const slide = slides[currentSlide];

  const wallpaperUrl =
    config.customWallpaperUrl ||
    (config.wallpaperPreset && (WALLPAPER_PRESETS as any)[config.wallpaperPreset]?.url) ||
    WALLPAPER_PRESETS.warehouse.url;

  return (
    <div
      onClick={onStart}
      className={`fixed inset-0 h-full w-full z-30 flex flex-col justify-between p-12 text-white transition-all duration-1000 ${slide.theme} cursor-pointer select-none relative overflow-hidden`}
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
      <div className="flex items-center justify-between z-10">
        <DanantaraLogo variant="dark" />

        <div className="hidden md:flex items-center gap-2 rounded-full bg-white/10 px-5 py-2 backdrop-blur-md border border-white/20">
          <ShieldCheck className="h-4 w-4 text-[#FACC15]" />
          <span className="text-xs font-bold tracking-wider text-slate-200 uppercase">
            Holding BUMN Ketenagalistrikan &bull; {config.warehouseCode}
          </span>
        </div>

        <PlnLogo variant="dark" />
      </div>

      {/* Main Center Message */}
      <div className="my-auto max-w-4xl space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#FACC15]/20 px-4 py-1.5 border border-[#FACC15]/40 text-[#FACC15] text-sm font-bold tracking-widest uppercase">
          <Sparkles className="h-4 w-4" />
          {slide.tag}
        </div>

        <h2 className="text-5xl font-black leading-tight tracking-tight text-white drop-shadow-md md:text-6xl">
          {slide.title}
        </h2>

        <p className="text-2xl font-normal text-slate-300 leading-relaxed max-w-3xl">
          {slide.subtitle}
        </p>

        {/* Quick hint for scanner */}
        <div className="mt-8 flex items-center gap-3 text-amber-300 bg-black/40 w-fit px-6 py-3 rounded-2xl border border-amber-500/30">
          <Scan className="h-6 w-6 animate-pulse" />
          <span className="text-base font-semibold">
            Dekatkan Barcode / QR Material langsung ke scanner kapan saja
          </span>
        </div>
      </div>

      {/* Bottom Ticker & Tap Prompt */}
      <div className="space-y-6">
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
