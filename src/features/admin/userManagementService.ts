/**
 * Spatie-style Role & Permission User Management Service
 * Mendukung manajemen pengguna, hak akses berbasis perizinan (Spatie),
 * wildcard '*' untuk Super Administrator (bisa akses kemana saja),
 * dan fungsi ubah kata sandi di menu profile.
 */

export type SpatiePermission =
  | '*' // Wildcard Spatie: Akses penuh ke seluruh modul / bisa akses kemana saja
  | 'dashboard.view'
  | 'stock.view'
  | 'stock.manage'
  | 'categories.manage'
  | 'locations.manage'
  | 'import.manage'
  | 'history.manage'
  | 'settings.manage'
  | 'users.manage';

export interface SpatiePermissionMeta {
  id: SpatiePermission;
  label: string;
  description: string;
  category: 'core' | 'logistics' | 'system';
}

export const SPATIE_AVAILABLE_PERMISSIONS: SpatiePermissionMeta[] = [
  {
    id: '*',
    label: 'Akses Penuh Semua Modul (*)',
    description: 'Hak akses tingkat tertinggi Spatie (Super Admin) - dapat mengakses kemana saja tanpa batasan.',
    category: 'core',
  },
  {
    id: 'dashboard.view',
    label: 'Lihat Dashboard Eksekutif',
    description: 'Melihat ringkasan metrik KPI, status sinkronisasi, dan inventaris gudang.',
    category: 'core',
  },
  {
    id: 'stock.view',
    label: 'Lihat Katalog & Stok',
    description: 'Melihat daftar material baru dan material return beserta lokasi rak.',
    category: 'logistics',
  },
  {
    id: 'stock.manage',
    label: 'Kelola & Sesuaikan Stok',
    description: 'Menyesuaikan kuantitas fisik, mutasi rak, dan mendaftarkan material baru.',
    category: 'logistics',
  },
  {
    id: 'categories.manage',
    label: 'Kelola Kategori Logistik',
    description: 'Menambah, mengedit, dan menghapus kategori material kelistrikan PLN.',
    category: 'logistics',
  },
  {
    id: 'locations.manage',
    label: 'Kelola Denah & Tata Letak',
    description: 'Mengatur struktur penomoran Blok A-Z, sub-blok, dan slot rak gudang.',
    category: 'logistics',
  },
  {
    id: 'import.manage',
    label: 'Integrasi Paket & Impor CSV SAP',
    description: 'Mengimpor dataset material SAP ERP dan mengganti master data gudang.',
    category: 'system',
  },
  {
    id: 'history.manage',
    label: 'Riwayat Snapshot & Rollback',
    description: 'Melihat audit log snapshot versi data gudang dan melakukan pemulihan data.',
    category: 'system',
  },
  {
    id: 'users.manage',
    label: 'Manajemen Pengguna & Spatie',
    description: 'Menambah pengguna baru, mengatur role, dan mengonfigurasi hak akses modul.',
    category: 'system',
  },
  {
    id: 'settings.manage',
    label: 'Pengaturan Kiosk & Sistem',
    description: 'Mengatur timer idle, umur kedaluwarsa stok, wallpaper, dan konfigurasi terminal.',
    category: 'system',
  },
];

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  permissions: SpatiePermission[];
  createdAt: string;
  updatedAt?: string;
}

const STORAGE_KEY = 'kiosk_admin_users_v2';

export class UserManagementService {
  /**
   * Mengambil daftar seluruh pengguna terdaftar dari penyimpanan lokal.
   * Jika belum ada, otomatis melakukan seeding Superadmin default.
   */
  public static getUsers(): AdminUser[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback ke default seeding jika parsing error
    }

    const defaultUsers = this.getDefaultUsers();
    this.saveUsers(defaultUsers);
    return defaultUsers;
  }

  /**
   * Menyimpan daftar pengguna ke localStorage
   */
  public static saveUsers(users: AdminUser[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('Gagal menyimpan daftar pengguna:', e);
    }
  }

  /**
   * Seeding akun Super Administrator default
   */
  public static getDefaultUsers(): AdminUser[] {
    return [
      {
        id: 'usr-superadmin-01',
        name: 'Administrator Gudang PLN',
        email: 'admin@pln-kiosk.id',
        password: '123456',
        role: 'Super Administrator',
        permissions: ['*'], // Spatie wildcard: bisa akses kemana saja
        createdAt: new Date().toISOString(),
      },
    ];
  }

  /**
   * Mencari user berdasarkan email atau username
   */
  public static findByIdentifier(identifier: string): AdminUser | null {
    const cleanId = identifier.trim().toLowerCase();
    const cleanUsername = cleanId.includes('@') ? cleanId.split('@')[0] : cleanId;
    const users = this.getUsers();

    return (
      users.find((u) => {
        const userEmail = u.email.toLowerCase();
        const userUsername = userEmail.split('@')[0];
        return (
          userEmail === cleanId ||
          userUsername === cleanId ||
          userUsername === cleanUsername
        );
      }) || null
    );
  }

  /**
   * Menambahkan pengguna baru (Add User Spatie)
   */
  public static addUser(data: {
    name: string;
    email: string;
    password: string;
    role: string;
    permissions: SpatiePermission[];
  }): { success: boolean; user?: AdminUser; error?: string } {
    const trimmedEmail = data.email.trim().toLowerCase();
    if (!trimmedEmail) {
      return { success: false, error: 'Email / username tidak boleh kosong' };
    }
    if (!data.name.trim()) {
      return { success: false, error: 'Nama pengguna tidak boleh kosong' };
    }
    if (!data.password || data.password.length < 4) {
      return { success: false, error: 'Kata sandi minimal 4 karakter' };
    }

    const existing = this.findByIdentifier(trimmedEmail);
    if (existing) {
      return { success: false, error: `Pengguna dengan email '${trimmedEmail}' sudah terdaftar` };
    }

    const newUser: AdminUser = {
      id: `usr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: data.name.trim(),
      email: trimmedEmail,
      password: data.password,
      role: data.role.trim() || 'Petugas Logistik',
      permissions: data.permissions.length > 0 ? data.permissions : ['dashboard.view', 'stock.view'],
      createdAt: new Date().toISOString(),
    };

    const users = this.getUsers();
    users.push(newUser);
    this.saveUsers(users);

    return { success: true, user: newUser };
  }

  /**
   * Mengubah kata sandi pengguna (untuk menu Profile)
   */
  public static updatePassword(
    identifier: string,
    currentPassword: string,
    newPassword: string
  ): { success: boolean; error?: string } {
    if (!newPassword || newPassword.length < 4) {
      return { success: false, error: 'Kata sandi baru minimal 4 karakter' };
    }

    const users = this.getUsers();
    const targetUser = this.findByIdentifier(identifier);

    if (!targetUser) {
      return { success: false, error: 'Pengguna tidak ditemukan' };
    }

    if (targetUser.password !== currentPassword) {
      return { success: false, error: 'Kata sandi saat ini tidak sesuai' };
    }

    const updatedUsers = users.map((u) => {
      if (u.id === targetUser.id) {
        return {
          ...u,
          password: newPassword,
          updatedAt: new Date().toISOString(),
        };
      }
      return u;
    });

    this.saveUsers(updatedUsers);
    return { success: true };
  }

  /**
   * Menghapus pengguna
   */
  public static deleteUser(userId: string): { success: boolean; error?: string } {
    const users = this.getUsers();
    const target = users.find((u) => u.id === userId);

    if (!target) {
      return { success: false, error: 'Pengguna tidak ditemukan' };
    }

    if (target.email === 'admin@pln-kiosk.id' && target.permissions.includes('*')) {
      return { success: false, error: 'Akun Super Administrator utama dilindungi dan tidak dapat dihapus' };
    }

    if (users.length <= 1) {
      return { success: false, error: 'Tidak dapat menghapus satu-satunya pengguna terdaftar' };
    }

    const filtered = users.filter((u) => u.id !== userId);
    this.saveUsers(filtered);
    return { success: true };
  }

  /**
   * Memvalidasi otentikasi login pengguna
   */
  public static authenticate(
    identifier: string,
    secret: string
  ): { success: boolean; user?: AdminUser; error?: string } {
    if (!identifier.trim() || !secret) {
      return { success: false, error: 'Email / username dan kata sandi wajib diisi' };
    }

    const user = this.findByIdentifier(identifier);
    if (!user) {
      if (identifier.trim().toLowerCase() === 'admin') {
        const defaultAdmin = this.getUsers().find((u) => u.permissions.includes('*'));
        if (defaultAdmin && defaultAdmin.password === secret) {
          return { success: true, user: defaultAdmin };
        }
      }
      return { success: false, error: 'Email/username atau kata sandi tidak sesuai' };
    }

    if (user.password === secret) {
      return { success: true, user };
    }

    return { success: false, error: 'Email/username atau kata sandi tidak sesuai' };
  }

  /**
   * Mengecek apakah seorang pengguna memiliki hak akses (Spatie permission).
   * Pengguna dengan izin '*' dapat mengakses kemana saja (bisa akses kemana saja).
   */
  public static hasPermission(user: AdminUser | null | undefined, permission: SpatiePermission): boolean {
    if (!user || !user.permissions) return false;
    if (user.permissions.includes('*')) return true; // Wildcard Spatie: Akses semua modul
    return user.permissions.includes(permission);
  }
}
