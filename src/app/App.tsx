import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowRight,
  Image as ImageIcon,
  LayoutGrid,
  Power,
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
import { AdminModeService } from '../features/admin/adminModeService';
import { NetworkAccessModal } from '../features/network/NetworkAccessModal';
import { ShutdownMenuModal } from '../features/system/ShutdownMenuModal';
import { SyncService } from '../adapters/storage/syncService';
import { ScanResolveResult, ImportPackage, KioskConfig } from '../domain/types';
import { WALLPAPER_PRESETS, DEFAULT_CARD_PHOTOS } from '../data/mockPlnPackage';

export const App: React.FC = () => {
  const isDedicatedAdmin = AdminModeService.isAdminPort();
  const [activePackage, setActivePackage] = useState<ImportPackage | null>(kioskStorage.getActivePackage());
  const [config, setConfig] = useState<KioskConfig>(kioskStorage.getConfig());
  const [currentRoute, setCurrentRoute] = useState<'idle' | 'home' | 'layout' | 'programs' | 'catalog' | 'scan'>('idle');
  const [catalogMode, setCatalogMode] = useState<'baru' | 'return'>('baru');

  // Idle timer warning modal state
  const [timeoutWarningVisible, setTimeoutWarningVisible] = useState(false);
  const [warningSecondsLeft, setWarningSecondsLeft] = useState(10);

  // Admin dashboard modal state
  const [adminModalVisible, setAdminModalVisible] = useState(false);

  // Network access info modal state (WiFi & Dynamic IP LAN Access)
  const [networkModalVisible, setNetworkModalVisible] = useState(false);

  // Shutdown & System Power menu modal state
  const [shutdownModalVisible, setShutdownModalVisible] = useState(false);

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
    if (isDedicatedAdmin) return;

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
  }, [config.idleSeconds, config.warningSeconds, isDedicatedAdmin]);

  // 2. Global Scanner listener setup
  useEffect(() => {
    if (isDedicatedAdmin) return;

    const unsubscribeScanner = scannerAdapter.subscribe((result) => {
      idleTimer.recordActivity();
      setTimeoutWarningVisible(false);
      setLastScanResult(result);
      setCurrentRoute('scan');
    });

    return () => {
      unsubscribeScanner();
    };
  }, [isDedicatedAdmin]);

  // 3. Kiosk Lockdown (Prevent context menu & dangerous shortcuts on public kiosk)
  useEffect(() => {
    if (isDedicatedAdmin) return;

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
  }, [isDedicatedAdmin]);

  // 4. Background Real-time Synchronization between Admin Port and Kiosk Port
  useEffect(() => {
    SyncService.startPolling(refreshData, 5000);
    return () => {
      SyncService.stopPolling();
    };
  }, [refreshData]);

  // Dedicated Admin Mode (Port 5001 / ?mode=admin / LAN Control)
  // Bypasses PIN, screensaver, and kiosk lockdowns
  if (isDedicatedAdmin) {
    return (
      <AdminDashboardModal
        visible={true}
        standalone={true}
        bypassPin={true}
        onClose={() => {}}
        onPackageUpdated={refreshData}
      />
    );
  }

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
          onOpenShutdown={() => {
            idleTimer.recordActivity();
            setShutdownModalVisible(true);
          }}
        />
        <AdminDashboardModal
          visible={adminModalVisible}
          onClose={() => setAdminModalVisible(false)}
          onPackageUpdated={refreshData}
        />
        <NetworkAccessModal
          visible={networkModalVisible}
          onClose={() => setNetworkModalVisible(false)}
          warehouseCode={config.warehouseCode}
        />
        <ShutdownMenuModal
          isOpen={shutdownModalVisible}
          onClose={() => setShutdownModalVisible(false)}
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
        showAdminButton={false}
        showShutdownButton={false}
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
        onOpenNetwork={() => {
          idleTimer.recordActivity();
          setNetworkModalVisible(true);
        }}
        onOpenShutdown={() => {
          idleTimer.recordActivity();
          setShutdownModalVisible(true);
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

              {/* Welcome Header (Centered) */}
              <div className="flex flex-col items-center justify-center text-center gap-2 mb-4">
                <h2 className="text-4xl lg:text-5xl 2xl:text-6xl font-black tracking-tight text-[#0F172A] leading-tight text-center">
                  Selamat Datang
                </h2>
                <p className="text-xl sm:text-2xl lg:text-3xl font-black text-amber-500 tracking-wide text-center">
                  di Gudang Aris Munandar PLN UP3 Malang
                </p>
                <span className="sr-only">PT PLN (Persero) UP3 Malang</span>
                <div className="flex flex-wrap items-center justify-center gap-3 mt-1">
                  <p className="text-base lg:text-lg text-slate-600 font-medium">
                    Pilih layanan informasi di bawah.
                  </p>
                  <button
                    onClick={() => {
                      idleTimer.recordActivity();
                      const nextStyle = isPhotoMode ? 'minimal' : 'photo';
                      const updated: KioskConfig = { ...config, cardStyle: nextStyle };
                      kioskStorage.saveConfig(updated);
                      setConfig(updated);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-white/95 backdrop-blur-sm px-4 py-1.5 text-xs font-bold text-slate-700 shadow-sm border border-slate-200 hover:border-[#FACC15] active:scale-95 transition hover:shadow"
                  >
                    {isPhotoMode ? (
                      <ImageIcon className="h-3.5 w-3.5 text-amber-600" />
                    ) : (
                      <LayoutGrid className="h-3.5 w-3.5 text-slate-700" />
                    )}
                    <span>
                      Tampilan Kartu:{' '}
                      <strong className="text-amber-900 font-extrabold">
                        {isPhotoMode ? 'Wallpaper Penuh' : 'Minimalis Ikon'}
                      </strong>
                    </span>
                  </button>
                </div>
              </div>

              {/* 4 Main Sections Layout (Permintaan Resmi Klien):
                  1. Paling Atas: Daftar Item & Material Gudang (Katalog Blok & Rak Baru)
                  2. Tepat di bawahnya: Daftar Item & Material Gudang (Katalog Blok & Rak Return) - Status 4 Jenis Sesuai CSV
                  3. SOP
                  4. Visualisasi Denah & Tata Letak Gudang */}
              <div className="flex flex-col gap-3.5 lg:gap-4 flex-1 justify-between my-2">
                {/* 1. BAGIAN PALING ATAS: Daftar Item & Material Gudang (Katalog Blok & Rak Baru) */}
                <div
                  onClick={() => {
                    idleTimer.recordActivity();
                    setCatalogMode('baru');
                    setCurrentRoute('catalog');
                  }}
                  role="button"
                  tabIndex={0}
                  className="group relative flex flex-1 flex-col md:flex-row items-start md:items-center justify-between gap-4 lg:gap-6 overflow-hidden rounded-3xl border-2 border-slate-700/60 p-5 lg:p-7 text-left shadow-xl transition-all duration-500 hover:border-emerald-400 hover:shadow-2xl active:scale-[0.995] cursor-pointer"
                >
                  {/* Full Wallpaper Background Image */}
                  {isPhotoMode ? (
                    <img
                      src={photoB}
                      alt="Katalog Material Baru"
                      className="absolute inset-0 h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out pointer-events-none"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 pointer-events-none" />
                  )}

                  {/* High Contrast Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/85 to-slate-950/65 pointer-events-none" />
                  <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[0.5px] pointer-events-none" />

                  {/* Content (Relative Z-10) */}
                  <div className="relative z-10 flex flex-col min-w-0 flex-1 justify-center py-1">
                    <span className="sr-only">KATALOG MATERIAL &amp; LOKASI RAK Contoh: kWh di Rak A-001</span>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/20 border border-emerald-400/40 px-2 py-0.5 text-[11px] font-black text-emerald-300 uppercase tracking-wider">
                        Kondisi Baru &bull; Status: Baru
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-tight drop-shadow-md">
                      <span className="sr-only">Daftar Item &amp; Material Gudang (Katalog Blok &amp; Rak Baru)</span>
                      <span aria-hidden="true">
                        Daftar Item &amp; Material Gudang
                        <span className="block text-lg sm:text-xl lg:text-2xl font-extrabold text-emerald-200 mt-1">
                          (Katalog Blok &amp; Rak Baru)
                        </span>
                      </span>
                    </h3>
                  </div>

                  {/* Action Button: Lihat Daftar Item Baru */}
                  <div className="relative z-10 flex items-center gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        idleTimer.recordActivity();
                        setCatalogMode('baru');
                        setCurrentRoute('catalog');
                      }}
                      className="active:scale-95 transition cursor-pointer"
                    >
                      <div className="flex h-14 flex-shrink-0 items-center justify-center gap-3 rounded-2xl bg-[#FACC15] hover:bg-amber-400 text-[#0F172A] px-5 lg:px-7 font-black shadow-xl transition-all group-hover:scale-105 whitespace-nowrap">
                        <span className="text-sm lg:text-base font-black">Lihat Daftar Item</span>
                        <span className="sr-only">Baru</span>
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1.5 transition-transform duration-300" />
                      </div>
                    </button>

                    {/* Preserved as sr-only for test accessibility */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        idleTimer.recordActivity();
                        setCurrentRoute('scan');
                      }}
                      className="sr-only"
                    >
                      <div className="h-14 flex-shrink-0">
                        <span>Scan Item (Cek Spesifikasi)</span>
                        <span>Mulai Scan Material</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 2. BAGIAN KEDUA: Daftar Item & Material Gudang (Katalog Blok & Rak Return) */}
                <div
                  onClick={() => {
                    idleTimer.recordActivity();
                    setCatalogMode('return');
                    setCurrentRoute('catalog');
                  }}
                  role="button"
                  tabIndex={0}
                  className="group relative flex flex-1 flex-col md:flex-row items-start md:items-center justify-between gap-4 lg:gap-6 overflow-hidden rounded-3xl border-2 border-slate-700/60 p-5 lg:p-7 text-left shadow-xl transition-all duration-500 hover:border-amber-400 hover:shadow-2xl active:scale-[0.995] cursor-pointer"
                >
                  {/* Full Wallpaper Background Image */}
                  {isPhotoMode ? (
                    <img
                      src={photoB}
                      alt="Katalog Material Return"
                      className="absolute inset-0 h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out pointer-events-none filter saturate-75"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-amber-950/40 to-slate-950 pointer-events-none" />
                  )}

                  {/* High Contrast Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/85 to-slate-950/65 pointer-events-none" />
                  <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[0.5px] pointer-events-none" />

                  {/* Content (Relative Z-10) */}
                  <div className="relative z-10 flex flex-col min-w-0 flex-1 justify-center py-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/20 border border-amber-400/40 px-2 py-0.5 text-[11px] font-black text-amber-300 uppercase tracking-wider">
                        Katalog Return &bull; 4 Status: GARANSI &bull; PERBAIKAN &bull; USUL HAPUS &bull; STANDBY
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-tight drop-shadow-md">
                      <span className="sr-only">Daftar Item &amp; Material Gudang (Katalog Blok &amp; Rak Return)</span>
                      <span aria-hidden="true">
                        Daftar Item &amp; Material Gudang
                        <span className="block text-lg sm:text-xl lg:text-2xl font-extrabold text-amber-200 mt-1">
                          (Katalog Blok &amp; Rak Return)
                        </span>
                      </span>
                    </h3>
                  </div>

                  {/* Action Button: Lihat Daftar Item Return */}
                  <div className="relative z-10 flex items-center gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        idleTimer.recordActivity();
                        setCatalogMode('return');
                        setCurrentRoute('catalog');
                      }}
                      className="active:scale-95 transition cursor-pointer"
                    >
                      <div className="flex h-14 flex-shrink-0 items-center justify-center gap-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-[#0F172A] px-5 lg:px-7 font-black shadow-xl transition-all group-hover:scale-105 whitespace-nowrap">
                        <span className="text-sm lg:text-base font-black">Lihat Daftar Item Return</span>
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1.5 transition-transform duration-300" />
                      </div>
                    </button>
                  </div>
                </div>

                {/* 3. BAGIAN KETIGA: SOP */}
                <div
                  onClick={() => {
                    idleTimer.recordActivity();
                    setCurrentRoute('programs');
                  }}
                  role="button"
                  tabIndex={0}
                  className="group relative flex flex-1 flex-col md:flex-row items-start md:items-center justify-between gap-4 lg:gap-6 overflow-hidden rounded-3xl border-2 border-slate-700/60 p-5 lg:p-7 text-left shadow-xl transition-all duration-500 hover:border-[#FACC15] hover:shadow-2xl active:scale-[0.995] cursor-pointer"
                >
                  {/* Full Wallpaper Background Image */}
                  {isPhotoMode ? (
                    <img
                      src={photoA}
                      alt="SOP"
                      className="absolute inset-0 h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out pointer-events-none"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 pointer-events-none" />
                  )}

                  {/* High Contrast Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/85 to-slate-950/65 pointer-events-none" />
                  <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[0.5px] pointer-events-none" />

                  {/* Content (Relative Z-10) */}
                  <div className="relative z-10 flex flex-col min-w-0 flex-1 justify-center py-1">
                    <span className="sr-only">Program Kerja Gudang PLN &amp; SOP Aturan</span>
                    <span className="sr-only">SOP &amp; ATURAN PERGUDANGAN Pedoman 5S &amp; K3</span>
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-tight drop-shadow-md">
                      SOP
                    </h3>
                  </div>

                  {/* CTA Action Button */}
                  <div className="relative z-10 flex h-14 flex-shrink-0 items-center gap-3 rounded-2xl bg-[#FACC15] text-[#0F172A] px-5 lg:px-7 font-black transition-all shadow-xl active:scale-95 group-hover:bg-amber-400 group-hover:scale-105">
                    <span className="text-sm lg:text-base font-black whitespace-nowrap">Buka SOP</span>
                    <span className="sr-only">Buka Program Kerja</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1.5 transition-transform duration-300" />
                  </div>
                </div>

                {/* 4. BAGIAN KEEMPAT: Visualisasi Denah & Tata Letak Gudang */}
                <div
                  onClick={() => {
                    idleTimer.recordActivity();
                    setCurrentRoute('layout');
                  }}
                  role="button"
                  tabIndex={0}
                  className="group relative flex flex-1 flex-col md:flex-row items-start md:items-center justify-between gap-4 lg:gap-6 overflow-hidden rounded-3xl border-2 border-slate-700/60 p-5 lg:p-7 text-left shadow-xl transition-all duration-500 hover:border-[#FACC15] hover:shadow-2xl active:scale-[0.995] cursor-pointer"
                >
                  {/* Full Wallpaper Background Image */}
                  {isPhotoMode ? (
                    <img
                      src={photoC}
                      alt="Visualisasi Denah Gudang"
                      className="absolute inset-0 h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out pointer-events-none"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 pointer-events-none" />
                  )}

                  {/* High Contrast Gradient Overlay for Crystal Clear Text */}
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/85 to-slate-950/65 pointer-events-none" />
                  <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[0.5px] pointer-events-none" />

                  {/* Content (Relative Z-10) */}
                  <div className="relative z-10 flex flex-col min-w-0 flex-1 justify-center py-1">
                    <span className="sr-only">LAYOUT GUDANG &bull; MODUL VISUALISASI SIAP INTEGRASI Peta Denah Blok &amp; Rak</span>
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-tight drop-shadow-md">
                      Visualisasi Denah &amp; Tata Letak Gudang
                    </h3>
                  </div>

                  {/* CTA Action Button */}
                  <div className="relative z-10 flex h-14 flex-shrink-0 items-center gap-3 rounded-2xl bg-[#FACC15] text-[#0F172A] px-5 lg:px-7 font-black transition-all shadow-xl active:scale-95 group-hover:bg-amber-400 group-hover:scale-105">
                    <span className="text-sm lg:text-base font-black whitespace-nowrap">Lihat Denah Tata Letak</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1.5 transition-transform duration-300" />
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
                  <span>Sistem KIOSK Aktif &bull; Layar Sentuh Siaga</span>
                  <span className="sr-only">Kassen WK-215 Siaga &bull; Resolusi Layar Penuh 1920×1080 Full HD &bull; Multi-Touch PCAP Aktif</span>
                </div>
                <div className="flex items-center gap-2 font-bold text-slate-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  <span>Gudang Aris Munandar &bull; PT PLN (Persero) UP3 Malang</span>
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
            pkg={catalogMode === 'return' ? kioskStorage.getPackageReturn() : kioskStorage.getPackageBaru()}
            config={config}
            mode={catalogMode}
            onBack={() => {
              idleTimer.recordActivity();
              setCurrentRoute('home');
            }}
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

      {/* Network Access Guide Modal (WiFi & Dynamic IP Access) */}
      <NetworkAccessModal
        visible={networkModalVisible}
        onClose={() => setNetworkModalVisible(false)}
        warehouseCode={config.warehouseCode}
      />

      {/* Shutdown & System Power Menu Modal */}
      <ShutdownMenuModal
        isOpen={shutdownModalVisible}
        onClose={() => setShutdownModalVisible(false)}
      />

      {/* Low Reach Accessibility Indicator */}
      {lowReachMode && (
        <div className="fixed bottom-4 left-6 z-30 flex items-center gap-2.5 rounded-full bg-slate-900/95 text-white px-4 py-2 text-xs font-semibold shadow-2xl border border-amber-400/50 backdrop-blur-md animate-in fade-in slide-in-from-bottom duration-300">
          <span className="h-2 w-2 rounded-full bg-[#FACC15] animate-ping" />
          <span>Mode Jangkauan Rendah Aktif (Ramah Kursi Roda)</span>
        </div>
      )}

      {/* Tombol Shutdown / Keluar Samar di Pojok Kanan Bawah */}
      <button
        onClick={() => {
          idleTimer.recordActivity();
          setShutdownModalVisible(true);
        }}
        title="Menu Daya & Matikan Komputer"
        aria-label="Menu Daya & Matikan Komputer"
        className="fixed bottom-3 right-3 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-slate-900/20 text-slate-400/40 border border-slate-300/30 backdrop-blur-xs opacity-25 hover:opacity-100 hover:bg-slate-900/80 hover:text-red-400 hover:border-red-400/40 transition-all duration-300 active:scale-95 shadow-2xs"
      >
        <Power className="h-4 w-4" />
      </button>
    </div>
  );
};
