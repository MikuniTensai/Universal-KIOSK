import React, { useState, useMemo } from 'react';
import { Search, X, Keyboard, PackageOpen, MapPin } from 'lucide-react';
import { ImportPackage, KioskConfig, MaterialWithStock } from '../../domain/types';
import { CatalogService } from './catalogService';
import { MaterialCard } from './MaterialCard';
import { MaterialDetailModal } from './MaterialDetailModal';
import { VirtualKeyboard } from '../../shared/ui/VirtualKeyboard';
import { getCategoryIcon } from '../../shared/utils/categoryIcons';

interface CatalogViewProps {
  pkg: ImportPackage;
  config: KioskConfig;
  onNavigateToScan: () => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  pkg,
  config,
  onNavigateToScan,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBlock, setSelectedBlock] = useState<string>('all');
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialWithStock | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState<boolean>(false);

  const searchResult = useMemo(() => {
    return CatalogService.searchMaterials(pkg, config, {
      query: searchQuery,
      categoryId: selectedCategory,
      blockCode: selectedBlock,
      pageSize: 50,
    });
  }, [pkg, config, searchQuery, selectedCategory, selectedBlock]);

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
    <div className="flex flex-col min-h-full bg-[#F8FAFC] p-8 overflow-y-auto no-scrollbar">
      {/* Top Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 shrink-0">
        {/* Search Input Box (Height 56px) */}
        <div className="relative flex-1 flex items-center">
          <div className="pointer-events-none absolute left-4 text-slate-400">
            <Search className="h-6 w-6" />
          </div>
          <input
            type="text"
            placeholder="Cari nama material, nomor rak (misal: Rak A-001), atau blok gudang..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setKeyboardVisible(true)}
            className="h-16 w-full rounded-control border border-slate-200 bg-white pl-14 pr-32 text-base lg:text-lg font-medium text-[#0F172A] shadow-sm placeholder:text-slate-400 focus:border-[#FACC15] focus:outline-none focus:ring-4 focus:ring-[#FACC15]/20"
          />
          <div className="absolute right-3 flex items-center gap-1.5">
            {searchQuery && (
              <button
                onClick={handleClear}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 active:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={() => setKeyboardVisible(prev => !prev)}
              className={`flex h-12 w-12 items-center justify-center rounded-control transition active:scale-95 ${
                keyboardVisible ? 'bg-[#FACC15] text-[#0F172A]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              title="Keyboard Sentuh"
            >
              <Keyboard className="h-6 w-6" />
            </button>
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
          { label: '🔌 Isolator (Rak A3)', query: 'Rak A3' },
          { label: '🏗️ Trafo (Blok B)', query: 'Blok B' },
          { label: '🦺 APD & Helm (Rak K3-01)', query: 'Rak K3-01' },
          { label: '📦 Kabel MVTIC', query: 'Kabel MVTIC' },
        ].map((item, idx) => (
          <button
            key={idx}
            onClick={() => setSearchQuery(item.query)}
            className="flex h-9 items-center rounded-full bg-white border border-slate-200 px-3.5 font-bold text-slate-700 shadow-2xs hover:border-[#FACC15] hover:bg-amber-50 active:scale-95 transition whitespace-nowrap"
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
                {pkg.materials.length}
              </span>
            </button>
          );
        })()}

        {pkg.categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const count = pkg.materials.filter(m => m.categoryId === cat.id).length;
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
              onClick={() => setSelectedMaterial(material)}
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
