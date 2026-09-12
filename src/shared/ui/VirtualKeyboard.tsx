import React from 'react';
import { Delete, X } from 'lucide-react';
import { playTouchClick } from '../utils/audioFeedback';

interface VirtualKeyboardProps {
  onKeyPress: (char: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  onClose: () => void;
  visible: boolean;
}

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  onKeyPress,
  onBackspace,
  onClear,
  onClose,
  visible,
}) => {
  if (!visible) return null;

  const rows = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-'],
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M', '/'],
  ];

  return (
    <div
      data-testid="virtual-keyboard"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#0F172A] p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] shadow-2xl transition-transform border-t-2 border-[#FACC15]"
    >
      <div className="mx-auto max-w-4xl">
        <div className="mb-2.5 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Keyboard Sentuh Kiosk
          </span>
          <button
            onClick={onClose}
            className="flex min-h-[38px] items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-slate-200 border border-slate-700 active:scale-95 transition-all"
          >
            <X className="h-4 w-4 text-amber-400" /> <span>Tutup</span>
          </button>
        </div>

        {/* Rows */}
        <div className="flex flex-col gap-2">
          {rows.map((row, rIdx) => (
            <div key={rIdx} className="flex justify-center gap-1.5">
              {row.map((char) => (
                <button
                  key={char}
                  onClick={() => {
                    playTouchClick();
                    onKeyPress(char);
                  }}
                  className="flex h-12 min-w-[44px] flex-1 items-center justify-center rounded-control bg-slate-800 text-base font-bold text-white shadow transition-all active:scale-95 active:bg-[#FACC15] active:text-[#0F172A]"
                >
                  {char}
                </button>
              ))}
            </div>
          ))}

          {/* Bottom Control Row */}
          <div className="flex justify-center gap-2 pt-1">
            <button
              onClick={() => {
                playTouchClick();
                onClear();
              }}
              className="flex h-12 flex-1 items-center justify-center rounded-control bg-rose-900/60 text-sm font-semibold text-rose-200 transition active:scale-95 active:bg-rose-700"
            >
              Hapus Semua
            </button>
            <button
              onClick={() => {
                playTouchClick();
                onKeyPress(' ');
              }}
              className="flex h-12 flex-[3] items-center justify-center rounded-control bg-slate-800 text-sm font-bold uppercase tracking-widest text-white transition active:scale-95 active:bg-[#FACC15] active:text-[#0F172A]"
            >
              Spasi
            </button>
            <button
              onClick={() => {
                playTouchClick();
                onBackspace();
              }}
              className="flex h-12 flex-1 items-center justify-center gap-1 rounded-control bg-slate-700 text-sm font-semibold text-white transition active:scale-95 active:bg-slate-600"
            >
              <Delete className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
