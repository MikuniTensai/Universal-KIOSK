import React, { useState, useEffect, useCallback } from 'react';
import {
  ClipboardList,
  Package,
  Scan,
  ArrowRight,
  Sparkles,
  Image as ImageIcon,
  LayoutGrid,
} from 'lucide-react';
import { kioskStorage } from '../adapters/storage/kioskStorage';
import { scannerAdapter } from '../features/scanner/scannerWedgeAdapter';
import { idleTimer } from '../features/idle/idleTimerService';
import { Header } from '../shared/ui/Header';
import { TimeoutWarningModal } from '../shared/ui/TimeoutWarningModal';
import { IdleScreensaver } from '../features/idle/IdleScreensaver';
import { WorkProgramsView } from '../features/programs/WorkProgramsView';
import { CatalogView } from '../features/catalog/CatalogView';
import { ScanStandbyView } from '../features/scanner/ScanStandbyView';
import { AdminDashboardModal } from '../features/admin/AdminDashboardModal';
import { ScanResolveResult, ImportPackage, KioskConfig } from '../domain/types';
import { WALLPAPER_PRESETS, DEFAULT_CARD_PHOTOS } from '../data/mockPlnPackage';

export const App: React.FC = () => {
  const [activePackage, setActivePackage] = useState<ImportPackage | null>(kioskStorage.getActivePackage());
  const [config, setConfig] = useState<KioskConfig>(kioskStorage.getConfig());
  const [currentRoute, setCurrentRoute] = useState<'idle' | 'home' | 'programs' | 'catalog' | 'scan'>('idle');

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
                  className="absolute inset-0 -z-10 bg-cover bg-center opacity-10 pointer-events-none rounded-3xl"
                  style={{ backgroundImage: `url(${wallpaperUrl})` }}
                />
              )}

              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="text-left">
                  <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-900 mb-2 shadow-sm">
                    <Sparkles className="h-4 w-4 text-amber-600" />
                    Terminal Mandiri Kassen WK-215 (Full HD 1080p)
                  </div>
                  <h2 className="text-3xl lg:text-4xl 2xl:text-5xl font-black tracking-tight text-[#0F172A]">
                    Selamat Datang di Gudang Logistik PLN
                  </h2>
                  <p className="mt-1.5 text-base lg:text-lg text-slate-600">
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
                  className="flex items-center gap-2.5 rounded-full bg-white px-5 py-3 text-xs lg:text-sm font-bold text-slate-700 shadow-md border border-slate-300 hover:border-[#FACC15] active:scale-95 transition"
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

              {/* 3 Main Thumbnails - Vertical Stack Layout (Tiga Kebawah Vertikal) */}
              <div className="flex flex-col gap-4 lg:gap-5 flex-1 justify-between my-2">
                {/* Thumbnail A: Program Kerja Gudang PLN */}
                <button
                  onClick={() => {
                    idleTimer.recordActivity();
                    setCurrentRoute('programs');
                  }}
                  className="group relative flex flex-1 items-center justify-between gap-5 lg:gap-8 overflow-hidden rounded-card border-2 border-slate-200 bg-white p-4 lg:p-6 text-left shadow-md transition-all hover:border-[#FACC15] hover:shadow-xl active:scale-[0.99]"
                >
                  <div className="flex items-center gap-5 lg:gap-7 flex-1 min-w-0">
                    {isPhotoMode && (
                      <div className="relative h-24 w-36 sm:h-28 sm:w-44 lg:h-32 lg:w-56 shrink-0 overflow-hidden rounded-xl bg-slate-900 shadow">
                        <img
                          src={photoA}
                          alt="Program Kerja"
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                        <span className="absolute bottom-2 left-2 rounded bg-[#FACC15] px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#0F172A] shadow">
                          PROGRAM & K3
                        </span>
                      </div>
                    )}
                    {!isPhotoMode && (
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 group-hover:bg-[#FACC15] group-hover:text-[#0F172A] transition-colors shadow-sm">
                        <ClipboardList className="h-10 w-10" />
                      </div>
                    )}
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-amber-800">
                          Thumbnail A
                        </span>
                        <span className="hidden sm:inline-block rounded bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-900">
                          SOP & Edukasi
                        </span>
                      </div>
                      <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#0F172A] mt-0.5 mb-1 truncate">
                        Program Kerja Gudang PLN
                      </h3>
                      <p className="text-xs sm:text-sm lg:text-base text-slate-500 line-clamp-2 leading-relaxed">
                        Roadmap target, capaian logistik, jadwal audit, dan standar operasional 5S.
                      </p>
                    </div>
                  </div>
                  <div className="flex h-14 flex-shrink-0 items-center gap-3 rounded-xl bg-slate-100 px-5 lg:px-7 font-bold text-[#0F172A] group-hover:bg-[#FACC15] transition-all shadow-sm">
                    <span className="text-sm lg:text-base font-extrabold whitespace-nowrap">Buka Program Kerja</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                {/* Thumbnail B: Daftar Item & Material Gudang PLN */}
                <button
                  onClick={() => {
                    idleTimer.recordActivity();
                    setCurrentRoute('catalog');
                  }}
                  className="group relative flex flex-1 items-center justify-between gap-5 lg:gap-8 overflow-hidden rounded-card border-2 border-slate-200 bg-white p-4 lg:p-6 text-left shadow-md transition-all hover:border-[#FACC15] hover:shadow-xl active:scale-[0.99]"
                >
                  <div className="flex items-center gap-5 lg:gap-7 flex-1 min-w-0">
                    {isPhotoMode && (
                      <div className="relative h-24 w-36 sm:h-28 sm:w-44 lg:h-32 lg:w-56 shrink-0 overflow-hidden rounded-xl bg-slate-900 shadow">
                        <img
                          src={photoB}
                          alt="Daftar Item"
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                        <span className="absolute bottom-2 left-2 rounded bg-[#FACC15] px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#0F172A] shadow">
                          E-KATALOG MATERIAL
                        </span>
                      </div>
                    )}
                    {!isPhotoMode && (
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 group-hover:bg-[#FACC15] group-hover:text-[#0F172A] transition-colors shadow-sm">
                        <Package className="h-10 w-10" />
                      </div>
                    )}
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-blue-800">
                          Thumbnail B
                        </span>
                        <span className="hidden sm:inline-block rounded bg-blue-100 px-2 py-0.5 text-[11px] font-bold text-blue-900">
                          Direktori Inventaris
                        </span>
                      </div>
                      <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#0F172A] mt-0.5 mb-1 truncate">
                        Daftar Item & Material Gudang
                      </h3>
                      <p className="text-xs sm:text-sm lg:text-base text-slate-500 line-clamp-2 leading-relaxed">
                        E-Katalog material distribusi, alat kerja, APD, dan pencarian stok gudang.
                      </p>
                    </div>
                  </div>
                  <div className="flex h-14 flex-shrink-0 items-center gap-3 rounded-xl bg-slate-100 px-5 lg:px-7 font-bold text-[#0F172A] group-hover:bg-[#FACC15] transition-all shadow-sm">
                    <span className="text-sm lg:text-base font-extrabold whitespace-nowrap">Lihat Daftar Item</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                {/* Thumbnail C: Scan Item (Cek Spesifikasi Mandiri) */}
                <button
                  onClick={() => {
                    idleTimer.recordActivity();
                    setCurrentRoute('scan');
                  }}
                  className="group relative flex flex-1 items-center justify-between gap-5 lg:gap-8 overflow-hidden rounded-card border-2 border-[#FACC15] bg-gradient-to-r from-amber-50/80 via-white to-white p-4 lg:p-6 text-left shadow-lg transition-all hover:shadow-2xl active:scale-[0.99]"
                >
                  <div className="absolute top-0 right-0 bg-[#FACC15] px-4 py-1 rounded-bl-xl text-xs font-black text-[#0F172A] z-10 shadow">
                    CEK MANDIRI
                  </div>
                  <div className="flex items-center gap-5 lg:gap-7 flex-1 min-w-0">
                    {isPhotoMode && (
                      <div className="relative h-24 w-36 sm:h-28 sm:w-44 lg:h-32 lg:w-56 shrink-0 overflow-hidden rounded-xl bg-slate-900 shadow">
                        <img
                          src={photoC}
                          alt="Scan Barcode"
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                        <span className="absolute bottom-2 left-2 rounded bg-[#FACC15] px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#0F172A] shadow">
                          SCANNER 2D SIAGA
                        </span>
                      </div>
                    )}
                    {!isPhotoMode && (
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#FACC15] text-[#0F172A] shadow-md">
                        <Scan className="h-10 w-10" />
                      </div>
                    )}
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-amber-900">
                          Thumbnail C
                        </span>
                        <span className="hidden sm:inline-block rounded bg-amber-200 px-2 py-0.5 text-[11px] font-black text-amber-950">
                          Barcode & QR Reader
                        </span>
                      </div>
                      <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#0F172A] mt-0.5 mb-1 truncate">
                        Scan Item (Cek Spesifikasi)
                      </h3>
                      <p className="text-xs sm:text-sm lg:text-base text-slate-600 line-clamp-2 leading-relaxed">
                        Dekatkan barcode/QR material ke scanner untuk melihat spesifikasi SPLN dan posisi rak gudang.
                      </p>
                    </div>
                  </div>
                  <div className="flex h-14 flex-shrink-0 items-center gap-3 rounded-xl bg-[#FACC15] px-5 lg:px-7 font-bold text-[#0F172A] group-hover:bg-amber-400 transition-all shadow">
                    <span className="text-sm lg:text-base font-extrabold whitespace-nowrap">Mulai Scan Material</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              </div>

              {/* Bottom Kiosk Status Confirmation Bar */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200 px-6 py-2.5 text-xs text-slate-500">
                <div className="flex items-center gap-2 font-medium">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Kassen WK-215 Siaga &bull; Resolusi Layar Penuh 1920×1080 Full HD &bull; Multi-Touch PCAP Aktif</span>
                </div>
                <div className="font-semibold text-slate-600">
                  Gudang Logistik PLN Aris Munandar Malang
                </div>
              </div>
            </div>
          );
        })()}

        {/* VIEW: WORK PROGRAMS */}
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
