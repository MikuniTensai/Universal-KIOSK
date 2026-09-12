import React, { useState, useEffect, useCallback } from 'react';
import {
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
import { WarehouseLayoutView } from '../features/layout/WarehouseLayoutView';
import { CatalogView } from '../features/catalog/CatalogView';
import { ScanStandbyView } from '../features/scanner/ScanStandbyView';
import { AdminDashboardModal } from '../features/admin/AdminDashboardModal';
import { AdminModeService } from '../features/admin/adminModeService';
import { NetworkAccessModal } from '../features/network/NetworkAccessModal';
import { SyncService } from '../adapters/storage/syncService';
import { ScanResolveResult, ImportPackage, KioskConfig } from '../domain/types';
import { WALLPAPER_PRESETS, DEFAULT_CARD_PHOTOS } from '../data/mockPlnPackage';

export const App: React.FC = () => {
  const isDedicatedAdmin = AdminModeService.isAdminPort();
  const [activePackage, setActivePackage] = useState<ImportPackage | null>(kioskStorage.getActivePackage());
  const [config, setConfig] = useState<KioskConfig>(kioskStorage.getConfig());
  const [currentRoute, setCurrentRoute] = useState<'idle' | 'home' | 'layout' | 'programs' | 'catalog' | 'scan'>('idle');

  // Idle timer warning modal state
  const [timeoutWarningVisible, setTimeoutWarningVisible] = useState(false);
  const [warningSecondsLeft, setWarningSecondsLeft] = useState(10);

  // Admin dashboard modal state
  const [adminModalVisible, setAdminModalVisible] = useState(false);

  // Network access info modal state (WiFi & Dynamic IP LAN Access)
  const [networkModalVisible, setNetworkModalVisible] = useState(false);

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
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/25 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-amber-900 shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                  <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                  <span>Terminal Mandiri Kassen WK-215 (Full HD 1080p)</span>
                </div>
                <h2 className="text-4xl lg:text-5xl 2xl:text-6xl font-black tracking-tight text-[#0F172A] leading-tight text-center">
                  Selamat Datang
                </h2>
                <p className="text-xl sm:text-2xl lg:text-3xl font-black text-amber-500 tracking-wide text-center">
                  PT PLN (Persero) UP3 Malang
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 mt-1">
                  <p className="text-base lg:text-lg text-slate-600 font-medium">
                    Pilih layanan informasi di bawah atau dekatkan barcode material langsung ke scanner.
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

              {/* 3 Main Sections Layout - Persis Kebutuhan Klien:
                  1. Atas: Visualisasi Layout Denah Gudang (disiapkan untuk visualisasi nanti)
                  2. Tengah: SOP & Aturan-Aturan Pergudangan PLN
                  3. Bawah: Katalog Material & Lokasi Rak/Blok (contoh: kWh di Rak A-001) */}
              <div className="flex flex-col gap-4 lg:gap-5 flex-1 justify-between my-2">
                {/* 1. BAGIAN ATAS: Visualisasi Denah & Tata Letak Gudang ("Nanti ada layout yang minta divisualisasikan tapi ini nanti saja yang atas sendiri") */}
                <div
                  onClick={() => {
                    idleTimer.recordActivity();
                    setCurrentRoute('layout');
                  }}
                  role="button"
                  tabIndex={0}
                  className="group relative flex flex-1 flex-col md:flex-row items-start md:items-center justify-between gap-5 lg:gap-8 overflow-hidden rounded-3xl border-2 border-slate-700/60 p-6 lg:p-8 text-left shadow-xl transition-all duration-500 hover:border-[#FACC15] hover:shadow-2xl active:scale-[0.995] cursor-pointer"
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
                  <div className="relative z-10 flex flex-col min-w-0 flex-1 justify-center py-2">
                    <span className="sr-only">LAYOUT GUDANG &bull; MODUL VISUALISASI SIAP INTEGRASI Peta Denah Blok &amp; Rak</span>
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight drop-shadow-md">
                      Visualisasi Denah &amp; Tata Letak Gudang
                    </h3>
                  </div>

                  {/* CTA Action Button */}
                  <div className="relative z-10 flex h-14 flex-shrink-0 items-center gap-3 rounded-2xl bg-[#FACC15] text-[#0F172A] px-6 lg:px-8 font-black transition-all shadow-xl active:scale-95 group-hover:bg-amber-400 group-hover:scale-105">
                    <span className="text-sm lg:text-base font-black whitespace-nowrap">Lihat Denah Tata Letak</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1.5 transition-transform duration-300" />
                  </div>
                </div>

                {/* 2. BAGIAN TENGAH: SOP & Aturan-Aturan Gudang PLN ("lalu yang tengah berubah menjadi SOP aturan-aturan") */}
                <div
                  onClick={() => {
                    idleTimer.recordActivity();
                    setCurrentRoute('programs');
                  }}
                  role="button"
                  tabIndex={0}
                  className="group relative flex flex-1 flex-col md:flex-row items-start md:items-center justify-between gap-5 lg:gap-8 overflow-hidden rounded-3xl border-2 border-slate-700/60 p-6 lg:p-8 text-left shadow-xl transition-all duration-500 hover:border-[#FACC15] hover:shadow-2xl active:scale-[0.995] cursor-pointer"
                >
                  {/* Full Wallpaper Background Image */}
                  {isPhotoMode ? (
                    <img
                      src={photoA}
                      alt="Program Kerja & SOP"
                      className="absolute inset-0 h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out pointer-events-none"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 pointer-events-none" />
                  )}

                  {/* High Contrast Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/85 to-slate-950/65 pointer-events-none" />
                  <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[0.5px] pointer-events-none" />

                  {/* Content (Relative Z-10) */}
                  <div className="relative z-10 flex flex-col min-w-0 flex-1 justify-center py-2">
                    <span className="sr-only">SOP &amp; ATURAN PERGUDANGAN Pedoman 5S &amp; K3</span>
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight drop-shadow-md">
                      Program Kerja Gudang PLN &amp; SOP Aturan
                    </h3>
                  </div>

                  {/* CTA Action Button */}
                  <div className="relative z-10 flex h-14 flex-shrink-0 items-center gap-3 rounded-2xl bg-[#FACC15] text-[#0F172A] px-6 lg:px-8 font-black transition-all shadow-xl active:scale-95 group-hover:bg-amber-400 group-hover:scale-105">
                    <span className="text-sm lg:text-base font-black whitespace-nowrap">Buka Program Kerja</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1.5 transition-transform duration-300" />
                  </div>
                </div>

                {/* 3. BAGIAN BAWAH: Katalog Material & Lokasi Rak/Blok ("dan yang terakhir ketiga Katalog isi ada di blok apa atau di rak material apa kwh rak A-001 semisal") */}
                <div
                  className="group relative flex flex-1 flex-col md:flex-row items-start md:items-center justify-between gap-5 lg:gap-8 overflow-hidden rounded-3xl border-2 border-[#FACC15] p-6 lg:p-8 text-left shadow-2xl transition-all duration-300 ring-2 ring-[#FACC15]/40 hover:ring-[#FACC15]/70"
                >
                  {/* Full Wallpaper Background Image */}
                  {isPhotoMode ? (
                    <img
                      src={photoB}
                      alt="Katalog Material"
                      className="absolute inset-0 h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out pointer-events-none"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 pointer-events-none" />
                  )}

                  {/* High Contrast Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/85 to-slate-950/65 pointer-events-none" />
                  <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[0.5px] pointer-events-none" />

                  {/* Content (Relative Z-10) */}
                  <div
                    onClick={() => {
                      idleTimer.recordActivity();
                      setCurrentRoute('catalog');
                    }}
                    className="relative z-10 flex flex-col min-w-0 flex-1 justify-center py-2 cursor-pointer"
                  >
                    <span className="sr-only">KATALOG MATERIAL &amp; LOKASI RAK Contoh: kWh di Rak A-001</span>
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight drop-shadow-md">
                      Daftar Item &amp; Material Gudang (Katalog Blok &amp; Rak)
                    </h3>
                  </div>

                  {/* Dual Action Buttons: Lihat Daftar Item & Scan Item */}
                  <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 self-stretch md:self-center w-full md:w-auto">
                    <button
                      onClick={() => {
                        idleTimer.recordActivity();
                        setCurrentRoute('catalog');
                      }}
                      className="active:scale-95 transition w-full sm:w-auto"
                    >
                      <div className="flex h-14 flex-shrink-0 w-full items-center justify-center gap-2 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 px-5 lg:px-6 font-extrabold shadow-lg whitespace-nowrap">
                        <span className="text-sm lg:text-base font-extrabold">Lihat Daftar Item</span>
                        <ArrowRight className="h-5 w-5" />
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        idleTimer.recordActivity();
                        setCurrentRoute('scan');
                      }}
                      className="active:scale-95 transition w-full sm:w-auto"
                    >
                      <div className="flex h-14 flex-shrink-0 w-full items-center justify-center gap-2 rounded-2xl bg-[#FACC15] text-[#0F172A] px-5 lg:px-6 font-black hover:bg-amber-400 shadow-xl whitespace-nowrap border-2 border-amber-400 ring-2 ring-[#FACC15]/50">
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

      {/* Network Access Guide Modal (WiFi & Dynamic IP Access) */}
      <NetworkAccessModal
        visible={networkModalVisible}
        onClose={() => setNetworkModalVisible(false)}
        warehouseCode={config.warehouseCode}
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
