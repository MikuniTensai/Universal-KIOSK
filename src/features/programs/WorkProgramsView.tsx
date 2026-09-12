import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  ArrowLeft,
  FileText,
  AlertTriangle,
  ShieldCheck,
  Maximize2,
  X,
  ZoomIn,
  ZoomOut,
  Boxes,
  LayoutGrid,
  ClipboardCheck,
  Users,
  HardHat,
  Hand,
  HeartHandshake,
  FileCheck,
} from 'lucide-react';
import { AnimatedSopExplorer } from './AnimatedSopExplorer';
import budaya5sImg from '../../assets/cards/budaya_5s.webp';
import safetyLeaderImg from '../../assets/cards/safety_leader.webp';

interface WorkProgramsViewProps {
  onBack: () => void;
}

const SAFETY_LEADER_DATA = [
  {
    num: '1',
    title: 'PATUHI SOP',
    slogan: 'Kerja Aman Hasil Optimal',
    desc: 'Laksanakan seluruh tahapan penanganan material (penerimaan, penyimpanan, dan pengeluaran) secara disiplin tanpa jalan pintas demi mencegah insiden fatal.',
    icon: ClipboardCheck,
  },
  {
    num: '2',
    title: 'PATUHI INSTRUKSI KERJA',
    slogan: 'Kerja Sesuai Aturan Cegah Risiko',
    desc: 'Pahami lembar instruksi kerja (IK) sebelum mengoperasikan alat berat, handling material tegangan tinggi, atau manuver forklift di lorong rak.',
    icon: FileCheck,
  },
  {
    num: '3',
    title: 'PAKAI APD',
    slogan: 'Alat Pelindung Diri Melindungi Kita',
    desc: 'Wajib mengenakan APD lengkap: Helm Safety SNI, Rompi Reflektif High-Vis, dan Safety Shoes bersol baja sebelum melangkahkan kaki ke area gudang.',
    icon: HardHat,
  },
  {
    num: '4',
    title: 'PAKAI SARUNG TANGAN SAFETY',
    slogan: 'Tangan Aman Kerja Nyaman',
    desc: 'Lindungi jari dan telapak tangan dari goresan drum kabel, tepi plat trafo tajam, serpihan konduktor tembaga, maupun bahan kimia oli trafo.',
    icon: Hand,
  },
  {
    num: '5',
    title: 'KERJA SAMA TIM & BERDOA',
    slogan: 'Bersama Lebih Kuat Selamat Berkarya',
    desc: 'Jaga komunikasi aktif dan saling mengingatkan potensi bahaya (safety buddy), serta awali setiap aktivitas dengan doa bersama demi keselamatan bersama.',
    icon: HeartHandshake,
  },
];

const FIVE_S_DATA = [
  {
    num: '1',
    name: 'SEIRI',
    indonesian: 'RINGKAS',
    slogan: 'Memilah barang yang perlu dan tidak perlu',
    desc: 'Memisahkan barang yang diperlukan dan menyingkirkan material tidak terpakai dari tempat kerja, lorong lintasan forklift, dan area rak penyimpanan.',
    icon: Boxes,
  },
  {
    num: '2',
    name: 'SEITON',
    indonesian: 'RAPI',
    slogan: 'Menata barang dengan teratur sesuai tempatnya',
    desc: 'Menempatkan material pada lokasi pasti (Blok, Rak, Sub-Rak) dengan identitas label visual yang jelas agar cepat ditemukan saat dibutuhkan.',
    icon: LayoutGrid,
  },
  {
    num: '3',
    name: 'SEISO',
    indonesian: 'RESIK',
    slogan: 'Membersihkan area kerja & peralatan',
    desc: 'Membersihkan tempat kerja, lantai gudang, dan sarana kerja sehingga lingkungan operasional senantiasa bersih, higienis, dan bebas dari bahaya ceceran kotoran.',
    icon: Sparkles,
  },
  {
    num: '4',
    name: 'SEIKETSU',
    indonesian: 'RAWAT',
    slogan: 'Menjaga standar kebersihan & kerapihan secara konsisten',
    desc: 'Memelihara dan mempertahankan standar kebersihan serta kerapihan (Ringkas, Rapi, Resik) secara konsisten dengan checklist dan marka visual.',
    icon: ClipboardCheck,
  },
  {
    num: '5',
    name: 'SHITSUKE',
    indonesian: 'RAJIN',
    slogan: 'Membiasakan disiplin & membudayakan 5S',
    desc: 'Membiasakan seluruh insan logistik untuk mematuhi aturan kerja dan membudayakan 5S atas inisiatif mandiri demi keunggulan operasional bersama.',
    icon: Users,
  },
];

export const WorkProgramsView: React.FC<WorkProgramsViewProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'sop' | 'k3' | '5s'>('sop');
  const [isPosterLightboxOpen, setIsPosterLightboxOpen] = useState(false);
  const [posterZoom, setPosterZoom] = useState(1);
  const [isSafetyLightboxOpen, setIsSafetyLightboxOpen] = useState(false);
  const [safetyZoom, setSafetyZoom] = useState(1);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsPosterLightboxOpen(false);
        setIsSafetyLightboxOpen(false);
      }
    };
    if (isPosterLightboxOpen || isSafetyLightboxOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPosterLightboxOpen, isSafetyLightboxOpen]);

  const tabs = [
    { id: 'sop', label: 'SOP Masuk & Keluar Material', icon: FileText },
    { id: 'k3', label: 'Aturan K3 & Keselamatan Kerja', icon: ShieldAlert },
    { id: '5s', label: 'Standar 5S Pergudangan', icon: Sparkles },
  ];

  return (
    <div className="flex flex-col min-h-full bg-[#F8FAFC] p-6 lg:p-8 overflow-y-auto no-scrollbar">
      {/* Title & Back Button */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 shrink-0">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/30 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-amber-900 mb-1.5 shadow-2xs">
            <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
            <span>STANDAR OPERASIONAL PROSEDUR (SOP)</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-black text-[#0F172A] tracking-tight">
            SOP
          </h2>
          <p className="text-sm lg:text-base font-medium text-slate-500 mt-1">
            Panduan resmi Standar Operasional Prosedur pergudangan, alur logistik, keselamatan K3, dan kepatuhan 5S PLN.
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 shrink-0">
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
          <AnimatedSopExplorer autoPlay={true} />
        )}

        {/* TAB 2: ATURAN K3 & KESELAMATAN (SETIAP PRIBADI ADALAH SAFETY LEADER) */}
        {activeTab === 'k3' && (
          <div className="space-y-6">
            {/* Header Tab K3 */}
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-5">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-rose-950 text-white px-3.5 py-1 text-xs font-black uppercase tracking-wider shadow-sm mb-1.5 border border-rose-800">
                  <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
                  <span>KESELAMATAN &amp; KESEHATAN KERJA (K3) &bull; BUDAYA SAFETY PLN</span>
                </div>
                <h3 className="text-2xl lg:text-3xl font-black text-[#0F172A] tracking-tight">
                  Aturan Mutlak Keselamatan Kerja di Area Gudang Logistik PLN
                </h3>
                <p className="text-sm text-slate-600 mt-1 max-w-3xl">
                  Zero Accident adalah komitmen utama kita bersama. Tidak ada pekerjaan yang begitu penting sehingga mengabaikan keselamatan.
                </p>
              </div>

              {/* Action Button: Lightbox Modal K3 */}
              <button
                type="button"
                onClick={() => {
                  setSafetyZoom(1);
                  setIsSafetyLightboxOpen(true);
                }}
                className="flex items-center gap-2.5 h-12 px-5 rounded-xl bg-[#002D62] text-white hover:bg-blue-900 active:scale-95 text-xs font-black shadow-md transition shrink-0 border border-blue-400/30 cursor-pointer"
                title="Buka poster resmi Safety Leader K3 dalam resolusi tinggi"
              >
                <Maximize2 className="h-4 w-4 text-amber-400" />
                <span>Lihat Poster K3 (Full HD)</span>
              </button>
            </div>

            {/* Slogan Banner Resmikan Safety Leader */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0284C7] via-[#002D62] to-[#0F172A] p-6 text-white shadow-lg border-2 border-sky-400/30">
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
                <div>
                  <span className="text-xs font-black uppercase tracking-widest text-amber-300">
                    KOMITMEN KESELAMATAN KERJA INSAN LOGISTIK PLN
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
                    SETIAP PRIBADI ADALAH SAFETY LEADER
                  </h3>
                  <div className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-full bg-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-md">
                    <span>&ldquo;Ketaatan adalah Ibu dari kesuksesan dan merupakan kunci dari keselamatan&rdquo;</span>
                  </div>
                </div>

                {/* Direct Button to open full poster */}
                <button
                  type="button"
                  onClick={() => {
                    setSafetyZoom(1);
                    setIsSafetyLightboxOpen(true);
                  }}
                  className="flex items-center gap-2 h-12 px-5 rounded-xl bg-white text-[#002D62] hover:bg-amber-400 hover:text-slate-950 active:scale-95 text-xs font-black shadow-md transition shrink-0 cursor-pointer"
                >
                  <Maximize2 className="h-4 w-4 text-[#002D62]" />
                  <span>Perbesar Poster K3</span>
                </button>
              </div>
            </div>

            {/* Poster Landscape Preview Card */}
            <div
              onClick={() => {
                setSafetyZoom(1);
                setIsSafetyLightboxOpen(true);
              }}
              className="group relative rounded-2xl overflow-hidden border-2 border-slate-700/60 bg-[#081C33] shadow-xl cursor-pointer hover:border-amber-400 transition-all duration-300"
            >
              <div className="relative aspect-[16/8] sm:aspect-[16/7] w-full overflow-hidden bg-slate-950 flex items-center justify-center">
                <img
                  src={safetyLeaderImg}
                  alt="Poster Setiap Pribadi Adalah Safety Leader PLN"
                  className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-102"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                <div className="absolute bottom-4 inset-x-6 flex flex-wrap items-center justify-between gap-2 text-white">
                  <span className="text-xs font-bold text-slate-200 drop-shadow">
                    Poster Resmi K3 PT PLN (Persero) &bull; Safety Leader
                  </span>
                  <div className="flex items-center gap-2 rounded-lg bg-amber-400 text-slate-950 px-3.5 py-1.5 text-xs font-black shadow group-hover:scale-105 transition-transform">
                    <Maximize2 className="h-3.5 w-3.5" />
                    <span>Ketuk untuk Perbesar Poster (Full HD)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 5 Safety Leader Pillar Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {SAFETY_LEADER_DATA.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.num}
                    className="flex flex-col justify-between p-4.5 rounded-2xl bg-[#081C33] border-2 border-slate-700/60 shadow-md hover:border-amber-400 hover:shadow-xl transition-all duration-200 text-left"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40">
                          PILAR {item.num}
                        </span>
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#002D62] text-amber-400 border border-blue-400/30">
                          <Icon className="h-5 w-5" />
                        </div>
                      </div>
                      <h4 className="text-base font-black text-white leading-tight">
                        {item.title}
                      </h4>
                      <p className="text-xs font-black text-amber-400 mt-1">
                        {item.slogan}
                      </p>
                      <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Detail Wajib APD & Prosedur Darurat */}
            <div className="grid md:grid-cols-2 gap-6 pt-2">
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

        {/* TAB 3: STANDAR 5S PERGUDANGAN (BUDAYA 5S GUDANG ARIS MUNANDAR) */}
        {activeTab === '5s' && (
          <div className="space-y-6">
            {/* Header Tab 5S */}
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-5">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[#002D62] text-white px-3.5 py-1 text-xs font-black uppercase tracking-wider shadow-sm mb-1.5 border border-blue-400/30">
                  <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                  <span>BUDAYA 5S &bull; GUDANG ARIS MUNANDAR</span>
                </div>
                <h3 className="text-2xl lg:text-3xl font-black text-[#0F172A] tracking-tight">
                  Penerapan Budaya 5S Gudang Aris Munandar
                </h3>
                <p className="text-sm text-slate-600 mt-1 max-w-3xl">
                  Standar kebersihan, keteraturan, dan kedisiplinan resmi Danantara Indonesia &amp; PT PLN (Persero) di lingkungan Gudang Aris Munandar.
                </p>
              </div>

              {/* Action Button: Lightbox Modal */}
              <button
                type="button"
                onClick={() => {
                  setPosterZoom(1);
                  setIsPosterLightboxOpen(true);
                }}
                className="flex items-center gap-2.5 h-12 px-5 rounded-xl bg-[#002D62] text-white hover:bg-blue-900 active:scale-95 text-xs font-black shadow-md transition shrink-0 border border-blue-400/30 cursor-pointer"
                title="Buka poster resmi Budaya 5S dalam resolusi tinggi"
              >
                <Maximize2 className="h-4 w-4 text-amber-400" />
                <span>Lihat Poster Resmi (Full HD)</span>
              </button>
            </div>

            {/* Layout: Poster Standing Banner (Left) + 5 Cultural Pillars (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Poster Standing Banner Showcase */}
              <div className="lg:col-span-4 xl:col-span-4 flex flex-col items-center">
                <div
                  onClick={() => {
                    setPosterZoom(1);
                    setIsPosterLightboxOpen(true);
                  }}
                  className="group relative w-full max-w-sm rounded-2xl overflow-hidden border-2 border-slate-700/50 bg-[#081C33] shadow-xl cursor-pointer transition-all duration-300 hover:shadow-2xl hover:border-amber-400 hover:scale-[1.01]"
                >
                  {/* Poster Image Container */}
                  <div className="relative aspect-[9/20] w-full overflow-hidden bg-slate-950 flex items-center justify-center">
                    <img
                      src={budaya5sImg}
                      alt="Budaya 5S Gudang Aris Munandar"
                      className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-75 group-hover:opacity-90 transition-opacity" />

                    {/* Interactive Badge on Hover */}
                    <div className="absolute bottom-4 inset-x-4 flex items-center justify-center gap-2 rounded-xl bg-amber-400 text-slate-950 py-3 px-4 font-black text-xs shadow-lg transition-transform group-hover:scale-105">
                      <Maximize2 className="h-4 w-4" />
                      <span>Ketuk untuk Perbesar Poster</span>
                    </div>
                  </div>

                  {/* Caption Bar */}
                  <div className="p-3.5 bg-[#081C33] border-t border-slate-800 text-center">
                    <p className="text-xs font-bold text-white tracking-wide">
                      X-Banner Resmi Budaya 5S
                    </p>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Danantara Indonesia &bull; PT PLN (Persero)
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: 5 Pillars List */}
              <div className="lg:col-span-8 xl:col-span-8 space-y-3">
                {FIVE_S_DATA.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.num}
                      className="group relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 lg:p-5 rounded-2xl bg-[#081C33] border-2 border-slate-700/60 shadow-md hover:border-amber-400 hover:shadow-xl transition-all duration-200"
                    >
                      {/* Left: Indicator & Title */}
                      <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                        {/* Number & Icon Badge */}
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#002D62] text-amber-400 border border-blue-400/30 shadow-inner group-hover:scale-105 transition-transform">
                          <Icon className="h-6 w-6" />
                        </div>

                        {/* Text Titles */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black uppercase px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40">
                              {item.num}. {item.name}
                            </span>
                            <span className="text-sm font-black text-slate-300 tracking-wider">
                              ({item.indonesian})
                            </span>
                          </div>
                          <h4 className="text-base sm:text-lg font-black text-white mt-1 leading-snug">
                            {item.slogan}
                          </h4>
                          <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                            {item.desc}
                          </p>
                        </div>
                      </div>

                      {/* Right: Yellow Accent Bar */}
                      <div className="hidden sm:block w-1.5 self-stretch bg-amber-400 rounded-full shrink-0 my-1" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* 5S POSTER HIGH-RESOLUTION LIGHTBOX MODAL */}
      {isPosterLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col"
          onClick={() => setIsPosterLightboxOpen(false)}
        >
          {/* Top Bar Controls */}
          <div
            className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="flex h-3 w-3 rounded-full bg-amber-400 animate-pulse" />
              <div>
                <h4 className="text-base sm:text-lg font-black text-white">
                  Poster Resmi Budaya 5S &bull; Gudang Aris Munandar
                </h4>
                <p className="text-xs text-slate-400">
                  Danantara Indonesia &bull; PT PLN (Persero)
                </p>
              </div>
            </div>

            {/* Zoom Controls & Close Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPosterZoom((z) => Math.max(0.6, Number((z - 0.2).toFixed(1))))}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition cursor-pointer"
                title="Perkecil (-)"
              >
                <ZoomOut className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => setPosterZoom(1)}
                className="h-10 px-3 rounded-lg bg-slate-800 text-white hover:bg-slate-700 text-xs font-bold transition cursor-pointer"
                title="Reset Ukuran (100%)"
              >
                {Math.round(posterZoom * 100)}%
              </button>
              <button
                type="button"
                onClick={() => setPosterZoom((z) => Math.min(2.5, Number((z + 0.2).toFixed(1))))}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition cursor-pointer"
                title="Perbesar (+)"
              >
                <ZoomIn className="h-5 w-5" />
              </button>
              <div className="h-6 w-px bg-slate-700 mx-1" />
              <button
                type="button"
                onClick={() => setIsPosterLightboxOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition font-bold cursor-pointer"
                title="Tutup (Esc)"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Scrollable / Zoomable Poster Viewport */}
          <div
            className="flex-1 overflow-auto p-4 sm:p-8 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                transform: `scale(${posterZoom})`,
                transformOrigin: 'top center',
                transition: 'transform 0.15s ease-out',
              }}
              className="max-w-md w-full shadow-2xl rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 my-auto"
            >
              <img
                src={budaya5sImg}
                alt="Poster Resmi Budaya 5S Gudang Aris Munandar"
                className="w-full h-auto block object-contain select-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* K3 SAFETY LEADER HIGH-RESOLUTION LIGHTBOX MODAL */}
      {isSafetyLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col"
          onClick={() => setIsSafetyLightboxOpen(false)}
        >
          {/* Top Bar Controls */}
          <div
            className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="flex h-3 w-3 rounded-full bg-amber-400 animate-pulse" />
              <div>
                <h4 className="text-base sm:text-lg font-black text-white">
                  Poster Resmi K3 &bull; Setiap Pribadi Adalah Safety Leader
                </h4>
                <p className="text-xs text-slate-400">
                  PT PLN (Persero) &bull; Keselamatan &amp; Kesehatan Kerja
                </p>
              </div>
            </div>

            {/* Zoom Controls & Close Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSafetyZoom((z) => Math.max(0.6, Number((z - 0.2).toFixed(1))))}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition cursor-pointer"
                title="Perkecil (-)"
              >
                <ZoomOut className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => setSafetyZoom(1)}
                className="h-10 px-3 rounded-lg bg-slate-800 text-white hover:bg-slate-700 text-xs font-bold transition cursor-pointer"
                title="Reset Ukuran (100%)"
              >
                {Math.round(safetyZoom * 100)}%
              </button>
              <button
                type="button"
                onClick={() => setSafetyZoom((z) => Math.min(2.5, Number((z + 0.2).toFixed(1))))}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition cursor-pointer"
                title="Perbesar (+)"
              >
                <ZoomIn className="h-5 w-5" />
              </button>
              <div className="h-6 w-px bg-slate-700 mx-1" />
              <button
                type="button"
                onClick={() => setIsSafetyLightboxOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition font-bold cursor-pointer"
                title="Tutup (Esc)"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Scrollable / Zoomable Poster Viewport */}
          <div
            className="flex-1 overflow-auto p-4 sm:p-8 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                transform: `scale(${safetyZoom})`,
                transformOrigin: 'top center',
                transition: 'transform 0.15s ease-out',
              }}
              className="max-w-4xl w-full shadow-2xl rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 my-auto"
            >
              <img
                src={safetyLeaderImg}
                alt="Poster Resmi K3 Safety Leader PLN"
                className="w-full h-auto block object-contain select-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
