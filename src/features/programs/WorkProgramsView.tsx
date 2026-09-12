import React, { useState } from 'react';
import { Target, Sparkles, ShieldAlert, CheckCircle2, ArrowLeft, FileText, AlertTriangle, ShieldCheck } from 'lucide-react';
import { AnimatedSopExplorer } from './AnimatedSopExplorer';

interface WorkProgramsViewProps {
  onBack: () => void;
}

export const WorkProgramsView: React.FC<WorkProgramsViewProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'sop' | 'k3' | '5s' | 'visi'>('sop');

  const tabs = [
    { id: 'sop', label: 'SOP Masuk & Keluar Material', icon: FileText },
    { id: 'k3', label: 'Aturan K3 & Keselamatan Kerja', icon: ShieldAlert },
    { id: '5s', label: 'Standar 5S Pergudangan', icon: Sparkles },
    { id: 'visi', label: 'Visi & KPI Logistik', icon: Target },
  ];

  return (
    <div className="flex flex-col min-h-full bg-[#F8FAFC] p-6 lg:p-8 overflow-y-auto no-scrollbar">
      {/* Title & Back Button */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 shrink-0">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/30 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-amber-900 mb-1.5 shadow-2xs">
            <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
            <span>STANDAR OPERASIONAL PROSEDUR &amp; ATURAN GUDANG PLN</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-black text-[#0F172A] tracking-tight">
            SOP &amp; Aturan: Program Kerja &amp; Tata Kelola Logistik PLN
          </h2>
          <p className="text-sm lg:text-base font-medium text-slate-500 mt-1">
            Panduan resmi prosedur operasional standar, tata tertib keselamatan K3, kepatuhan 5S, dan program kerja logistik terpadu.
          </p>
        </div>
        <button
          onClick={onBack}
          className="flex h-14 items-center gap-2 rounded-control bg-white border border-slate-200 px-6 text-base font-bold text-slate-700 shadow-sm active:scale-95 active:bg-slate-100 shrink-0 hover:border-amber-400"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Kembali</span>
        </button>
      </div>

      {/* Navigation Tabs (Min 56px touch target) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 shrink-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex h-16 items-center justify-center gap-2.5 rounded-control px-4 text-sm lg:text-base font-bold transition shadow-sm active:scale-95 ${
                isActive
                  ? 'bg-[#FACC15] text-[#0F172A] shadow-md border-2 border-amber-400'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="flex-1 rounded-card bg-white p-6 lg:p-8 shadow-sm border border-slate-200">
        {/* TAB 1: SOP MASUK & KELUAR MATERIAL (ANIMATED EXPLORER) */}
        {activeTab === 'sop' && (
          <AnimatedSopExplorer />
        )}

        {/* TAB 2: ATURAN K3 & KESELAMATAN */}
        {activeTab === 'k3' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs font-black uppercase tracking-wider text-rose-800 bg-rose-100/80 px-2.5 py-0.5 rounded-md border border-rose-300">
                KESELAMATAN &amp; KESEHATAN KERJA (K3)
              </span>
              <h3 className="text-2xl font-black text-[#0F172A] mt-2">
                Aturan Mutlak Keselamatan Kerja di Area Gudang Logistik PLN
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Zero Accident adalah komitmen utama kita bersama. Tidak ada pekerjaan yang begitu penting sehingga mengabaikan keselamatan.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-2xl bg-rose-50/70 p-6 border-2 border-rose-200">
                <h4 className="text-lg font-black text-rose-900 mb-3.5 flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-rose-600" />
                  <span>Aturan Wajib APD Masuk Area Gudang</span>
                </h4>
                <ul className="space-y-3 text-xs lg:text-sm text-rose-950 font-medium">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                    <span><strong>Helm Safety SNI/ANSI:</strong> Wajib dikenakan dan tali dagu terpasang kencang di seluruh zona gudang.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                    <span><strong>Safety Shoes Baja:</strong> Wajib bersol anti-slip dan memiliki steel toe cap penahan beban kejatuhan benda berat.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                    <span><strong>Rompi Reflektif (High-Vis):</strong> Wajib warna kuning/oranye menyala agar terlihat jelas oleh operator forklift.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                    <span><strong>Dilarang Merokok:</strong> Gudang menyimpan bahan mudah terbakar (isolasi kabel, oli trafo). Sanksi tegas diberlakukan.</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl bg-slate-50 p-6 border-2 border-slate-200">
                <h4 className="text-lg font-black text-slate-900 mb-3.5 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <span>Prosedur Darurat &amp; Titik Kumpul (Evakuasi)</span>
                </h4>
                <div className="space-y-3 text-xs lg:text-sm text-slate-700 leading-relaxed">
                  <p>
                    Jika terjadi gempa bumi, kebakaran, atau bunyi alarm sirine bahaya:
                  </p>
                  <ol className="list-decimal pl-4 space-y-2">
                    <li>Hentikan seketika operasi pengangkatan hoist trafo dan forklift.</li>
                    <li>Jangan panik. Segera ikuti garis jalur evakuasi hijau di lantai.</li>
                    <li>Berkumpul di <strong>Titik Kumpul (Assembly Point) Lapangan Parkir Depan</strong> untuk absensi darurat.</li>
                    <li>Hubungi posko K3 PLN Aris Munandar di line darurat internal: <strong>Ext. 112</strong>.</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: STANDAR 5S PERGUDANGAN */}
        {activeTab === '5s' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs font-black uppercase tracking-wider text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-md border border-amber-300">
                STANDAR TATA KELOLA FISIK
              </span>
              <h3 className="text-2xl font-black text-[#0F172A] mt-2">
                Penerapan Budaya 5S (Seiri, Seiton, Seiso, Seiketsu, Shitsuke)
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Kerapian fisik rak dan blok gudang mempercepat waktu penemuan material (retrieval time) hingga di bawah 3 menit.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-black uppercase text-amber-800 bg-amber-100 px-2 py-0.5 rounded">1. Seiri</span>
                <h4 className="text-base font-black text-slate-900 mt-2">Ringkas</h4>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Pilah material aktif dari barang afkir/rusak. Bersihkan lorong lintasan dari tumpukan kardus kosong.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-black uppercase text-amber-800 bg-amber-100 px-2 py-0.5 rounded">2. Seiton</span>
                <h4 className="text-base font-black text-slate-900 mt-2">Rapi</h4>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Setiap material memiliki alamat rak tetap. Label kode rak (misal Rak A-001) harus terbaca jelas dari jarak 2 meter.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-black uppercase text-amber-800 bg-amber-100 px-2 py-0.5 rounded">3. Seiso</span>
                <h4 className="text-base font-black text-slate-900 mt-2">Resik</h4>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Bersihkan ceceran oli atau serbuk isolasi setiap sore. Pastikan ruang bersih kalibrasi kWh meter selalu bebas debu.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-black uppercase text-amber-800 bg-amber-100 px-2 py-0.5 rounded">4. Seiketsu</span>
                <h4 className="text-base font-black text-slate-900 mt-2">Rawat</h4>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Pertahankan standar visual marka lantai kuning forklift dan batas tinggi tumpukan maksimal 3 susun.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-black uppercase text-amber-800 bg-amber-100 px-2 py-0.5 rounded">5. Shitsuke</span>
                <h4 className="text-base font-black text-slate-900 mt-2">Rajin</h4>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Disiplin harian seluruh personel logistik tanpa perlu diawasi. Lakukan briefing K3 5S setiap apel pagi.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: VISI & KPI LOGISTIK */}
        {activeTab === 'visi' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs font-black uppercase tracking-wider text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-md border border-amber-300">
                TARGET &amp; STRATEGI UTAMA
              </span>
              <h3 className="text-2xl font-black text-[#0F172A] mt-2">
                Visi, Misi &amp; Key Performance Indicators (KPI) Logistik
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Arah transformasi rantai pasok ketenagalistrikan nasional menuju World Class Logistics Provider.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-control bg-amber-50/50 p-6 border border-amber-200">
                <h4 className="text-lg font-bold text-amber-900 mb-3">Visi Logistik Terpadu</h4>
                <p className="text-slate-700 leading-relaxed">
                  Menjadi rantai pasok ketenagalistrikan yang andal, efisien, transparan, dan berstandar kelas dunia untuk mendukung keandalan listrik nasional tanpa padam.
                </p>
              </div>
              <div className="rounded-control bg-slate-50 p-6 border border-slate-200">
                <h4 className="text-lg font-bold text-slate-900 mb-3">Target KPI Utama</h4>
                <ul className="space-y-2 text-slate-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <span><strong>Zero Delay:</strong> Kesiapan material gangguan 100% tepat waktu</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <span><strong>Akurasi Stock Opname:</strong> Tingkat kesesuaian fisik ≥ 99.8%</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <span><strong>Zero Accident:</strong> Nihil kecelakaan kerja di seluruh area gudang</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
