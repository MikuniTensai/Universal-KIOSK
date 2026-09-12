import React, { useState, useMemo } from 'react';
import { Search, X, Keyboard, PackageOpen, MapPin, MoreVertical, Check, ArrowLeft, Filter } from 'lucide-react';
import { ImportPackage, KioskConfig, MaterialWithStock } from '../../domain/types';
import { CatalogService } from './catalogService';
import { MaterialCard } from './MaterialCard';
import { MaterialDetailModal } from './MaterialDetailModal';
import { VirtualKeyboard } from '../../shared/ui/VirtualKeyboard';
import { getCategoryIcon } from '../../shared/utils/categoryIcons';

interface CatalogViewProps {
  pkg: ImportPackage;
  config: KioskConfig;
  mode?: 'baru' | 'return';
  onBack?: () => void;
  onNavigateToScan: () => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  pkg,
  config,
  mode = 'baru',
  onBack,
  onNavigateToScan,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCategoryMenu, setShowCategoryMenu] = useState<boolean>(false);
  const [selectedBlock, setSelectedBlock] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialWithStock | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState<boolean>(false);

  const searchResult = useMemo(() => {
    return CatalogService.searchMaterials(pkg, config, {
      query: searchQuery,
      categoryId: selectedCategory,
      blockCode: selectedBlock,
      condition: mode === 'return' ? 'RETURN' : 'BARU',
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
      pageSize: 200,
    });
  }, [pkg, pkg.packageHash, pkg.importedAt, pkg.sourceAt, pkg.materials,
    pkg.stockSnapshots, pkg.locations, pkg.categories, pkg.assets, pkg.barcodeAliases,
    config, config.staleAfterHours, config.warehouseCode, searchQuery, selectedCategory,
    selectedBlock, mode, selectedStatus]);

  const { materialsInMode, categoryCounts, statusCounts } = useMemo(() => {
    const materialsInMode = pkg.materials.filter(m => {
      const cond = m.condition || 'BARU';
      return mode === 'return' ? cond === 'RETURN' : cond === 'BARU';
    });
    const categoryCounts = new Map<string, number>();
    const statusCounts = new Map<string, number>();
    for (const material of materialsInMode) {
      categoryCounts.set(material.categoryId, (categoryCounts.get(material.categoryId) || 0) + 1);
      const status = (material.status || 'STANDBY').toUpperCase();
      statusCounts.set(status, (statusCounts.get(status) || 0) + 1);
    }
    return { materialsInMode, categoryCounts, statusCounts };
  }, [pkg, pkg.materials, pkg.packageHash, pkg.importedAt, config, mode]);

  const handleKeyPress = (char: string) => {
    setSearchQuery(prev => prev + char);
  };

  const handleBackspace = () => {
    setSearchQuery(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setSearchQuery('');
  };

  return (
    <div className="flex flex-col min-h-full bg-[#F8FAFC] p-4 sm:p-6 lg:p-8 overflow-y-auto no-scrollbar">
      {/* Top Header Title & Back Navigation */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3 shrink-0">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 active:scale-95 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Kembali</span>
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-xs font-black uppercase tracking-wide border ${
                mode === 'return'
                  ? 'bg-amber-100 text-amber-950 border-amber-300'
                  : 'bg-emerald-100 text-emerald-950 border-emerald-300'
              }`}>
                {mode === 'return' ? 'Katalog Material Return' : 'Katalog Material Baru'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#0F172A] tracking-tight mt-0.5">
              <span className="sr-only">
                {mode === 'return'
                  ? 'Daftar Item & Material Gudang (Katalog Blok & Rak Return)'
                  : 'Daftar Item & Material Gudang (Katalog Blok & Rak Baru)'}
              </span>
              <span aria-hidden="true">
                Daftar Item &amp; Material Gudang
                <span className="block text-lg sm:text-xl lg:text-2xl text-slate-700 font-extrabold mt-0.5">
                  {mode === 'return'
                    ? '(Katalog Blok & Rak Return)'
                    : '(Katalog Blok & Rak Baru)'}
                </span>
              </span>
            </h1>
          </div>
        </div>
      </div>

      {/* 4 Status Filter Bar Khusus Katalog Return */}
      {mode === 'return' && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar mb-4 shrink-0 text-xs">
          <span className="font-extrabold uppercase text-slate-500 whitespace-nowrap flex items-center gap-1.5 mr-1">
            <Filter className="h-3.5 w-3.5 text-amber-600" />
            Filter Status Return:
          </span>
          {[
            { id: 'all', label: 'Semua Status' },
            { id: 'GARANSI', label: 'GARANSI' },
            { id: 'PERBAIKAN', label: 'PERBAIKAN' },
            { id: 'USUL HAPUS', label: 'USUL HAPUS' },
            { id: 'STANDBY', label: 'STANDBY' },
          ].map(statusItem => {
            const isSelected = selectedStatus === statusItem.id;
            const count = statusItem.id === 'all'
              ? materialsInMode.length
              : statusCounts.get(statusItem.id) || 0;

            return (
              <button
                key={statusItem.id}
                onClick={() => setSelectedStatus(statusItem.id)}
                className={`flex h-10 items-center gap-2 rounded-xl px-4 font-black transition active:scale-95 shrink-0 border ${
                  isSelected
                    ? 'bg-[#0F172A] text-[#FACC15] border-slate-900 shadow-md scale-102'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-amber-400 hover:bg-amber-50/50'
                }`}
              >
                <span>{statusItem.label}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  isSelected ? 'bg-amber-400/20 text-[#FACC15]' : 'bg-slate-100 text-slate-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Top Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-5 shrink-0">
        {/* Search Input Box (Height 56px / 64px) */}
        <div className="relative flex-1 flex items-center">
          <div className="pointer-events-none absolute left-4 text-slate-400">
            <Search className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <input
            type="text"
            placeholder="Cari nama material, kode normalisasi SAP (misal: 4120470), rak, atau blok..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setKeyboardVisible(true)}
            className="h-14 sm:h-16 w-full rounded-control border border-slate-200 bg-white pl-12 sm:pl-14 pr-36 sm:pr-44 text-sm sm:text-base lg:text-lg font-medium text-[#0F172A] shadow-sm placeholder:text-slate-400 placeholder:truncate focus:border-[#FACC15] focus:outline-none focus:ring-4 focus:ring-[#FACC15]/20"
          />
          <div className="absolute right-3 flex items-center gap-1.5">
            {searchQuery && (
              <button
                onClick={handleClear}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 active:bg-slate-100"
                aria-label="Bersihkan pencarian"
              >
                <X className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={() => setKeyboardVisible(prev => !prev)}
              className={`flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-control transition active:scale-95 ${
                keyboardVisible ? 'bg-[#FACC15] text-[#0F172A]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              title="Keyboard Sentuh"
              aria-label="Tampilkan Keyboard Sentuh"
            >
              <Keyboard className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>

            {/* Titik 3 Filter by Category */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowCategoryMenu(prev => !prev)}
                className={`flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-control transition active:scale-95 ${
                  selectedCategory !== 'all'
                    ? 'bg-[#FACC15] text-[#0F172A] border-2 border-amber-500 font-bold shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                title="Filter Berdasarkan Kategori"
                aria-label="Filter berdasarkan kategori"
              >
                <MoreVertical className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>

              {showCategoryMenu && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setShowCategoryMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-72 max-w-[90vw] rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl z-40 animate-in fade-in zoom-in-95 duration-100 text-left">
                    <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Filter Kategori
                      </span>
                      <span className="text-xs bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-semibold">
                        {pkg.categories.length} Kategori
                      </span>
                    </div>
                    <div className="max-h-72 overflow-y-auto py-1 space-y-1">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCategory('all');
                          setShowCategoryMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-xl transition ${
                          selectedCategory === 'all'
                            ? 'bg-[#FACC15] text-[#0F172A] font-bold'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span>Semua Kategori</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs opacity-75">({materialsInMode.length})</span>
                          {selectedCategory === 'all' && <Check className="h-4 w-4" />}
                        </div>
                      </button>
                      {pkg.categories
                        .filter(cat => mode !== 'return' || categoryCounts.has(cat.id))
                        .map((cat) => {
                          const count = categoryCounts.get(cat.id) || 0;
                          const isSelected = selectedCategory === cat.id;
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => {
                                setSelectedCategory(cat.id);
                                setShowCategoryMenu(false);
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-xl transition ${
                                isSelected
                                  ? 'bg-[#FACC15] text-[#0F172A] font-bold'
                                  : 'text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              <span className="truncate pr-2">{cat.name}</span>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-xs opacity-75">({count})</span>
                                {isSelected && <Check className="h-4 w-4" />}
                              </div>
                            </button>
                          );
                        })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Location Shortcuts (Pencarian Cepat Berdasarkan Blok & Rak) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar mb-4 shrink-0 text-xs">
        <span className="font-extrabold uppercase text-slate-500 whitespace-nowrap">
          Pencarian Cepat Lokasi:
        </span>
        {[
          { label: '⚡ kWh Meter (Rak A-001)', query: 'Rak A-001' },
          { label: '📦 TRF Dudukan (1060798)', query: '1060798' },
          { label: '⚡ MCB 10A (Rak A11)', query: 'A11' },
          { label: '🔌 Cable Shoe 150mm² (Rak H12)', query: 'H12' },
          { label: '⚡ Box 105 kVA (4120470)', query: '4120470' },
          { label: '📦 kWh Meter E-PR (Rak C11)', query: 'C11' },
          { label: '⚡ Fuse Link 20kV (Rak I13)', query: 'I13' },
          { label: '📦 Kabel NFA2X (3110542)', query: '3110542' },
          { label: '🔌 Trafo 160kVA (1030075)', query: '1030075' },
          { label: '⚡ NH Fuse 125A (2240029)', query: '2240029' },
          { label: '🦺 Tang K3 (202608)', query: '202608' },
        ].map((item, idx) => (
          <button
            key={idx}
            onClick={() => setSearchQuery(item.query)}
            className="flex min-h-[38px] items-center rounded-full bg-white border border-slate-200 px-3.5 font-bold text-slate-700 shadow-2xs hover:border-[#FACC15] hover:bg-amber-50 active:scale-95 transition whitespace-nowrap"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Category Filter Chips Bar */}
      <div className="flex gap-2.5 overflow-x-auto pb-3 pt-1 no-scrollbar mb-6 shrink-0">
        {(() => {
          const AllIcon = getCategoryIcon('all');
          const isAllSelected = selectedCategory === 'all';
          return (
            <button
              onClick={() => setSelectedCategory('all')}
              className={`flex h-14 shrink-0 items-center justify-center gap-2.5 rounded-control px-6 text-sm font-bold transition shadow-sm active:scale-95 ${
                isAllSelected
                  ? 'bg-[#FACC15] text-[#0F172A] border-2 border-amber-400 shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <AllIcon className={`h-4 w-4 ${isAllSelected ? 'text-[#0F172A]' : 'text-amber-600'}`} />
              <span>Semua Kategori</span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${isAllSelected ? 'bg-amber-400/60 text-[#0F172A]' : 'bg-slate-100 text-slate-500'}`}>
                {materialsInMode.length}
              </span>
            </button>
          );
        })()}

        {pkg.categories
          .filter(cat => mode !== 'return' || categoryCounts.has(cat.id))
          .map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const count = categoryCounts.get(cat.id) || 0;
            const CatIcon = getCategoryIcon(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex h-14 shrink-0 items-center justify-center gap-2.5 rounded-control px-6 text-sm font-bold transition shadow-sm active:scale-95 ${
                  isSelected
                    ? 'bg-[#FACC15] text-[#0F172A] border-2 border-amber-400 shadow-md'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <CatIcon className={`h-4 w-4 ${isSelected ? 'text-[#0F172A]' : 'text-amber-600'}`} />
                <span>{cat.name}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${isSelected ? 'bg-amber-400/60 text-[#0F172A]' : 'bg-slate-100 text-slate-500'}`}>
                  {count}
                </span>
              </button>
            );
          })}
      </div>

      {/* Block A-Z Filter Selector Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar mb-5 shrink-0 text-xs">
        <span className="font-extrabold uppercase text-slate-500 whitespace-nowrap flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5 text-amber-600" />
          Filter Blok Gudang:
        </span>
        <button
          onClick={() => setSelectedBlock('all')}
          className={`h-9 px-3.5 rounded-full font-bold transition shrink-0 ${
            selectedBlock === 'all'
              ? 'bg-[#0F172A] text-[#FACC15]'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Semua Blok
        </button>
        {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((blockLetter) => {
          const isBlockSelected = selectedBlock === blockLetter;
          return (
            <button
              key={blockLetter}
              onClick={() => setSelectedBlock(isBlockSelected ? 'all' : blockLetter)}
              className={`h-9 px-3.5 rounded-full font-mono font-bold transition shrink-0 border ${
                isBlockSelected
                  ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-xs scale-105'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-amber-400'
              }`}
            >
              BLOK {blockLetter}
            </button>
          );
        })}
      </div>

      {/* Results Count */}
      <div className="mb-4 flex items-center justify-between text-sm text-slate-500 font-medium shrink-0">
        <span>Menampilkan {searchResult.items.length} dari total {searchResult.total} material</span>
      </div>

      {/* Material Grid */}
      {searchResult.items.length === 0 ? (
        <div className="my-auto flex flex-col items-center justify-center rounded-card border border-dashed border-slate-300 bg-white p-12 text-center">
          <PackageOpen className="h-16 w-16 text-slate-300 mb-4" />
          <h3 className="text-xl font-bold text-slate-800 mb-1">
            Tidak Ada Material yang Cocok
          </h3>
          <p className="text-sm text-slate-500 max-w-md">
            Tidak ditemukan material dengan kueri "{searchQuery}". Periksa ejaan atau hapus pencarian untuk menampilkan seluruh katalog.
          </p>
          <button
            onClick={handleClear}
            className="mt-6 flex h-12 items-center rounded-control bg-[#FACC15] px-6 text-sm font-bold text-[#0F172A] shadow transition active:scale-95"
          >
            Reset Pencarian
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-20">
          {searchResult.items.map((material) => (
            <MaterialCard
              key={material.id}
              material={material}
              onClick={setSelectedMaterial}
            />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <MaterialDetailModal
        material={selectedMaterial}
        onClose={() => setSelectedMaterial(null)}
        onScanAnother={() => {
          setSelectedMaterial(null);
          onNavigateToScan();
        }}
      />

      {/* Virtual Keyboard */}
      <VirtualKeyboard
        visible={keyboardVisible}
        onKeyPress={handleKeyPress}
        onBackspace={handleBackspace}
        onClear={handleClear}
        onClose={() => setKeyboardVisible(false)}
      />
    </div>
  );
};
