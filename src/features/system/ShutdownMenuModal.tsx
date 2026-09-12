import React, { useState, useEffect, useRef } from 'react';
import { Power, RotateCw, LogOut, X, AlertTriangle, Monitor } from 'lucide-react';

interface ShutdownMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ActionType = 'shutdown' | 'restart' | 'exit' | null;

export const ShutdownMenuModal: React.FC<ShutdownMenuModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [pendingAction, setPendingAction] = useState<ActionType>(null);
  const [countdown, setCountdown] = useState<number>(5);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setPendingAction(null);
      setCountdown(5);
      setStatusMessage(null);
      setIsProcessing(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [isOpen]);

  useEffect(() => {
    if (pendingAction && countdown > 0 && !isProcessing) {
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            executeAction(pendingAction);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [pendingAction, isProcessing]);

  const handleSelectAction = (action: ActionType) => {
    setPendingAction(action);
    setCountdown(5);
  };

  const handleCancelAction = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPendingAction(null);
    setCountdown(5);
  };

  const executeAction = async (action: ActionType) => {
    if (!action) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setIsProcessing(true);
    let endpoint = '';
    let msg = '';

    if (action === 'shutdown') {
      endpoint = '/api/system/shutdown';
      msg = 'Mematikan komputer Windows...';
    } else if (action === 'restart') {
      endpoint = '/api/system/restart';
      msg = 'Memulai ulang (restart) komputer...';
    } else if (action === 'exit') {
      endpoint = '/api/system/exit-kiosk';
      msg = 'Menutup layar Kiosk ke Desktop Windows...';
    }

    setStatusMessage(msg);

    try {
      await fetch(endpoint, { method: 'POST' });
    } catch {
      // Offline fallback
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="shutdown-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm select-none"
    >
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600 border border-red-100">
              <Power className="h-6 w-6" />
            </div>
            <div>
              <h2 id="shutdown-modal-title" className="text-xl font-bold text-slate-900">
                Menu Daya & Keluar Kiosk
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Komputer Terminal Mandiri PLN UP3 Malang
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            aria-label="Tutup"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        {!pendingAction ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-slate-600 font-medium">
              Pilih tindakan yang ingin dijalankan pada komputer Kiosk ini:
            </p>

            {/* Option 1: Shutdown */}
            <button
              onClick={() => handleSelectAction('shutdown')}
              className="flex items-center gap-4 rounded-xl border-2 border-red-100 bg-red-50/50 p-4 text-left transition hover:bg-red-50 hover:border-red-300 active:scale-[0.98] group"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-600 text-white shadow-sm group-hover:scale-105 transition">
                <Power className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-red-950 text-base">Matikan Komputer (Shutdown)</h3>
                <p className="text-xs text-red-800/80 mt-0.5">
                  Menutup seluruh program dan mematikan daya komputer secara aman.
                </p>
              </div>
            </button>

            {/* Option 2: Restart */}
            <button
              onClick={() => handleSelectAction('restart')}
              className="flex items-center gap-4 rounded-xl border-2 border-amber-100 bg-amber-50/50 p-4 text-left transition hover:bg-amber-50 hover:border-amber-300 active:scale-[0.98] group"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm group-hover:scale-105 transition">
                <RotateCw className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-amber-950 text-base">Mulai Ulang (Restart)</h3>
                <p className="text-xs text-amber-800/80 mt-0.5">
                  Memulai ulang sistem operasi Windows untuk penyegaran memori.
                </p>
              </div>
            </button>

            {/* Option 3: Exit Kiosk to Desktop */}
            <button
              onClick={() => handleSelectAction('exit')}
              className="flex items-center gap-4 rounded-xl border-2 border-slate-200 bg-slate-50/70 p-4 text-left transition hover:bg-slate-100 hover:border-slate-300 active:scale-[0.98] group"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-700 text-white shadow-sm group-hover:scale-105 transition">
                <LogOut className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Keluar ke Desktop Windows</h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Menutup layar kiosk agar petugas dapat mengakses desktop Windows.
                </p>
              </div>
            </button>
          </div>
        ) : (
          /* Confirmation step with countdown */
          <div className="flex flex-col items-center text-center p-5 rounded-xl bg-slate-50 border border-slate-200 gap-4">
            <div className={`flex h-16 w-16 items-center justify-center rounded-full ${
              pendingAction === 'shutdown' ? 'bg-red-100 text-red-600' :
              pendingAction === 'restart' ? 'bg-amber-100 text-amber-600' :
              'bg-slate-200 text-slate-700'
            }`}>
              {pendingAction === 'shutdown' && <Power className="h-8 w-8 animate-pulse" />}
              {pendingAction === 'restart' && <RotateCw className="h-8 w-8 animate-spin" />}
              {pendingAction === 'exit' && <LogOut className="h-8 w-8" />}
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {pendingAction === 'shutdown' && 'Konfirmasi Matikan Komputer'}
                {pendingAction === 'restart' && 'Konfirmasi Mulai Ulang (Restart)'}
                {pendingAction === 'exit' && 'Konfirmasi Keluar ke Desktop'}
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Tindakan akan otomatis dijalankan dalam{' '}
                <span className="font-bold text-red-600 text-lg">{countdown}</span> detik.
              </p>
            </div>

            {statusMessage ? (
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700 bg-emerald-50 px-4 py-2.5 rounded-lg border border-emerald-200">
                <AlertTriangle className="h-4 w-4" />
                <span>{statusMessage}</span>
              </div>
            ) : (
              <div className="flex items-center gap-3 w-full mt-2">
                <button
                  onClick={handleCancelAction}
                  disabled={isProcessing}
                  className="flex-1 h-12 rounded-xl border border-slate-300 bg-white font-bold text-sm text-slate-700 hover:bg-slate-100 transition active:scale-95"
                >
                  Batal
                </button>
                <button
                  onClick={() => executeAction(pendingAction)}
                  disabled={isProcessing}
                  className={`flex-1 h-12 rounded-xl font-bold text-sm text-white shadow-md transition active:scale-95 ${
                    pendingAction === 'shutdown'
                      ? 'bg-red-600 hover:bg-red-700'
                      : pendingAction === 'restart'
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-slate-800 hover:bg-slate-900'
                  }`}
                >
                  {pendingAction === 'shutdown' && 'Ya, Matikan Sekarang'}
                  {pendingAction === 'restart' && 'Ya, Restart Sekarang'}
                  {pendingAction === 'exit' && 'Ya, Keluar Kiosk'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Footer info */}
        <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Monitor className="h-3.5 w-3.5" />
            <span>Kassen WK-215 (Hardware Kiosk)</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 font-medium"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
