import React, { useState, useRef, useEffect } from 'react';
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
  FolderTree,
  Sparkles,
  Plus,
  Trash2,
  ArrowRight,
  Search,
  X,
  MoreVertical,
  Check,
  Settings,
  Download,
  FileSpreadsheet,
  ShieldCheck,
  KeyRound,
  UserPlus,
  Users,
  Eye,
  EyeOff,
  Lock,
  Database,
} from 'lucide-react';
import { AdminAuth } from './adminAuth';
import {
  UserManagementService,
  AdminUser,
  SpatiePermission,
  SPATIE_AVAILABLE_PERMISSIONS,
} from './userManagementService';
import { SqlBackupService, AutoBackupMeta } from './sqlBackupService';
import { ImportService, PackagePreviewSummary } from './importService';
import { CsvImportService, CsvImportStats, CsvImportScope } from './csvImportService';
import { snapshotManager } from './snapshotManager';
import { kioskStorage } from '../../adapters/storage/kioskStorage';
import { SyncService } from '../../adapters/storage/syncService';
import { ImportPackage, KioskConfig, Material } from '../../domain/types';
import { validateKioskConfig } from '../../domain/validation';
import { WALLPAPER_PRESETS, DEFAULT_CARD_PHOTOS, plnUp3MalangFullPackage } from '../../data/mockPlnPackage';
import { WarehouseLayoutService, WarehouseBlock } from '../layout/warehouseLayoutService';
import { AdminLoginScreen, AdminLoginUser } from './AdminLoginScreen';
import { AdminConsoleShell, AdminModuleTab } from './AdminConsoleShell';
import { NetworkInfoCard } from '../network/NetworkInfoCard';
import { NetworkAccessModal } from '../network/NetworkAccessModal';
import { ContentService } from '../programs/contentService';

interface AdminDashboardModalProps {
  visible: boolean;
  onClose: () => void;
  onPackageUpdated?: () => void;
  standalone?: boolean;
  bypassPin?: boolean;
  initialTab?: AdminModuleTab;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  visible,
  onClose,
  onPackageUpdated,
  standalone = false,
  bypassPin = false,
  initialTab = 'stock',
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    bypassPin ? true : AdminAuth.isAuthenticated()
  );
  const [currentUser, setCurrentUser] = useState<AdminLoginUser>(() => {
    return AdminAuth.getCurrentUser();
  });
  const [activeTab, setActiveTab] = useState<AdminModuleTab>(initialTab);
  const [overviewSearch, setOverviewSearch] = useState('');
  const [overviewSelectedCategory, setOverviewSelectedCategory] = useState<string>('all');
  const [showOverviewCategoryMenu, setShowOverviewCategoryMenu] = useState<boolean>(false);
  const [stockSearch, setStockSearch] = useState('');
  const [stockSelectedCategory, setStockSelectedCategory] = useState<string>('all');
  const [showStockCategoryMenu, setShowStockCategoryMenu] = useState<boolean>(false);
  const [showStockModal, setShowStockModal] = useState<boolean>(false);
  const [showNetworkModal, setShowNetworkModal] = useState(false);

  const triggerPackageUpdated = () => {
    onPackageUpdated?.();
    SyncService.pushState().catch(() => {});
  };


  // Import states
  const [jsonInput, setJsonInput] = useState('');
  const [parsedPackage, setParsedPackage] = useState<ImportPackage | null>(null);
  const [packagePreview, setPackagePreview] = useState<PackagePreviewSummary | null>(null);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importWarnings, setImportWarnings] = useState<string[]>([]);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // CSV Import & Replace states
  const [showCsvImportModal, setShowCsvImportModal] = useState<boolean>(false);
  const [csvText, setCsvText] = useState<string>('');
  const [csvFileName, setCsvFileName] = useState<string>('');
  const [csvImportMode, setCsvImportMode] = useState<'replace' | 'merge'>('replace');
  const [csvImportScope, setCsvImportScope] = useState<CsvImportScope>('auto');
  const [csvImportStats, setCsvImportStats] = useState<CsvImportStats | null>(null);
  const [csvParsedPackage, setCsvParsedPackage] = useState<ImportPackage | null>(null);
  const [csvImportError, setCsvImportError] = useState<string | null>(null);
  const [isProcessingCsv, setIsProcessingCsv] = useState<boolean>(false);
  const csvFileInputRef = useRef<HTMLInputElement | null>(null);

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
  const [adjustCategory, setAdjustCategory] = useState<string>('');
  const [adjustPhotoPath, setAdjustPhotoPath] = useState<string>('');
  const [stockError, setStockError] = useState<string | null>(null);

  // New Material states (persis format master Excel: nama material, stok, blok, rak, sub rak)
  const [newMatName, setNewMatName] = useState<string>('');
  const [newMatInitialQty, setNewMatInitialQty] = useState<number>(10);
  const [newMatCategory, setNewMatCategory] = useState<string>('');
  const [newMatPhotoPath, setNewMatPhotoPath] = useState<string>('');
  const [newMatBlok, setNewMatBlok] = useState<string>('A');
  const [newMatRack, setNewMatRack] = useState<string>('A');
  const [newMatBin, setNewMatBin] = useState<string>('A11');
  const [newMatCode, setNewMatCode] = useState<string>('');
  const [newMatBarcode, setNewMatBarcode] = useState<string>('');
  const [newMatCondition, setNewMatCondition] = useState<'BARU' | 'RETURN'>('BARU');
  const [newMatStatus, setNewMatStatus] = useState<string>('Baru');

  // Sub-katalog Stok: Baru vs Return
  const [stockConditionTab, setStockConditionTab] = useState<'baru' | 'return'>(
    initialTab === 'stock-return' ? 'return' : 'baru'
  );
  const [stockReturnStatusFilter, setStockReturnStatusFilter] = useState<'all' | 'GARANSI' | 'PERBAIKAN' | 'USUL HAPUS' | 'STANDBY'>('all');

  useEffect(() => {
    if (activeTab === 'stock-return') {
      setStockConditionTab('return');
    } else if (activeTab === 'stock-baru' || activeTab === 'stock') {
      setStockConditionTab('baru');
    }
  }, [activeTab]);

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
  const [blockToDelete, setBlockToDelete] = useState<{
    letter: string;
    code: string;
    name: string;
    occupiedCount: number;
    subBlockCount: number;
    slotCount: number;
  } | null>(null);
  const [subBlockToDelete, setSubBlockToDelete] = useState<{
    code: string;
    occupiedCount: number;
    slotCount: number;
  } | null>(null);
  const [slotToDelete, setSlotToDelete] = useState<{
    code: string;
    isOccupied: boolean;
    materialName?: string | null;
  } | null>(null);

  // User Management (Spatie) states
  const [usersList, setUsersList] = useState<AdminUser[]>(() => UserManagementService.getUsers());
  const [showAddUserModal, setShowAddUserModal] = useState<boolean>(false);
  const [newUserName, setNewUserName] = useState<string>('');
  const [newUserEmail, setNewUserEmail] = useState<string>('');
  const [newUserPassword, setNewUserPassword] = useState<string>('');
  const [newUserRole, setNewUserRole] = useState<string>('Petugas Logistik');
  const [newUserIsWildcard, setNewUserIsWildcard] = useState<boolean>(true); // Default true: Spatie bisa akses kemana saja
  const [newUserPermissions, setNewUserPermissions] = useState<SpatiePermission[]>(['dashboard.view', 'stock.view']);
  const [addUserError, setAddUserError] = useState<string | null>(null);
  const [addUserSuccess, setAddUserSuccess] = useState<string | null>(null);

  // Profile & Change Password states
  const [currentPasswordInput, setCurrentPasswordInput] = useState<string>('');
  const [newPasswordInput, setNewPasswordInput] = useState<string>('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState<string>('');
  const [showCurrentPassword, setShowCurrentPassword] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [profileActionError, setProfileActionError] = useState<string | null>(null);
  const [profileActionSuccess, setProfileActionSuccess] = useState<string | null>(null);

  // SQL Backup (backup.sql) states
  const [startupBackupMeta, setStartupBackupMeta] = useState<AutoBackupMeta | null>(() =>
    SqlBackupService.getAutoBackupMeta('startup')
  );
  const [shutdownBackupMeta, setShutdownBackupMeta] = useState<AutoBackupMeta | null>(() =>
    SqlBackupService.getAutoBackupMeta('shutdown')
  );
  const [showSqlRestoreModal, setShowSqlRestoreModal] = useState<boolean>(false);
  const [sqlRestoreInput, setSqlRestoreInput] = useState<string>('');
  const [sqlRestoreFileName, setSqlRestoreFileName] = useState<string>('');
  const [sqlRestoreSuccess, setSqlRestoreSuccess] = useState<string | null>(null);
  const [sqlRestoreError, setSqlRestoreError] = useState<string | null>(null);
  const [isProcessingSqlRestore, setIsProcessingSqlRestore] = useState<boolean>(false);
  const sqlFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDownloadSqlBackup = () => {
    SqlBackupService.downloadSqlFile('backup.sql');
    setStartupBackupMeta(SqlBackupService.getAutoBackupMeta('startup'));
    setShutdownBackupMeta(SqlBackupService.getAutoBackupMeta('shutdown'));
  };

  const handleSqlFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSqlRestoreFileName(file.name);
    setSqlRestoreError(null);
    setSqlRestoreSuccess(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setSqlRestoreInput(content);
      }
    };
    reader.onerror = () => {
      setSqlRestoreError('Gagal membaca berkas file SQL.');
    };
    reader.readAsText(file);
  };

  const handleExecuteSqlRestore = (e: React.FormEvent) => {
    e.preventDefault();
    setSqlRestoreError(null);
    setSqlRestoreSuccess(null);
    setIsProcessingSqlRestore(true);

    try {
      const res = SqlBackupService.restoreFromSql(sqlRestoreInput);
      if (res.success) {
        setSqlRestoreSuccess(res.message);
        triggerPackageUpdated();
        setTimeout(() => {
          setShowSqlRestoreModal(false);
          setSqlRestoreInput('');
          setSqlRestoreFileName('');
          setSqlRestoreSuccess(null);
        }, 1200);
      } else {
        setSqlRestoreError(res.message || res.error || 'Gagal memulihkan database dari SQL.');
      }
    } catch (err) {
      setSqlRestoreError(err instanceof Error ? err.message : 'Terjadi kesalahan saat memulihkan database.');
    } finally {
      setIsProcessingSqlRestore(false);
    }
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    setAddUserError(null);
    setAddUserSuccess(null);

    const permissionsToAssign: SpatiePermission[] = newUserIsWildcard
      ? ['*']
      : newUserPermissions.length > 0
      ? newUserPermissions
      : ['dashboard.view', 'stock.view'];

    const res = UserManagementService.addUser({
      name: newUserName,
      email: newUserEmail,
      password: newUserPassword,
      role: newUserRole,
      permissions: permissionsToAssign,
    });

    if (res.success && res.user) {
      setUsersList(UserManagementService.getUsers());
      setAddUserSuccess(
        `Pengguna '${res.user.name}' (${res.user.email}) berhasil ditambahkan dengan akses Spatie ${
          newUserIsWildcard ? 'Wildcard (* - Bisa Akses Kemana Saja)' : 'Kustom'
        }!`
      );
      setShowAddUserModal(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserRole('Petugas Logistik');
      setNewUserIsWildcard(true);
      setNewUserPermissions(['dashboard.view', 'stock.view']);
    } else {
      setAddUserError(res.error || 'Gagal menambahkan pengguna baru.');
    }
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (window.confirm(`Yakin ingin menghapus pengguna '${userName}'? Tindakan ini tidak dapat dibatalkan.`)) {
      const res = UserManagementService.deleteUser(userId);
      if (res.success) {
        setUsersList(UserManagementService.getUsers());
        setAddUserSuccess(`Pengguna '${userName}' berhasil dihapus.`);
      } else {
        alert(res.error || 'Gagal menghapus pengguna.');
      }
    }
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileActionError(null);
    setProfileActionSuccess(null);

    if (newPasswordInput !== confirmPasswordInput) {
      setProfileActionError('Konfirmasi kata sandi baru tidak cocok!');
      return;
    }

    if (newPasswordInput.length < 4) {
      setProfileActionError('Kata sandi baru minimal 4 karakter!');
      return;
    }

    const res = UserManagementService.updatePassword(
      currentUser.email,
      currentPasswordInput,
      newPasswordInput
    );

    if (res.success) {
      setProfileActionSuccess('Kata sandi berhasil diperbarui! Silakan gunakan kata sandi baru untuk login berikutnya.');
      setCurrentPasswordInput('');
      setNewPasswordInput('');
      setConfirmPasswordInput('');
      setUsersList(UserManagementService.getUsers());
    } else {
      setProfileActionError(res.error || 'Gagal memperbarui kata sandi.');
    }
  };

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
        categoryId: adjustCategory || undefined,
        photoPath: adjustPhotoPath,
      });
      setActionSuccessMessage('Stok, kategori, dan foto material berhasil diperbarui.');
      setShowStockModal(false);
      triggerPackageUpdated();
    } catch (err: any) {
      setStockError(err.message || 'Gagal memperbarui stok.');
    }
  };

  const handleAddNewMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    setStockError(null);
    try {
      if (!newMatName.trim()) {
        setStockError('Nama material tidak boleh kosong.');
        return;
      }
      const finalBlok = newMatBlok.trim().toUpperCase() || 'A';
      const finalRack = newMatRack.trim().toUpperCase() || 'A';
      const finalSubRak = newMatBin.trim().toUpperCase() || 'A11';

      kioskStorage.addMaterialWithBarcode({
        code: newMatCode.trim() || undefined,
        name: newMatName.trim(),
        categoryId: newMatCategory || undefined,
        photoPath: newMatPhotoPath.trim() || undefined,
        barcode: newMatBarcode.trim() || undefined,
        zone: `Blok ${finalBlok}`,
        rack: finalRack,
        bin: finalSubRak,
        initialQuantity: Number(newMatInitialQty) || 0,
        condition: newMatCondition,
        status: newMatCondition === 'RETURN' ? newMatStatus : 'Baru',
      });
      setActionSuccessMessage(`Material "${newMatName}" (${newMatCondition}) berhasil didaftarkan di BLOK ${finalBlok}, RAK ${finalRack}, SUB RAK ${finalSubRak}.`);
      setNewMatName('');
      setNewMatInitialQty(10);
      setNewMatCategory('');
      setNewMatPhotoPath('');
      setNewMatBlok('A');
      setNewMatRack('A');
      setNewMatBin('A11');
      setNewMatCode('');
      setNewMatBarcode('');
      setNewMatCondition('BARU');
      setNewMatStatus('Baru');
      setShowStockModal(false);
      triggerPackageUpdated();
    } catch (err: any) {
      setStockError(err.message || 'Gagal mendaftarkan material baru.');
    }
  };

  const handleExportCsv = () => {
    const isRet = stockConditionTab === 'return';
    const targetPkg = isRet ? kioskStorage.getPackageReturn() : kioskStorage.getPackageBaru();
    if (!targetPkg || targetPkg.materials.length === 0) {
      setStockError(`Database material ${isRet ? 'Return' : 'Baru'} masih kosong.`);
      return;
    }

    const rows = targetPkg.materials.map((m, idx) => {
      const { totalQty, blokDisplay, rakDisplay, subRakDisplay } = getMaterialLocationInfo(m.id, targetPkg);
      const safeName = m.name.includes(',') || m.name.includes('"')
        ? `"${m.name.replace(/"/g, '""')}"`
        : m.name;
      const normCode = m.code || m.sapCode || '';
      const subRakCol = subRakDisplay !== '-' ? subRakDisplay : '';
      if (isRet) {
        return `${idx + 1},${safeName},${normCode},${m.unit},${totalQty},${blokDisplay},${rakDisplay},${subRakCol},${m.status || 'STANDBY'}`;
      }
      return `${idx + 1},${safeName},${normCode},${m.unit},${totalQty},${blokDisplay},${rakDisplay},${subRakCol}`;
    });

    const header = isRet
      ? 'No,Nama Material,Kode Normalisasi,Satuan,Stok,BLOK,RAK,SUB RAK,STATUS\n'
      : 'No,Nama Material,Kode Normalisasi,Satuan,Stok,BLOK,RAK,\n';
    const csvContent = header + rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `export_material_${isRet ? 'NEW_RETUR' : 'NEW'}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setActionSuccessMessage(`Berhasil mengekspor Database Material ${isRet ? 'Return' : 'Baru'} (${rows.length} item) ke format CSV master Excel SAP.`);
  };

  const processCsvContent = async (rawCsv: string, mode: 'replace' | 'merge', scope: CsvImportScope = csvImportScope) => {
    if (!rawCsv.trim()) {
      setCsvImportStats(null);
      setCsvParsedPackage(null);
      return;
    }
    setIsProcessingCsv(true);
    setCsvImportError(null);
    try {
      const basePkg = scope === 'return-only'
        ? kioskStorage.getPackageReturn()
        : scope === 'baru-only'
        ? kioskStorage.getPackageBaru()
        : kioskStorage.getActivePackage();

      const { pkg, stats } = await CsvImportService.createPackageFromCsv(rawCsv, mode, basePkg, scope);
      if (stats.validRows === 0) {
        setCsvImportError('Tidak ditemukan baris data material yang valid di dalam file CSV.');
        setCsvImportStats(null);
        setCsvParsedPackage(null);
        return;
      }
      setCsvImportStats(stats);
      setCsvParsedPackage(pkg);
    } catch (err: any) {
      setCsvImportError(err.message || 'Gagal memproses file CSV.');
      setCsvImportStats(null);
      setCsvParsedPackage(null);
    } finally {
      setIsProcessingCsv(false);
    }
  };

  const handleCsvFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFileName(file.name);
    try {
      const text = await file.text();
      setCsvText(text);
      await processCsvContent(text, csvImportMode, csvImportScope);
    } catch (err: any) {
      setCsvImportError(err.message || 'Gagal membaca file CSV.');
    }
  };

  const handleApplyCsvImport = () => {
    if (!csvParsedPackage || !csvImportStats) return;
    try {
      const targetScope: 'baru' | 'return' | 'all' =
        csvImportStats.effectiveScope === 'return-only' || csvImportScope === 'return-only'
          ? 'return'
          : csvImportStats.effectiveScope === 'baru-only' || csvImportScope === 'baru-only'
          ? 'baru'
          : 'all';

      kioskStorage.activatePackage(csvParsedPackage, targetScope);
      WarehouseLayoutService.syncWithPackage(kioskStorage.getActivePackage() || csvParsedPackage);
      triggerPackageUpdated();
      setShowCsvImportModal(false);

      if (targetScope === 'return') {
        setActionSuccessMessage(
          `Sukses memperbarui Database Material Return (${csvImportStats.validRows} item). Database Material Baru (${kioskStorage.getPackageBaru().materials.length} item) 100% aman tersimpan di database terpisah!`
        );
      } else if (targetScope === 'baru') {
        setActionSuccessMessage(
          `Sukses memperbarui Database Material Baru (${csvImportStats.validRows} item). Database Material Return (${kioskStorage.getPackageReturn().materials.length} item) 100% aman tersimpan di database terpisah!`
        );
      } else {
        setActionSuccessMessage(
          csvImportStats.mode === 'replace'
            ? `Sukses mengganti database material dengan ${csvImportStats.materialsCount} item dari CSV!`
            : `Sukses memperbarui dan menggabungkan ${csvImportStats.validRows} item dari CSV ke database!`
        );
      }

      setCsvText('');
      setCsvFileName('');
      setCsvImportStats(null);
      setCsvParsedPackage(null);
    } catch (err: any) {
      setCsvImportError(err.message || 'Gagal menerapkan data CSV ke database.');
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

  const handleConfirmDeleteBlock = () => {
    if (!blockToDelete) return;
    try {
      if (adminBlocks.length <= 1) {
        setBlockActionMessage('Tidak dapat menghapus blok terakhir. Minimal harus ada 1 blok tersisa di denah gudang.');
        setBlockToDelete(null);
        return;
      }
      const ok = WarehouseLayoutService.deleteBlock(blockToDelete.letter);
      if (ok) {
        setAdminBlocks(WarehouseLayoutService.getBlocks());
        setBlockActionMessage(`Blok "${blockToDelete.code}" (${blockToDelete.name}) berhasil dihapus.`);
        triggerPackageUpdated();
      } else {
        setBlockActionMessage(`Gagal menemukan Blok ${blockToDelete.code} untuk dihapus.`);
      }
    } catch (err: unknown) {
      setBlockActionMessage(err instanceof Error ? err.message : 'Gagal menghapus blok');
    } finally {
      setBlockToDelete(null);
    }
  };

  const handleConfirmDeleteSubBlock = () => {
    if (!subBlockToDelete) return;
    try {
      const ok = WarehouseLayoutService.deleteSubBlock(subBlockToDelete.code);
      if (ok) {
        setAdminBlocks(WarehouseLayoutService.getBlocks());
        setBlockActionMessage(`Baris Sub-Blok "${subBlockToDelete.code}" berhasil dihapus.`);
        triggerPackageUpdated();
      } else {
        setBlockActionMessage(`Gagal menemukan Baris Sub-Blok ${subBlockToDelete.code} untuk dihapus.`);
      }
    } catch (err: unknown) {
      setBlockActionMessage(err instanceof Error ? err.message : 'Gagal menghapus baris');
    } finally {
      setSubBlockToDelete(null);
    }
  };

  const handleConfirmDeleteSlot = () => {
    if (!slotToDelete) return;
    try {
      const ok = WarehouseLayoutService.deleteSlot(slotToDelete.code);
      if (ok) {
        setAdminBlocks(WarehouseLayoutService.getBlocks());
        setBlockActionMessage(`Slot "${slotToDelete.code}" berhasil dihapus.`);
        triggerPackageUpdated();
      } else {
        setBlockActionMessage(`Gagal menemukan Slot ${slotToDelete.code} untuk dihapus.`);
      }
    } catch (err: unknown) {
      setBlockActionMessage(err instanceof Error ? err.message : 'Gagal menghapus slot');
    } finally {
      setSlotToDelete(null);
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

  const getMaterialLocationInfo = (materialId: string, pkg?: ImportPackage | null) => {
    const snapshots = pkg?.stockSnapshots.filter(s => s.materialId === materialId) || [];
    const totalQty = snapshots.reduce((sum, s) => sum + (s.quantity || 0), 0);
    const locObj = snapshots[0] ? pkg?.locations.find(l => l.id === snapshots[0].locationId) : null;

    let blokDisplay = '-';
    if (locObj?.zone) {
      const rawZone = locObj.zone.replace(/\s*\(.*?\)/g, '').trim();
      blokDisplay = rawZone.replace(/^Blok\s+/i, '').trim() || rawZone;
    }

    let rakDisplay = '-';
    if (locObj?.rack) {
      const rawRack = locObj.rack.trim();
      if (rawRack && rawRack !== '-' && !rawRack.toLowerCase().includes('area terbuka')) {
        rakDisplay = rawRack.replace(/^Rak\s+/i, '').trim();
      }
    }

    let subRakDisplay = '-';
    if (locObj?.bin) {
      const rawBin = locObj.bin.trim();
      if (rawBin && rawBin !== '-' && rawBin !== 'Luar Rak' && rawBin !== 'Tanpa Rak') {
        subRakDisplay = rawBin.replace(/^Sub\s*Rak\s+/i, '').trim();
      }
    }

    return { totalQty, blokDisplay, rakDisplay, subRakDisplay, locObj };
  };

  const pkgBaru = kioskStorage.getPackageBaru();
  const pkgReturn = kioskStorage.getPackageReturn();
  const totalBaruCount = pkgBaru.materials.length;
  const totalReturnCount = pkgReturn.materials.length;
  const currentTabPkg = stockConditionTab === 'return' ? pkgReturn : pkgBaru;

  const filteredStockMaterials = currentTabPkg.materials.filter((m) => {
    // 1. Pemisahan Katalog Stok: Baru vs Return
    if (stockConditionTab === 'return') {
      if (stockReturnStatusFilter !== 'all') {
        const s = (m.status || 'STANDBY').toUpperCase();
        if (s !== stockReturnStatusFilter) return false;
      }
    }

    // 2. Filter Kategori
    if (stockSelectedCategory !== 'all' && m.categoryId !== stockSelectedCategory) {
      return false;
    }

    // 3. Filter Pencarian Teks
    if (!stockSearch) return true;
    const q = stockSearch.toLowerCase().trim();
    const { blokDisplay, rakDisplay, subRakDisplay } = getMaterialLocationInfo(m.id, currentTabPkg);
    return (
      m.name.toLowerCase().includes(q) ||
      m.code.toLowerCase().includes(q) ||
      (m.sapCode ? m.sapCode.toLowerCase().includes(q) : false) ||
      m.unit.toLowerCase().includes(q) ||
      blokDisplay.toLowerCase().includes(q) ||
      rakDisplay.toLowerCase().includes(q) ||
      subRakDisplay.toLowerCase().includes(q) ||
      (m.status ? m.status.toLowerCase().includes(q) : false)
    );
  });

  const overviewFilteredMaterials = (activePkg?.materials || []).filter((m) => {
    if (overviewSelectedCategory !== 'all' && m.categoryId !== overviewSelectedCategory) {
      return false;
    }
    if (!overviewSearch) return true;
    const q = overviewSearch.toLowerCase().trim();
    const { blokDisplay, rakDisplay, subRakDisplay } = getMaterialLocationInfo(m.id, activePkg);
    return (
      m.name.toLowerCase().includes(q) ||
      m.code.toLowerCase().includes(q) ||
      (m.sapCode ? m.sapCode.toLowerCase().includes(q) : false) ||
      m.unit.toLowerCase().includes(q) ||
      blokDisplay.toLowerCase().includes(q) ||
      rakDisplay.toLowerCase().includes(q) ||
      subRakDisplay.toLowerCase().includes(q)
    );
  });

  return (
    <div className={standalone ? "min-h-screen w-full bg-slate-100 flex flex-col font-sans" : "fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-2 sm:p-4"}>
      <div className={standalone ? "w-full min-h-screen" : "w-full h-full max-w-[1800px] max-h-[98vh] rounded-2xl overflow-hidden shadow-2xl border border-slate-700 bg-white"}>
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
          onOpenNetworkModal={() => setShowNetworkModal(true)}
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
              {/* Dynamic WiFi LAN Access Info Card */}
              <NetworkInfoCard onOpenFullModal={() => setShowNetworkModal(true)} />

              {/* Quick Action Pills Bar */}
              <div className="adms-quick-actions-bar">
                <button
                  type="button"
                  className="adms-action-pill"
                  onClick={() => { setActiveTab('stock'); setStockMode('adjust'); setShowStockModal(true); }}
                >
                  <Boxes size={15} strokeWidth={2} />
                  <span>Penyesuaian Cepat Stok</span>
                  <ArrowRight size={13} strokeWidth={2} className="arrow" />
                </button>
                <button
                  type="button"
                  className="adms-action-pill"
                  onClick={() => { setActiveTab('stock'); setStockMode('new-material'); setShowStockModal(true); }}
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
              <div className="adms-kpi-grid grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
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
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative w-full sm:w-80">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Cari nama, kode normalisasi, blok, rak..."
                        value={overviewSearch}
                        onChange={(e) => setOverviewSearch(e.target.value)}
                        className="w-full h-10 rounded-xl border border-slate-300 pl-9 pr-8 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-[#0369a1] focus:ring-2 focus:ring-[#0369a1]/20 focus:outline-none"
                      />
                      {overviewSearch && (
                        <button
                          type="button"
                          onClick={() => setOverviewSearch('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                          aria-label="Bersihkan pencarian overview"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Titik 3 Filter Kategori Overview */}
                    <div className="relative shrink-0">
                      <button
                        type="button"
                        onClick={() => setShowOverviewCategoryMenu((prev) => !prev)}
                        title="Filter Berdasarkan Kategori"
                        aria-label="Filter berdasarkan kategori overview"
                        className={`flex h-10 w-10 items-center justify-center rounded-xl border transition shadow-2xs active:scale-95 ${
                          overviewSelectedCategory !== 'all'
                            ? 'bg-amber-100 border-amber-400 text-amber-900 font-bold ring-2 ring-amber-400/30'
                            : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>

                      {showOverviewCategoryMenu && (
                        <>
                          <div
                            className="fixed inset-0 z-30"
                            onClick={() => setShowOverviewCategoryMenu(false)}
                          />
                          <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-40 animate-in fade-in zoom-in-95 duration-100 text-left">
                            <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between mb-1">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                Filter Kategori
                              </span>
                              <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-semibold">
                                {activePkg?.categories.length || 0} Kategori
                              </span>
                            </div>
                            <div className="max-h-60 overflow-y-auto py-1 space-y-0.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setOverviewSelectedCategory('all');
                                  setShowOverviewCategoryMenu(false);
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition ${
                                  overviewSelectedCategory === 'all'
                                    ? 'bg-amber-50 text-amber-900 font-bold'
                                    : 'text-slate-700 hover:bg-slate-100'
                                }`}
                              >
                                <span>Semua Kategori</span>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[11px] text-slate-400">({activePkg?.materials.length || 0})</span>
                                  {overviewSelectedCategory === 'all' && <Check className="h-3.5 w-3.5 text-amber-600" />}
                                </div>
                              </button>
                              {activePkg?.categories.map((cat) => {
                                const count = (activePkg.materials || []).filter((m) => m.categoryId === cat.id).length;
                                const isSelected = overviewSelectedCategory === cat.id;
                                return (
                                  <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => {
                                      setOverviewSelectedCategory(cat.id);
                                      setShowOverviewCategoryMenu(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition ${
                                      isSelected
                                        ? 'bg-amber-50 text-amber-900 font-bold'
                                        : 'text-slate-700 hover:bg-slate-100'
                                    }`}
                                  >
                                    <span className="truncate pr-2">{cat.name}</span>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <span className="text-[11px] text-slate-400">({count})</span>
                                      {isSelected && <Check className="h-3.5 w-3.5 text-amber-600" />}
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

                {overviewSelectedCategory !== 'all' && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[11px] font-semibold text-slate-500">Filter Kategori:</span>
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-100 border border-amber-300 px-2.5 py-1 text-xs font-bold text-amber-900">
                      <span>{activePkg?.categories.find((c) => c.id === overviewSelectedCategory)?.name || overviewSelectedCategory}</span>
                      <button
                        type="button"
                        onClick={() => setOverviewSelectedCategory('all')}
                        className="text-amber-700 hover:text-amber-950 p-0.5 rounded-full hover:bg-amber-200/60"
                        title="Hapus filter kategori"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  </div>
                )}

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs min-w-[640px]">
                    <thead className="bg-slate-50 font-bold uppercase text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="p-3 w-12 text-center">No</th>
                        <th className="p-3">Nama Material</th>
                        <th className="p-3">Kode Normalisasi</th>
                        <th className="p-3 text-center">Satuan</th>
                        <th className="p-3 text-center">Stok</th>
                        <th className="p-3 text-center">BLOK</th>
                        <th className="p-3 text-center">RAK</th>
                        <th className="p-3 text-center">SUB RAK</th>
                        <th className="p-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {overviewFilteredMaterials.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="p-8 text-center text-slate-400 font-medium">
                            Tidak ada material yang cocok dengan pencarian "{overviewSearch}".
                          </td>
                        </tr>
                      ) : (
                        overviewFilteredMaterials
                          .slice(0, overviewSearch ? 100 : 15)
                          .map((mat, idx) => {
                            const { totalQty, blokDisplay, rakDisplay, subRakDisplay } = getMaterialLocationInfo(mat.id, activePkg);
                            return (
                              <tr key={mat.id} className="hover:bg-slate-50 transition">
                                <td className="p-3 text-center text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                                <td className="p-3 font-bold text-slate-900 min-w-[200px]">{mat.name}</td>
                                <td className="p-3 font-mono font-bold text-sky-700">{mat.code}</td>
                                <td className="p-3 text-center font-bold text-slate-600">{mat.unit}</td>
                                <td className="p-3 text-center">
                                  <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                                      totalQty > 0
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                                    }`}
                                  >
                                    {totalQty}
                                  </span>
                                </td>
                                <td className="p-3 text-center font-mono font-bold text-amber-900">
                                  <span className="inline-block px-2 py-0.5 rounded bg-amber-100/80 border border-amber-300">
                                    {blokDisplay}
                                  </span>
                                </td>
                                <td className="p-3 text-center font-mono font-bold text-slate-800">
                                  <span className={rakDisplay !== '-' ? 'inline-block px-2 py-0.5 rounded bg-slate-100 border border-slate-200' : 'text-slate-400'}>
                                    {rakDisplay}
                                  </span>
                                </td>
                                <td className="p-3 text-center font-mono font-bold text-sky-800">
                                  <span className={subRakDisplay !== '-' ? 'inline-block px-2 py-0.5 rounded bg-sky-50 border border-sky-200' : 'text-slate-400'}>
                                    {subRakDisplay}
                                  </span>
                                </td>
                                <td className="p-3 text-right">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setAdjustMatId(mat.id);
                                      setActiveTab('stock');
                                      setStockMode('adjust');
                                      setShowStockModal(true);
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 font-bold hover:bg-sky-100 text-[11px] transition"
                                  >
                                    Sesuaikan
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                      )}
                    </tbody>
                  </table>

                  {/* Table Footer / Jump to Full Stock Management */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-600">
                    <div>
                      Menampilkan <strong className="font-bold text-slate-900">{Math.min(overviewFilteredMaterials.length, overviewSearch ? 100 : 15)}</strong> dari <strong className="font-bold text-slate-900">{overviewFilteredMaterials.length}</strong> material
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('stock')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FACC15] text-[#0F172A] font-bold hover:bg-amber-400 transition text-xs shadow-2xs"
                    >
                      <Boxes className="h-3.5 w-3.5" />
                      <span>Buka Manajemen Stok Lengkap (157 Material) &rarr;</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: STOCK & MATERIAL MUTATION (Dukungan Katalog Baru & Return) */}
          {(activeTab === 'stock' || activeTab === 'stock-baru' || activeTab === 'stock-return') && (
            <div className="space-y-4">
              {/* Sub-Katalog Switcher: Baru vs Return */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 mr-1 hidden sm:inline">Pilih Katalog Stok:</span>
                  <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => {
                        setStockConditionTab('baru');
                        setActiveTab('stock-baru');
                      }}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                        stockConditionTab === 'baru'
                          ? 'bg-sky-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>Katalog Baru</span>
                      <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                        stockConditionTab === 'baru' ? 'bg-sky-700 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {totalBaruCount}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setStockConditionTab('return');
                        setActiveTab('stock-return');
                      }}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                        stockConditionTab === 'return'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-amber-300" />
                      <span>Katalog Return</span>
                      <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                        stockConditionTab === 'return' ? 'bg-amber-700 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {totalReturnCount}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Filter Status Retur (hanya saat mode Return aktif) */}
                {stockConditionTab === 'return' && (
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="text-[11px] font-bold text-amber-900 mr-1">Status Retur:</span>
                    {(['all', 'GARANSI', 'PERBAIKAN', 'USUL HAPUS', 'STANDBY'] as const).map((st) => {
                      const isSel = stockReturnStatusFilter === st;
                      const label = st === 'all' ? 'Semua Status' : st;
                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setStockReturnStatusFilter(st)}
                          className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
                            isSel
                              ? 'bg-amber-600 text-white shadow-2xs'
                              : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-3.5">
                <div className="min-w-0">
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Boxes className="h-4 w-4 text-amber-600 shrink-0" />
                    <span>
                      Daftar &amp; Kelola Stok Material {stockConditionTab === 'return' ? '(Katalog Return)' : '(Katalog Baru)'} ({filteredStockMaterials.length} dari {stockConditionTab === 'return' ? totalReturnCount : totalBaruCount} Terdaftar):
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    Kolom disesuaikan dengan format master Excel SAP (No, Nama Material, Kode Normalisasi, Satuan, Stok, BLOK, RAK, SUB RAK, Status)
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setStockMode('new-material');
                        setNewMatCondition(stockConditionTab === 'return' ? 'RETURN' : 'BARU');
                        setNewMatStatus(stockConditionTab === 'return' ? 'STANDBY' : 'Baru');
                        setStockError(null);
                        setShowStockModal(true);
                      }}
                      className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[#FACC15] px-3.5 text-xs font-bold text-[#0F172A] shadow-2xs hover:bg-amber-400 active:scale-95 transition shrink-0"
                      title="Buka pop-up tambah material baru"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Tambah Material {stockConditionTab === 'return' ? 'Return' : 'Baru'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setStockMode('adjust');
                        setStockError(null);
                        setShowStockModal(true);
                      }}
                      className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-white border border-slate-300 px-3.5 text-xs font-bold text-slate-700 hover:bg-slate-50 active:scale-95 transition shadow-2xs shrink-0"
                      title="Buka pop-up penyesuaian stok material"
                    >
                      <Boxes className="h-4 w-4 text-amber-600" />
                      <span>Penyesuaian Stok</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleExportCsv}
                      className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 text-xs font-bold text-white shadow-2xs hover:bg-emerald-700 active:scale-95 transition shrink-0"
                      title="Export database material ke file CSV (Format Master Excel SAP)"
                    >
                      <Download className="h-4 w-4" />
                      <span>Export CSV (Excel SAP)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCsvImportError(null);
                        setCsvImportScope(stockConditionTab === 'return' ? 'return-only' : 'baru-only');
                        setShowCsvImportModal(true);
                      }}
                      className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-sky-700 px-3.5 text-xs font-bold text-white shadow-2xs hover:bg-sky-800 active:scale-95 transition shrink-0"
                      title="Import file CSV untuk mengganti atau memperbarui database stok material"
                    >
                      <Upload className="h-4 w-4" />
                      <span>Import CSV ({stockConditionTab === 'return' ? 'Katalog Return' : 'Katalog Baru'})</span>
                    </button>
                  </div>

                  {/* Search Bar & Titik 3 Category Filter for Stock Table */}
                  <div className="flex items-center gap-2 flex-1 sm:flex-initial min-w-[240px]">
                    <div className="relative flex-1 sm:w-64 md:w-72">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        value={stockSearch}
                        onChange={(e) => setStockSearch(e.target.value)}
                        placeholder="Cari nama, kode normalisasi, blok, rak..."
                        className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0369a1] bg-white"
                      />
                      {stockSearch && (
                        <button
                          type="button"
                          onClick={() => setStockSearch('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Titik 3 Dropdown Filter Kategori */}
                    <div className="relative shrink-0">
                      <button
                        type="button"
                        onClick={() => setShowStockCategoryMenu(prev => !prev)}
                        className={`h-10 w-10 flex items-center justify-center rounded-xl border transition ${
                          stockSelectedCategory !== 'all'
                            ? 'bg-amber-100 border-amber-400 text-amber-900 shadow-2xs'
                            : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                        }`}
                        title="Filter Berdasarkan Kategori"
                        aria-label="Filter berdasarkan kategori"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>

                      {showStockCategoryMenu && (
                        <div className="absolute right-0 top-12 w-64 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-30 animate-in fade-in zoom-in-95 duration-150">
                          <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Filter Kategori:
                          </div>
                          <div className="max-h-60 overflow-y-auto py-1">
                            <button
                              type="button"
                              onClick={() => {
                                setStockSelectedCategory('all');
                                setShowStockCategoryMenu(false);
                              }}
                              className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition ${
                                stockSelectedCategory === 'all'
                                  ? 'bg-amber-50 text-amber-900 font-bold'
                                  : 'text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <span>Semua Kategori</span>
                              {stockSelectedCategory === 'all' && <Check className="h-3.5 w-3.5 text-amber-600" />}
                            </button>
                            {activePkg?.categories.map((c) => (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => {
                                  setStockSelectedCategory(c.id);
                                  setShowStockCategoryMenu(false);
                                }}
                                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition ${
                                  stockSelectedCategory === c.id
                                    ? 'bg-amber-50 text-amber-900 font-bold'
                                    : 'text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                <span className="truncate">{c.name}</span>
                                {stockSelectedCategory === c.id && <Check className="h-3.5 w-3.5 text-amber-600" />}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {stockSelectedCategory !== 'all' && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-500">Filter Kategori:</span>
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-100 border border-amber-300 px-2.5 py-1 text-xs font-bold text-amber-900">
                    <span>{activePkg?.categories.find((c) => c.id === stockSelectedCategory)?.name || stockSelectedCategory}</span>
                    <button
                      type="button"
                      onClick={() => setStockSelectedCategory('all')}
                      className="text-amber-700 hover:text-amber-950 p-0.5 rounded-full hover:bg-amber-200/60"
                      title="Hapus filter kategori"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                </div>
              )}

              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
                <table className="w-full text-left text-xs min-w-[720px]">
                  <thead className="bg-slate-50 font-bold uppercase text-slate-600 border-b border-slate-200 sticky top-0 z-10 shadow-xs">
                    <tr>
                      <th className="p-3 w-12 text-center">No</th>
                      <th className="p-3">Nama Material</th>
                      <th className="p-3">Kode Normalisasi</th>
                      <th className="p-3 text-center">Satuan</th>
                      <th className="p-3 text-center">Stok</th>
                      <th className="p-3 text-center">BLOK</th>
                      <th className="p-3 text-center">RAK</th>
                      <th className="p-3 text-center">SUB RAK</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3">Kategori</th>
                      <th className="p-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredStockMaterials.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="p-8 text-center text-slate-400 font-medium">
                          Tidak ada material yang cocok dengan pencarian "{stockSearch}".
                        </td>
                      </tr>
                    ) : (
                      filteredStockMaterials.map((m, idx) => {
                        const { totalQty, blokDisplay, rakDisplay, subRakDisplay } = getMaterialLocationInfo(m.id, currentTabPkg);
                        const category = currentTabPkg.categories.find(c => c.id === m.categoryId) || activePkg?.categories.find(c => c.id === m.categoryId);
                        return (
                          <tr key={m.id} className="hover:bg-slate-50 transition">
                            <td className="p-3 text-center text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                            <td className="p-3 font-bold text-slate-900 min-w-[220px]">{m.name}</td>
                            <td className="p-3 font-mono font-bold text-sky-700">{m.code}</td>
                            <td className="p-3 text-center font-bold text-slate-600">{m.unit}</td>
                            <td className="p-3 text-center">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                                  totalQty > 0
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                                }`}
                              >
                                {totalQty}
                              </span>
                            </td>
                            <td className="p-3 text-center font-mono font-bold text-amber-900">
                              <span className="inline-block px-2 py-0.5 rounded bg-amber-100/80 border border-amber-300">
                                {blokDisplay}
                              </span>
                            </td>
                            <td className="p-3 text-center font-mono font-bold text-slate-800">
                              <span className={rakDisplay !== '-' ? 'inline-block px-2 py-0.5 rounded bg-slate-100 border border-slate-200' : 'text-slate-400'}>
                                {rakDisplay}
                              </span>
                            </td>
                            <td className="p-3 text-center font-mono font-bold text-sky-800">
                              <span className={subRakDisplay !== '-' ? 'inline-block px-2 py-0.5 rounded bg-sky-50 border border-sky-200' : 'text-slate-400'}>
                                {subRakDisplay}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              {m.condition === 'RETURN' ? (
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                                    m.status === 'GARANSI'
                                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                                      : m.status === 'PERBAIKAN'
                                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                                      : m.status === 'USUL HAPUS'
                                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                                      : 'bg-slate-100 text-slate-700 border-slate-300'
                                  }`}
                                >
                                  {m.status || 'STANDBY'}
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-50 text-sky-700 border border-sky-200">
                                  Baru
                                </span>
                              )}
                            </td>
                            <td className="p-3 min-w-[140px]">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                                {category?.name || m.categoryId || 'Tanpa Kategori'}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAdjustMatId(m.id);
                                    setAdjustCategory(m.categoryId);
                                    setAdjustPhotoPath(m.photoPath || '');
                                    setStockMode('adjust');
                                    setShowStockModal(true);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 font-bold hover:bg-sky-100 text-[11px] transition"
                                >
                                  Sesuaikan
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setMaterialToDelete(m)}
                                  className="p-1 rounded-lg text-rose-600 hover:bg-rose-50 hover:text-rose-700 border border-transparent hover:border-rose-200 transition"
                                  title={`Hapus material ${m.name}`}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>

                {/* Table Summary Footer Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 font-medium">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span>
                      Menampilkan <strong className="text-slate-800 font-bold">{filteredStockMaterials.length}</strong> dari <strong className="text-slate-800 font-bold">{stockConditionTab === 'return' ? totalReturnCount : totalBaruCount}</strong> material terdaftar ({stockConditionTab === 'return' ? 'Katalog Return' : 'Katalog Baru'})
                    </span>
                    {stockSelectedCategory !== 'all' && (
                      <span className="text-amber-800 font-semibold">(filter kategori aktif)</span>
                    )}
                    {stockSearch && (
                      <span className="text-sky-800 font-semibold">(pencarian: "{stockSearch}")</span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Database Terverifikasi SAP Logistik &bull; Port 5001
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: CATEGORY MANAGEMENT */}
          {activeTab === 'categories' && (
            <div className="space-y-6 w-full">
              <form onSubmit={handleAddCategory} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3.5">
                  {activePkg?.categories.map((cat) => {
                    const count = activePkg.materials.filter(m => m.categoryId === cat.id).length;
                    return (
                      <div key={cat.id} className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white shadow-xs hover:border-slate-300 transition">
                        <div className="flex items-center gap-2.5 min-w-0 pr-1">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-900 font-bold text-xs shrink-0">
                            {cat.name.slice(0, 2).toUpperCase()}
                          </span>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-slate-900 block truncate" title={cat.name}>{cat.name}</span>
                            <span className="text-[10px] text-slate-500">{count} material terkait</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-semibold shrink-0">
                          {cat.id}
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

                <div className="grid grid-cols-1 gap-4">
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
                                triggerPackageUpdated();
                              } catch (err) {
                                console.error(err);
                              }
                            }}
                            className="text-[11px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-2 py-1 rounded-lg transition"
                          >
                            + Baris Sub-Blok
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const occupied = WarehouseLayoutService.getOccupiedSlotsCountInBlock(block.letter);
                              const totalSlots = block.subBlocks.reduce((acc, sb) => acc + sb.slots.length, 0);
                              setBlockToDelete({
                                letter: block.letter,
                                code: block.code,
                                name: block.name,
                                occupiedCount: occupied,
                                subBlockCount: block.subBlocks.length,
                                slotCount: totalSlots,
                              });
                            }}
                            className="text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2 py-1 rounded-lg transition flex items-center gap-1 active:scale-95"
                            title={`Hapus Blok ${block.code}`}
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>Hapus Blok</span>
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
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    try {
                                      WarehouseLayoutService.addSlotToSubBlock(sb.code);
                                      setAdminBlocks(WarehouseLayoutService.getBlocks());
                                      setBlockActionMessage(`Slot baru berhasil ditambahkan ke ${sb.code}.`);
                                      triggerPackageUpdated();
                                    } catch (err) {
                                      console.error(err);
                                    }
                                  }}
                                  className="text-[10px] text-slate-600 hover:text-amber-800 font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200 hover:border-amber-300 transition"
                                  title={`Tambah slot ke baris ${sb.code}`}
                                >
                                  + Slot ({sb.code}.{sb.slots.length + 1})
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const occupied = WarehouseLayoutService.getOccupiedSlotsCountInSubBlock(sb.code);
                                    setSubBlockToDelete({
                                      code: sb.code,
                                      occupiedCount: occupied,
                                      slotCount: sb.slots.length,
                                    });
                                  }}
                                  className="text-[10px] text-rose-600 hover:text-rose-800 font-bold bg-white hover:bg-rose-50 p-1 rounded border border-slate-200 hover:border-rose-300 transition"
                                  title={`Hapus baris ${sb.code}`}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {sb.slots.map((s) => {
                                const isOccupied = s.status === 'occupied' || Boolean(s.materialName) || Boolean(s.materialId);
                                return (
                                  <span
                                    key={s.code}
                                    className={`group relative inline-flex items-center gap-1 font-mono text-[10px] pl-1.5 pr-1 py-0.5 rounded transition ${
                                      isOccupied
                                        ? 'bg-amber-200 text-amber-900 font-bold border border-amber-300'
                                        : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                                    }`}
                                    title={s.materialName ? `Terisi: ${s.materialName} (${s.code})` : `Kosong (${s.code})`}
                                  >
                                    <span>{s.code}</span>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSlotToDelete({
                                          code: s.code,
                                          isOccupied,
                                          materialName: s.materialName,
                                        });
                                      }}
                                      className="text-slate-400 hover:text-rose-600 hover:bg-rose-100 rounded-xs p-0.5 transition"
                                      title={`Hapus Slot ${s.code}`}
                                      aria-label={`Hapus Slot ${s.code}`}
                                    >
                                      <X className="h-2.5 w-2.5" />
                                    </button>
                                  </span>
                                );
                              })}
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
              {/* Card Import CSV Master Excel SAP */}
              <div className="rounded-xl border-2 border-sky-300 bg-sky-50/80 p-5 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-200 text-sky-900">
                        <FileSpreadsheet className="h-3.5 w-3.5 text-sky-700" />
                        Master Excel SAP CSV
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        Fitur Baru: Replace All / Merge
                      </span>
                    </div>
                    <h4 className="text-base font-extrabold text-slate-900">
                      Import & Replace dari File CSV (export_material NEW(1).csv)
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                      Unggah file CSV dari SAP untuk mengganti seluruh database material atau memperbarui kuantitas stok dan zonasi rak (BLOK, RAK, SUB RAK) secara otomatis tanpa format JSON manual.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCsvImportError(null);
                      setShowCsvImportModal(true);
                    }}
                    className="shrink-0 flex items-center justify-center gap-2.5 rounded-control bg-[#0369a1] hover:bg-[#0284c7] px-5 py-3.5 text-xs font-bold text-white shadow active:scale-95 transition"
                  >
                    <Upload className="h-4 w-4 text-[#FACC15]" />
                    <span>Buka Dialog Import File CSV</span>
                  </button>
                </div>
              </div>

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
            <div className="space-y-6 w-full">
              {configErrors.length > 0 && (
                <div className="rounded-control bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
                  {configErrors.join(', ')}
                </div>
              )}

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
                {/* Kolom 1: Parameter Dasar & Identitas Kiosk */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Settings className="h-4 w-4 text-[#0369a1]" />
                    <h5 className="font-extrabold text-sm text-slate-800">
                      Parameter Operasional &amp; Identitas Kiosk
                    </h5>
                  </div>

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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                </div>

                {/* Kolom 2: Visual Customization & Wallpaper Settings */}
                <div className="rounded-2xl border border-amber-300 bg-amber-50/50 p-5 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between border-b border-amber-200/70 pb-3">
                    <h5 className="font-extrabold text-sm text-[#0F172A] flex items-center gap-2">
                      <Palette className="h-4 w-4 text-amber-700" />
                      <span>Tampilan Visual &amp; Wallpaper Kiosk</span>
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
                {/* Cadangan & Pemulihan Database (backup.sql) */}
                <div className="xl:col-span-2 rounded-2xl border-2 border-sky-200 bg-gradient-to-r from-sky-50/70 via-white to-amber-50/40 p-5 sm:p-6 space-y-4 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0369a1] text-white shadow-xs">
                        <Database className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-extrabold text-sm text-slate-900">
                            Cadangan &amp; Pemulihan Database (backup.sql)
                          </h5>
                          <span className="rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-[10px] font-black text-emerald-800 uppercase tracking-wider">
                            Auto-Backup Aktif
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Format skrip SQL standar SQLite/ANSI lengkap (DDL &amp; DML seluruh tabel, material, rak, dan konfigurasi).
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={handleDownloadSqlBackup}
                        className="flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-[#0369a1] hover:bg-sky-800 active:scale-95 text-white text-xs font-bold shadow-xs transition"
                        title="Unduh berkas backup.sql ke perangkat ini"
                      >
                        <Download size={15} strokeWidth={2.4} />
                        <span>Unduh backup.sql</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSqlRestoreError(null);
                          setSqlRestoreSuccess(null);
                          setShowSqlRestoreModal(true);
                        }}
                        className="flex items-center justify-center gap-2 h-11 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 active:scale-95 text-slate-700 text-xs font-bold shadow-xs transition"
                        title="Pulihkan data dari berkas backup.sql"
                      >
                        <RotateCcw size={15} strokeWidth={2.2} />
                        <span>Restore SQL</span>
                      </button>
                    </div>
                  </div>

                  {/* Auto-Backup Status Indicators */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-1 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                          <span>Backup Otomatis Awal Aplikasi (Startup)</span>
                        </span>
                        <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          Tiap App Dibuka
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {startupBackupMeta
                          ? `Terakhir: ${new Date(startupBackupMeta.timestamp).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })} ${new Date(startupBackupMeta.timestamp).toLocaleTimeString('id-ID')} (${(startupBackupMeta.sizeBytes / 1024).toFixed(1)} KB)`
                          : 'Aktif otomatis pada setiap awal aplikasi berjalan.'}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-1 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <span className="h-2.5 w-2.5 rounded-full bg-amber-500 inline-block" />
                          <span>Backup Otomatis Sebelum Shutdown</span>
                        </span>
                        <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          Pra-Matikan Kiosk
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {shutdownBackupMeta
                          ? `Terakhir: ${new Date(shutdownBackupMeta.timestamp).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })} ${new Date(shutdownBackupMeta.timestamp).toLocaleTimeString('id-ID')} (${(shutdownBackupMeta.sizeBytes / 1024).toFixed(1)} KB)`
                          : 'Aktif otomatis sesaat sebelum konfirmasi shutdown kiosk.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button Simpan */}
              <div className="flex justify-end pt-1">
                <button
                  onClick={handleSaveConfig}
                  className="flex h-12 items-center justify-center rounded-xl bg-[#FACC15] px-8 text-sm font-black text-[#0F172A] shadow-md active:scale-95 hover:bg-amber-400 transition w-full sm:w-auto"
                >
                  Simpan Konfigurasi
                </button>
              </div>
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

          {/* TAB 5: NETWORK ACCESS GUIDE (WIFI & DYNAMIC IP LAN) */}
          {activeTab === 'network' && (
            <div className="space-y-6">
              <NetworkInfoCard onOpenFullModal={() => setShowNetworkModal(true)} />
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                    Panduan Akses Nirkabel Petugas Gudang (WiFi &amp; LAN)
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowNetworkModal(true)}
                    className="flex items-center gap-1.5 h-10 px-4 rounded-xl bg-[#0369a1] text-white text-xs font-bold shadow-sm hover:bg-sky-800 active:scale-95 transition"
                  >
                    <span>Buka Tampilan Penuh &amp; QR Code</span>
                  </button>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Dengan menghubungkan smartphone atau laptop ke WiFi yang sama dengan unit Kiosk, petugas dapat mengelola stok, mencetak barcode, memeriksa logistik rak, dan mengimpor data paket SAP langsung dari meja kerja tanpa perlu antri di depan mesin Kassen.
                </p>
              </div>
            </div>
          )}

          {/* TAB: USER MANAGEMENT (SPATIE) */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* Header & Add User Action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-[#0369a1] border border-sky-200 shadow-xs">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                      Manajemen Pengguna &amp; Otorisasi Spatie
                    </h3>
                    <p className="text-xs text-slate-500">
                      Kelola daftar operator, hak akses berbasis perizinan Spatie, dan penetapan role.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAddUserError(null);
                    setShowAddUserModal(true);
                  }}
                  className="flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-[#0369a1] text-white text-xs font-bold shadow-sm hover:bg-sky-800 active:scale-95 transition shrink-0"
                >
                  <UserPlus size={16} strokeWidth={2.4} />
                  <span>Tambah Pengguna (Add User)</span>
                </button>
              </div>

              {/* Spatie Wildcard Banner */}
              <div className="rounded-2xl border border-amber-300 bg-amber-50/80 p-4 sm:p-5 flex items-start gap-3 shadow-2xs">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-200 text-amber-900">
                  <Sparkles size={18} />
                </div>
                <div className="text-xs text-amber-950 space-y-1 leading-relaxed">
                  <div className="font-black text-sm text-amber-900">
                    Otorisasi Terintegrasi Spatie Role &amp; Permission
                  </div>
                  <p>
                    Pengguna dengan izin <strong>Wildcard (*)</strong> memiliki otoritas <em>Super Administrator</em> yang <strong>bisa akses kemana saja</strong> ke seluruh modul (Manajemen Stok, Klasifikasi Kategori, Tata Letak Gudang Blok A-Z, Impor SAP, Konfigurasi Kiosk, dan Log Diagnostik).
                  </p>
                </div>
              </div>

              {addUserSuccess && (
                <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-300 p-3.5 px-4 text-xs font-semibold text-emerald-900 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span>{addUserSuccess}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAddUserSuccess(null)}
                    className="text-emerald-700 hover:text-emerald-900 font-bold p-1"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Users Table List */}
              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <div className="border-b border-slate-200 px-6 py-4 bg-slate-50 flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Daftar Pengguna Terdaftar ({usersList.length} Akun)
                  </h4>
                  <span className="text-[11px] font-mono text-slate-500">
                    Sistem: Spatie v2 &bull; LocalStorage
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="border-b border-slate-200 bg-slate-100/70 text-[11px] uppercase font-black tracking-wider text-slate-600">
                      <tr>
                        <th className="px-6 py-3.5">Pengguna / Identitas</th>
                        <th className="px-4 py-3.5">Peran / Role</th>
                        <th className="px-4 py-3.5">Hak Akses Spatie</th>
                        <th className="px-4 py-3.5">Tanggal Dibuat</th>
                        <th className="px-6 py-3.5 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {usersList.map((u) => {
                        const isWildcard = u.permissions.includes('*');
                        const isMainAdmin = u.email === 'admin@pln-kiosk.id';

                        return (
                          <tr key={u.id} className="hover:bg-slate-50/80 transition">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-600 to-sky-800 font-bold text-white text-xs shadow-xs">
                                  {u.name.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-bold text-slate-900 text-sm">{u.name}</div>
                                  <div className="font-mono text-xs text-slate-500">{u.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold bg-sky-100/80 text-sky-900 border border-sky-200">
                                {u.role}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              {isWildcard ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-extrabold bg-amber-100 text-amber-950 border border-amber-300">
                                  <Sparkles size={13} className="text-amber-600" />
                                  <span>Bisa Akses Kemana Saja (*)</span>
                                </span>
                              ) : (
                                <div className="flex flex-wrap gap-1 max-w-xs">
                                  {u.permissions.map((perm) => (
                                    <span
                                      key={perm}
                                      className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-mono border border-slate-200"
                                    >
                                      {perm}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-4 text-slate-500 font-mono text-[11px]">
                              {new Date(u.createdAt).toLocaleDateString('id-ID', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </td>
                            <td className="px-6 py-4 text-right">
                              {isMainAdmin ? (
                                <span
                                  className="text-[11px] text-slate-400 font-medium italic cursor-not-allowed"
                                  title="Akun Super Administrator utama dilindungi"
                                >
                                  Akun Utama
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteUser(u.id, u.name)}
                                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:border-rose-300 active:scale-95 transition font-bold text-xs"
                                  title={`Hapus pengguna ${u.name}`}
                                >
                                  <Trash2 size={13} />
                                  <span>Hapus</span>
                                </button>
                              )}
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

          {/* TAB: PROFILE & UBAH PASSWORD */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Notification Banner */}
              {profileActionSuccess && (
                <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-300 p-4 text-xs font-semibold text-emerald-900 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span>{profileActionSuccess}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setProfileActionSuccess(null)}
                    className="text-emerald-700 hover:text-emerald-900 font-bold p-1"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {profileActionError && (
                <div className="flex items-center justify-between rounded-xl bg-rose-50 border border-rose-300 p-4 text-xs font-semibold text-rose-900 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={16} className="text-rose-600 shrink-0" />
                    <span>{profileActionError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setProfileActionError(null)}
                    className="text-rose-700 hover:text-rose-900 font-bold p-1"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Profil Akun Info */}
                <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between space-y-6">
                  <div>
                    <div className="flex items-center gap-4 pb-5 border-b border-slate-200">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#0369a1] to-sky-500 font-black text-white text-xl shadow-md">
                        {currentUser.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-base font-black text-slate-900">{currentUser.name}</h3>
                        <p className="text-xs font-mono text-slate-500">{currentUser.email}</p>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-900 mt-1">
                          {currentUser.role}
                        </span>
                      </div>
                    </div>

                    <div className="pt-5 space-y-4 text-xs">
                      <div>
                        <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                          Status Sesi Saat Ini
                        </span>
                        <div className="flex items-center gap-2 mt-1 text-slate-800 font-medium">
                          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                          <span>Console Admin Terhubung (Port 5001)</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                          Otoritas Spatie Permissions
                        </span>
                        <div className="mt-1.5">
                          {currentUser.permissions?.includes('*') || currentUser.role.includes('Super') ? (
                            <div className="rounded-xl bg-amber-50 border border-amber-300 p-3 text-amber-950 font-medium space-y-1">
                              <div className="font-extrabold text-amber-900 flex items-center gap-1.5">
                                <Sparkles size={14} className="text-amber-600" />
                                <span>Wildcard Spatie (*) — Bisa Akses Kemana Saja</span>
                              </div>
                              <p className="text-[11px] text-amber-800 leading-relaxed">
                                Akun ini memiliki izin penuh ke seluruh modul, tata letak, dan pengaturan sistem Universal-KIOSK.
                              </p>
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {currentUser.permissions?.map((p) => (
                                <span
                                  key={p}
                                  className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 font-mono text-[11px] border border-slate-200"
                                >
                                  {p}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 text-xs text-slate-600 space-y-1">
                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                      <ShieldCheck size={15} className="text-[#0369a1]" />
                      <span>Standar Keamanan KIOSK PLN</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Kata sandi disimpan secara aman pada database lokal kiosk. Pastikan Anda mengganti kata sandi secara berkala.
                    </p>
                  </div>
                </div>

                {/* Right Column: Form Ubah Kata Sandi */}
                <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                      <KeyRound size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900">Ubah Kata Sandi Akun</h3>
                      <p className="text-xs text-slate-500">
                        Perbarui kata sandi login untuk keamanan akses operasional Anda.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div>
                      <label
                        htmlFor="profile-current-password"
                        className="block text-xs font-bold text-slate-700 mb-1.5"
                      >
                        Kata Sandi Saat Ini <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          id="profile-current-password"
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={currentPasswordInput}
                          onChange={(e) => setCurrentPasswordInput(e.target.value)}
                          placeholder="Masukkan kata sandi saat ini"
                          className="w-full h-11 px-3.5 pr-10 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0369a1] focus:border-transparent transition"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                          title={showCurrentPassword ? 'Sembunyikan' : 'Tampilkan'}
                        >
                          {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="profile-new-password"
                        className="block text-xs font-bold text-slate-700 mb-1.5"
                      >
                        Kata Sandi Baru <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          id="profile-new-password"
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPasswordInput}
                          onChange={(e) => setNewPasswordInput(e.target.value)}
                          placeholder="Masukkan kata sandi baru (minimal 4 karakter)"
                          className="w-full h-11 px-3.5 pr-10 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0369a1] focus:border-transparent transition"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                          title={showNewPassword ? 'Sembunyikan' : 'Tampilkan'}
                        >
                          {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="profile-confirm-password"
                        className="block text-xs font-bold text-slate-700 mb-1.5"
                      >
                        Konfirmasi Kata Sandi Baru <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="profile-confirm-password"
                        type={showNewPassword ? 'text' : 'password'}
                        value={confirmPasswordInput}
                        onChange={(e) => setConfirmPasswordInput(e.target.value)}
                        placeholder="Ulangi kata sandi baru persis sama"
                        className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0369a1] focus:border-transparent transition"
                        required
                      />
                    </div>

                    <div className="pt-3">
                      <button
                        type="submit"
                        className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-[#0369a1] hover:bg-sky-800 text-white font-black text-xs shadow-md active:scale-95 transition"
                      >
                        <Lock size={15} strokeWidth={2.4} />
                        <span>Simpan Kata Sandi Baru</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

      {/* Pop-up Modal Import & Replace CSV Master Excel SAP */}
      {showCsvImportModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCsvImportModal(false);
              setCsvImportError(null);
            }
          }}
        >
          <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700 border border-sky-300">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Import & Replace Database Material (Excel SAP CSV)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ganti seluruh data atau perbarui stok & lokasi material langsung dari file CSV
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowCsvImportModal(false);
                  setCsvImportError(null);
                }}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-5">
              {/* Target Database Selector */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Pilih Database Target Sinkronisasi:
                  </label>
                  <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    2 Database Terpisah &amp; Terisolasi
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCsvImportScope('return-only');
                      if (csvText) processCsvContent(csvText, csvImportMode, 'return-only');
                    }}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center gap-1 ${
                      csvImportScope === 'return-only'
                        ? 'border-amber-600 bg-amber-50 text-amber-950 ring-2 ring-amber-500/20 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>🔄 Database Return</span>
                    <span className="text-[10px] font-normal text-emerald-600">Database Baru Aman</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCsvImportScope('baru-only');
                      if (csvText) processCsvContent(csvText, csvImportMode, 'baru-only');
                    }}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center gap-1 ${
                      csvImportScope === 'baru-only'
                        ? 'border-sky-600 bg-sky-50 text-sky-950 ring-2 ring-sky-500/20 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>📦 Database Baru</span>
                    <span className="text-[10px] font-normal text-emerald-600">Database Return Aman</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCsvImportScope('auto');
                      if (csvText) processCsvContent(csvText, csvImportMode, 'auto');
                    }}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center gap-1 ${
                      csvImportScope === 'auto'
                        ? 'border-sky-600 bg-sky-50 text-sky-950 ring-2 ring-sky-500/20 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>🤖 Auto (Deteksi CSV)</span>
                    <span className="text-[10px] font-normal text-slate-500">Otomatis Pintar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCsvImportScope('all');
                      if (csvText) processCsvContent(csvText, csvImportMode, 'all');
                    }}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center gap-1 ${
                      csvImportScope === 'all'
                        ? 'border-slate-700 bg-slate-100 text-slate-950 ring-2 ring-slate-400/20 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>🌐 Kedua Database</span>
                    <span className="text-[10px] font-normal text-slate-500">Master Gabungan</span>
                  </button>
                </div>
              </div>

              {/* Mode Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Pilih Mode Sinkronisasi:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setCsvImportMode('replace');
                      if (csvText) processCsvContent(csvText, 'replace', csvImportScope);
                    }}
                    className={`p-3.5 rounded-xl border text-left transition flex items-start gap-3 ${
                      csvImportMode === 'replace'
                        ? 'border-sky-500 bg-sky-50/80 text-sky-950 ring-2 ring-sky-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className={`mt-0.5 h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${
                      csvImportMode === 'replace' ? 'border-sky-600 bg-sky-600' : 'border-slate-300'
                    }`}>
                      {csvImportMode === 'replace' && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <div className="text-xs font-extrabold flex items-center gap-1.5">
                        <span>Ganti Seluruh Data Database Terpilih (Replace)</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-200 text-amber-900">Rekomendasi</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        Hanya me-replace isi database target yang dipilih. Database pasangannya sama sekali tidak tersentuh.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCsvImportMode('merge');
                      if (csvText) processCsvContent(csvText, 'merge', csvImportScope);
                    }}
                    className={`p-3.5 rounded-xl border text-left transition flex items-start gap-3 ${
                      csvImportMode === 'merge'
                        ? 'border-sky-500 bg-sky-50/80 text-sky-950 ring-2 ring-sky-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className={`mt-0.5 h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${
                      csvImportMode === 'merge' ? 'border-sky-600 bg-sky-600' : 'border-slate-300'
                    }`}>
                      {csvImportMode === 'merge' && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <div className="text-xs font-extrabold">Perbarui & Tambah (Merge / Upsert)</div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        Memperbarui stok & lokasi material yang cocok di database terpilih, serta menambahkan material baru.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Upload Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Unggah File CSV / Master Excel SAP:
                </label>
                <div className="border-2 border-dashed border-slate-300 hover:border-sky-400 rounded-2xl p-6 text-center bg-slate-50/50 transition">
                  <input
                    ref={csvFileInputRef}
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleCsvFileUpload}
                    className="hidden"
                    id="csv-file-input"
                  />
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="h-12 w-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center shadow-xs">
                      <Upload className="h-6 w-6" />
                    </div>
                    <div>
                      <label
                        htmlFor="csv-file-input"
                        className="cursor-pointer text-xs font-bold text-[#0369a1] hover:underline"
                      >
                        Pilih file CSV dari komputer
                      </label>
                      <span className="text-xs text-slate-500"> atau seret file ke sini</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Mendukung format: <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-700">export_material NEW(1).csv</code> atau <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-700">export_material NEW RETUR.csv</code>
                    </p>
                    {csvFileName && (
                      <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <Check className="h-3.5 w-3.5" />
                        <span>File terpilih: {csvFileName}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Error Box */}
              {csvImportError && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-800 flex items-start gap-2.5">
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{csvImportError}</span>
                </div>
              )}

              {/* Preview Stats */}
              {csvImportStats && (
                <div className="space-y-3 rounded-2xl bg-slate-50 border border-slate-200 p-4">
                  {/* Two-Way Protection Banner */}
                  {(csvImportStats.effectiveScope === 'return-only' || csvImportScope === 'return-only') && (
                    <div className="flex items-center gap-2.5 rounded-xl border border-emerald-300 bg-emerald-50/90 p-3 text-xs text-emerald-900 shadow-2xs">
                      <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
                      <div>
                        <span className="font-extrabold">🛡️ Terisolasi ke Database Return: </span>
                        Mengimpor <strong>{csvImportStats.validRows}</strong> material ke <strong>Database Return</strong>.
                        Database Material Baru (<strong>{kioskStorage.getPackageBaru().materials.length} item</strong>) berada di database terpisah dan <strong>100% aman tersimpan</strong>!
                      </div>
                    </div>
                  )}

                  {(csvImportStats.effectiveScope === 'baru-only' || csvImportScope === 'baru-only') && (
                    <div className="flex items-center gap-2.5 rounded-xl border border-emerald-300 bg-emerald-50/90 p-3 text-xs text-emerald-900 shadow-2xs">
                      <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
                      <div>
                        <span className="font-extrabold">🛡️ Terisolasi ke Database Baru: </span>
                        Mengimpor <strong>{csvImportStats.validRows}</strong> material ke <strong>Database Baru</strong>.
                        Database Material Return (<strong>{kioskStorage.getPackageReturn().materials.length} item</strong>) berada di database terpisah dan <strong>100% aman tersimpan</strong>!
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Pratinjau Hasil Pembacaan CSV:
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      {csvImportStats.validRows} Baris Terverifikasi ({csvImportStats.detectedCondition})
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
                      <span className="text-[11px] text-slate-400">Total Material Akhir</span>
                      <p className="text-base font-extrabold text-slate-900">{csvImportStats.materialsCount}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
                      <span className="text-[11px] text-slate-400">Total Stok Fisik CSV</span>
                      <p className="text-base font-extrabold text-emerald-600">{csvImportStats.totalQuantity}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
                      <span className="text-[11px] text-slate-400">Jumlah Lokasi</span>
                      <p className="text-base font-extrabold text-sky-600">{csvImportStats.locationsCount}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
                      <span className="text-[11px] text-slate-400">Target & Aksi</span>
                      <p className="text-xs font-extrabold text-amber-700 uppercase mt-0.5">
                        {csvImportStats.effectiveScope} ({csvImportStats.mode})
                      </p>
                    </div>
                  </div>

                  {/* Sample rows table */}
                  <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100/70 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                        <tr>
                          <th className="px-3 py-2">No</th>
                          <th className="px-3 py-2">Nama Material</th>
                          <th className="px-3 py-2">Normalisasi</th>
                          <th className="px-3 py-2">Satuan</th>
                          <th className="px-3 py-2">Stok</th>
                          <th className="px-3 py-2">BLOK</th>
                          <th className="px-3 py-2">RAK</th>
                          <th className="px-3 py-2">SUB RAK</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {csvImportStats.sampleRows.map((r, i) => (
                          <tr key={i} className="hover:bg-slate-50/80">
                            <td className="px-3 py-2 font-mono text-slate-500">{r.no}</td>
                            <td className="px-3 py-2 font-semibold text-slate-800 max-w-[200px] truncate" title={r.name}>{r.name}</td>
                            <td className="px-3 py-2 font-mono text-slate-600">{r.code || '-'}</td>
                            <td className="px-3 py-2 text-slate-600">{r.unit}</td>
                            <td className="px-3 py-2 font-bold text-slate-900">{r.stock}</td>
                            <td className="px-3 py-2 font-bold text-amber-800">{r.blok}</td>
                            <td className="px-3 py-2 font-bold text-slate-700">{r.rak}</td>
                            <td className="px-3 py-2 font-bold text-sky-700">{r.subRak}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 bg-slate-50 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowCsvImportModal(false);
                  setCsvImportError(null);
                }}
                className="h-11 px-5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition active:scale-95"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleApplyCsvImport}
                disabled={!csvParsedPackage || isProcessingCsv}
                className="h-11 px-6 rounded-xl bg-[#0369a1] hover:bg-[#0284c7] text-xs font-bold text-white shadow active:scale-95 transition disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
              >
                <CheckCircle2 className="h-4 w-4 text-[#FACC15]" />
                <span>
                  {csvImportStats?.effectiveScope === 'return-only'
                    ? 'Terapkan Katalog Return (Baru Tetap Aman)'
                    : csvImportStats?.effectiveScope === 'baru-only'
                    ? 'Terapkan Katalog Baru (Return Tetap Aman)'
                    : csvImportMode === 'replace'
                    ? 'Terapkan & Ganti Total Database'
                    : 'Terapkan & Perbarui Stok Database'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pop-up Modal Tambah / Sesuaikan Stok Material & Barcode */}
      {showStockModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowStockModal(false);
              setStockError(null);
            }
          }}
        >
          <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-900 border border-amber-300">
                  <Boxes className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {stockMode === 'adjust' ? 'Tambah / Sesuaikan Stok Material' : 'Pendaftaran Material Baru'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Database Logistik Pergudangan PLN UP3 Malang
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setShowStockModal(false); setStockError(null); }}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
                aria-label="Tutup pop-up"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-5">
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
                  2. Tambah Material Baru
                </button>
              </div>

              {stockError && (
                <div className="rounded-control bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200 font-semibold">
                  {stockError}
                </div>
              )}

              {stockMode === 'adjust' ? (
                <form onSubmit={handleAdjustStock} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                      Pilih Material:
                    </label>
                    <select
                      value={adjustMatId || (activePkg?.materials[0]?.id ?? '')}
                      onChange={(e) => {
                        const nextId = e.target.value;
                        setAdjustMatId(nextId);
                        const selectedMat = activePkg?.materials.find(m => m.id === nextId);
                        if (selectedMat) {
                          setAdjustCategory(selectedMat.categoryId);
                          setAdjustPhotoPath(selectedMat.photoPath || '');
                        }
                      }}
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
                    const currentCategory = activePkg?.categories.find(c => c.id === (adjustCategory || mat.categoryId));
                    const activePhoto = adjustPhotoPath || mat.photoPath;
                    return (
                      <div className="rounded-xl bg-amber-50/70 p-4 border border-amber-200 text-xs text-amber-900 flex items-start gap-3.5">
                        <div className="h-16 w-16 rounded-xl border border-amber-300/80 bg-white overflow-hidden shrink-0 shadow-2xs flex items-center justify-center">
                          {activePhoto ? (
                            <img
                              src={activePhoto}
                              alt={mat.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Boxes className="h-8 w-8 text-amber-600" />
                          )}
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="font-bold text-sm text-[#0F172A]">{mat.name}</p>
                          <p>Kode: <strong className="font-mono">{mat.code}</strong> {mat.sapCode ? `• SAP: ${mat.sapCode}` : ''}</p>
                          <p>Kategori: <strong className="text-sky-800 font-semibold">{currentCategory?.name || mat.categoryId}</strong></p>
                          <p>Total Stok: <strong className="text-emerald-700 text-sm">{totalQty} {mat.unit}</strong></p>
                        </div>
                      </div>
                    );
                  })()}

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold uppercase text-slate-600">
                        Kategori Material:
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setShowStockModal(false);
                          setActiveTab('categories');
                        }}
                        className="text-[11px] font-bold text-sky-600 hover:text-sky-700 hover:underline flex items-center gap-1"
                      >
                        + Kelola Kategori
                      </button>
                    </div>
                    <select
                      value={adjustCategory || (activePkg?.materials.find(m => m.id === (adjustMatId || activePkg?.materials[0]?.id))?.categoryId ?? '')}
                      onChange={(e) => setAdjustCategory(e.target.value)}
                      className="w-full h-11 rounded-xl border border-slate-300 px-3 text-sm bg-white font-medium text-slate-800 focus:border-[#0369a1] focus:ring-2 focus:ring-[#0369a1]/20 focus:outline-none"
                    >
                      {activePkg?.categories.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Foto / Gambar Material */}
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                      Foto / Gambar Produk:
                    </label>
                    <div className="flex items-center gap-3 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="h-16 w-16 rounded-lg border border-slate-200 bg-white overflow-hidden shrink-0 flex items-center justify-center shadow-2xs">
                        {adjustPhotoPath || (activePkg?.materials.find(m => m.id === (adjustMatId || activePkg?.materials[0]?.id))?.photoPath) ? (
                          <img
                            src={adjustPhotoPath || (activePkg?.materials.find(m => m.id === (adjustMatId || activePkg?.materials[0]?.id))?.photoPath || '')}
                            alt="Foto Produk"
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = ContentService.getFallbackImage();
                            }}
                          />
                        ) : (
                          <ImageIcon className="h-6 w-6 text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <input
                          type="text"
                          value={adjustPhotoPath}
                          onChange={(e) => setAdjustPhotoPath(e.target.value)}
                          placeholder="Tempel tautan URL gambar..."
                          className="w-full h-8 rounded-lg border border-slate-300 px-2.5 text-xs bg-white text-slate-800 focus:border-[#0369a1] focus:outline-none"
                        />
                        <div className="flex items-center gap-2">
                          <label className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-[11px] transition shadow-2xs">
                            <Upload className="h-3 w-3 text-sky-600" />
                            <span>Unggah Foto</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (evt) => {
                                    if (typeof evt.target?.result === 'string') {
                                      setAdjustPhotoPath(evt.target.result);
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                          {adjustPhotoPath && (
                            <button
                              type="button"
                              onClick={() => setAdjustPhotoPath('')}
                              className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:underline"
                            >
                              Hapus Foto
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      type="submit"
                      className="flex-1 flex h-12 items-center justify-center gap-2 rounded-control bg-[#FACC15] px-8 text-sm font-bold text-[#0F172A] shadow-md transition active:scale-95 hover:bg-amber-400"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Simpan Perubahan Stok</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setShowStockModal(false); setStockError(null); }}
                      className="flex h-12 items-center justify-center rounded-control bg-slate-100 hover:bg-slate-200 px-5 text-sm font-bold text-slate-700 transition active:scale-95"
                    >
                      Batal
                    </button>

                    {(() => {
                      const currentMatId = adjustMatId || activePkg?.materials[0]?.id;
                      const mat = activePkg?.materials.find(m => m.id === currentMatId);
                      if (!mat) return null;
                      return (
                        <button
                          type="button"
                          onClick={() => {
                            setMaterialToDelete(mat);
                          }}
                          className="flex h-12 items-center justify-center gap-2 rounded-control bg-rose-50 border border-rose-300 px-4 text-sm font-bold text-rose-700 shadow-sm transition active:scale-95 hover:bg-rose-100"
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
                <form onSubmit={handleAddNewMaterial} className="space-y-4">
                  {/* Pilihan Kondisi: Baru vs Return */}
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                      Kondisi / Tipe Material: <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          setNewMatCondition('BARU');
                          setNewMatStatus('Baru');
                        }}
                        className={`h-11 flex items-center justify-center gap-2 rounded-xl text-xs font-bold transition border ${
                          newMatCondition === 'BARU'
                            ? 'bg-sky-50 border-sky-600 text-sky-900 shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                        <span>Material Baru</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setNewMatCondition('RETURN');
                          setNewMatStatus('STANDBY');
                        }}
                        className={`h-11 flex items-center justify-center gap-2 rounded-xl text-xs font-bold transition border ${
                          newMatCondition === 'RETURN'
                            ? 'bg-amber-50 border-amber-600 text-amber-950 shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        <span>Material Return</span>
                      </button>
                    </div>
                  </div>

                  {/* Status Retur jika kondisi RETURN */}
                  {newMatCondition === 'RETURN' && (
                    <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 space-y-1.5">
                      <label className="block text-xs font-bold uppercase text-amber-900">
                        Status Retur Material: <span className="text-rose-500">*</span>
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {(['STANDBY', 'GARANSI', 'PERBAIKAN', 'USUL HAPUS'] as const).map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => setNewMatStatus(st)}
                            className={`py-1.5 px-2 rounded-lg text-xs font-bold transition border ${
                              newMatStatus === st
                                ? 'bg-amber-600 border-amber-700 text-white shadow-xs'
                                : 'bg-white border-amber-200 text-amber-900 hover:bg-amber-100'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 1. Nama Material */}
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                      Nama Material: <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newMatName}
                      onChange={(e) => setNewMatName(e.target.value)}
                      placeholder="Contoh: Kabel XLPE 20kV 3x150mm"
                      required
                      className="w-full h-12 rounded-xl border border-slate-300 px-3.5 text-sm font-semibold text-slate-900 bg-white focus:border-[#0369a1] focus:ring-2 focus:ring-[#0369a1]/20 focus:outline-none placeholder:text-slate-400 shadow-2xs"
                    />
                  </div>

                  {/* 2. Kategori Material */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold uppercase text-slate-700">
                        Kategori Material: <span className="text-rose-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setShowStockModal(false);
                          setActiveTab('categories');
                        }}
                        className="text-[11px] font-bold text-sky-600 hover:text-sky-700 hover:underline flex items-center gap-1"
                      >
                        + Kelola Kategori
                      </button>
                    </div>
                    <select
                      value={newMatCategory}
                      onChange={(e) => setNewMatCategory(e.target.value)}
                      className="w-full h-12 rounded-xl border border-slate-300 px-3.5 text-sm font-semibold text-slate-900 bg-white focus:border-[#0369a1] focus:ring-2 focus:ring-[#0369a1]/20 focus:outline-none shadow-2xs"
                    >
                      <option value="">-- Pilih Kategori Material --</option>
                      {activePkg?.categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Foto / Gambar Produk */}
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                      Foto / Gambar Produk:
                    </label>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="h-16 w-16 rounded-lg border border-slate-200 bg-white overflow-hidden shrink-0 flex items-center justify-center shadow-2xs">
                        {newMatPhotoPath ? (
                          <img
                            src={newMatPhotoPath}
                            alt="Preview"
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = ContentService.getFallbackImage();
                            }}
                          />
                        ) : (
                          <ImageIcon className="h-6 w-6 text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <input
                          type="text"
                          value={newMatPhotoPath}
                          onChange={(e) => setNewMatPhotoPath(e.target.value)}
                          placeholder="Tempel tautan URL gambar..."
                          className="w-full h-8 rounded-lg border border-slate-300 px-2.5 text-xs bg-white text-slate-800 focus:border-[#0369a1] focus:outline-none"
                        />
                        <div className="flex items-center gap-2">
                          <label className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-[11px] transition shadow-2xs">
                            <Upload className="h-3 w-3 text-sky-600" />
                            <span>Unggah Foto</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (evt) => {
                                    if (typeof evt.target?.result === 'string') {
                                      setNewMatPhotoPath(evt.target.result);
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                          {newMatPhotoPath && (
                            <button
                              type="button"
                              onClick={() => setNewMatPhotoPath('')}
                              className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:underline"
                            >
                              Hapus Foto
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. Jumlah Stok */}
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                      Jumlah Stok Fisik: <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={newMatInitialQty}
                      onChange={(e) => setNewMatInitialQty(Number(e.target.value))}
                      placeholder="Contoh: 10"
                      required
                      className="w-full h-12 rounded-xl border border-slate-300 px-3.5 text-sm font-bold text-slate-900 bg-white focus:border-[#0369a1] focus:ring-2 focus:ring-[#0369a1]/20 focus:outline-none shadow-2xs"
                    />
                  </div>

                  {/* 3, 4, 5. BLOK, RAK & SUB RAK (Sesuai Format Master Excel) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                        BLOK: <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newMatBlok}
                        onChange={(e) => setNewMatBlok(e.target.value)}
                        placeholder="Contoh: A"
                        required
                        className="w-full h-12 rounded-xl border border-slate-300 px-3.5 text-sm font-bold text-slate-900 bg-white focus:border-[#0369a1] focus:ring-2 focus:ring-[#0369a1]/20 focus:outline-none shadow-2xs uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                        RAK: <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newMatRack}
                        onChange={(e) => setNewMatRack(e.target.value)}
                        placeholder="Contoh: Rak A-01 (atau A)"
                        required
                        className="w-full h-12 rounded-xl border border-slate-300 px-3.5 text-sm font-bold text-slate-900 bg-white focus:border-[#0369a1] focus:ring-2 focus:ring-[#0369a1]/20 focus:outline-none shadow-2xs uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                        SUB RAK:
                      </label>
                      <input
                        type="text"
                        value={newMatBin}
                        onChange={(e) => setNewMatBin(e.target.value)}
                        placeholder="Contoh: Sub Rak 01 (atau A11)"
                        className="w-full h-12 rounded-xl border border-slate-300 px-3.5 text-sm font-bold text-slate-900 bg-white focus:border-[#0369a1] focus:ring-2 focus:ring-[#0369a1]/20 focus:outline-none shadow-2xs uppercase"
                      />
                    </div>
                  </div>

                  {/* Info Box */}
                  <div className="rounded-xl bg-amber-50/80 border border-amber-200 p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
                    <Boxes className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      Format lokasi diselaraskan dengan Master Excel SAP: <strong>BLOK</strong>, <strong>RAK</strong>, dan <strong>SUB RAK</strong>. Kode normalisasi material akan digenerate otomatis jika dikosongkan.
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      type="submit"
                      className="flex-1 flex h-12 items-center justify-center gap-2 rounded-control bg-[#FACC15] px-8 text-sm font-bold text-[#0F172A] shadow-md transition active:scale-95 hover:bg-amber-400"
                    >
                      <PlusCircle className="h-4 w-4" />
                      <span>Daftarkan Material</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowStockModal(false); setStockError(null); }}
                      className="flex h-12 items-center justify-center rounded-control bg-slate-100 hover:bg-slate-200 px-5 text-sm font-bold text-slate-700 transition active:scale-95"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Material */}
      {materialToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
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

      {/* Modal Konfirmasi Hapus Blok */}
      {blockToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border-2 border-rose-400 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 shrink-0">
                <Trash2 className="h-6 w-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Konfirmasi Hapus Blok Gudang</h3>
                <span className="text-xs text-rose-700 font-bold">Tindakan ini menghapus seluruh hirarki blok</span>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-black text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                  {blockToDelete.code}
                </span>
                <span className="text-[11px] text-slate-500 font-semibold">
                  {blockToDelete.subBlockCount} Baris &bull; {blockToDelete.slotCount} Slot
                </span>
              </div>
              <div className="font-bold text-sm text-slate-900 leading-snug">
                {blockToDelete.name}
              </div>
            </div>

            {blockToDelete.occupiedCount > 0 ? (
              <div className="rounded-xl bg-amber-50 border border-amber-300 p-3 text-xs text-amber-950 font-medium flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Perhatian:</strong> Terdapat <strong>{blockToDelete.occupiedCount} slot</strong> yang sedang terisi material di blok ini. Menghapus blok akan melepaskan data alokasi denah untuk material tersebut.
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-600 leading-relaxed">
                Apakah Anda yakin ingin menghapus <strong>{blockToDelete.code}</strong>? Seluruh baris sub-blok dan slot rak di dalamnya akan dihapus dari tata letak gudang.
              </p>
            )}

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setBlockToDelete(null)}
                className="h-11 px-5 rounded-xl border border-slate-300 font-bold text-slate-700 text-xs hover:bg-slate-100 active:scale-95 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteBlock}
                className="flex items-center gap-2 h-11 px-5 rounded-xl bg-rose-600 text-white font-black text-xs shadow-md hover:bg-rose-700 active:scale-95 transition"
              >
                <Trash2 className="h-4 w-4" />
                <span>Ya, Hapus Blok Ini</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Sub-Blok */}
      {subBlockToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border-2 border-rose-400 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 shrink-0">
                <Trash2 className="h-6 w-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Konfirmasi Hapus Baris Sub-Blok</h3>
                <span className="text-xs text-rose-700 font-bold">Hapus baris rak beserta slot di dalamnya</span>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 text-xs space-y-1">
              <div className="font-mono text-sm font-black text-amber-900">
                Baris {subBlockToDelete.code}
              </div>
              <div className="text-[11px] text-slate-500">
                Total {subBlockToDelete.slotCount} slot rak terdaftar
              </div>
            </div>

            {subBlockToDelete.occupiedCount > 0 ? (
              <div className="rounded-xl bg-amber-50 border border-amber-300 p-3 text-xs text-amber-950 font-medium flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Perhatian:</strong> Terdapat <strong>{subBlockToDelete.occupiedCount} slot</strong> yang sedang terisi material pada baris ini!
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-600 leading-relaxed">
                Apakah Anda yakin ingin menghapus baris <strong>{subBlockToDelete.code}</strong>?
              </p>
            )}

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSubBlockToDelete(null)}
                className="h-11 px-5 rounded-xl border border-slate-300 font-bold text-slate-700 text-xs hover:bg-slate-100 active:scale-95 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteSubBlock}
                className="flex items-center gap-2 h-11 px-5 rounded-xl bg-rose-600 text-white font-black text-xs shadow-md hover:bg-rose-700 active:scale-95 transition"
              >
                <Trash2 className="h-4 w-4" />
                <span>Ya, Hapus Baris Ini</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Slot */}
      {slotToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border-2 border-rose-400 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 shrink-0">
                <Trash2 className="h-6 w-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Konfirmasi Hapus Slot Rak</h3>
                <span className="text-xs text-rose-700 font-bold">Hapus slot penyimpanan dari denah</span>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 text-xs space-y-1">
              <div className="font-mono text-sm font-black text-amber-900">
                Slot: {slotToDelete.code}
              </div>
              {slotToDelete.materialName ? (
                <div className="text-xs font-bold text-slate-800">
                  Material: <span className="text-amber-900">{slotToDelete.materialName}</span>
                </div>
              ) : (
                <div className="text-[11px] text-emerald-700 font-semibold">
                  Status: Slot kosong (tidak ada material)
                </div>
              )}
            </div>

            {slotToDelete.isOccupied && (
              <div className="rounded-xl bg-amber-50 border border-amber-300 p-3 text-xs text-amber-950 font-medium flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Peringatan:</strong> Slot ini sedang terisi material. Menghapusnya akan melepaskan penetapan slot pada material tersebut.
                </div>
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSlotToDelete(null)}
                className="h-11 px-5 rounded-xl border border-slate-300 font-bold text-slate-700 text-xs hover:bg-slate-100 active:scale-95 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteSlot}
                className="flex items-center gap-2 h-11 px-5 rounded-xl bg-rose-600 text-white font-black text-xs shadow-md hover:bg-rose-700 active:scale-95 transition"
              >
                <Trash2 className="h-4 w-4" />
                <span>Ya, Hapus Slot Ini</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal Add User Spatie */}
      {showAddUserModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAddUserModal(false);
              setAddUserError(null);
            }
          }}
        >
          <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-[#0369a1]">
                  <UserPlus size={18} strokeWidth={2.4} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Tambah Pengguna Baru (Spatie)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Daftarkan akun operator dan atur hak akses modul atau wildcard
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAddUserModal(false);
                  setAddUserError(null);
                }}
                className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleAddUser} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs text-slate-800">
              {addUserError && (
                <div className="rounded-xl bg-rose-50 border border-rose-300 p-3 text-xs font-semibold text-rose-900 flex items-center gap-2">
                  <AlertCircle size={16} className="text-rose-600 shrink-0" />
                  <span>{addUserError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Nama Lengkap <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0369a1]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Email / Username <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="Contoh: budi@pln-kiosk.id"
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0369a1]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Kata Sandi Awal <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    placeholder="Minimal 4 karakter"
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0369a1]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Peran / Jabatan
                  </label>
                  <input
                    type="text"
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value)}
                    placeholder="Contoh: Petugas Logistik"
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0369a1]"
                  />
                </div>
              </div>

              {/* Spatie Permissions Configuration */}
              <div className="pt-2">
                <label className="block font-bold text-slate-900 mb-2">
                  Konfigurasi Hak Akses Spatie
                </label>

                {/* Wildcard * Option (Bisa Akses Kemana Saja) */}
                <div
                  className={`rounded-xl border-2 p-4 transition cursor-pointer ${
                    newUserIsWildcard
                      ? 'border-amber-400 bg-amber-50/90 shadow-xs'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100/80'
                  }`}
                  onClick={() => setNewUserIsWildcard(!newUserIsWildcard)}
                >
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newUserIsWildcard}
                      onChange={(e) => setNewUserIsWildcard(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded-sm text-amber-600 focus:ring-amber-500 border-slate-300"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-amber-950">
                          Bisa Akses Kemana Saja (Wildcard `*`)
                        </span>
                        <span className="rounded-full bg-amber-200 text-amber-900 text-[10px] font-black px-2 py-0.5">
                          SUPER ADMIN
                        </span>
                      </div>
                      <p className="text-xs text-amber-900/80 mt-1 leading-relaxed">
                        Memberikan izin penuh tanpa batas ke seluruh modul sistem (dashboard, stok baru/return, kategori, denah blok A-Z, import SAP, riwayat restore, konfigurasi, dan log).
                      </p>
                    </div>
                  </label>
                </div>

                {/* Modular Permissions Checklist if Wildcard is OFF */}
                {!newUserIsWildcard && (
                  <div className="mt-3 p-4 rounded-xl border border-slate-200 bg-slate-50/80 space-y-3 animate-in fade-in duration-150">
                    <div className="text-xs font-bold text-slate-700">
                      Pilih Hak Akses Perizinan Modular:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                      {SPATIE_AVAILABLE_PERMISSIONS.filter((p) => p.id !== '*').map((perm) => {
                        const isChecked = newUserPermissions.includes(perm.id);
                        return (
                          <label
                            key={perm.id}
                            className={`flex items-start gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition ${
                              isChecked
                                ? 'bg-sky-50 border-sky-300 text-sky-950 font-bold'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNewUserPermissions([...newUserPermissions, perm.id]);
                                } else {
                                  setNewUserPermissions(newUserPermissions.filter((p) => p !== perm.id));
                                }
                              }}
                              className="mt-0.5 h-3.5 w-3.5 rounded-sm text-sky-600 focus:ring-sky-500 border-slate-300"
                            />
                            <div>
                              <div className="text-[11px] font-bold">{perm.label}</div>
                              <div className="text-[10px] text-slate-500 font-normal font-mono">
                                {perm.id}
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddUserModal(false);
                    setAddUserError(null);
                  }}
                  className="h-11 px-5 rounded-xl border border-slate-300 font-bold text-slate-700 text-xs hover:bg-slate-100 active:scale-95 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 h-11 px-6 rounded-xl bg-[#0369a1] hover:bg-sky-800 text-white font-black text-xs shadow-md active:scale-95 transition"
                >
                  <Check size={16} strokeWidth={2.4} />
                  <span>Simpan &amp; Daftarkan Pengguna</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Restore backup.sql */}
      {showSqlRestoreModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowSqlRestoreModal(false);
              setSqlRestoreError(null);
              setSqlRestoreSuccess(null);
            }
          }}
        >
          <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-[#0369a1]">
                  <RotateCcw size={18} strokeWidth={2.4} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Pulihkan Database dari backup.sql
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Unggah atau tempel skrip SQL cadangan untuk memulihkan seluruh data gudang
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowSqlRestoreModal(false);
                  setSqlRestoreError(null);
                  setSqlRestoreSuccess(null);
                }}
                className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleExecuteSqlRestore} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs text-slate-800">
              {sqlRestoreError && (
                <div className="rounded-xl bg-rose-50 border border-rose-300 p-3 text-xs font-semibold text-rose-900 flex items-center gap-2">
                  <AlertCircle size={16} className="text-rose-600 shrink-0" />
                  <span>{sqlRestoreError}</span>
                </div>
              )}

              {sqlRestoreSuccess && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-300 p-3 text-xs font-semibold text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>{sqlRestoreSuccess}</span>
                </div>
              )}

              {/* Upload File Input */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Pilih File backup.sql (.sql):
                </label>
                <input
                  type="file"
                  ref={sqlFileInputRef}
                  accept=".sql,text/plain"
                  onChange={handleSqlFileSelect}
                  className="hidden"
                />
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => sqlFileInputRef.current?.click()}
                    className="flex items-center gap-2 h-11 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 font-bold text-xs text-slate-700 shadow-2xs transition"
                  >
                    <Upload size={15} />
                    <span>Pilih Berkas .sql...</span>
                  </button>
                  {sqlRestoreFileName && (
                    <span className="font-mono text-xs text-sky-800 bg-sky-50 border border-sky-200 px-3 py-1.5 rounded-lg">
                      {sqlRestoreFileName}
                    </span>
                  )}
                </div>
              </div>

              {/* Textarea for SQL Script */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Atau Tempel (Paste) Perintah Skrip SQL:
                </label>
                <textarea
                  rows={8}
                  value={sqlRestoreInput}
                  onChange={(e) => setSqlRestoreInput(e.target.value)}
                  placeholder="-- Tempel skrip SQL di sini (INSERT INTO materials, categories, dll)..."
                  className="w-full rounded-xl border border-slate-300 p-3 font-mono text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0369a1]"
                  required
                />
              </div>

              <div className="rounded-xl bg-amber-50 border border-amber-300 p-3 text-xs text-amber-900 flex items-start gap-2">
                <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Perhatian:</strong> Pemulihan database akan memperbarui master data materiil, kategori, lokasi rak, dan snapshot stok saat ini sesuai isi berkas backup.sql.
                </p>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowSqlRestoreModal(false);
                    setSqlRestoreError(null);
                    setSqlRestoreSuccess(null);
                  }}
                  className="h-11 px-5 rounded-xl border border-slate-300 font-bold text-slate-700 text-xs hover:bg-slate-100 active:scale-95 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!sqlRestoreInput.trim() || isProcessingSqlRestore}
                  className="flex items-center gap-2 h-11 px-6 rounded-xl bg-[#0369a1] hover:bg-sky-800 disabled:opacity-50 text-white font-black text-xs shadow-md active:scale-95 transition"
                >
                  <RotateCcw size={16} strokeWidth={2.4} />
                  <span>{isProcessingSqlRestore ? 'Memproses...' : 'Eksekusi Pemulihan Database'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        </AdminConsoleShell>
      </div>

      {/* Network Access Guide Modal */}
      <NetworkAccessModal
        visible={showNetworkModal}
        onClose={() => setShowNetworkModal(false)}
        warehouseCode={configDraft.warehouseCode || 'GUD-PLN-MLG-AM01'}
      />
    </div>
  );
};

