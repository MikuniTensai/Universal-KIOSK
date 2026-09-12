import React, { useState, useEffect, useCallback } from 'react';
import {
  Package,
  Scan,
  ArrowRight,
  Sparkles,
  Image as ImageIcon,
  LayoutGrid,
  Compass,
  FileText,
} from 'lucide-react';
import { kioskStorage } from '../adapters/storage/kioskStorage';
import { scannerAdapter } from '../features/scanner/scannerWedgeAdapter';
import { idleTimer } from '../features/idle/idleTimerService';
import { Header } from '../shared/ui/Header';
import { TimeoutWarningModal } from '../shared/ui/TimeoutWarningModal';
import { IdleScreensaver } from '../features/idle/IdleScreensaver';
import { WorkProgramsView } from '../features/programs/WorkProgramsView';
import { WarehouseLayoutView } from '../features/layout/WarehouseLayoutView';
import { CatalogView } from '../features/catalog/CatalogView';
import { ScanStandbyView } from '../features/scanner/ScanStandbyView';
import { AdminDashboardModal } from '../features/admin/AdminDashboardModal';
import { ScanResolveResult, ImportPackage, KioskConfig } from '../domain/types';
import { WALLPAPER_PRESETS, DEFAULT_CARD_PHOTOS } from '../data/mockPlnPackage';

export const App: React.FC = () => {
  const [activePackage, setActivePackage] = useState<ImportPackage | null>(kioskStorage.getActivePackage());
  const [config, setConfig] = useState<KioskConfig>(kioskStorage.getConfig());
  const [currentRoute, setCurrentRoute] = useState<'idle' | 'home' | 'layout' | 'programs' | 'catalog' | 'scan'>('idle');

  // Idle timer warning modal state
  const [timeoutWarningVisible, setTimeoutWarningVisible] = useState(false);
  const [warningSecondsLeft, setWarningSecondsLeft] = useState(10);

  // Admin dashboard modal state
  const [adminModalVisible, setAdminModalVisible] = useState(false);

  // Scan state
  const [lastScanResult, setLastScanResult] = useState<ScanResolveResult | null>(null);

  // Accessibility / Low-Reach Mode for 21.5" screen
  const [lowReachMode, setLowReachMode] = useState(false);

  const refreshData = useCallback(() => {
    setActivePackage(kioskStorage.getActivePackage());
    setConfig(kioskStorage.getConfig());
  }, []);

  // 1. Activity & Idle Timer setup
  useEffect(() => {
    idleTimer.updateTimeouts(config.idleSeconds, config.warningSeconds);
    idleTimer.start();

    const unsubscribe = idleTimer.subscribe((event, state) => {
      if (event === 'warning') {
        setTimeoutWarningVisible(true);
        setWarningSecondsLeft(state.secondsRemaining);
      } else if (event === 'timeout') {
        setTimeoutWarningVisible(false);
        setLastScanResult(null);
        setCurrentRoute('idle');
      } else if (event === 'reset') {
        setTimeoutWarningVisible(false);
      }
    });

    const handleUserActivity = () => {
      idleTimer.recordActivity();
    };

    window.addEventListener('pointerdown', handleUserActivity);
    window.addEventListener('touchstart', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);

    return () => {
      unsubscribe();
      idleTimer.stop();
      window.removeEventListener('pointerdown', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
    };
  }, [config.idleSeconds, config.warningSeconds]);

  // 2. Global Scanner listener setup
  useEffect(() => {
    const unsubscribeScanner = scannerAdapter.subscribe((result) => {
      idleTimer.recordActivity();
      setTimeoutWarningVisible(false);
      setLastScanResult(result);
      setCurrentRoute('scan');
    });

    return () => {
      unsubscribeScanner();
    };
  }, []);

  // 3. Kiosk Lockdown (Prevent context menu & dangerous shortcuts)
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleKeydownLock = (e: KeyboardEvent) => {
      if (
        e.key === 'F11' ||
        e.key === 'F12' ||
        (e.ctrlKey && (e.key === 'r' || e.key === 'R' || e.key === 'n' || e.key === 'N' || e.key === 'w' || e.key === 'W'))
      ) {
        e.preventDefault();
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeydownLock);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeydownLock);
    };
  }, []);

  if (!activePackage) {
    return (
      <div className="fixed inset-0 flex h-full w-full flex-col items-center justify-center bg-slate-900 text-white p-8 text-center">
        <h2 className="text-3xl font-bold text-[#FACC15] mb-2">Konfigurasi Awal Diperlukan</h2>
        <p className="text-slate-400 max-w-md mb-6">
          Database lokal belum terpasang. Petugas logistik silakan buka panel admin untuk memuat paket data material perdana.
        </p>
        <button
          onClick={() => setAdminModalVisible(true)}
          className="flex h-14 items-center rounded-control bg-[#FACC15] px-8 text-base font-bold text-[#0F172A] shadow-lg"
        >
          Buka Panel Petugas
        </button>
      </div>
    );
  }

  // Route 1: Idle Screensaver
  if (currentRoute === 'idle') {
    return (
      <>
        <IdleScreensaver
          pkg={activePackage}
          config={config}
          onStart={() => {
            idleTimer.recordActivity();
            setCurrentRoute('home');
          }}
        />
        <AdminDashboardModal
          visible={adminModalVisible}
          onClose={() => setAdminModalVisible(false)}
          onPackageUpdated={refreshData}
        />
      </>
    );
  }

  return (
    <div className="fixed inset-0 flex h-full w-full flex-col overflow-hidden bg-[#F8FAFC]">
      {/* Top Universal-POS Style Header */}
      <Header
        config={config}
        currentRoute={currentRoute}
        lowReachMode={lowReachMode}
        onToggleLowReach={() => {
          idleTimer.recordActivity();
          setLowReachMode(prev => !prev);
        }}
        onNavigate={(route) => {
          idleTimer.recordActivity();
          setCurrentRoute(route as any);
        }}
        onOpenAdmin={() => {
          idleTimer.recordActivity();
          setAdminModalVisible(true);
        }}
      />

      {/* Main Screen Content - Edge-to-edge full width with smooth touch scrolling */}
      <main className={`flex-1 w-full overflow-y-auto no-scrollbar flex flex-col transition-all duration-500 ${lowReachMode ? 'pt-[8vh]' : ''}`}>
        {/* VIEW: HOME (3 BIG INTERACTIVE THUMBNAILS - PERSIS KEBUTUHAN KLIEN FULL SCREEN 1920x1080) */}
        {currentRoute === 'home' && (() => {
          const isPhotoMode = config.cardStyle !== 'minimal';
          const photoA = config.thumbnailAPhoto || DEFAULT_CARD_PHOTOS.thumbnailA;
          const photoB = config.thumbnailBPhoto || DEFAULT_CARD_PHOTOS.thumbnailB;
          const photoC = config.thumbnailCPhoto || DEFAULT_CARD_PHOTOS.thumbnailC;
          const wallpaperUrl =
            config.customWallpaperUrl ||
            (config.wallpaperPreset && (WALLPAPER_PRESETS as any)[config.wallpaperPreset]?.url) ||
            WALLPAPER_PRESETS.warehouse.url;

          return (
            <div className="relative flex flex-col w-full h-full max-w-[1780px] mx-auto px-6 md:px-12 py-6 flex-1 justify-between">
              {/* Subtle Ambient Wallpaper */}
              {wallpaperUrl && (
                <div
                  className="absolute inset-0 -z-10 bg-cover bg-center opacity-15 pointer-events-none rounded-3xl"
                  style={{ backgroundImage: `url(${wallpaperUrl})` }}
                />
              )}

              {/* Welcome Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                <div className="text-left">
                  <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/25 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-amber-900 mb-2.5 shadow-sm">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                    <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                    <span>Terminal Mandiri Kassen WK-215 (Full HD 1080p)</span>
                  </div>
                  <h2 className="text-3xl lg:text-4xl 2xl:text-[42px] font-black tracking-tight text-[#0F172A] leading-tight">
                    Selamat Datang di Gudang Logistik PLN
                  </h2>
                  <p className="mt-1.5 text-base lg:text-lg text-slate-600 font-medium max-w-3xl">
                    Pilih layanan informasi di bawah atau dekatkan barcode material langsung ke scanner.
                  </p>
                </div>

                {/* Quick Toggle for Senior Staff */}
                <button
                  onClick={() => {
                    idleTimer.recordActivity();
                    const nextStyle = isPhotoMode ? 'minimal' : 'photo';
                    const updated: KioskConfig = { ...config, cardStyle: nextStyle };
                    kioskStorage.saveConfig(updated);
                    setConfig(updated);
                  }}
                  className="flex items-center gap-2.5 rounded-2xl bg-white/95 backdrop-blur-sm px-5 py-3 text-xs lg:text-sm font-bold text-slate-700 shadow-md border border-slate-200 hover:border-[#FACC15] active:scale-95 transition hover:shadow-lg"
                >
                  {isPhotoMode ? (
                    <ImageIcon className="h-4 w-4 text-amber-600" />
                  ) : (
                    <LayoutGrid className="h-4 w-4 text-slate-700" />
                  )}
                  <span>
                    Tampilan Kartu:{' '}
                    <strong className="text-amber-900 font-extrabold">
                      {isPhotoMode ? 'Bergambar Nyata' : 'Minimalis Ikon'}
                    </strong>
                  </span>
                </button>
              </div>

              {/* 3 Main Sections Layout - Persis Kebutuhan Klien:
                  1. Atas: Visualisasi Layout Denah Gudang (disiapkan untuk visualisasi nanti)
                  2. Tengah: SOP & Aturan-Aturan Pergudangan PLN
                  3. Bawah: Katalog Material & Lokasi Rak/Blok (contoh: kWh di Rak A-001) */}
              <div className="flex flex-col gap-4 lg:gap-5 flex-1 justify-between my-2">
                {/* 1. BAGIAN ATAS: Visualisasi Denah & Tata Letak Gudang ("Nanti ada layout yang minta divisualisasikan tapi ini nanti saja yang atas sendiri") */}
                <button
                  onClick={() => {
                    idleTimer.recordActivity();
                    setCurrentRoute('layout');
                  }}
                  className="group relative flex flex-1 items-center justify-between gap-5 lg:gap-8 overflow-hidden rounded-card border-2 border-slate-700/60 bg-slate-950 p-6 lg:p-8 text-left shadow-xl transition-all duration-300 hover:border-sky-400 hover:shadow-2xl active:scale-[0.99]"
                >
                  {/* Full Bleed Background Image with Dark Cinematic Gradient */}
                  {isPhotoMode ? (
                    <div className="absolute inset-0 -z-10 overflow-hidden">
                      <img
                        src={photoC}
                        alt="Visualisasi Denah Gudang"
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/85 to-slate-950/35" />
                      <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[0.5px]" />
                    </div>
                  ) : (
                    <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950" />
                  )}

                  <div className="flex flex-col min-w-0 flex-1 justify-center py-1 z-10">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-sky-500/20 border border-sky-400/30 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider text-sky-300 backdrop-blur-md shadow-xs">
                        <Compass className="h-3.5 w-3.5 text-sky-400" />
                        LAYOUT GUDANG &bull; MODUL VISUALISASI SIAP INTEGRASI
                      </span>
                      <span className="hidden sm:inline-flex items-center rounded-md bg-white/10 border border-white/15 px-2.5 py-0.5 text-[11px] font-bold text-slate-200 backdrop-blur-md">
                        Peta Denah Blok &amp; Rak
                      </span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl lg:text-[32px] font-black text-white tracking-tight leading-tight mb-1.5 drop-shadow-sm">
                      Visualisasi Denah &amp; Tata Letak Gudang
                    </h3>
                    <p className="text-xs sm:text-sm lg:text-base text-slate-300 line-clamp-2 leading-relaxed mb-3 max-w-3xl">
                      Peta tata letak visual denah gudang, lorong rak penyimpanan material PLN, jalur forklift, dan posisi pos Kiosk Kassen.
                    </p>

                    {/* Interactive Feature Chips */}
                    <div className="hidden sm:flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-white/10 hover:bg-white/15 border border-white/15 px-3 py-1 text-xs font-semibold text-slate-200 backdrop-blur-md shadow-sm">
                        🔌 Blok A: Gardu &amp; Jaringan
                      </span>
                      <span className="rounded-full bg-white/10 hover:bg-white/15 border border-white/15 px-3 py-1 text-xs font-semibold text-slate-200 backdrop-blur-md shadow-sm">
                        🏗️ Blok B: Heavy &amp; Trafo
                      </span>
                      <span className="rounded-full bg-white/10 hover:bg-white/15 border border-white/15 px-3 py-1 text-xs font-semibold text-slate-200 backdrop-blur-md shadow-sm">
                        ⚡ Blok C: APP &amp; kWh (Rak A-001)
                      </span>
                      <span className="rounded-full bg-white/10 hover:bg-white/15 border border-white/15 px-3 py-1 text-xs font-semibold text-slate-200 backdrop-blur-md shadow-sm">
                        🦺 Blok D: APD &amp; K3
                      </span>
                    </div>
                  </div>

                  <div className="flex h-14 flex-shrink-0 items-center gap-3 rounded-xl bg-white/15 hover:bg-[#FACC15] text-white hover:text-[#0F172A] border border-white/25 hover:border-[#FACC15] px-5 lg:px-7 font-bold transition-all shadow-lg active:scale-95 backdrop-blur-md group-hover:bg-[#FACC15] group-hover:text-[#0F172A] z-10">
                    <span className="text-sm lg:text-base font-extrabold whitespace-nowrap">Lihat Denah Tata Letak</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1.5 transition-transform duration-300" />
                  </div>
                </button>

                {/* 2. BAGIAN TENGAH: SOP & Aturan-Aturan Gudang PLN ("lalu yang tengah berubah menjadi SOP aturan-aturan") */}
                <button
                  onClick={() => {
                    idleTimer.recordActivity();
                    setCurrentRoute('programs');
                  }}
                  className="group relative flex flex-1 items-center justify-between gap-5 lg:gap-8 overflow-hidden rounded-card border-2 border-slate-700/60 bg-slate-950 p-6 lg:p-8 text-left shadow-xl transition-all duration-300 hover:border-amber-400 hover:shadow-2xl active:scale-[0.99]"
                >
                  {/* Full Bleed Background Image with Dark Cinematic Gradient */}
                  {isPhotoMode ? (
                    <div className="absolute inset-0 -z-10 overflow-hidden">
                      <img
                        src={photoA}
                        alt="SOP Aturan Gudang"
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/85 to-slate-950/35" />
                      <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[0.5px]" />
                    </div>
                  ) : (
                    <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950" />
                  )}

                  <div className="flex flex-col min-w-0 flex-1 justify-center py-1 z-10">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-500/20 border border-amber-400/30 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider text-amber-300 backdrop-blur-md shadow-xs">
                        <FileText className="h-3.5 w-3.5 text-amber-400" />
                        SOP &amp; ATURAN PERGUDANGAN
                      </span>
                      <span className="hidden sm:inline-flex items-center rounded-md bg-white/10 border border-white/15 px-2.5 py-0.5 text-[11px] font-bold text-slate-200 backdrop-blur-md">
                        Pedoman 5S &amp; K3
                      </span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl lg:text-[32px] font-black text-white tracking-tight leading-tight mb-1.5 drop-shadow-sm">
                      Program Kerja Gudang PLN &amp; SOP Aturan
                    </h3>
                    <p className="text-xs sm:text-sm lg:text-base text-slate-300 line-clamp-2 leading-relaxed mb-3 max-w-3xl">
                      SOP masuk/keluar barang, aturan mutlak keselamatan kerja K3 (Zero Accident), dan kepatuhan standar 5S.
                    </p>

                    {/* Interactive Feature Chips */}
                    <div className="hidden sm:flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-white/10 hover:bg-white/15 border border-white/15 px-3 py-1 text-xs font-semibold text-slate-200 backdrop-blur-md shadow-sm">
                        📋 SOP Inbound &amp; Outbound
                      </span>
                      <span className="rounded-full bg-white/10 hover:bg-white/15 border border-white/15 px-3 py-1 text-xs font-semibold text-slate-200 backdrop-blur-md shadow-sm">
                        🛡️ Aturan Wajib APD K3
                      </span>
                      <span className="rounded-full bg-white/10 hover:bg-white/15 border border-white/15 px-3 py-1 text-xs font-semibold text-slate-200 backdrop-blur-md shadow-sm">
                        ✨ Standar 5S Pergudangan
                      </span>
                      <span className="rounded-full bg-white/10 hover:bg-white/15 border border-white/15 px-3 py-1 text-xs font-semibold text-slate-200 backdrop-blur-md shadow-sm">
                        🎯 Visi &amp; Roadmap 2026
                      </span>
                    </div>
                  </div>

                  <div className="flex h-14 flex-shrink-0 items-center gap-3 rounded-xl bg-white/15 hover:bg-[#FACC15] text-white hover:text-[#0F172A] border border-white/25 hover:border-[#FACC15] px-5 lg:px-7 font-bold transition-all shadow-lg active:scale-95 backdrop-blur-md group-hover:bg-[#FACC15] group-hover:text-[#0F172A] z-10">
                    <span className="text-sm lg:text-base font-extrabold whitespace-nowrap">Buka Program Kerja</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1.5 transition-transform duration-300" />
                  </div>
                </button>

                {/* 3. BAGIAN BAWAH: Katalog Material & Lokasi Rak/Blok ("dan yang terakhir ketiga Katalog isi ada di blok apa atau di rak material apa kwh rak A-001 semisal") */}
                <div
                  className="group relative flex flex-1 flex-col lg:flex-row items-stretch lg:items-center justify-between gap-5 lg:gap-8 overflow-hidden rounded-card border-2 border-[#FACC15] bg-slate-950 p-6 lg:p-8 text-left shadow-2xl transition-all duration-300 hover:border-amber-400 ring-2 ring-[#FACC15]/30"
                >
                  {/* Full Bleed Background Image with Dark Cinematic Gradient */}
                  {isPhotoMode ? (
                    <div className="absolute inset-0 -z-10 overflow-hidden">
                      <img
                        src={photoB}
                        alt="Katalog Material"
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/85 to-amber-950/30" />
                      <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[0.5px]" />
                    </div>
                  ) : (
                    <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950" />
                  )}

                  <div className="absolute top-0 right-0 bg-[#FACC15] px-4 py-1.5 rounded-bl-2xl text-[11px] font-black uppercase tracking-wider text-[#0F172A] z-10 shadow-md flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-600 animate-ping" />
                    <span>CEK MANDIRI &bull; SCANNER 2D SIAGA</span>
                  </div>

                  <div
                    onClick={() => {
                      idleTimer.recordActivity();
                      setCurrentRoute('catalog');
                    }}
                    className="flex flex-col min-w-0 flex-1 justify-center py-1 cursor-pointer z-10"
                  >
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-500/20 border border-blue-400/30 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider text-blue-300 backdrop-blur-md shadow-xs">
                        <Package className="h-3.5 w-3.5 text-blue-400" />
                        KATALOG MATERIAL &amp; LOKASI RAK
                      </span>
                      <span className="inline-flex items-center rounded-md bg-amber-400/25 border border-amber-400/40 px-2.5 py-0.5 text-[11px] font-black text-amber-300 backdrop-blur-md">
                        Contoh: kWh di Rak A-001
                      </span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl lg:text-[32px] font-black text-white tracking-tight leading-tight mb-1.5 drop-shadow-sm">
                      Daftar Item &amp; Material Gudang (Katalog Blok &amp; Rak)
                    </h3>
                    <p className="text-xs sm:text-sm lg:text-base text-slate-300 line-clamp-2 leading-relaxed mb-3 max-w-3xl">
                      Cek material berada di blok apa dan di rak material mana (contoh: Smart Meter kWh di Rak A-001), cek saldo stok, atau scan barcode langsung.
                    </p>

                    {/* Featured Client Example Chips */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-amber-400/20 border border-amber-400/40 px-3 py-1 text-xs font-black text-amber-300 backdrop-blur-md shadow-xs flex items-center gap-1">
                        <span>⚡</span> Smart Meter (kWh) &rarr; <strong className="text-amber-200">Rak A-001 (Blok C)</strong>
                      </span>
                      <span className="hidden sm:inline-flex rounded-full bg-white/10 border border-white/15 px-3 py-1 text-xs font-semibold text-slate-200 backdrop-blur-md shadow-xs">
                        🔌 Isolator &rarr; Rak A3 (Blok A)
                      </span>
                      <span className="hidden md:inline-flex rounded-full bg-white/10 border border-white/15 px-3 py-1 text-xs font-semibold text-slate-200 backdrop-blur-md shadow-xs">
                        🏗️ Trafo 100kVA &rarr; Blok B (Jalur 2)
                      </span>
                      <span className="hidden lg:inline-flex rounded-full bg-white/10 border border-white/15 px-3 py-1 text-xs font-semibold text-slate-200 backdrop-blur-md shadow-xs">
                        🦺 APD Helm &rarr; Rak K3-01 (Blok D)
                      </span>
                    </div>
                  </div>

                  {/* Dual Action Buttons: Lihat Daftar Item & Scan Item */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0 self-end lg:self-center z-10">
                    <button
                      onClick={() => {
                        idleTimer.recordActivity();
                        setCurrentRoute('catalog');
                      }}
                      className="active:scale-95 transition"
                    >
                      <div className="flex h-14 flex-shrink-0 items-center gap-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white px-5 lg:px-6 font-extrabold border border-slate-700/80 shadow-md backdrop-blur-md whitespace-nowrap">
                        <span className="text-sm lg:text-base font-extrabold">Lihat Daftar Item</span>
                        <ArrowRight className="h-5 w-5" />
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        idleTimer.recordActivity();
                        setCurrentRoute('scan');
                      }}
                      className="active:scale-95 transition"
                    >
                      <div className="flex h-14 flex-shrink-0 items-center gap-2 rounded-xl bg-[#FACC15] text-[#0F172A] px-5 lg:px-6 font-black hover:bg-amber-400 shadow-xl whitespace-nowrap border-2 border-amber-400 ring-2 ring-[#FACC15]/50">
                        <Scan className="h-5 w-5" />
                        <span className="text-sm lg:text-base font-black">Scan Item (Cek Spesifikasi)</span>
                        <span className="sr-only">Mulai Scan Material</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Kiosk Status Confirmation Bar */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200 px-6 py-3 text-xs text-slate-600 shadow-sm">
                <div className="flex items-center gap-2.5 font-semibold">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span>Kassen WK-215 Siaga &bull; Resolusi Layar Penuh 1920×1080 Full HD &bull; Multi-Touch PCAP Aktif</span>
                </div>
                <div className="flex items-center gap-2 font-bold text-slate-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  <span>Gudang Logistik PLN Aris Munandar Malang</span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* VIEW: WAREHOUSE LAYOUT & DENAH BLOK / RAK */}
        {currentRoute === 'layout' && (
          <WarehouseLayoutView
            pkg={activePackage}
            config={config}
            onBack={() => {
              idleTimer.recordActivity();
              setCurrentRoute('home');
            }}
            onSelectRack={() => {
              idleTimer.recordActivity();
              setCurrentRoute('catalog');
            }}
          />
        )}

        {/* VIEW: WORK PROGRAMS & SOP */}
        {currentRoute === 'programs' && (
          <WorkProgramsView
            onBack={() => {
              idleTimer.recordActivity();
              setCurrentRoute('home');
            }}
          />
        )}

        {/* VIEW: CATALOG */}
        {currentRoute === 'catalog' && (
          <CatalogView
            pkg={activePackage}
            config={config}
            onNavigateToScan={() => {
              idleTimer.recordActivity();
              setCurrentRoute('scan');
            }}
          />
        )}

        {/* VIEW: SCANNER STANDBY & RESULT */}
        {currentRoute === 'scan' && (
          <ScanStandbyView
            pkg={activePackage}
            lastScanResult={lastScanResult}
            onClearScanResult={() => {
              idleTimer.recordActivity();
              setLastScanResult(null);
            }}
            onBack={() => {
              idleTimer.recordActivity();
              setLastScanResult(null);
              setCurrentRoute('home');
            }}
            onNavigateToCatalog={() => {
              idleTimer.recordActivity();
              setLastScanResult(null);
              setCurrentRoute('catalog');
            }}
            onSimulateScan={(rawCode) => {
              idleTimer.recordActivity();
              scannerAdapter.processScan(rawCode);
            }}
          />
        )}
      </main>

      {/* Timeout Warning Modal */}
      <TimeoutWarningModal
        visible={timeoutWarningVisible}
        secondsRemaining={warningSecondsLeft}
        onContinue={() => {
          idleTimer.recordActivity();
          setTimeoutWarningVisible(false);
        }}
      />

      {/* Admin Dashboard Modal */}
      <AdminDashboardModal
        visible={adminModalVisible}
        onClose={() => setAdminModalVisible(false)}
        onPackageUpdated={refreshData}
      />

      {/* Low Reach Accessibility Indicator */}
      {lowReachMode && (
        <div className="fixed bottom-4 left-6 z-30 flex items-center gap-2.5 rounded-full bg-slate-900/95 text-white px-4 py-2 text-xs font-semibold shadow-2xl border border-amber-400/50 backdrop-blur-md animate-in fade-in slide-in-from-bottom duration-300">
          <span className="h-2 w-2 rounded-full bg-[#FACC15] animate-ping" />
          <span>Mode Jangkauan Rendah Aktif (Ramah Kursi Roda)</span>
        </div>
      )}
    </div>
  );
};
