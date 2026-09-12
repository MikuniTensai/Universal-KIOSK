import React, { useState } from 'react';
import { Target, Compass, Sparkles, ShieldAlert, CheckCircle2, ArrowLeft } from 'lucide-react';

interface WorkProgramsViewProps {
  onBack: () => void;
}

export const WorkProgramsView: React.FC<WorkProgramsViewProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'visi' | 'roadmap' | '5s' | 'k3'>('visi');

  const tabs = [
    { id: 'visi', label: 'Visi & KPI Logistik', icon: Target },
    { id: 'roadmap', label: 'Roadmap 2026', icon: Compass },
    { id: '5s', label: 'Standar 5S Gudang', icon: Sparkles },
    { id: 'k3', label: 'K3 & Keselamatan', icon: ShieldAlert },
  ];

  return (
    <div className="flex flex-col min-h-full bg-[#F8FAFC] p-8 overflow-y-auto no-scrollbar">
      {/* Title & Back Button */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h2 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Program Kerja & Tata Kelola Logistik PLN
          </h2>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Transparansi roadmap kerja, standar keselamatan, dan tata kelola material distribusi
          </p>
        </div>
        <button
          onClick={onBack}
          className="flex h-14 items-center gap-2 rounded-control bg-white border border-slate-200 px-6 text-base font-bold text-slate-700 shadow-sm active:scale-95 active:bg-slate-100 shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Kembali</span>
        </button>
      </div>

      {/* Navigation Tabs (Min 56px touch target) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 shrink-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex h-16 items-center justify-center gap-3 rounded-control px-4 text-base font-bold transition shadow-sm active:scale-95 ${
                isActive
                  ? 'bg-[#FACC15] text-[#0F172A] shadow-md border-2 border-amber-400'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className="h-6 w-6" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="flex-1 rounded-card bg-white p-8 shadow-sm border border-slate-200">
        {activeTab === 'visi' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-[#0F172A]">
              Visi, Misi & Key Performance Indicators (KPI)
            </h3>
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

        {activeTab === 'roadmap' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-[#0F172A]">
              Roadmap Digitalisasi Gudang Logistik 2026
            </h3>
            <div className="space-y-4">
              <div className="flex gap-4 p-4 rounded-control bg-slate-50 border border-slate-200">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FACC15] font-bold text-[#0F172A]">
                  Q1
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900">Digitalisasi Barcode 2D Material MDU</h4>
                  <p className="text-sm text-slate-600 mt-1">
                    Pemasangan barcode & QR code tahan cuaca pada seluruh Transformator, Isolator, FCO, dan Kabel MVTIC di area gudang.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-4 rounded-control bg-slate-50 border border-slate-200">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FACC15] font-bold text-[#0F172A]">
                  Q2
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900">Implementasi Terminal Kiosk Mandiri Kassen WK-215</h4>
                  <p className="text-sm text-slate-600 mt-1">
                    Penyediaan kios informasi interaktif di pos logistik untuk kemudahan cek lokasi rak dan spek teknis material oleh tim teknik lapangan.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-4 rounded-control bg-slate-50 border border-slate-200">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-300 font-bold text-slate-700">
                  Q3-Q4
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900">Integrasi Otomasi Stock Opname Digital Terpadu</h4>
                  <p className="text-sm text-slate-600 mt-1">
                    Penyelarasan data real-time dengan aplikasi mobile lapangan dan sistem ERP PLN pusat.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === '5s' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-[#0F172A]">
              Penerapan Standar 5S (Seiri, Seiton, Seiso, Seiketsu, Shitsuke)
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-5 rounded-control bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold uppercase text-amber-700">1. Seiri (Ringkas)</span>
                <h4 className="text-lg font-bold text-slate-900 mt-1">Pilah & Singkirkan</h4>
                <p className="text-sm text-slate-600 mt-2">
                  Pisahkan material layak pakai, rusak retur, dan limbah isolasi. Singkirkan barang yang tidak diperlukan dari jalur lintasan.
                </p>
              </div>
              <div className="p-5 rounded-control bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold uppercase text-amber-700">2. Seiton (Rapi)</span>
                <h4 className="text-lg font-bold text-slate-900 mt-1">Tata & Beri Label</h4>
                <p className="text-sm text-slate-600 mt-2">
                  Semua material ditaruh pada rak/bin yang memiliki kode alamat dan label barcode yang terlihat jelas.
                </p>
              </div>
              <div className="p-5 rounded-control bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold uppercase text-amber-700">3. Seiso (Resik)</span>
                <h4 className="text-lg font-bold text-slate-900 mt-1">Bersihkan Area</h4>
                <p className="text-sm text-slate-600 mt-2">
                  Lakukan pembersihan harian dari debu, ceceran oli trafo, atau potongan kabel guna mencegah risiko slip dan api.
                </p>
              </div>
              <div className="p-5 rounded-control bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold uppercase text-amber-700">4. Seiketsu (Rawat)</span>
                <h4 className="text-lg font-bold text-slate-900 mt-1">Standarisasi Tata Letak</h4>
                <p className="text-sm text-slate-600 mt-2">
                  Tetapkan standar penandaan garis kuning marka forklift dan batas tumpukan material maksimal 3 tingkat.
                </p>
              </div>
              <div className="p-5 rounded-control bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold uppercase text-amber-700">5. Shitsuke (Rajin)</span>
                <h4 className="text-lg font-bold text-slate-900 mt-1">Disiplin Berkelanjutan</h4>
                <p className="text-sm text-slate-600 mt-2">
                  Jadikan 5S sebagai kebiasaan kerja setiap pergantian shift dan sebelum penutupan gudang sore hari.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'k3' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-[#0F172A]">
              Pedoman Keselamatan & Kesehatan Kerja (K3)
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-control bg-rose-50 p-6 border border-rose-200">
                <h4 className="text-lg font-bold text-rose-900 mb-3 flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-rose-600" />
                  <span>Aturan Wajib Masuk Area Gudang</span>
                </h4>
                <ul className="space-y-2.5 text-sm text-rose-950 font-medium">
                  <li className="flex items-start gap-2">
                    <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>Wajib menggunakan Safety Helmet Full Brim berstandar SNI/ANSI.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>Wajib memakai Safety Shoes dengan toe-cap baja pelindung.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>Kenakan rompi reflektif berkilau tinggi (high-visibility vest).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>Dilarang merokok di seluruh area tertutup maupun terbuka gudang.</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-control bg-slate-50 p-6 border border-slate-200">
                <h4 className="text-lg font-bold text-slate-900 mb-3">Jalur Evakuasi & Titik Kumpul</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Apabila sirine bahaya berbunyi, segera tinggalkan pekerjaan dan ikuti marka garis hijau menuju <strong>Titik Kumpul (Assembly Point) Lapangan Parkir Depan</strong>. Jangan menggunakan lift barang saat terjadi gempa atau kebakaran.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
