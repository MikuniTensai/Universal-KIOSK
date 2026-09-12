import React, { useState } from 'react';
import {
  Upload,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  FileText,
  RotateCcw,
  Image as ImageIcon,
  LayoutGrid,
  Palette,
  ChevronDown,
  Boxes,
  FolderPlus,
  PlusCircle,
  Barcode,
  FolderTree,
  Sparkles,
  Plus,
  Trash2,
  ArrowRight,
  Search,
} from 'lucide-react';
import { AdminAuth } from './adminAuth';
import { ImportService, PackagePreviewSummary } from './importService';
import { snapshotManager } from './snapshotManager';
import { kioskStorage } from '../../adapters/storage/kioskStorage';
import { SyncService } from '../../adapters/storage/syncService';
import { ImportPackage, KioskConfig, Material } from '../../domain/types';
import { validateKioskConfig } from '../../domain/validation';
import { WALLPAPER_PRESETS, DEFAULT_CARD_PHOTOS, plnUp3MalangFullPackage } from '../../data/mockPlnPackage';
import { WarehouseLayoutService, WarehouseBlock } from '../layout/warehouseLayoutService';
import { AdminLoginScreen, AdminLoginUser } from './AdminLoginScreen';
import { AdminConsoleShell, AdminModuleTab } from './AdminConsoleShell';

interface AdminDashboardModalProps {
  visible: boolean;
  onClose: () => void;
  onPackageUpdated: () => void;
  standalone?: boolean;
  bypassPin?: boolean;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  visible,
  onClose,
  onPackageUpdated,
  standalone = false,
  bypassPin = false,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    bypassPin || standalone ? true : AdminAuth.isAuthenticated()
  );
  const [currentUser, setCurrentUser] = useState<AdminLoginUser>({
    name: 'Administrator',
    role: 'Super Administrator',
    email: 'admin@pln-kiosk.internal',
  });
  const [activeTab, setActiveTab] = useState<AdminModuleTab>('stock');
  const [overviewSearch, setOverviewSearch] = useState('');

  const triggerPackageUpdated = () => {
    onPackageUpdated();
    SyncService.pushState().catch(() => {});
  };


  // Import states
  const [jsonInput, setJsonInput] = useState('');
  const [parsedPackage, setParsedPackage] = useState<ImportPackage | null>(null);
  const [packagePreview, setPackagePreview] = useState<PackagePreviewSummary | null>(null);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importWarnings, setImportWarnings] = useState<string[]>([]);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Settings states
  const [configDraft, setConfigDraft] = useState<KioskConfig>(kioskStorage.getConfig());
  const [configErrors, setConfigErrors] = useState<string[]>([]);

  // Stock Management states
  const [stockMode, setStockMode] = useState<'adjust' | 'new-material'>('adjust');
  const [adjustMatId, setAdjustMatId] = useState<string>('');
  const [stockDeltaInput, setStockDeltaInput] = useState<number>(10);
  const [isExactStock, setIsExactStock] = useState<boolean>(false);
  const [adjustZone, setAdjustZone] = useState<string>('Blok A');
  const [adjustRack, setAdjustRack] = useState<string>('A.1');
  const [adjustBin, setAdjustBin] = useState<string>('A.1.1');
  const [stockError, setStockError] = useState<string | null>(null);

  // New Material states
  const [newMatCode, setNewMatCode] = useState<string>('');
  const [newMatName, setNewMatName] = useState<string>('');
  const [newMatCategoryId, setNewMatCategoryId] = useState<string>('');
  const [newMatSapCode, setNewMatSapCode] = useState<string>('');
  const [newMatUnit, setNewMatUnit] = useState<string>('Unit');
  const [newMatSpec, setNewMatSpec] = useState<string>('');
  const [newMatBarcode, setNewMatBarcode] = useState<string>('');
  const [newMatZone, setNewMatZone] = useState<string>('Blok A');
  const [newMatRack, setNewMatRack] = useState<string>('A.1');
  const [newMatBin, setNewMatBin] = useState<string>('A.1.1');
  const [newMatInitialQty, setNewMatInitialQty] = useState<number>(10);

  // Category Management states
  const [newCatName, setNewCatName] = useState<string>('');
  const [catError, setCatError] = useState<string | null>(null);

  // Location & Block Management states (A-Z)
  const [adminBlocks, setAdminBlocks] = useState<WarehouseBlock[]>(() => WarehouseLayoutService.getBlocks());
  const [adminNewBlockLetter, setAdminNewBlockLetter] = useState<string>('I');
  const [adminNewBlockName, setAdminNewBlockName] = useState<string>('');
  const [adminSubCount, setAdminSubCount] = useState<number>(3);
  const [adminSlotCount, setAdminSlotCount] = useState<number>(5);
  const [blockActionMessage, setBlockActionMessage] = useState<string | null>(null);

  // Deletion confirmation state
  const [materialToDelete, setMaterialToDelete] = useState<Material | null>(null);

  if (!visible && !standalone) return null;

  const handleLogout = () => {
    AdminAuth.logout();
    setIsAuthenticated(false);
  };

  const handleValidatePackageWithContent = async (content: string) => {
    setImportErrors([]);
    setImportWarnings([]);
    setActionSuccessMessage(null);

    const active = kioskStorage.getActivePackage();
    const result = await ImportService.parseAndValidate(content, active);

    if (!result.validation.isValid) {
      setImportErrors(result.validation.errors.map(e => `${e.field}: ${e.message}`));
      setParsedPackage(null);
      setPackagePreview(null);
    } else {
      setParsedPackage(result.pkg);
      setPackagePreview(result.preview || null);
      setImportWarnings(result.validation.warnings);
    }
  };

  const handleValidatePackage = async () => {
    await handleValidatePackageWithContent(jsonInput);
  };

  const handleActivatePackage = () => {
    if (!parsedPackage) return;
    const res = snapshotManager.activate(parsedPackage);
    if (res.success) {
      setActionSuccessMessage(res.message);
      setParsedPackage(null);
      setPackagePreview(null);
      setJsonInput('');
      triggerPackageUpdated();
    } else {
      setImportErrors([res.message]);
    }
  };

  const handleRestore = (datasetVersion: number) => {
    if (window.confirm(`Yakin ingin memulihkan (restore) dataset versi ${datasetVersion}?`)) {
      const res = snapshotManager.restore(datasetVersion);
      if (res.success) {
        setActionSuccessMessage(res.message);
        triggerPackageUpdated();
      } else {
        alert(res.message);
      }
    }
  };

  const handleSaveConfig = () => {
    const val = validateKioskConfig(configDraft);
    if (!val.isValid) {
      setConfigErrors(val.errors.map(e => e.message));
    } else {
      setConfigErrors([]);
      kioskStorage.saveConfig(configDraft);
      setActionSuccessMessage('Pengaturan kiosk berhasil disimpan.');
      triggerPackageUpdated();
    }
  };
  const handleAdjustStock = (e: React.FormEvent) => {
    e.preventDefault();
    setStockError(null);
    try {
      const activePkg = kioskStorage.getActivePackage();
      const targetId = adjustMatId || activePkg?.materials[0]?.id;
      if (!targetId) {
        setStockError('Pilih material terlebih dahulu.');
        return;
      }
      kioskStorage.addOrAdjustStock({
        materialId: targetId,
        zone: adjustZone,
        rack: adjustRack,
        bin: adjustBin,
        quantityDelta: Number(stockDeltaInput),
        setExact: isExactStock,
      });
      setActionSuccessMessage('Stok material berhasil diperbarui.');
      triggerPackageUpdated();
    } catch (err: any) {
      setStockError(err.message || 'Gagal memperbarui stok.');
    }
  };

  const handleAddNewMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    setStockError(null);
    try {
      const activePkg = kioskStorage.getActivePackage();
      const catId = newMatCategoryId || activePkg?.categories[0]?.id;
      if (!catId) {
        setStockError('Pilih kategori material.');
        return;
      }
      kioskStorage.addMaterialWithBarcode({
        code: newMatCode,
        name: newMatName,
        categoryId: catId,
        sapCode: newMatSapCode,
        unit: newMatUnit,
        specification: newMatSpec,
        barcode: newMatBarcode || newMatCode,
        zone: newMatZone,
        rack: newMatRack,
        bin: newMatBin,
        initialQuantity: Number(newMatInitialQty),
      });
      setActionSuccessMessage(`Material "${newMatName}" berhasil didaftarkan beserta barcode.`);
      setNewMatCode('');
      setNewMatName('');
      setNewMatSapCode('');
      setNewMatSpec('');
      setNewMatBarcode('');
      triggerPackageUpdated();
    } catch (err: any) {
      setStockError(err.message || 'Gagal mendaftarkan material baru.');
    }
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    setCatError(null);
    try {
      if (!newCatName.trim()) {
        setCatError('Nama kategori wajib diisi.');
        return;
      }
      kioskStorage.addCategory(newCatName.trim());
      setActionSuccessMessage(`Kategori "${newCatName.trim()}" berhasil ditambahkan.`);
      setNewCatName('');
      triggerPackageUpdated();
    } catch (err: any) {
      setCatError(err.message || 'Gagal menambahkan kategori.');
    }
  };

  const handleAdminAddBlock = (e: React.FormEvent) => {
    e.preventDefault();
    setBlockActionMessage(null);
    try {
      const created = WarehouseLayoutService.addBlock({
        letter: adminNewBlockLetter,
        name: adminNewBlockName || `Area Blok ${adminNewBlockLetter.toUpperCase()}`,
        subBlockCount: adminSubCount,
        slotsPerSubBlock: adminSlotCount,
      });
      setAdminBlocks(WarehouseLayoutService.getBlocks());
      setBlockActionMessage(`Blok "${created.code}" (${created.name}) berhasil ditambahkan.`);
      setAdminNewBlockName('');
      triggerPackageUpdated();
    } catch (err: any) {
      setBlockActionMessage(err instanceof Error ? err.message : 'Gagal menambah blok');
    }
  };

  const handleAdminInitializeAtoZ = () => {
    const updated = WarehouseLayoutService.initializeAllBlocksAtoZ();
    setAdminBlocks(updated);
    setBlockActionMessage('Seluruh Blok A sampai Z (lengkap dengan Sub-Blok .1-.3 dan Slot .1-.5) berhasil diinisialisasi.');
    triggerPackageUpdated();
  };

  const handleAdminResetDefaults = () => {
    const defaults = WarehouseLayoutService.resetDefaults();
    setAdminBlocks(defaults);
    setBlockActionMessage('Struktur Blok berhasil dikembalikan ke standar awal (Blok A-H).');
    triggerPackageUpdated();
  };

  const handleConfirmDeleteMaterial = () => {
    if (!materialToDelete) return;
    try {
      const res = kioskStorage.deleteMaterial(materialToDelete.id);
      setActionSuccessMessage(`Material "${res.materialName}" (${res.materialCode}) berhasil dihapus dari database.`);
      setMaterialToDelete(null);
      setAdjustMatId('');
      const updatedPkg = kioskStorage.getActivePackage();
      if (updatedPkg) {
        WarehouseLayoutService.syncWithPackage(updatedPkg);
      }
      triggerPackageUpdated();
    } catch (err: unknown) {
      setStockError(err instanceof Error ? err.message : 'Gagal menghapus material');
    }
  };

  // 1. Unauthenticated Login Screen View (Universal-ADMS 2-Column Split & Keypad)
  if (!isAuthenticated && !standalone && !bypassPin) {
    return (
      <AdminLoginScreen
        onLoginSuccess={(user) => {
          setIsAuthenticated(true);
          setCurrentUser(user);
        }}
        onClose={onClose}
        port={5000}
      />
    );
  }

  if (!isAuthenticated) {
    return (
      <AdminLoginScreen
        onLoginSuccess={(user) => {
          setIsAuthenticated(true);
          setCurrentUser(user);
        }}
        onClose={onClose}
        port={5001}
      />
    );
  }

  // 2. Full Admin Dashboard (Universal-ADMS BioTime App Shell & PLN Theme)
  const history = kioskStorage.getPackageHistory();
  const logs = kioskStorage.getLogs();
  const activePkg = kioskStorage.getActivePackage();

  return (
    <div className={standalone ? "min-h-screen w-full bg-slate-100 flex flex-col font-sans" : "fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-2 sm:p-4"}>
      <div className={standalone ? "w-full min-h-screen" : "w-full h-full max-w-[1600px] max-h-[96vh] rounded-2xl overflow-hidden shadow-2xl border border-slate-700 bg-white"}>
        <AdminConsoleShell
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setActionSuccessMessage(null);
          }}
          currentUser={currentUser}
          onLogout={handleLogout}
          onRefresh={triggerPackageUpdated}
          onCloseModal={!standalone ? onClose : undefined}
          standalone={standalone}
          historyCount={history.length}
          logsCount={logs.length}
          warehouseCode={kioskStorage.getConfig().warehouseCode}
        >
          {actionSuccessMessage && (
            <div className="mb-4 flex items-center gap-2 rounded-control bg-emerald-50 p-4 text-sm font-bold text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <span>{actionSuccessMessage}</span>
            </div>
          )}

          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Action Pills Bar */}
              <div className="adms-quick-actions-bar">
                <button
                  type="button"
                  className="adms-action-pill"
                  onClick={() => { setActiveTab('stock'); setStockMode('adjust'); }}
                >
                  <Boxes size={15} strokeWidth={2} />
                  <span>Penyesuaian Cepat Stok</span>
                  <ArrowRight size={13} strokeWidth={2} className="arrow" />
                </button>
                <button
                  type="button"
                  className="adms-action-pill"
                  onClick={() => { setActiveTab('stock'); setStockMode('new-material'); }}
                >
                  <PlusCircle size={15} strokeWidth={2} />
                  <span>Pendaftaran Material Baru</span>
                  <ArrowRight size={13} strokeWidth={2} className="arrow" />
                </button>
                <button
                  type="button"
                  className="adms-action-pill"
                  onClick={() => setActiveTab('locations')}
                >
                  <FolderTree size={15} strokeWidth={2} />
                  <span>Visualisasi Denah Gudang (A-Z)</span>
                  <ArrowRight size={13} strokeWidth={2} className="arrow" />
                </button>
                <button
                  type="button"
                  className="adms-action-pill"
                  onClick={() => setActiveTab('import')}
                >
                  <Upload size={15} strokeWidth={2} />
                  <span>Impor Paket SAP JSON</span>
                  <ArrowRight size={13} strokeWidth={2} className="arrow" />
                </button>
              </div>

              {/* 4 Executive KPI Cards */}
              <div className="adms-kpi-grid">
                <div className="adms-kpi-card">
                  <div className="adms-kpi-info">
                    <span className="adms-kpi-label">Total Material Terdaftar</span>
                    <span className="adms-kpi-value">{activePkg?.materials.length || 0}</span>
                    <span className="adms-kpi-sub">Katalog logistik PLN UP3</span>
                  </div>
                  <div className="adms-kpi-icon-box bg-sky-50 text-sky-600 border border-sky-200">
                    <Boxes size={22} strokeWidth={2.2} />
                  </div>
                </div>

                <div className="adms-kpi-card">
                  <div className="adms-kpi-info">
                    <span className="adms-kpi-label">Total Kuantitas Fisik</span>
                    <span className="adms-kpi-value">
                      {activePkg?.stockSnapshots.reduce((acc, s) => acc + (s.quantity || 0), 0) || 0}
                    </span>
                    <span className="adms-kpi-sub">Unit material siap pakai</span>
                  </div>
                  <div className="adms-kpi-icon-box bg-emerald-50 text-emerald-600 border border-emerald-200">
                    <CheckCircle2 size={22} strokeWidth={2.2} />
                  </div>
                </div>

                <div className="adms-kpi-card">
                  <div className="adms-kpi-info">
                    <span className="adms-kpi-label">Zonasi Blok Gudang</span>
                    <span className="adms-kpi-value">{adminBlocks.length} Blok</span>
                    <span className="adms-kpi-sub">Hierarki fleksibel A s/d Z</span>
                  </div>
                  <div className="adms-kpi-icon-box bg-amber-50 text-amber-600 border border-amber-200">
                    <FolderTree size={22} strokeWidth={2.2} />
                  </div>
                </div>

                <div className="adms-kpi-card">
                  <div className="adms-kpi-info">
                    <span className="adms-kpi-label">Snapshot ERP Master</span>
                    <span className="adms-kpi-value">v{activePkg?.datasetVersion || 1}</span>
                    <span className="adms-kpi-sub">{activePkg?.sourceName?.slice(0, 24) || 'PLN SAP ERP'}</span>
                  </div>
                  <div className="adms-kpi-icon-box bg-violet-50 text-violet-600 border border-violet-200">
                    <FileText size={22} strokeWidth={2.2} />
                  </div>
                </div>
              </div>

              {/* Status Operasional Dual-Port & LAN */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                    <h3 className="text-sm font-extrabold text-slate-800">
                      Status Operasional Dual-Port &amp; Sinkronisasi LAN
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500">
                    {kioskStorage.getConfig().warehouseCode}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-1">
                    <div className="flex justify-between items-center font-bold text-slate-700">
                      <span>Layar Kiosk (Port 5000)</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">Aktif</span>
                    </div>
                    <span className="text-slate-500">Mode publik sentuh, pencarian visual denah gudang &amp; SOP PLN</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-1">
                    <div className="flex justify-between items-center font-bold text-slate-700">
                      <span>Konsol Admin (Port 5001)</span>
                      <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px]">Terhubung</span>
                    </div>
                    <span className="text-slate-500">Kontrol mutasi stok, pendaftaran barcode &amp; manajemen blok A-Z</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-1">
                    <div className="flex justify-between items-center font-bold text-slate-700">
                      <span>Real-time Broadcast &amp; Storage</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px]">Idempoten</span>
                    </div>
                    <span className="text-slate-500">BroadcastChannel &amp; SQLite/JSON persistent offline tanpa internet</span>
                  </div>
                </div>
              </div>

              {/* Quick Material Inventory Summary Table */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-800">
                      Ringkasan Inventaris Material Terkini
                    </h3>
                    <p className="text-xs text-slate-500">
                      Snapshot aktif versi {activePkg?.datasetVersion || '-'} &bull; {activePkg?.sourceName || '-'}
                    </p>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Cari kode atau nama material..."
                      value={overviewSearch}
                      onChange={(e) => setOverviewSearch(e.target.value)}
                      className="w-full h-10 rounded-xl border border-slate-300 pl-9 pr-3 text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-[#0369a1] focus:ring-2 focus:ring-[#0369a1]/20 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs min-w-[640px]">
                    <thead className="bg-slate-50 font-bold uppercase text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="p-3">Kode Material</th>
                        <th className="p-3">Nama Material</th>
                        <th className="p-3">Kategori</th>
                        <th className="p-3">Lokasi Gudang</th>
                        <th className="p-3">Stok Siap Pakai</th>
                        <th className="p-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {activePkg?.materials
                        .filter((m) =>
                          overviewSearch
                            ? m.name.toLowerCase().includes(overviewSearch.toLowerCase()) ||
                              m.code.toLowerCase().includes(overviewSearch.toLowerCase())
                            : true
                        )
                        .slice(0, 8)
                        .map((mat) => {
                          const cat = activePkg?.categories.find((c) => c.id === mat.categoryId);
                          const snapshots = activePkg?.stockSnapshots.filter((s) => s.materialId === mat.id) || [];
                          const totalQty = snapshots.reduce((sum, s) => sum + (s.quantity || 0), 0);
                          const locObj = snapshots[0] ? activePkg?.locations.find((l) => l.id === snapshots[0].locationId) : null;
                          const loc = locObj
                            ? `${locObj.zone || '-'} • ${locObj.rack || '-'} / ${locObj.bin || '-'}`
                            : '-';
                          return (
                            <tr key={mat.id} className="hover:bg-slate-50 transition">
                              <td className="p-3 font-mono font-bold text-sky-700">{mat.code}</td>
                              <td className="p-3 font-bold text-slate-900">{mat.name}</td>
                              <td className="p-3 text-slate-500">{cat?.name || '-'}</td>
                              <td className="p-3 font-mono text-[11px]">{loc}</td>
                              <td className="p-3">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                    totalQty > 0
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                                  }`}
                                >
                                  {totalQty} {mat.unit}
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAdjustMatId(mat.id);
                                    setActiveTab('stock');
                                    setStockMode('adjust');
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 font-bold hover:bg-sky-100 text-[11px] transition"
                                >
                                  Sesuaikan
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: STOCK & MATERIAL MUTATION */}
          {activeTab === 'stock' && (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
                <button
                  type="button"
                  onClick={() => { setStockMode('adjust'); setStockError(null); }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    stockMode === 'adjust' ? 'bg-[#FACC15] text-[#0F172A] shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  1. Tambah / Sesuaikan Stok Material
                </button>
                <button
                  type="button"
                  onClick={() => { setStockMode('new-material'); setStockError(null); }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    stockMode === 'new-material' ? 'bg-[#FACC15] text-[#0F172A] shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  2. Tambah Material Baru & Barcode
                </button>
              </div>

              {stockError && (
                <div className="rounded-control bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200 font-semibold">
                  {stockError}
                </div>
              )}

              {stockMode === 'adjust' ? (
                <form onSubmit={handleAdjustStock} className="space-y-4 max-w-xl">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                      Pilih Material:
                    </label>
                    <select
                      value={adjustMatId || (activePkg?.materials[0]?.id ?? '')}
                      onChange={(e) => setAdjustMatId(e.target.value)}
                      className="w-full h-11 rounded-xl border border-slate-300 px-3 text-sm bg-white font-medium text-slate-800 focus:border-[#0369a1] focus:ring-2 focus:ring-[#0369a1]/20 focus:outline-none"
                    >
                      {activePkg?.materials.map(m => (
                        <option key={m.id} value={m.id}>
                          [{m.code}] {m.name} ({m.unit})
                        </option>
                      ))}
                    </select>
                  </div>

                  {(() => {
                    const currentMatId = adjustMatId || activePkg?.materials[0]?.id;
                    const mat = activePkg?.materials.find(m => m.id === currentMatId);
                    if (!mat) return null;
                    const matStocks = activePkg?.stockSnapshots.filter(s => s.materialId === mat.id) || [];
                    const totalQty = matStocks.reduce((sum, s) => sum + (s.quantity || 0), 0);
                    return (
                      <div className="rounded-xl bg-amber-50/70 p-4 border border-amber-200 text-xs text-amber-900 space-y-1">
                        <p className="font-bold text-sm text-[#0F172A]">{mat.name}</p>
                        <p>Kode: <strong className="font-mono">{mat.code}</strong> {mat.sapCode ? `• SAP: ${mat.sapCode}` : ''}</p>
                        <p>Total Stok Saat Ini: <strong className="text-emerald-700 text-sm">{totalQty} {mat.unit}</strong></p>
                      </div>
                    );
                  })()}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                        Metode Penyesuaian:
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setIsExactStock(false)}
                          className={`flex-1 min-h-[42px] py-2 rounded-xl text-xs font-bold border transition ${
                            !isExactStock ? 'bg-[#FACC15] text-[#0F172A] border-amber-400 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          + Tambah / - Kurang
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsExactStock(true)}
                          className={`flex-1 min-h-[42px] py-2 rounded-xl text-xs font-bold border transition ${
                            isExactStock ? 'bg-[#FACC15] text-[#0F172A] border-amber-400 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          Tetapkan Nilai
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                        {isExactStock ? 'Nilai Stok Pasti:' : 'Jumlah Penambahan (+/-):'}
                      </label>
                      <input
                        type="number"
                        value={stockDeltaInput}
                        onChange={(e) => setStockDeltaInput(Number(e.target.value))}
                        className="w-full h-11 rounded-xl border border-slate-300 px-3 text-sm font-bold text-slate-800 focus:border-[#0369a1] focus:ring-2 focus:ring-[#0369a1]/20 focus:outline-none"
                        placeholder={isExactStock ? "contoh: 50" : "contoh: 10 atau -5"}
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                    <span className="text-xs font-bold text-slate-700 block">Lokasi Rak Penyimpanan di Gudang:</span>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Zona</label>
                        <input
                          type="text"
                          value={adjustZone}
                          onChange={(e) => setAdjustZone(e.target.value)}
                          placeholder="Zona A"
                          className="w-full h-10 rounded-xl border border-slate-300 px-3 text-xs bg-white focus:border-[#0369a1] focus:ring-2 focus:ring-[#0369a1]/20 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Rak</label>
                        <input
                          type="text"
                          value={adjustRack}
                          onChange={(e) => setAdjustRack(e.target.value)}
                          placeholder="Rak 01"
                          className="w-full h-10 rounded-xl border border-slate-300 px-3 text-xs bg-white focus:border-[#0369a1] focus:ring-2 focus:ring-[#0369a1]/20 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Bin / Kotak</label>
                        <input
                          type="text"
                          value={adjustBin}
                          onChange={(e) => setAdjustBin(e.target.value)}
                          placeholder="Bin 01"
                          className="w-full h-10 rounded-xl border border-slate-300 px-3 text-xs bg-white focus:border-[#0369a1] focus:ring-2 focus:ring-[#0369a1]/20 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="submit"
                      className="flex-1 flex h-12 items-center justify-center gap-2 rounded-control bg-[#FACC15] px-8 text-sm font-bold text-[#0F172A] shadow-md transition active:scale-95 hover:bg-amber-400"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Simpan Perubahan Stok</span>
                    </button>

                    {(() => {
                      const currentMatId = adjustMatId || activePkg?.materials[0]?.id;
                      const mat = activePkg?.materials.find(m => m.id === currentMatId);
                      if (!mat) return null;
                      return (
                        <button
                          type="button"
                          onClick={() => setMaterialToDelete(mat)}
                          className="flex h-12 items-center justify-center gap-2 rounded-control bg-rose-50 border border-rose-300 px-5 text-sm font-bold text-rose-700 shadow-sm transition active:scale-95 hover:bg-rose-100"
                          title={`Hapus material ${mat.name} dari database`}
                        >
                          <Trash2 className="h-4 w-4 text-rose-600" />
                          <span>Hapus Material Ini</span>
                        </button>
                      );
                    })()}
                  </div>
                </form>
              ) : (
                <form onSubmit={handleAddNewMaterial} className="space-y-4 max-w-2xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                        Kode Material (Wajib Unik):
                      </label>
                      <input
                        type="text"
                        value={newMatCode}
                        onChange={(e) => setNewMatCode(e.target.value)}
                        placeholder="Contoh: 001999"
                        required
                        className="w-full h-11 rounded-xl border border-slate-300 px-3 text-sm font-mono text-slate-800 focus:border-[#0369a1] focus:ring-2 focus:ring-[#0369a1]/20 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                        Kode SAP:
                      </label>
                      <input
                        type="text"
                        value={newMatSapCode}
                        onChange={(e) => setNewMatSapCode(e.target.value)}
                        placeholder="Contoh: 10009999"
                        className="w-full h-11 rounded-xl border border-slate-300 px-3 text-sm font-mono text-slate-800 focus:border-[#0369a1] focus:ring-2 focus:ring-[#0369a1]/20 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                      Nama Resmi Material:
                    </label>
                    <input
                      type="text"
                      value={newMatName}
                      onChange={(e) => setNewMatName(e.target.value)}
                      placeholder="Contoh: Kabel Tegangan Menengah 20kV XLPE 3x150mm"
                      required
                      className="w-full h-11 rounded-xl border border-slate-300 px-3 text-sm font-medium text-slate-800 focus:border-[#0369a1] focus:ring-2 focus:ring-[#0369a1]/20 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                        Kategori Material:
                      </label>
                      <select
                        value={newMatCategoryId || (activePkg?.categories[0]?.id ?? '')}
                        onChange={(e) => setNewMatCategoryId(e.target.value)}
                        className="w-full h-11 rounded-xl border border-slate-300 px-3 text-sm bg-white font-medium text-slate-800 focus:border-[#0369a1] focus:ring-2 focus:ring-[#0369a1]/20 focus:outline-none"
                      >
                        {activePkg?.categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                        Satuan Unit:
                      </label>
                      <input
                        type="text"
                        value={newMatUnit}
                        onChange={(e) => setNewMatUnit(e.target.value)}
                        placeholder="Unit / Buah / Meter / Set"
                        required
                        className="w-full h-11 rounded-xl border border-slate-300 px-3 text-sm text-slate-800 focus:border-[#0369a1] focus:ring-2 focus:ring-[#0369a1]/20 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                      Nilai Barcode / QR Code Scanner (Wajib):
                    </label>
                    <div className="relative flex items-center">
                      <Barcode className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input
                        type="text"
                        value={newMatBarcode}
                        onChange={(e) => setNewMatBarcode(e.target.value)}
                        placeholder="Contoh: PLN-KBL-20KV-2026 atau nomor barcode fisik"
                        required
                        className="w-full h-11 rounded-xl border border-slate-300 pl-10 pr-3 text-sm font-mono text-slate-800 focus:border-[#0369a1] focus:ring-2 focus:ring-[#0369a1]/20 focus:outline-none"
                      />
                    </div>
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Barcode ini akan otomatis terdaftar dan bisa langsung diuji coba pada modul Scanner Kiosk.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                      Standar Spesifikasi Teknis (SPLN / Standar PLN):
                    </label>
                    <textarea
                      rows={2}
                      value={newMatSpec}
                      onChange={(e) => setNewMatSpec(e.target.value)}
                      placeholder="Contoh: SPLN D3.002-1:2007, Tegangan 20kV, Isolasi XLPE tahan cuaca"
                      className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-800 focus:border-[#0369a1] focus:ring-2 focus:ring-[#0369a1]/20 focus:outline-none"
                    />
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                    <span className="text-xs font-bold text-slate-700 block">Alokasi Rak Gudang & Stok Awal:</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Zona</label>
                        <input
                          type="text"
                          value={newMatZone}
                          onChange={(e) => setNewMatZone(e.target.value)}
                          className="w-full h-10 rounded-xl border border-slate-300 px-3 text-xs bg-white focus:border-[#0369a1] focus:ring-2 focus:ring-[#0369a1]/20 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Rak</label>
                        <input
                          type="text"
                          value={newMatRack}
                          onChange={(e) => setNewMatRack(e.target.value)}
                          className="w-full h-10 rounded-xl border border-slate-300 px-3 text-xs bg-white focus:border-[#0369a1] focus:ring-2 focus:ring-[#0369a1]/20 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Bin</label>
                        <input
                          type="text"
                          value={newMatBin}
                          onChange={(e) => setNewMatBin(e.target.value)}
                          className="w-full h-10 rounded-xl border border-slate-300 px-3 text-xs bg-white focus:border-[#0369a1] focus:ring-2 focus:ring-[#0369a1]/20 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Stok Awal</label>
                        <input
                          type="number"
                          value={newMatInitialQty}
                          onChange={(e) => setNewMatInitialQty(Number(e.target.value))}
                          className="w-full h-10 rounded-xl border border-slate-300 px-3 text-xs bg-white font-bold focus:border-[#0369a1] focus:ring-2 focus:ring-[#0369a1]/20 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="flex h-12 items-center justify-center gap-2 rounded-control bg-[#FACC15] px-8 text-sm font-bold text-[#0F172A] shadow-md transition active:scale-95 w-full sm:w-auto"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>Daftarkan Material & Barcode</span>
                  </button>
                </form>
              )}

              {/* Material Inventory Table & Delete Actions */}
              <div className="pt-6 border-t border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Boxes className="h-4 w-4 text-amber-600" />
                    <span>Daftar Material Gudang ({activePkg?.materials.length || 0} Item Terdaftar):</span>
                  </h4>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Setiap barang yang masuk dapat disesuaikan stoknya atau dihapus permanen
                  </span>
                </div>

                <div className="max-h-[300px] overflow-y-auto rounded-xl border border-slate-200 bg-white divide-y divide-slate-100 no-scrollbar">
                  {activePkg?.materials.map((m) => {
                    const matStocks = activePkg?.stockSnapshots.filter(s => s.materialId === m.id) || [];
                    const totalQty = matStocks.reduce((sum, s) => sum + (s.quantity || 0), 0);
                    const cat = activePkg?.categories.find(c => c.id === m.categoryId);
                    return (
                      <div key={m.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 hover:bg-slate-50 transition gap-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <span className="font-mono text-xs font-black text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300 shrink-0">
                            {m.code}
                          </span>
                          <div className="min-w-0 flex-1">
                            <h5 className="text-xs font-bold text-slate-800 truncate">{m.name}</h5>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                              <span>{cat?.name || 'Umum'}</span>
                              <span>&bull;</span>
                              <span>Stok: <strong className="text-emerald-700 font-bold">{totalQty} {m.unit}</strong></span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setStockMode('adjust');
                              setAdjustMatId(m.id);
                            }}
                            className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition"
                          >
                            Sesuaikan
                          </button>
                          <button
                            type="button"
                            onClick={() => setMaterialToDelete(m)}
                            className="flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1.5 rounded-lg transition"
                            title={`Hapus material ${m.name}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB: CATEGORY MANAGEMENT */}
          {activeTab === 'categories' && (
            <div className="space-y-6 max-w-2xl">
              <form onSubmit={handleAddCategory} className="rounded-card border border-slate-200 bg-slate-50 p-5 space-y-4">
                <h4 className="text-sm font-bold text-slate-800">Form Tambah Kategori Material Baru</h4>
                {catError && (
                  <div className="rounded-control bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200 font-semibold">
                    {catError}
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="Contoh: Kabel Tegangan Menengah, APD & K3..."
                    required
                    className="flex-1 h-12 rounded-xl border border-slate-300 px-4 text-sm bg-white font-medium text-slate-800 focus:border-[#FACC15] focus:ring-2 focus:ring-[#FACC15]/30 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="flex h-12 items-center justify-center gap-2 rounded-control bg-[#FACC15] px-6 text-sm font-bold text-[#0F172A] shadow-md transition active:scale-95 shrink-0 w-full sm:w-auto"
                  >
                    <FolderPlus className="h-4 w-4" />
                    <span>Tambah Kategori</span>
                  </button>
                </div>
              </form>

              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-800">
                  Daftar Kategori Aktif ({activePkg?.categories.length || 0}):
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activePkg?.categories.map((cat) => {
                    const count = activePkg.materials.filter(m => m.categoryId === cat.id).length;
                    return (
                      <div key={cat.id} className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-900 font-bold text-xs">
                            {cat.name.slice(0, 2).toUpperCase()}
                          </span>
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">{cat.name}</span>
                            <span className="text-[10px] text-slate-500">{count} material terkait</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-semibold">
                          ID: {cat.id}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LOCATIONS / WAREHOUSE HIERARCHY */}
          {activeTab === 'locations' && (
            <div className="space-y-6">
              {blockActionMessage && (
                <div className="rounded-xl bg-amber-50 border border-amber-300 p-4 text-xs font-bold text-amber-900 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>{blockActionMessage}</span>
                </div>
              )}

              {/* Header Info & Action Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-card border border-slate-200 bg-slate-50 p-4">
                <div>
                  <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
                    <FolderTree className="h-4 w-4 text-amber-600" />
                    <span>Hierarki Tata Letak Blok &amp; Rak Gudang PLN (A s/d Z)</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Struktur dinamis fleksibel: <strong>Blok &rarr; Sub-Blok / Baris &rarr; Slot Rak</strong> (misal A.1.1 - A.1.5 s/d A.3.5, dapat ditambah hingga Blok Z).
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleAdminInitializeAtoZ}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 px-3.5 py-2 text-xs font-bold transition shadow"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-[#FACC15]" />
                    <span>Inisialisasi A-Z</span>
                  </button>
                  <button
                    onClick={handleAdminResetDefaults}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 px-3 py-2 text-xs font-bold transition"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Reset (A-H)</span>
                  </button>
                </div>
              </div>

              {/* Form Tambah Blok Baru */}
              <form onSubmit={handleAdminAddBlock} className="rounded-card border border-slate-200 bg-white p-5 space-y-4 shadow-sm">
                <h5 className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                  <PlusCircle className="h-4 w-4 text-amber-600" />
                  <span>Tambah Blok Baru Mandiri (Fleksibel A s/d Z):</span>
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Huruf Blok:</label>
                    <input
                      type="text"
                      maxLength={2}
                      value={adminNewBlockLetter}
                      onChange={(e) => setAdminNewBlockLetter(e.target.value.toUpperCase())}
                      placeholder="I, J, Z..."
                      required
                      className="w-full h-11 rounded-xl border border-slate-300 px-3 font-mono font-black text-sm bg-slate-50 focus:bg-white focus:border-[#0369a1] focus:ring-2 focus:ring-[#0369a1]/20 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Nama Area / Blok:</label>
                    <input
                      type="text"
                      value={adminNewBlockName}
                      onChange={(e) => setAdminNewBlockName(e.target.value)}
                      placeholder="Contoh: Area Panel Hubung Bagi 20kV"
                      required
                      className="w-full h-11 rounded-xl border border-slate-300 px-3 text-xs sm:text-sm bg-slate-50 focus:bg-white font-medium focus:border-[#0369a1] focus:ring-2 focus:ring-[#0369a1]/20 focus:outline-none"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full h-11 flex items-center justify-center gap-1.5 rounded-xl bg-[#FACC15] text-[#0F172A] text-xs font-bold shadow active:scale-95 hover:bg-amber-400"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Buat Blok</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Jumlah Sub-Blok:</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={adminSubCount}
                      onChange={(e) => setAdminSubCount(Number(e.target.value))}
                      className="w-full h-10 rounded-xl border border-slate-300 px-3 text-xs bg-white font-bold focus:border-[#0369a1] focus:ring-2 focus:ring-[#0369a1]/20 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Slot per Baris:</label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={adminSlotCount}
                      onChange={(e) => setAdminSlotCount(Number(e.target.value))}
                      className="w-full h-10 rounded-xl border border-slate-300 px-3 text-xs bg-white font-bold focus:border-[#0369a1] focus:ring-2 focus:ring-[#0369a1]/20 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2 flex items-center text-[11px] text-slate-500">
                    Contoh format: <strong>{adminNewBlockLetter || '?'}.1.1 s/d {adminNewBlockLetter || '?'}.{adminSubCount}.{adminSlotCount}</strong>
                  </div>
                </div>
              </form>

              {/* List of Blocks Tree */}
              <div className="space-y-3">
                <h5 className="text-xs font-black uppercase text-slate-700 tracking-wider">
                  Daftar Blok &amp; Sub-Blok Terdaftar ({adminBlocks.length} Blok):
                </h5>

                <div className="grid grid-cols-1 gap-3 max-h-[420px] overflow-y-auto pr-1 no-scrollbar">
                  {adminBlocks.map((block) => (
                    <div
                      key={block.id}
                      className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-xs"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{block.icon}</span>
                          <div>
                            <span className="font-mono font-black text-xs text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                              {block.code}
                            </span>
                            <span className="ml-2 font-bold text-xs text-slate-800">
                              {block.name}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              try {
                                WarehouseLayoutService.addSubBlock(block.letter);
                                setAdminBlocks(WarehouseLayoutService.getBlocks());
                                setBlockActionMessage(`Sub-blok baru berhasil ditambahkan ke ${block.code}.`);
                              } catch (err) {
                                console.error(err);
                              }
                            }}
                            className="text-[11px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-2 py-1 rounded-lg transition"
                          >
                            + Baris Sub-Blok
                          </button>
                        </div>
                      </div>

                      {/* Sub-Blocks */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                        {block.subBlocks.map((sb) => (
                          <div
                            key={sb.code}
                            className="rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-xs space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-black text-[11px] text-slate-700">
                                Baris {sb.code}
                              </span>
                              <button
                                onClick={() => {
                                  try {
                                    WarehouseLayoutService.addSlotToSubBlock(sb.code);
                                    setAdminBlocks(WarehouseLayoutService.getBlocks());
                                    setBlockActionMessage(`Slot baru berhasil ditambahkan ke ${sb.code}.`);
                                  } catch (err) {
                                    console.error(err);
                                  }
                                }}
                                className="text-[10px] text-slate-500 hover:text-amber-800 font-bold"
                              >
                                + Slot ({sb.code}.{sb.slots.length + 1})
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {sb.slots.map((s) => (
                                <span
                                  key={s.code}
                                  className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                                    s.status === 'occupied' || s.materialName
                                      ? 'bg-amber-200 text-amber-900 font-bold border border-amber-300'
                                      : 'bg-white text-slate-600 border border-slate-200'
                                  }`}
                                  title={s.materialName ? `Terisi: ${s.materialName}` : 'Kosong'}
                                >
                                  {s.code}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: IMPORT */}
          {activeTab === 'import' && (
            <div className="space-y-6">
              {/* Preset Paket Data Material Aktual Klien PLN UP3 Malang */}
              <div className="rounded-xl border-2 border-amber-300 bg-amber-50/80 p-5 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-200 text-amber-900">
                        <Sparkles className="h-3.5 w-3.5 text-amber-700" />
                        Preset Data Klien Siap Pakai
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        151 Material Aktual
                      </span>
                    </div>
                    <h4 className="text-base font-extrabold text-slate-900">
                      Import Paket 151 Material Gudang Aris Munandar (export_material NEW.csv)
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                      Dataset komprehensif mencakup Transformator 100-250kVA, Kabel SUTR/SKTM/NYY, Smart Meter AMI 1 & 3 Fasa, CT Metering, MCB/MCCB, FCO & Fuse Link, Isolator, Cross Arm Travers, dan APD K3 yang telah otomatis dipetakan ke Blok A, B, C, D, E, F beserta kode rak & bin standar PLN.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const json = JSON.stringify(plnUp3MalangFullPackage, null, 2);
                      setJsonInput(json);
                      handleValidatePackageWithContent(json);
                    }}
                    className="shrink-0 flex items-center justify-center gap-2.5 rounded-control bg-slate-900 hover:bg-slate-800 px-5 py-3.5 text-xs font-bold text-white shadow active:scale-95 transition"
                  >
                    <Upload className="h-4 w-4 text-[#FACC15]" />
                    <span>Muat & Validasi 151 Material</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Tempel JSON Paket Data Ekspor Logistik:
                </label>
                <textarea
                  rows={8}
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder="Paste JSON ImportPackage di sini..."
                  className="w-full rounded-xl border border-slate-300 p-3.5 font-mono text-xs text-slate-800 focus:border-[#0369a1] focus:ring-2 focus:ring-[#0369a1]/20 focus:outline-none transition"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleValidatePackage}
                  disabled={!jsonInput.trim()}
                  className="flex h-12 items-center justify-center gap-2 rounded-control bg-slate-900 px-6 text-sm font-bold text-white shadow active:scale-95 disabled:opacity-50 w-full sm:w-auto"
                >
                  <FileText className="h-4 w-4" />
                  <span>Validasi & Pratinjau Paket</span>
                </button>

                {packagePreview && (
                  <button
                    onClick={handleActivatePackage}
                    className="flex h-12 items-center justify-center gap-2 rounded-control bg-[#FACC15] px-6 text-sm font-bold text-[#0F172A] shadow-md active:scale-95 w-full sm:w-auto"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Aktivasi Paket Sekarang (Atomik)</span>
                  </button>
                )}
              </div>

              {/* Errors & Warnings */}
              {importErrors.length > 0 && (
                <div className="rounded-control bg-rose-50 p-4 border border-rose-200 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800 uppercase">
                    <AlertCircle className="h-4 w-4" /> Kesalahan Validasi:
                  </div>
                  <ul className="text-xs text-rose-700 list-disc list-inside">
                    {importErrors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {importWarnings.length > 0 && (
                <div className="rounded-control bg-amber-50 p-4 border border-amber-200 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 uppercase">
                    <AlertTriangle className="h-4 w-4" /> Peringatan:
                  </div>
                  <ul className="text-xs text-amber-700 list-disc list-inside">
                    {importWarnings.map((warn, idx) => (
                      <li key={idx}>{warn}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Preview Card */}
              {packagePreview && (
                <div className="rounded-control bg-slate-50 p-5 border border-slate-200 space-y-4">
                  <h4 className="text-sm font-bold text-slate-800">Ringkasan Pratinjau Paket Tervalidasi</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                    <div className="bg-white p-3 rounded border border-slate-200">
                      <span className="text-xs text-slate-500">Versi Dataset</span>
                      <p className="font-bold text-slate-900 text-lg">{packagePreview.datasetVersion}</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-slate-200">
                      <span className="text-xs text-slate-500">Total Material</span>
                      <p className="font-bold text-slate-900 text-lg">{packagePreview.materialCount}</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-slate-200">
                      <span className="text-xs text-slate-500">Kategori</span>
                      <p className="font-bold text-slate-900 text-lg">{packagePreview.categoryCount}</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-slate-200">
                      <span className="text-xs text-slate-500">Lokasi / Stok</span>
                      <p className="font-bold text-slate-900 text-lg">{packagePreview.stockSnapshotCount}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: HISTORY & RESTORE */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-800">Daftar Snapshot Sebelumnya</h4>
              {history.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500 bg-slate-50 rounded-control border border-slate-200">
                  Belum ada riwayat snapshot tersimpan.
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((pkg) => (
                    <div
                      key={pkg.datasetVersion}
                      className="flex flex-col sm:flex-row sm:items-center justify-between rounded-control border border-slate-200 bg-slate-50 p-4 gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-xs font-bold text-white">
                            Versi {pkg.datasetVersion}
                          </span>
                          <span className="text-sm font-bold text-slate-800">
                            {pkg.sourceName}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Waktu Sumber: {new Date(pkg.sourceAt).toLocaleString('id-ID')} &bull; Total {pkg.materials.length} Material
                        </p>
                      </div>

                      <button
                        onClick={() => handleRestore(pkg.datasetVersion)}
                        className="flex h-11 items-center justify-center gap-2 rounded-control bg-white border border-slate-300 px-4 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-100 active:scale-95 w-full sm:w-auto"
                      >
                        <RotateCcw className="h-4 w-4 text-amber-600" />
                        <span>Pulihkan (Restore)</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-4 max-w-xl">
              {configErrors.length > 0 && (
                <div className="rounded-control bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
                  {configErrors.join(', ')}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Nama Organisasi</label>
                <input
                  type="text"
                  value={configDraft.organizationName}
                  onChange={(e) => setConfigDraft({ ...configDraft, organizationName: e.target.value })}
                  className="w-full h-11 rounded-xl border border-slate-300 px-3 text-sm text-slate-800 focus:border-[#0369a1] focus:ring-2 focus:ring-[#0369a1]/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Kode Gudang</label>
                <input
                  type="text"
                  value={configDraft.warehouseCode}
                  onChange={(e) => setConfigDraft({ ...configDraft, warehouseCode: e.target.value })}
                  className="w-full h-11 rounded-xl border border-slate-300 px-3 text-sm text-slate-800 focus:border-[#0369a1] focus:ring-2 focus:ring-[#0369a1]/20 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Zona Waktu IANA</label>
                  <input
                    type="text"
                    value={configDraft.timezone}
                    onChange={(e) => setConfigDraft({ ...configDraft, timezone: e.target.value })}
                    className="w-full h-11 rounded-xl border border-slate-300 px-3 text-sm text-slate-800 focus:border-[#0369a1] focus:ring-2 focus:ring-[#0369a1]/20 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Umur Maksimal Stok (Jam)</label>
                  <input
                    type="number"
                    value={configDraft.staleAfterHours ?? ''}
                    onChange={(e) => setConfigDraft({ ...configDraft, staleAfterHours: e.target.value ? Number(e.target.value) : null })}
                    className="w-full h-11 rounded-xl border border-slate-300 px-3 text-sm text-slate-800 focus:border-[#0369a1] focus:ring-2 focus:ring-[#0369a1]/20 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Timeout Idle (Detik)</label>
                  <input
                    type="number"
                    value={configDraft.idleSeconds}
                    onChange={(e) => setConfigDraft({ ...configDraft, idleSeconds: Number(e.target.value) })}
                    className="w-full h-11 rounded-xl border border-slate-300 px-3 text-sm text-slate-800 focus:border-[#0369a1] focus:ring-2 focus:ring-[#0369a1]/20 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Timeout Warning (Detik)</label>
                  <input
                    type="number"
                    value={configDraft.warningSeconds}
                    onChange={(e) => setConfigDraft({ ...configDraft, warningSeconds: Number(e.target.value) })}
                    className="w-full h-11 rounded-xl border border-slate-300 px-3 text-sm text-slate-800 focus:border-[#0369a1] focus:ring-2 focus:ring-[#0369a1]/20 focus:outline-none"
                  />
                </div>
              </div>

              {/* Visual Customization & Wallpaper Settings */}
              <div className="rounded-xl border border-amber-300 bg-amber-50/50 p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-amber-200/70 pb-2">
                  <h5 className="font-extrabold text-sm text-[#0F172A]">
                    Tampilan Visual &amp; Wallpaper Kiosk
                  </h5>
                  <span className="text-[11px] font-bold text-amber-800 bg-amber-200/70 px-2.5 py-0.5 rounded-full">
                    Kustomisasi Petugas
                  </span>
                </div>

                {/* Card Style Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                    Gaya Kartu Menu Utama
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setConfigDraft({ ...configDraft, cardStyle: 'photo' })}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition min-h-[44px] ${
                        configDraft.cardStyle === 'photo'
                          ? 'border-amber-500 bg-white text-[#0F172A] shadow-md ring-2 ring-amber-400/40'
                          : 'border-slate-200 bg-white/60 text-slate-500 hover:bg-white'
                      }`}
                    >
                      <ImageIcon className="h-4 w-4 text-amber-600" />
                      <span>Mode Kartu Foto</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfigDraft({ ...configDraft, cardStyle: 'minimal' })}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition min-h-[44px] ${
                        configDraft.cardStyle === 'minimal'
                          ? 'border-amber-500 bg-white text-[#0F172A] shadow-md ring-2 ring-amber-400/40'
                          : 'border-slate-200 bg-white/60 text-slate-500 hover:bg-white'
                      }`}
                    >
                      <LayoutGrid className="h-4 w-4 text-amber-600" />
                      <span>Mode Minimalis</span>
                    </button>
                  </div>
                </div>

                {/* Preset Wallpaper Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Preset Wallpaper Gudang PLN
                  </label>
                  <div className="relative flex items-center">
                    <Palette className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-600" />
                    <select
                      value={configDraft.wallpaperPreset || 'warehouse'}
                      onChange={(e) => setConfigDraft({ ...configDraft, wallpaperPreset: e.target.value as any })}
                      className="w-full h-11 appearance-none rounded-xl border border-slate-300 pl-10 pr-10 text-sm bg-white font-medium text-slate-800 focus:border-[#0369a1] focus:ring-2 focus:ring-[#0369a1]/20 focus:outline-none"
                    >
                      {Object.values(WALLPAPER_PRESETS).map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} — {p.description}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  </div>
                </div>

                {/* Custom Wallpaper URL Input */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    URL Wallpaper Kustom (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Kosongkan jika menggunakan preset di atas..."
                    value={configDraft.customWallpaperUrl || ''}
                    onChange={(e) => setConfigDraft({ ...configDraft, customWallpaperUrl: e.target.value })}
                    className="w-full h-10 rounded-xl border border-slate-300 px-3 text-xs font-mono text-slate-800 focus:border-[#0369a1] focus:ring-2 focus:ring-[#0369a1]/20 focus:outline-none"
                  />
                </div>

                {/* Custom Photo URLs for Card A, B, C */}
                <div className="space-y-2 pt-1 border-t border-amber-200/50">
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-700 block">
                    Kustomisasi Foto Banner Kartu:
                  </span>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                      Foto Thumbnail A (Program Kerja):
                    </label>
                    <input
                      type="text"
                      value={configDraft.thumbnailAPhoto || ''}
                      placeholder={DEFAULT_CARD_PHOTOS.thumbnailA}
                      onChange={(e) => setConfigDraft({ ...configDraft, thumbnailAPhoto: e.target.value })}
                      className="w-full h-10 rounded-xl border border-slate-300 px-3 text-xs font-mono text-slate-800 focus:border-[#0369a1] focus:ring-2 focus:ring-[#0369a1]/20 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                      Foto Thumbnail B (Daftar Material):
                    </label>
                    <input
                      type="text"
                      value={configDraft.thumbnailBPhoto || ''}
                      placeholder={DEFAULT_CARD_PHOTOS.thumbnailB}
                      onChange={(e) => setConfigDraft({ ...configDraft, thumbnailBPhoto: e.target.value })}
                      className="w-full h-10 rounded-xl border border-slate-300 px-3 text-xs font-mono text-slate-800 focus:border-[#0369a1] focus:ring-2 focus:ring-[#0369a1]/20 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                      Foto Thumbnail C (Scan Barcode Item):
                    </label>
                    <input
                      type="text"
                      value={configDraft.thumbnailCPhoto || ''}
                      placeholder={DEFAULT_CARD_PHOTOS.thumbnailC}
                      onChange={(e) => setConfigDraft({ ...configDraft, thumbnailCPhoto: e.target.value })}
                      className="w-full h-10 rounded-xl border border-slate-300 px-3 text-xs font-mono text-slate-800 focus:border-[#0369a1] focus:ring-2 focus:ring-[#0369a1]/20 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleSaveConfig}
                className="mt-4 flex h-12 items-center justify-center rounded-xl bg-[#FACC15] px-8 text-sm font-black text-[#0F172A] shadow active:scale-95 hover:bg-amber-400 w-full sm:w-auto"
              >
                Simpan Konfigurasi
              </button>
            </div>
          )}

          {/* TAB 4: LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-800">Catatan Aktivitas & Diagnostik Sistem (Sanitized)</h4>
              <div className="max-h-[50vh] overflow-y-auto rounded-control border border-slate-200 bg-slate-900 p-4 font-mono text-xs text-slate-200 space-y-2">
                {logs.length === 0 ? (
                  <div className="text-slate-500">Belum ada catatan log.</div>
                ) : (
                  logs.map((l) => (
                    <div key={l.id} className="flex gap-2">
                      <span className="text-slate-400 shrink-0">
                        {new Date(l.timestamp).toLocaleTimeString('id-ID')}
                      </span>
                      <span
                        className={`font-bold shrink-0 ${
                          l.level === 'error' ? 'text-rose-400' : l.level === 'warn' ? 'text-amber-400' : 'text-emerald-400'
                        }`}
                      >
                        [{l.level.toUpperCase()}]
                      </span>
                      <span className="text-amber-300 shrink-0">[{l.component}]:</span>
                      <span className="text-slate-200">{l.message}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

      {/* Modal Konfirmasi Hapus Material */}
      {materialToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border-2 border-rose-400 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100">
                <Trash2 className="h-6 w-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Konfirmasi Hapus Material</h3>
                <span className="text-xs text-rose-700 font-bold">Tindakan ini menghapus data secara permanen</span>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 text-xs space-y-1">
              <div className="font-mono text-[11px] font-bold text-amber-800">
                Kode Material: {materialToDelete.code}
              </div>
              <div className="font-bold text-sm text-slate-900 leading-snug">
                {materialToDelete.name}
              </div>
              <div className="text-[11px] text-slate-500">
                Satuan: {materialToDelete.unit} &bull; ID: {materialToDelete.id}
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus barang masuk ini? Seluruh data stok gudang, nomor rak, dan barcode alias terkait material ini akan dihapus dari sistem kiosk.
            </p>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setMaterialToDelete(null)}
                className="h-11 px-5 rounded-xl border border-slate-300 font-bold text-slate-700 text-xs hover:bg-slate-100 active:scale-95 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteMaterial}
                className="flex items-center gap-2 h-11 px-5 rounded-xl bg-rose-600 text-white font-black text-xs shadow-md hover:bg-rose-700 active:scale-95 transition"
              >
                <Trash2 className="h-4 w-4" />
                <span>Ya, Hapus Material Ini</span>
              </button>
            </div>
          </div>
        </div>
      )}
        </AdminConsoleShell>
      </div>
    </div>
  );
};

