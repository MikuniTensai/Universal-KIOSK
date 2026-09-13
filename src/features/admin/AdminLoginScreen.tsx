import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  ArrowRight,
  Info,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Server,
  Radio,
  CheckCircle2,
  Lock,
  Cpu,
  X,
  Boxes,
  FileText,
  History,
  Delete,
  Wifi,
} from 'lucide-react';
import { AdminAuth } from './adminAuth';
import { UserManagementService } from './userManagementService';
import { NetworkAccessModal } from '../network/NetworkAccessModal';
import { kioskStorage } from '../../adapters/storage/kioskStorage';
import plnLogoImg from '../../assets/pln_logo.webp';
import './adminConsole.css';

export interface AdminLoginUser {
  name: string;
  role: string;
  email: string;
  permissions?: string[];
}

interface AdminLoginScreenProps {
  onLoginSuccess: (user: AdminLoginUser) => void;
  onClose?: () => void;
  port?: number | string;
  initialMode?: 'password' | 'pin';
}

export const AdminLoginScreen: React.FC<AdminLoginScreenProps> = ({
  onLoginSuccess,
  onClose,
  port = 5001,
  initialMode,
}) => {
  const config = kioskStorage.getConfig();
  const warehouseName = 'Gudang Aris Munandar';
  const orgName = config.organizationName || 'PT PLN (Persero) UP3 Malang';

  const [authMode, setAuthMode] = useState<'password' | 'pin'>(
    initialMode === 'pin' ? 'pin' : 'password'
  );
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeSlide, setActiveSlide] = useState(0);
  const [showNetworkModal, setShowNetworkModal] = useState(false);

  const handlePinDigit = (digit: string) => {
    if (pin.length < 6) {
      const newPin = pin + digit;
      setPin(newPin);
      if (newPin.length === 6) {
        if (AdminAuth.authenticate(newPin)) {
          setPinError(false);
          onLoginSuccess({
            name: 'Administrator Gudang PLN',
            role: 'Super Administrator',
            email: 'admin@pln-kiosk.internal',
          });
        } else {
          setPinError(true);
          setTimeout(() => {
            setPin('');
            setPinError(false);
          }, 700);
        }
      }
    }
  };

  const slides = [
    {
      stationTitle: `Operasional ${warehouseName}`,
      stationSubtitle: 'Status dual-port, sync katalog & mutasi stok fisik',
      stationBadge: `Port ${port} LAN Aktif`,
      items: [
        {
          icon: Server,
          iconClass: 'device',
          name: 'Kiosk Touchscreen (Port 5000)',
          desc: 'Layar Kiosk siap & sinkron real-time',
          badge: 'Online',
          badgeClass: 'ready',
        },
        {
          icon: Radio,
          iconClass: 'wire',
          name: 'Real-Time Sync Protocol',
          desc: 'BroadcastChannel & Polling /api/sync aktif',
          badge: 'Sinkron',
          badgeClass: 'sync',
        },
        {
          icon: ShieldCheck,
          iconClass: 'security',
          name: 'Otorisasi Petugas & Hak Akses',
          desc: 'Bypass LAN otomatis atau otentikasi kredensial',
          badge: 'Aman',
          badgeClass: 'secure',
        },
      ],
      leadTitle: 'Katalog Material Distribusi & Gardu PLN Terpadu',
      leadDesc:
        'Pencarian instan transformator, kabel, isolator, dan kWh meter lengkap dengan pemetaan lokasi rak A-Z.',
    },
    {
      stationTitle: 'Tata Letak Gudang & Hirarki Rak (A-Z)',
      stationSubtitle: 'Manajemen fleksibel blok gudang hingga huruf Z',
      stationBadge: 'Struktur Blok Fleksibel',
      items: [
        {
          icon: Boxes,
          iconClass: 'device',
          name: 'Zonasi Blok Fisik Gudang',
          desc: 'Blok A s/d H aktif (dapat ditambah hingga Z)',
          badge: 'Fleksibel',
          badgeClass: 'ready',
        },
        {
          icon: Cpu,
          iconClass: 'wire',
          name: 'Hirarki Sub-Blok & Slot Rak',
          desc: 'Format standar A.1.1 - A.1.5 (hingga A.3.5)',
          badge: 'Presisi',
          badgeClass: 'sync',
        },
        {
          icon: CheckCircle2,
          iconClass: 'security',
          name: 'Validasi Mutasi & Hapus Stok',
          desc: 'Pencegahan stok negatif & audit riwayat mutasi',
          badge: 'Terverifikasi',
          badgeClass: 'secure',
        },
      ],
      leadTitle: 'Manajemen Lokasi Rak Cepat & Akurat',
      leadDesc:
        'Petugas lapangan dan pengambil barang dapat langsung menuju koordinat rak spesifik tanpa salah ambil.',
    },
    {
      stationTitle: 'Integrasi ERP SAP Logistik & Snapshot',
      stationSubtitle: 'Impor paket dataset JSON & pemulihan instan',
      stationBadge: 'Auto-Backup Aktif',
      items: [
        {
          icon: FileText,
          iconClass: 'device',
          name: 'Paket Dataset Versi Master',
          desc: 'Skema snapshot terverifikasi integritas hash',
          badge: 'Master',
          badgeClass: 'ready',
        },
        {
          icon: History,
          iconClass: 'wire',
          name: 'Riwayat Snapshot & Rollback',
          desc: 'Rollback instan jika terjadi kekeliruan data',
          badge: 'Durable',
          badgeClass: 'sync',
        },
        {
          icon: Lock,
          iconClass: 'security',
          name: 'Zero-Collision Port Architecture',
          desc: 'Port 5000 (Kiosk) & Port 5001 (Admin) terisolasi',
          badge: 'Terisolasi',
          badgeClass: 'secure',
        },
      ],
      leadTitle: 'Konsistensi Data Multi-Device & Kiosk Offline',
      leadDesc:
        'Operasional gudang tetap berjalan lancar saat jaringan padam dengan sinkronisasi otomatis saat terhubung kembali.',
    },
  ];

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleAutoLogin = () => {
    AdminAuth.authenticate('123456');
    const defaultSuper = UserManagementService.getUsers().find(u => u.permissions.includes('*'));
    onLoginSuccess({
      email: defaultSuper?.email || 'admin@pln-kiosk.id',
      role: defaultSuper?.role || 'Super Administrator',
      name: defaultSuper?.name || 'Administrator Gudang PLN',
      permissions: defaultSuper?.permissions || ['*'],
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    const res = UserManagementService.authenticate(email, password);
    if (res.success && res.user) {
      setIsLoading(false);
      AdminAuth.authenticateCredentials(email, password);
      onLoginSuccess({
        email: res.user.email,
        role: res.user.role,
        name: res.user.name,
        permissions: res.user.permissions,
      });
    } else if (AdminAuth.authenticateCredentials(email, password)) {
      setIsLoading(false);
      const cur = AdminAuth.getCurrentUser();
      onLoginSuccess({
        email: cur.email,
        role: cur.role,
        name: cur.name,
        permissions: cur.permissions,
      });
    } else {
      setIsLoading(false);
      setErrorMessage('Email/username atau kata sandi tidak sesuai.');
    }
  };

  const currentSlide = slides[activeSlide];

  return (
    <div className="adms-login-page-wrapper">
      {/* Backdrop Split Decoration */}
      <div className="adms-backdrop-left" />
      <div className="adms-backdrop-right" />

      {/* Main Container Card */}
      <main className="adms-login-card-container">
        {/* Close Corner Button */}
        {onClose && (
          <button
            type="button"
            className="adms-login-close-corner-btn"
            onClick={onClose}
            title="Kembali ke Layar Kiosk (Port 5000)"
          >
            <X size={18} strokeWidth={2.4} />
            <span className="sr-only">Tutup</span>
          </button>
        )}

        {/* Left: Feature & Warehouse Showcase */}
        <section className="adms-login-showcase-panel">
          {/* SVG Watermark Background */}
          <svg
            className="adms-showcase-watermark"
            viewBox="0 0 500 500"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="120" cy="240" r="220" stroke="rgba(2, 132, 199, 0.08)" strokeWidth="48" />
            <circle cx="120" cy="240" r="320" stroke="rgba(245, 158, 11, 0.04)" strokeWidth="32" />
          </svg>

          {/* Brand Title Header */}
          <div className="adms-showcase-brand">
            <div className="adms-brand-logo-badge" title={orgName}>
              <img
                src={plnLogoImg}
                alt="Logo PT PLN (Persero)"
                className="adms-brand-logo-img"
              />
            </div>
            <div className="adms-brand-info">
              <div className="adms-brand-name">{warehouseName}</div>
              <div className="adms-brand-category">{orgName}</div>
            </div>
          </div>

          {/* Operations / Station Status Card Carousel */}
          <div className="adms-station-card-wrapper">
            <button
              type="button"
              className="adms-carousel-arrow left"
              onClick={prevSlide}
              aria-label="Slide sebelumnya"
            >
              <ChevronLeft size={18} strokeWidth={2.5} />
            </button>

            <div className="adms-station-status-card">
              <div className="adms-station-card-header">
                <div>
                  <h3 className="adms-station-title">{currentSlide.stationTitle}</h3>
                  <p className="adms-station-subtitle">{currentSlide.stationSubtitle}</p>
                </div>
                <span className="adms-station-active-pill">
                  <span className="adms-pulse-dot" />
                  {currentSlide.stationBadge}
                </span>
              </div>

              <div className="adms-station-list">
                {currentSlide.items.map((item, idx) => {
                  const ItemIcon = item.icon;
                  return (
                    <div key={idx} className="adms-station-item">
                      <div className={`adms-station-icon-box ${item.iconClass}`}>
                        <ItemIcon size={18} strokeWidth={2.2} />
                      </div>
                      <div className="adms-station-text-group">
                        <div className="adms-station-name">{item.name}</div>
                        <div className="adms-station-order-count">{item.desc}</div>
                      </div>
                      <span className={`adms-status-badge ${item.badgeClass}`}>{item.badge}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              className="adms-carousel-arrow right"
              onClick={nextSlide}
              aria-label="Slide berikutnya"
            >
              <ChevronRight size={18} strokeWidth={2.5} />
            </button>
          </div>

          {/* Bottom Tagline & Indicators */}
          <div className="adms-showcase-bottom">
            <h4 className="adms-showcase-lead-title">{currentSlide.leadTitle}</h4>
            <p className="adms-showcase-lead-desc">{currentSlide.leadDesc}</p>

            <div className="adms-carousel-indicators">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`adms-indicator-pill ${activeSlide === idx ? 'active' : ''}`}
                  aria-label={`Slide ${idx + 1}`}
                  onClick={() => setActiveSlide(idx)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Right: Login Form & Keypad Panel */}
        <section className="adms-login-form-panel">
          <div className="adms-form-panel-content">
            {/* Mode Switcher Tabs - only if initialMode is explicitly provided (e.g. tests) */}
            {Boolean(initialMode) && (
              <div className="adms-auth-mode-tabs">
                <button
                  type="button"
                  className={`adms-auth-tab ${authMode === 'password' ? 'active' : ''}`}
                  onClick={() => setAuthMode('password')}
                >
                  Kredensial Operator
                </button>
                <button
                  type="button"
                  className={`adms-auth-tab ${authMode === 'pin' ? 'active' : ''}`}
                  onClick={() => setAuthMode('pin')}
                >
                  PIN Keypad Cepat
                </button>
              </div>
            )}

            {/* Form Header */}
            <div className="adms-form-header">
              <h1 className="adms-welcome-title">
                {authMode === 'pin' ? 'Masukkan PIN Akses' : 'Selamat datang kembali'}
              </h1>
              <p className="adms-welcome-subtitle">
                {authMode === 'pin'
                  ? 'Otorisasi Petugas Gudang'
                  : `Masuk untuk mengakses konsol operasional ${warehouseName} ${orgName}.`}
              </p>
            </div>

            {/* Notice Banner Autodetect */}
            <div className="adms-login-notice-banner">
              <div className="adms-notice-icon-wrapper">
                <Info size={16} strokeWidth={2.4} />
              </div>
              <div className="adms-notice-text">
                <div className="adms-notice-title">Sesi LAN Terdeteksi (Port {port})</div>
                <div className="adms-notice-desc">Sistem {warehouseName} aktif otomatis tanpa perlu login manual.</div>
              </div>
              <button
                type="button"
                className="adms-banner-direct-btn"
                onClick={handleAutoLogin}
                title="Langsung Masuk Dashboard Administrator"
              >
                <CheckCircle2 size={13} strokeWidth={2.5} />
                <span>Masuk Langsung</span>
              </button>
            </div>

            {/* Remote Access via WiFi Guide Link */}
            <div className="flex items-center justify-between rounded-xl bg-sky-50/90 border border-sky-200 p-2.5 px-3.5 text-xs text-sky-900 shadow-2xs">
              <div className="flex items-center gap-2">
                <Wifi size={15} className="text-[#0369a1] shrink-0" />
                <span className="font-semibold">Buka dari HP di WiFi sama?</span>
              </div>
              <button
                type="button"
                onClick={() => setShowNetworkModal(true)}
                className="font-bold text-[#0369a1] hover:underline flex items-center gap-1 active:scale-95 transition"
              >
                <span>Lihat QR &amp; Panduan IP &rarr;</span>
              </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="adms-error-notice-banner">
                <span>{errorMessage}</span>
              </div>
            )}

            {/* PIN Keypad Mode */}
            {authMode === 'pin' ? (
              <div className="space-y-4">
                {/* 6-Digit PIN Indicators */}
                <div className="adms-pin-dots-container">
                  {[0, 1, 2, 3, 4, 5].map((idx) => (
                    <div
                      key={idx}
                      className={`adms-pin-dot ${idx < pin.length ? 'filled' : ''} ${
                        pinError ? 'error' : ''
                      }`}
                    />
                  ))}
                </div>

                {/* Keypad Grid */}
                <div className="adms-keypad-grid">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'DEL'].map((btn) => (
                    <button
                      key={btn}
                      type="button"
                      onClick={() => {
                        if (btn === 'C') setPin('');
                        else if (btn === 'DEL') setPin((prev) => prev.slice(0, -1));
                        else handlePinDigit(btn);
                      }}
                      className="adms-keypad-btn"
                    >
                      {btn === 'DEL' ? <Delete size={20} /> : btn === 'C' ? <span className="text-rose-600">C</span> : btn}
                    </button>
                  ))}
                </div>

                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => setAuthMode('password')}
                    className="text-xs font-bold text-sky-700 hover:text-sky-900 underline"
                  >
                    Gunakan Form Email &amp; Password
                  </button>
                </div>
              </div>
            ) : (
              /* Password Form Mode */
              <form className="adms-auth-form" onSubmit={handleFormSubmit}>
                <div className="adms-form-group">
                  <label htmlFor="adms-login-email" className="adms-form-label">
                    Email / Username Operator <span className="adms-required-mark">*</span>
                  </label>
                  <div className="adms-input-container">
                    <input
                      id="adms-login-email"
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="adms-form-input"
                      placeholder="Masukkan email atau username"
                      autoComplete="username"
                      required
                    />
                  </div>
                </div>

                <div className="adms-form-group">
                  <label htmlFor="adms-login-password" className="adms-form-label">
                    Kata Sandi / PIN Akses <span className="adms-required-mark">*</span>
                  </label>
                  <div className="adms-input-container">
                    <input
                      id="adms-login-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="adms-form-input adms-password-input"
                      placeholder="Masukkan kata sandi"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      className="adms-password-toggle-btn"
                      title={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="adms-form-options-row">
                  <label className="adms-remember-label">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="adms-custom-checkbox"
                    />
                    <span className="adms-remember-text">Ingat saya pada perangkat ini</span>
                  </label>
                  <a
                    href="#forgot"
                    className="adms-forgot-link"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Default PIN administrator gudang: 123456');
                    }}
                  >
                    Lupa PIN?
                  </a>
                </div>

                {/* Submit Button */}
                <button type="submit" className="adms-submit-btn" disabled={isLoading}>
                  {!isLoading ? (
                    <span className="adms-btn-content">
                      <ArrowRight size={16} strokeWidth={2.5} />
                      <span>Masuk Konsol Admin</span>
                    </span>
                  ) : (
                    <span className="adms-btn-content">
                      <span className="adms-btn-spinner" />
                      <span>Memproses Autentikasi...</span>
                    </span>
                  )}
                </button>
              </form>
            )}

            {/* Footer Text */}
            <div className="adms-form-footer">
              <span>Buka Layar Sentuh Kiosk?</span>
              <a
                href="http://localhost:5000"
                className="adms-trial-link"
                onClick={(e) => {
                  if (onClose) {
                    e.preventDefault();
                    onClose();
                  }
                }}
              >
                Buka Kiosk Display (Port 5000)
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Network Access Guide Modal */}
      <NetworkAccessModal
        visible={showNetworkModal}
        onClose={() => setShowNetworkModal(false)}
      />
    </div>
  );
};
