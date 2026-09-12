import {
  Layers,
  Zap,
  Cpu,
  Gauge,
  ShieldCheck,
  Hammer,
  Package,
  type LucideIcon,
} from 'lucide-react';

/**
 * Maps warehouse category ID or name to a consistent Lucide vector icon.
 * Matches Universal-POS iconographic design language.
 */
export const getCategoryIcon = (categoryIdOrName: string = ''): LucideIcon => {
  const key = categoryIdOrName.toLowerCase();

  if (key === 'all' || key.includes('semua')) {
    return Layers;
  }
  if (key.includes('mdu') || key.includes('distribusi utama')) {
    return Zap;
  }
  if (key.includes('gardu') || key.includes('jaringan') || key.includes('trafo')) {
    return Cpu;
  }
  if (key.includes('kwh') || key.includes('app') || key.includes('pengukur') || key.includes('pembatas')) {
    return Gauge;
  }
  if (key.includes('k3') || key.includes('apd') || key.includes('keselamatan') || key.includes('alat kerja')) {
    return ShieldCheck;
  }
  if (key.includes('sipil') || key.includes('pondasi') || key.includes('tiang') || key.includes('beton')) {
    return Hammer;
  }

  return Package;
};
