import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  MapPin,
  Search,
  HelpCircle,
  X,
} from 'lucide-react';
import { ImportPackage, KioskConfig } from '../../domain/types';
import denahGudangImg from '../../assets/denah_gudang_pln.png';

interface WarehouseLayoutViewProps {
  pkg: ImportPackage;
  config: KioskConfig;
  onBack: () => void;
  onSelectRack?: (rack: string) => void;
}

export const WarehouseLayoutView: React.FC<WarehouseLayoutViewProps> = ({
  pkg: _pkg,
  config: _config,
  onBack,
  onSelectRack,
}) => {
  // Zoom & Pan state
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragOrigin, setDragOrigin] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);

  // Touch pinch zoom state
  const touchDistanceRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Zoom controls
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3.5));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.6));
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Double click to toggle zoom
  const handleDoubleClick = () => {
    if (zoom > 1.2) {
      handleResetZoom();
    } else {
      setZoom(1.8);
    }
  };

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only primary button
    setIsDragging(true);
    setDragOrigin({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragOrigin.x,
      y: e.clientY - dragOrigin.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch pan & pinch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragOrigin({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      });
    } else if (e.touches.length === 2) {
      // Pinch to zoom start
      setIsDragging(false);
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchDistanceRef.current = dist;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      setPan({
        x: e.touches[0].clientX - dragOrigin.x,
        y: e.touches[0].clientY - dragOrigin.y,
      });
    } else if (e.touches.length === 2 && touchDistanceRef.current !== null) {
      // Pinch to zoom active
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const delta = (dist - touchDistanceRef.current) * 0.005;
      setZoom((prev) => Math.min(Math.max(prev + delta, 0.6), 3.5));
      touchDistanceRef.current = dist;
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchDistanceRef.current = null;
  };

  // Wheel zoom
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY > 0 ? -0.15 : 0.15;
    setZoom((prev) => Math.min(Math.max(prev + zoomDelta, 0.6), 3.5));
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  return (
    <div
      className={`flex flex-col ${
        isFullscreen ? 'fixed inset-0 z-50 bg-[#090D16]' : 'min-h-full bg-[#0B1120]'
      } text-white select-none overflow-hidden`}
    >
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 bg-[#0F172A]/95 backdrop-blur-md border-b border-cyan-500/20 shadow-lg shrink-0 z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex h-12 items-center gap-2.5 rounded-xl bg-slate-800/90 border border-slate-700/80 px-4 text-sm font-bold text-slate-200 hover:bg-cyan-950/80 hover:border-cyan-500/50 hover:text-cyan-300 active:scale-95 transition shadow-sm"
            title="Kembali ke Beranda"
            aria-label="Kembali ke Beranda"
          >
            <ArrowLeft className="h-5 w-5 text-cyan-400" />
            <span>Kembali ke Beranda</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider text-cyan-300">
                <MapPin className="h-3 w-3 text-cyan-400" />
                DOKUMEN RESMI TATA LETAK
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-400/30 px-2 py-0.5 text-[10px] font-extrabold text-amber-300">
                GUDANG ARIS MUNANDAR
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Denah &amp; Tata Letak Gudang</span>
              <span className="text-xs sm:text-sm font-semibold text-slate-400">
                PT PLN (Persero) UP3 Malang
              </span>
            </h1>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2.5">
          {onSelectRack && (
            <button
              onClick={() => onSelectRack('')}
              className="flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 text-xs sm:text-sm font-black text-slate-950 shadow-md hover:from-amber-400 hover:to-amber-500 active:scale-95 transition"
              title="Buka Daftar Item & Material Gudang"
            >
              <Search className="h-4 w-4" />
              <span>Cari di Katalog</span>
            </button>
          )}

          <button
            onClick={() => setShowGuideModal(true)}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800/90 border border-slate-700/80 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 active:scale-95 transition"
            title="Petunjuk Penggunaan Peta"
          >
            <HelpCircle className="h-5 w-5" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800/90 border border-slate-700/80 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 active:scale-95 transition"
            title={isFullscreen ? 'Keluar Layar Penuh' : 'Mode Layar Penuh'}
          >
            {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Main Interactive Map Canvas Viewport */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={handleDoubleClick}
        className={`relative flex-1 w-full overflow-hidden bg-[#060911] flex items-center justify-center select-none ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(56, 189, 248, 0.08) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      >
        {/* Subtle decorative blueprint grid watermark */}
        <div className="absolute top-4 left-6 pointer-events-none opacity-40 text-[11px] font-mono text-cyan-400/80 space-y-0.5">
          <p>CAD-PLN-MLG // ARIS MUNANDAR WAREHOUSE MASTERPLAN</p>
          <p>SCALE: {Math.round(zoom * 100)}% | STATUS: RESMI CETAK VERSI 1.1</p>
        </div>

        {/* The Blueprint Image with Smooth Transform */}
        <div
          className="relative max-w-none max-h-none transition-transform duration-75 ease-out"
          style={{
            transform: `translate3d(${pan.x}px, ${pan.y}px, 0px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div className="relative rounded-2xl p-2 bg-slate-900/60 border border-cyan-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.8)] ring-1 ring-cyan-400/20">
            <img
              src={denahGudangImg}
              alt="Denah dan Tata Letak Gudang Aris Munandar PT PLN UP3 Malang"
              className="max-w-[1200px] w-[88vw] h-auto rounded-xl object-contain pointer-events-none shadow-2xl"
              draggable={false}
            />
          </div>
        </div>

        {/* Floating Quick Floating Dock (Bottom Right / Center) */}
        <div className="absolute bottom-6 right-16 z-20 flex items-center gap-2 bg-[#0F172A]/90 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-1.5 shadow-2xl ring-1 ring-white/10">
          <button
            onClick={handleZoomIn}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800 text-cyan-300 hover:bg-cyan-500 hover:text-slate-950 active:scale-90 transition"
            title="Perbesar Denah (+)"
            aria-label="Perbesar Denah"
          >
            <ZoomIn className="h-5 w-5" />
          </button>

          <button
            onClick={handleResetZoom}
            className="px-3 h-11 flex flex-col items-center justify-center rounded-xl bg-slate-800/80 text-xs font-mono font-bold text-slate-200 hover:bg-slate-700 active:scale-95 transition"
            title="Klik untuk reset zoom ke 100%"
          >
            <span className="text-[10px] text-slate-400 font-sans">ZOOM</span>
            <span className="text-cyan-400">{Math.round(zoom * 100)}%</span>
          </button>

          <button
            onClick={handleZoomOut}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800 text-cyan-300 hover:bg-cyan-500 hover:text-slate-950 active:scale-90 transition"
            title="Perkecil Denah (-)"
            aria-label="Perkecil Denah"
          >
            <ZoomOut className="h-5 w-5" />
          </button>

          <div className="h-6 w-px bg-slate-700 mx-0.5" />

          <button
            onClick={handleResetZoom}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white active:scale-90 transition"
            title="Reset Posisi &amp; Skala Peta"
            aria-label="Reset Posisi Peta"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Guide / Help Modal for Kiosk Users */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#0F172A] border border-cyan-500/40 rounded-3xl p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                  <HelpCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Petunjuk Navigasi Denah</h3>
                  <p className="text-xs text-slate-400">Layar Sentuh Kios Kassen &amp; Desktop</p>
                </div>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3.5 my-5 text-sm">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-800/70 border border-slate-700/60">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 shrink-0">
                  <ZoomIn className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-cyan-300">Perbesar &amp; Perkecil</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Gunakan tombol <span className="font-bold text-white">+ / -</span> di pojok kanan bawah, cubit layar (pinch to zoom), atau scroll roda mouse.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-800/70 border border-slate-700/60">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 shrink-0">
                  <Maximize2 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-amber-300">Geser / Menjelajah Area (Pan)</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Sentuh dan seret layar ke arah mana saja untuk melihat detail blok, rak, pintu masuk, atau area retur.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowGuideModal(false)}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black text-sm shadow-lg hover:from-cyan-400 hover:to-blue-500 active:scale-95 transition"
            >
              Mengerti, Tutup Panduan
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
