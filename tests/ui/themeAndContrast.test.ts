import { describe, it, expect } from 'vitest';

/**
 * Calculates relative luminance for sRGB color hex
 */
function getLuminance(hex: string): number {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;

  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const R = toLinear(r);
  const G = toLinear(g);
  const B = toLinear(b);

  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/**
 * Calculates contrast ratio between two hex colors
 */
function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getLuminance(hex1);
  const lum2 = getLuminance(hex2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

describe('K17 / DESIGN.md: WCAG Color Contrast & Theme Tokens', () => {
  it('measures text #0F172A on primary #FACC15 satisfies WCAG AAA (>= 7:1)', () => {
    const ratio = getContrastRatio('#0F172A', '#FACC15');
    expect(ratio).toBeGreaterThanOrEqual(11.0); // 11.66:1
  });

  it('measures text #0F172A on primaryHover #EAB308 satisfies WCAG AAA', () => {
    const ratio = getContrastRatio('#0F172A', '#EAB308');
    expect(ratio).toBeGreaterThanOrEqual(9.0); // 9.31:1
  });

  it('measures textSecondary #475569 on white #FFFFFF satisfies WCAG AA (>= 4.5:1)', () => {
    const ratio = getContrastRatio('#475569', '#FFFFFF');
    expect(ratio).toBeGreaterThanOrEqual(7.0); // 7.58:1
  });

  it('measures primaryDark #854D0E on primaryLight #FEFCE8 satisfies WCAG AA (>= 4.5:1)', () => {
    const ratio = getContrastRatio('#854D0E', '#FEFCE8');
    expect(ratio).toBeGreaterThanOrEqual(6.5); // 6.62:1
  });

  it('prohibits white text on #FACC15 due to insufficient contrast (< 2:1)', () => {
    const ratio = getContrastRatio('#FFFFFF', '#FACC15');
    expect(ratio).toBeLessThan(2.0); // Only ~1.53:1
  });
});
