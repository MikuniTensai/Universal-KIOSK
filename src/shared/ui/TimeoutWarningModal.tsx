import React from 'react';
import { AlertCircle, ArrowRight } from 'lucide-react';

interface TimeoutWarningModalProps {
  visible: boolean;
  secondsRemaining: number;
  onContinue: () => void;
}

export const TimeoutWarningModal: React.FC<TimeoutWarningModalProps> = ({
  visible,
  secondsRemaining,
  onContinue,
}) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-card bg-white p-8 text-center shadow-2xl border-4 border-[#FACC15] animate-in fade-in zoom-in-95 duration-200">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <AlertCircle className="h-12 w-12" />
        </div>

        <h3 className="mb-2 text-2xl font-bold text-[#0F172A]">
          Apakah Anda Masih Menggunakan Kiosk?
        </h3>

        <p className="mb-6 text-base text-slate-600">
          Layar akan kembali ke mode awal demi keamanan dalam:
        </p>

        <div className="mb-8 inline-flex items-center justify-center rounded-full bg-amber-50 px-6 py-3 border-2 border-amber-300">
          <span className="text-4xl font-extrabold text-amber-700 font-mono">
            {secondsRemaining}
          </span>
          <span className="ml-2 text-base font-semibold text-amber-800">detik</span>
        </div>

        <button
          onClick={onContinue}
          className="flex h-16 w-full items-center justify-center gap-3 rounded-control bg-[#FACC15] text-lg font-bold text-[#0F172A] shadow-lg transition active:scale-95 active:bg-[#EAB308]"
        >
          <span>Ya, Lanjutkan Menggunakan</span>
          <ArrowRight className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};
