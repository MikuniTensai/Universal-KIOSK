import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Volume2,
  VolumeX,
  CheckCircle2,
  Truck,
  ClipboardCheck,
  Boxes,
  QrCode,
  Monitor,
  Check,
  Search,
  ShieldAlert,
  Printer,
  Sparkles,
  Layers,
  X,
  Eye,
  Info,
} from 'lucide-react';
import { SOP_FLOWS, SopFlow, SopStep } from './sopFlowData';
import './animatedSop.css';

export const AnimatedSopExplorer: React.FC = () => {
  const [selectedFlowId, setSelectedFlowId] = useState<'penerimaan' | 'pengeluaran' | 'pengembalian'>('penerimaan');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(4000); // 4000ms default
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const [lightboxZoom, setLightboxZoom] = useState<number>(1);

  const activeFlow: SopFlow = SOP_FLOWS.find((f) => f.id === selectedFlowId) || SOP_FLOWS[0];
  const activeStep: SopStep = activeFlow.steps[currentStepIndex] || activeFlow.steps[0];

  // Web Audio subtle synthesizer sound effect
  const playStepChime = useCallback(() => {
    if (!isSoundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 note
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5 note

      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } catch {
      // Audio autoplay policy fallback
    }
  }, [isSoundEnabled]);

  // When changing flow, reset to step 0
  const handleSelectFlow = (flowId: 'penerimaan' | 'pengeluaran' | 'pengembalian') => {
    setSelectedFlowId(flowId);
    setCurrentStepIndex(0);
    setProgressPercent(0);
    playStepChime();
  };

  // Next step handler
  const handleNextStep = useCallback(() => {
    setCurrentStepIndex((prev) => {
      const next = (prev + 1) % activeFlow.steps.length;
      return next;
    });
    setProgressPercent(0);
    playStepChime();
  }, [activeFlow.steps.length, playStepChime]);

  // Previous step handler
  const handlePrevStep = () => {
    setCurrentStepIndex((prev) => {
      const next = prev === 0 ? activeFlow.steps.length - 1 : prev - 1;
      return next;
    });
    setProgressPercent(0);
    playStepChime();
  };

  // Reset to first step
  const handleReset = () => {
    setCurrentStepIndex(0);
    setProgressPercent(0);
    playStepChime();
  };

  // Jump to specific step
  const handleJumpToStep = (index: number) => {
    setCurrentStepIndex(index);
    setProgressPercent(0);
    playStepChime();
  };

  // Auto-play timer loop
  const timerRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      setProgressPercent(0);
      return;
    }

    startTimeRef.current = Date.now();

    // Progress bar animation loop
    const updateProgress = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min(100, (elapsed / playbackSpeed) * 100);
      setProgressPercent(pct);

      if (pct < 100 && isPlaying) {
        animFrameRef.current = requestAnimationFrame(updateProgress);
      }
    };

    animFrameRef.current = requestAnimationFrame(updateProgress);

    timerRef.current = window.setInterval(() => {
      handleNextStep();
      startTimeRef.current = Date.now();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = requestAnimationFrame(updateProgress);
    }, playbackSpeed);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, playbackSpeed, handleNextStep]);

  // Esc key closes lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Icon helper based on step type
  const renderStepIcon = (iconType: SopStep['iconType'], size = 20) => {
    switch (iconType) {
      case 'truck':
        return <Truck size={size} />;
      case 'clipboard':
        return <ClipboardCheck size={size} />;
      case 'forklift':
        return <Boxes size={size} />;
      case 'barcode':
        return <QrCode size={size} />;
      case 'computer':
        return <Monitor size={size} />;
      case 'rack':
        return <Layers size={size} />;
      case 'printer':
        return <Printer size={size} />;
      case 'search':
        return <Search size={size} />;
      case 'shield':
        return <ShieldAlert size={size} />;
      case 'check':
      default:
        return <Check size={size} />;
    }
  };

  const getThemeClass = (flowId: string) => {
    if (flowId === 'penerimaan') return 'sop-step-node--active-penerimaan';
    if (flowId === 'pengeluaran') return 'sop-step-node--active-pengeluaran';
    return 'sop-step-node--active-pengembalian';
  };

  return (
    <div className="space-y-6">
      {/* 1. Sub-Header & Flow Switcher Tabs */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 rounded-md bg-amber-500/10 border border-amber-500/30 px-3 py-1 text-xs font-black uppercase tracking-wider text-amber-900">
              <Sparkles className="h-3.5 w-3.5 text-amber-600 animate-pulse" />
              <span>SIMULASI ALUR OPERASIONAL BER-ANIMASI RESMI PLN</span>
            </div>
            <h3 className="text-2xl lg:text-3xl font-black text-[#0F172A] mt-1.5 tracking-tight">
              Standar Operasional Prosedur (SOP) Pergudangan PLN
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
              Pilih salah satu dari 3 alur operasional di bawah untuk melihat animasi interaktif tahap demi tahap, dokumen TUG sah, dan regulasi keselamatan K3.
            </p>
          </div>

          {/* Infographic Poster Direct Button */}
          <button
            type="button"
            onClick={() => {
              setLightboxZoom(1);
              setIsLightboxOpen(true);
            }}
            className="flex items-center gap-2 h-12 px-5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 active:scale-95 text-xs font-bold shadow-md transition shrink-0"
            title="Buka poster infografis resmi dalam resolusi tinggi"
          >
            <Maximize2 className="h-4 w-4 text-amber-400" />
            <span>Lihat Poster Infografis (Full HD)</span>
          </button>
        </div>

        {/* 3 Main Flow Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {SOP_FLOWS.map((flow) => {
            const isSelected = selectedFlowId === flow.id;
            return (
              <button
                key={flow.id}
                type="button"
                onClick={() => handleSelectFlow(flow.id)}
                className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-300 text-left ${
                  isSelected
                    ? 'bg-white shadow-lg border-current scale-[1.01]'
                    : 'bg-slate-50/80 border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300'
                }`}
                style={{
                  borderColor: isSelected ? flow.themeColor.primary : undefined,
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-black text-sm shadow-sm transition-transform"
                    style={{
                      backgroundColor: isSelected ? flow.themeColor.primary : '#E2E8F0',
                      color: isSelected ? '#FFFFFF' : '#475569',
                    }}
                  >
                    {flow.id === 'penerimaan' ? '📥' : flow.id === 'pengeluaran' ? '📤' : '🔄'}
                  </div>
                  <div className="min-w-0">
                    <span
                      className="text-[10px] font-black uppercase tracking-wider block"
                      style={{ color: isSelected ? flow.themeColor.accent : '#64748B' }}
                    >
                      {flow.badge}
                    </span>
                    <h4 className="text-sm font-black text-slate-900 truncate">{flow.shortTitle}</h4>
                  </div>
                </div>

                <div
                  className={`h-3 w-3 rounded-full shrink-0 transition-transform ${
                    isSelected ? 'scale-125' : 'bg-slate-300'
                  }`}
                  style={{
                    backgroundColor: isSelected ? flow.themeColor.primary : undefined,
                  }}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Interactive Animation Controller Dock */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status Badge & Auto-Play Status */}
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl text-white font-bold transition-transform ${
                isPlaying ? 'scale-105' : ''
              }`}
              style={{ backgroundColor: activeFlow.themeColor.primary }}
            >
              {isPlaying ? <Play className="h-5 w-5 fill-current animate-pulse" /> : <Pause className="h-5 w-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                  {isPlaying ? 'Simulasi Berjalan Otomatis' : 'Mode Penjelajahan Manual'}
                </span>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white uppercase"
                  style={{ backgroundColor: activeFlow.themeColor.accent }}
                >
                  Tahap {currentStepIndex + 1} dari {activeFlow.steps.length}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isPlaying
                  ? `Berpindah otomatis setiap ${playbackSpeed / 1000} detik. Tekan Jeda untuk menahan.`
                  : 'Sentuh salah satu langkah di bawah atau tekan tombol Putar untuk memulai simulasi.'}
              </p>
            </div>
          </div>

          {/* Controls: Play/Pause, Step Prev/Next, Speed, Sound */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Play / Pause Toggle Button */}
            <button
              type="button"
              onClick={() => {
                setIsPlaying(!isPlaying);
                playStepChime();
              }}
              className={`sop-touch-target flex items-center gap-2 px-4 rounded-xl text-xs font-black shadow transition active:scale-95 ${
                isPlaying
                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                  : 'bg-[#0284C7] hover:bg-sky-700 text-white'
              }`}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
              <span>{isPlaying ? 'Jeda Simulasi' : 'Mulai Animasi'}</span>
            </button>

            {/* Step Navigation Buttons */}
            <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1 shadow-xs">
              <button
                type="button"
                onClick={handlePrevStep}
                className="sop-touch-target flex h-9 w-9 items-center justify-center rounded-lg text-slate-700 hover:bg-white active:scale-90 transition"
                title="Langkah Sebelumnya"
                aria-label="Langkah Sebelumnya"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="sop-touch-target flex h-9 w-9 items-center justify-center rounded-lg text-slate-700 hover:bg-white active:scale-90 transition"
                title="Mulai Ulang dari Langkah 1"
                aria-label="Mulai Ulang dari Langkah 1"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="sop-touch-target flex h-9 w-9 items-center justify-center rounded-lg text-slate-700 hover:bg-white active:scale-90 transition"
                title="Langkah Selanjutnya"
                aria-label="Langkah Selanjutnya"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Speed Toggle (4s vs 2s) */}
            <button
              type="button"
              onClick={() => {
                setPlaybackSpeed((prev) => (prev === 4000 ? 2000 : 4000));
                playStepChime();
              }}
              className="sop-touch-target h-10 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold active:scale-95 shadow-xs transition"
              title="Kecepatan Transisi Animasi"
            >
              Speed: {playbackSpeed === 4000 ? '1x (4s)' : '2x (2s)'}
            </button>

            {/* Audio Feedback Toggle */}
            <button
              type="button"
              onClick={() => setIsSoundEnabled(!isSoundEnabled)}
              className={`sop-touch-target h-10 w-10 flex items-center justify-center rounded-xl border transition active:scale-95 shadow-xs ${
                isSoundEnabled
                  ? 'border-sky-300 bg-sky-50 text-sky-700'
                  : 'border-slate-200 bg-white text-slate-400'
              }`}
              title={isSoundEnabled ? 'Suara Aktif' : 'Suara Dimatikan'}
              aria-label={isSoundEnabled ? 'Suara Aktif' : 'Suara Dimatikan'}
            >
              {isSoundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Shimmering Progress Bar when playing */}
        {isPlaying && (
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full rounded-full sop-progress-shimmer transition-all duration-100"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: activeFlow.themeColor.primary,
              }}
            />
          </div>
        )}

        {/* 3. Step Progress Timeline / Wire */}
        <div className="pt-2 overflow-x-auto no-scrollbar pb-1">
          <div className="flex items-center min-w-max gap-2 sm:gap-3">
            {activeFlow.steps.map((step, idx) => {
              const isActive = currentStepIndex === idx;
              const isPast = currentStepIndex > idx;
              return (
                <React.Fragment key={step.stepNumber}>
                  {/* Step Node Button */}
                  <button
                    type="button"
                    onClick={() => handleJumpToStep(idx)}
                    className={`sop-touch-target flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-left transition-all duration-300 active:scale-95 ${
                      isActive
                        ? `${getThemeClass(selectedFlowId)} shadow-md font-black`
                        : isPast
                        ? 'border-slate-300 bg-slate-100/90 text-slate-700'
                        : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-black shrink-0 ${
                        isActive
                          ? 'bg-white text-slate-900 shadow-xs'
                          : isPast
                          ? 'bg-slate-300 text-slate-800'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {isPast ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : step.stepNumber}
                    </span>

                    <div className="min-w-0">
                      <span className="text-xs font-bold block truncate max-w-[130px] sm:max-w-[170px]">
                        {step.title}
                      </span>
                      {step.documentCode && (
                        <span className={`text-[10px] font-semibold block truncate max-w-[130px] sm:max-w-[170px] ${
                          isActive ? 'text-white/90' : 'text-slate-400'
                        }`}>
                          {step.documentCode}
                        </span>
                      )}
                    </div>
                  </button>

                  {/* Connecting Wire between steps */}
                  {idx < activeFlow.steps.length - 1 && (
                    <div className="flex items-center px-0.5 shrink-0">
                      <svg width="24" height="12" viewBox="0 0 24 12" className="overflow-visible">
                        <line
                          x1="0"
                          y1="6"
                          x2="24"
                          y2="6"
                          stroke={isPast || isActive ? activeFlow.themeColor.primary : '#CBD5E1'}
                          strokeWidth="2.5"
                          className={isActive || isPast ? 'sop-current-wire' : ''}
                        />
                      </svg>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Active Step Showcase & Infographic Live Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Active Step Details (7 Cols on desktop) */}
        <div className="lg:col-span-7 space-y-4">
          <div
            className="rounded-2xl border-2 p-6 bg-white shadow-md transition-all duration-300 relative overflow-hidden"
            style={{
              borderColor: activeFlow.themeColor.border,
            }}
          >
            {/* Step Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-md font-black text-xl shrink-0 sop-active-floating"
                  style={{ backgroundColor: activeFlow.themeColor.primary }}
                >
                  {renderStepIcon(activeStep.iconType, 26)}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase text-white shadow-2xs"
                      style={{ backgroundColor: activeFlow.themeColor.primary }}
                    >
                      LANGKAH {activeStep.stepNumber} DARI {activeFlow.totalSteps}
                    </span>
                    {activeStep.documentCode && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        📄 {activeStep.documentCode}
                      </span>
                    )}
                  </div>
                  <h4 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                    {activeStep.title}
                  </h4>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {activeStep.subtitle}
                  </span>
                </div>
              </div>

              <div className="hidden sm:flex flex-col items-end">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pelaksana</span>
                <span className="text-xs font-black text-slate-800 text-right max-w-[180px]">
                  {activeStep.role}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-4 mb-5">
              <p className="text-sm font-medium text-slate-700 leading-relaxed">
                {activeStep.description}
              </p>
            </div>

            {/* Key Action Checkpoints */}
            <div className="space-y-2.5 mb-5">
              <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Ketentuan Mutlak &amp; Tindakan Kunci:</span>
              </span>
              <ul className="space-y-2">
                {activeStep.keyPoints.map((point, pIdx) => (
                  <li
                    key={pIdx}
                    className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 bg-white rounded-lg p-2.5 border border-slate-100 shadow-2xs"
                  >
                    <span
                      className="h-5 w-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5 text-white"
                      style={{ backgroundColor: activeFlow.themeColor.primary }}
                    >
                      {pIdx + 1}
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Spotlight Hint & Navigation Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-1.5 text-slate-500">
                <Info className="h-4 w-4 text-amber-500 shrink-0" />
                <span>
                  <strong>Lokasi pada Diagram:</strong> {activeStep.spotlightHint}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  disabled={currentStepIndex === 0}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 active:scale-95 disabled:opacity-40"
                >
                  &larr; Sebelumnya
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-3.5 py-1.5 rounded-lg text-white font-bold active:scale-95 shadow-sm"
                  style={{ backgroundColor: activeFlow.themeColor.primary }}
                >
                  {currentStepIndex === activeFlow.steps.length - 1 ? 'Selesai / Ulang &rarr;' : 'Lanjut &rarr;'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Official Poster Infographic Interactive Viewer (5 Cols on desktop) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="sop-poster-frame group">
            {/* Image Preview */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900 cursor-pointer"
              onClick={() => {
                setLightboxZoom(1);
                setIsLightboxOpen(true);
              }}
            >
              <img
                src={activeFlow.infographicImg}
                alt={activeFlow.infographicAlt}
                className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                loading="eager"
              />

              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

              {/* Top Banner Tag */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-white/20 text-white text-[11px] font-bold backdrop-blur-md">
                  <Eye className="h-3.5 w-3.5 text-amber-400" />
                  <span>Infografis Resmi PLN</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/90 text-slate-950 text-[10px] font-black uppercase shadow-xs">
                  Tahap {activeStep.stepNumber} Aktif
                </span>
              </div>

              {/* Bottom Click to Zoom Bar */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                <span className="text-xs font-bold text-white drop-shadow-md">
                  Ketuk untuk memperbesar layar penuh
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur-md text-white border border-white/30 group-hover:bg-amber-400 group-hover:text-slate-950 transition-colors">
                  <Maximize2 className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Poster Details Bar */}
            <div className="p-4 bg-slate-950 text-white flex items-center justify-between gap-3 border-t border-slate-800">
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                  Diagram Alur Resmi 2.5K
                </span>
                <h5 className="text-xs sm:text-sm font-black truncate">{activeFlow.title}</h5>
              </div>
              <button
                type="button"
                onClick={() => {
                  setLightboxZoom(1);
                  setIsLightboxOpen(true);
                }}
                className="h-9 px-3.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold shadow active:scale-95 transition shrink-0"
              >
                Perbesar
              </button>
            </div>
          </div>

          {/* Quick Guidance Box */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-600 flex items-start gap-2.5">
            <span className="text-base">💡</span>
            <p>
              <strong>Petunjuk Kiosk:</strong> Diagram di atas dapat dizoom dan digeser secara bebas. Gunakan tombol <em>Mulai Animasi</em> untuk presentasi otomatis alur kerja di hadapan staf atau inspeksi audit PLN.
            </p>
          </div>
        </div>
      </div>

      {/* 5. Lightbox Modal for Full Screen High-Res Infographic */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-3 sm:p-6 overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Tampilan Penuh Infografis SOP PLN"
        >
          <div className="sop-lightbox-content flex flex-col h-full w-full max-w-6xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden">
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950 shrink-0">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400 text-slate-950 font-black text-sm">
                  PLN
                </span>
                <div>
                  <h4 className="text-sm sm:text-base font-black text-white">{activeFlow.title}</h4>
                  <span className="text-xs text-slate-400">
                    Infografis Alur Standar Operasional Prosedur • PT PLN (Persero)
                  </span>
                </div>
              </div>

              {/* Zoom Controls & Close */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setLightboxZoom((z) => Math.max(0.75, z - 0.25))}
                  className="sop-touch-target flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 active:scale-95"
                  title="Perkecil"
                  aria-label="Perkecil"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <span className="text-xs font-mono text-slate-300 w-12 text-center">
                  {Math.round(lightboxZoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setLightboxZoom((z) => Math.min(2.5, z + 0.25))}
                  className="sop-touch-target flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 active:scale-95"
                  title="Perbesar"
                  aria-label="Perbesar"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setLightboxZoom(1)}
                  className="sop-touch-target h-9 px-2.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-bold active:scale-95"
                  title="Reset Zoom"
                >
                  100%
                </button>

                <div className="h-6 w-[1px] bg-slate-700 mx-1" />

                <button
                  type="button"
                  onClick={() => setIsLightboxOpen(false)}
                  className="sop-touch-target flex h-9 w-9 items-center justify-center rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white active:scale-95"
                  title="Tutup (Esc)"
                  aria-label="Tutup"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Image Body (Scrollable & Zoomable) */}
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-950/60 no-scrollbar">
              <div
                className="transition-transform duration-200 ease-out origin-center"
                style={{ transform: `scale(${lightboxZoom})` }}
              >
                <img
                  src={activeFlow.infographicImg}
                  alt={activeFlow.infographicAlt}
                  className="max-h-[82vh] max-w-full rounded-xl object-contain shadow-2xl border border-slate-700"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
              <span>Gunakan kontrol zoom untuk meneliti detail setiap formulir TUG dan ikon prosedur.</span>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold"
              >
                Kembali ke Alur
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
