import React, { useState, useEffect } from 'react';
import {
  Menu,
  X,
  LayoutDashboard,
  Boxes,
  FolderPlus,
  FolderTree,
  Upload,
  History,
  Settings,
  Activity,
  RefreshCw,
  LogOut,
  ArrowRight,
  ChevronRight,
  Wifi,
} from 'lucide-react';
import { AdminModeService } from './adminModeService';
import { AdminLoginUser } from './AdminLoginScreen';
import plnLogoImg from '../../assets/pln_logo.webp';
import './adminConsole.css';

export type AdminModuleTab =
  | 'overview'
  | 'stock'
  | 'categories'
  | 'locations'
  | 'import'
  | 'history'
  | 'settings'
  | 'logs'
  | 'network';

interface AdminConsoleShellProps {
  activeTab: AdminModuleTab;
  onTabChange: (tab: AdminModuleTab) => void;
  currentUser?: AdminLoginUser;
  onLogout: () => void;
  onRefresh: () => void;
  onCloseModal?: () => void;
  onOpenNetworkModal?: () => void;
  standalone?: boolean;
  historyCount?: number;
  logsCount?: number;
  warehouseCode?: string;
  children: React.ReactNode;
}

interface ModuleMeta {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
}

const MODULE_META_MAP: Record<AdminModuleTab, ModuleMeta> = {
  overview: {
    title: 'Dashboard Eksekutif',
    subtitle: 'Ringkasan eksekutif inventaris logistik & status operasional gudang PLN',
    icon: LayoutDashboard,
  },
  stock: {
    title: 'Manajemen Stok & Material',
    subtitle: 'Penyesuaian kuantitas fisik, mutasi rak, dan pendaftaran material baru',
    icon: Boxes,
  },
  categories: {
    title: 'Klasifikasi Kategori Logistik',
    subtitle: 'Pengelompokan perlengkapan gardu, transformator, kabel, dan APD K3',
    icon: FolderPlus,
  },
  locations: {
    title: 'Manajemen Tata Letak',
    subtitle: 'Konfigurasi fleksibel penomoran blok gudang, sub-blok, dan slot rak',
    icon: FolderTree,
  },
  import: {
    title: 'Integrasi Paket SAP ERP',
    subtitle: 'Sinkronisasi dataset snapshot dari ERP SAP Logistik Terpadu',
    icon: Upload,
  },
  history: {
    title: 'Riwayat Snapshot Gudang',
    subtitle: 'Audit versi master dataset gudang dan pemulihan instan',
    icon: History,
  },
    settings: {
    title: 'Konfigurasi Sistem Kiosk',
    subtitle: 'Pengaturan identitas unit, wallpaper, dan parameter operasional',
    icon: Settings,
  },
  logs: {
    title: 'Audit & Log Diagnostik',
    subtitle: 'Rekaman aktivitas sistem, integritas data, dan jejak audit transaksi',
    icon: Activity,
  },
  network: {
    title: 'Akses WiFi & IP Jaringan',
    subtitle: 'Panduan remote control Kiosk & Panel Admin dari HP / Laptop di WiFi yang sama',
    icon: Wifi,
  },
};

export const AdminConsoleShell: React.FC<AdminConsoleShellProps> = ({
  activeTab,
  onTabChange,
  currentUser = {
    name: 'Administrator',
    role: 'Super Administrator',
    email: 'admin@pln-kiosk.internal',
  },
  onLogout,
  onRefresh,
  onCloseModal,
  onOpenNetworkModal,
  standalone = false,
  historyCount = 0,
  logsCount = 0,
  warehouseCode = 'GUD-PLN-MLG-AM01',
  children,
}) => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  const navModules = [
    {
      id: 'dashboard',
      label: 'DASHBOARD',
      items: [
        {
          id: 'overview' as AdminModuleTab,
          label: 'Ringkasan & Overview',
          icon: LayoutDashboard,
        },
      ],
    },
    {
      id: 'inventory',
      label: 'INVENTARIS & STOK',
      items: [
        {
          id: 'stock' as AdminModuleTab,
          label: 'Kelola & Tambah Stok',
          icon: Boxes,
        },
        {
          id: 'categories' as AdminModuleTab,
          label: 'Kelola Kategori',
          icon: FolderPlus,
        },
      ],
    },
    {
      id: 'layout',
      label: 'TATA LETAK GUDANG',
      items: [
        {
          id: 'locations' as AdminModuleTab,
          label: 'Tata Letak Blok & Rak (A-Z)',
          icon: FolderTree,
        },
      ],
    },
    {
      id: 'integration',
      label: 'INTEGRASI & LOGISTIK',
      items: [
        {
          id: 'import' as AdminModuleTab,
          label: 'Impor Paket Baru',
          icon: Upload,
        },
        {
          id: 'history' as AdminModuleTab,
          label: 'Riwayat & Restore',
          icon: History,
          badge: historyCount > 0 ? historyCount : undefined,
        },
      ],
    },
    {
      id: 'system',
      label: 'SISTEM & DIAGNOSTIK',
      items: [
        {
          id: 'settings' as AdminModuleTab,
          label: 'Pengaturan Kiosk',
          icon: Settings,
        },
        {
          id: 'network' as AdminModuleTab,
          label: 'Akses WiFi & IP LAN',
          icon: Wifi,
        },
        {
          id: 'logs' as AdminModuleTab,
          label: 'Log Diagnostik',
          icon: Activity,
          badge: logsCount > 0 ? logsCount : undefined,
        },
      ],
    },
  ];

  const currentMeta = MODULE_META_MAP[activeTab] || MODULE_META_MAP.overview;
  const CurrentIcon = currentMeta.icon;

  const handleSelectTab = (tab: AdminModuleTab) => {
    onTabChange(tab);
    setIsMobileNavOpen(false);
  };

  return (
    <div className={`adms-app-shell ${!standalone ? 'modal-mode' : ''}`}>
      {/* Mobile Backdrop Overlay */}
      {isMobileNavOpen && (
        <div
          className="adms-sidebar-backdrop"
          onClick={() => setIsMobileNavOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* 1. Left Sidebar Navigation (Universal-ADMS BioTime Shape) */}
      <aside
        className={`adms-sidebar ${isMobileNavOpen ? 'adms-sidebar--open' : ''}`}
        aria-label="Navigasi Modul Admin"
      >
        <div className="adms-sidebar-top">
          <div className="adms-sidebar-header">
            <div className="adms-brand-group">
              <div className="adms-brand-logo" title="PT PLN (Persero)" aria-label="Logo PT PLN (Persero)">
                <img
                  src={plnLogoImg}
                  alt="Logo PT PLN (Persero)"
                  className="adms-brand-logo-img"
                />
              </div>
              <div className="adms-brand-text">
                <div className="adms-brand-title">Portal Administrator Gudang PLN</div>
                <div className="adms-brand-subtitle">Panel Administrator Kiosk Gudang PLN &bull; {warehouseCode}</div>
              </div>
            </div>

            {/* Mobile Drawer Close Button */}
            <button
              type="button"
              className="adms-sidebar-close-btn"
              onClick={() => setIsMobileNavOpen(false)}
              aria-label="Tutup Menu"
            >
              <X size={18} strokeWidth={2.2} />
            </button>
          </div>

          <div className="adms-sidebar-menu">
            {navModules.map((group) => (
              <div key={group.id} className="adms-menu-group">
                <div className="adms-menu-group-label">{group.label}</div>
                {group.items.map((item) => {
                  const ItemIcon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`adms-menu-item ${isActive ? 'active' : ''}`}
                      aria-current={isActive ? 'page' : undefined}
                      onClick={() => handleSelectTab(item.id)}
                    >
                      <div className="adms-menu-item-left">
                        <span className="adms-menu-icon-svg">
                          <ItemIcon size={18} strokeWidth={2} />
                        </span>
                        <span className="adms-menu-text">{item.label}</span>
                      </div>
                      {item.badge !== undefined ? (
                        <span className="adms-menu-counter-badge">{item.badge}</span>
                      ) : (
                        <ChevronRight className="adms-menu-chevron" size={14} strokeWidth={2.2} />
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Bottom Status */}
        <div className="adms-sidebar-bottom">
          <div className="adms-sidebar-status-row">
            <span className="adms-pulse-dot adms-pulse-dot--green" />
            <span className="status-text">Console Terhubung</span>
          </div>
          <div className="adms-sidebar-substatus">
            LAN Port 5001 &bull; Real-time Sync &bull; {timeStr || 'Aktif'}
          </div>
        </div>
      </aside>

      {/* 2. Main Viewport */}
      <div className="adms-main-viewport">
        {/* Sticky Top Bar Header */}
        <header className="adms-top-bar">
          <div className="adms-top-left">
            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              className="adms-mobile-menu-btn"
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              aria-label="Buka Menu Navigasi"
            >
              <Menu size={20} strokeWidth={2.2} />
            </button>

            <span className="adms-top-title-icon">
              <CurrentIcon size={20} strokeWidth={2.2} />
            </span>

            <div className="adms-top-title-group">
              <h1 className="adms-top-title">{currentMeta.title}</h1>
            </div>
          </div>

          <div className="adms-top-right">
            {/* Minimal Port Connection Status Pill (Clickable to open Network Guide) */}
            <button
              type="button"
              onClick={() => {
                if (onOpenNetworkModal) {
                  onOpenNetworkModal();
                } else {
                  handleSelectTab('network');
                }
              }}
              className="adms-conn-status-pill adms-conn-status-pill--ok cursor-pointer hover:opacity-90 active:scale-95 transition shrink-0"
              title="Klik untuk membuka Panduan Akses WiFi & Alamat IP Lokal Mesin"
            >
              <span className="adms-pulse-dot adms-pulse-dot--green" />
              <span className="font-bold">Port 5001</span>
            </button>

            {/* Jump to Kiosk Display Button */}
            <a
              href={AdminModeService.getKioskUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="adms-kiosk-jump-btn shrink-0"
              title="Buka Antarmuka Layar Sentuh Kiosk"
            >
              <span>Layar Kiosk</span>
              <ArrowRight size={13} strokeWidth={2.5} />
            </a>

            {/* User Profile Pill with Logout */}
            <div className="adms-user-profile-pill">
              <div className="adms-user-avatar">
                {currentUser.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="adms-user-info hidden md:flex">
                <span className="adms-user-name">{currentUser.name}</span>
                <span className="adms-user-role-status">
                  <span className="adms-online-indicator">{currentUser.role}</span>
                </span>
              </div>
              <button
                type="button"
                className="adms-topbar-logout-btn"
                onClick={onLogout}
                title="Keluar dari sesi konsol admin"
              >
                <LogOut size={12} strokeWidth={2.2} />
                <span>Keluar</span>
              </button>
            </div>

            {/* Quick WiFi / Network Guide Button */}
            <button
              type="button"
              className="adms-refresh-circle-btn hover:text-[#0369a1] hover:border-sky-300"
              onClick={() => {
                if (onOpenNetworkModal) {
                  onOpenNetworkModal();
                } else {
                  handleSelectTab('network');
                }
              }}
              title="Info Akses WiFi & Alamat IP Mesin"
            >
              <Wifi size={14} strokeWidth={2.2} />
            </button>

            {/* Refresh Button */}
            <button
              type="button"
              className="adms-refresh-circle-btn"
              onClick={onRefresh}
              title="Refresh Data Konsol"
            >
              <RefreshCw size={14} strokeWidth={2.2} />
            </button>

            {/* Close Modal Button (when in Kiosk overlay modal mode) */}
            {onCloseModal && (
              <button
                type="button"
                className="adms-refresh-circle-btn ml-1 hover:bg-rose-50 hover:text-rose-600"
                onClick={onCloseModal}
                aria-label="Tutup Panel Administrator"
                title="Tutup Panel Administrator & Kembali ke Kiosk"
              >
                <X size={16} strokeWidth={2.2} />
              </button>
            )}
          </div>
        </header>

        {/* Scrollable Dashboard Body */}
        <main className="adms-dashboard-body">{children}</main>
      </div>
    </div>
  );
};
