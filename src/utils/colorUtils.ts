export function parseHex(hex: string): { r: number; g: number; b: number } {
  let h = hex.replace('#', '').trim()
  if (h.length === 3) h = h.split('').map(c => c + c).join('')
  return {
    r: parseInt(h.slice(0, 2), 16) || 0,
    g: parseInt(h.slice(2, 4), 16) || 0,
    b: parseInt(h.slice(4, 6), 16) || 0,
  }
}

export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2
  const d = max - min
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) * 60; break
      case g: h = ((b - r) / d + 2) * 60; break
      case b: h = ((r - g) / d + 4) * 60; break
    }
  }
  return { h, s, l }
}

export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs((h / 60) % 2 - 1))
  const m = l - c / 2
  let r = 0, g = 0, b = 0
  if (h < 60) { r = c; g = x }
  else if (h < 120) { r = x; g = c }
  else if (h < 180) { g = c; b = x }
  else if (h < 240) { g = x; b = c }
  else if (h < 300) { r = x; b = c }
  else { r = c; b = x }
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  }
}

export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const { r, g, b } = parseHex(hex)
  return rgbToHsl(r, g, b)
}

export function hslToHex(h: number, s: number, l: number): string {
  const { r, g, b } = hslToRgb(h, s, l)
  return '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('')
}

export function adjustLightness(hex: string, amount: number): string {
  const { h, s, l } = hexToHsl(hex)
  return hslToHex(h, s, Math.max(0, Math.min(1, l + amount)))
}

export function toRgba(hex: string, alpha: number): string {
  const { r, g, b } = parseHex(hex)
  return `rgba(${r},${g},${b},${alpha})`
}

function hexToRgbStr(hex: string): string {
  const { r, g, b } = parseHex(hex)
  return `rgb(${r},${g},${b})`
}

export type AccentVariants = Record<string, string>

export function generateAccentVariants(baseHex: string, isDark: boolean): AccentVariants {
  const { r, g, b } = parseHex(baseHex)
  const { h, s, l } = rgbToHsl(r, g, b)

  if (isDark) {
    const darkL = Math.max(0.55, Math.min(0.85, l + 0.35))
    const aaDarkL = Math.max(0.70, Math.min(0.90, l + 0.50))
    const textFillL = Math.min(1, l + 0.65)

    const darkHex = hslToHex(h, s * 0.85, darkL)
    const aaDarkHex = hslToHex(h, s * 0.80, aaDarkL)
    const textFillHex = hslToHex(h, s * 0.60, textFillL)

    return {
      '--accent-base': darkHex,
      '--accent-hover': toRgba(darkHex, 0.90),
      '--accent-pressed': toRgba(darkHex, 0.80),
      '--accent-fill-disabled': 'rgba(255,255,255,0.16)',
      '--accent-aa-fill': aaDarkHex,
      '--accent-aa-text': '#000000',
      '--accent-text': '#000000',
      '--accent-text-secondary': 'rgba(0,0,0,0.50)',
      '--accent-text-fill-color-primary': textFillHex,
      '--AccentFillColorDefaultBrush': darkHex,
      '--AccentFillColorSecondaryBrush': toRgba(darkHex, 0.90),
      '--AccentFillColorTertiaryBrush': toRgba(darkHex, 0.80),
      '--AccentFillColorDisabledBrush': 'rgba(255,255,255,0.16)',
      '--SystemFillColorAttentionBrush': darkHex,
      '--TextOnAccentFillColorPrimaryBrush': '#000000',
      '--TextOnAccentFillColorSecondaryBrush': 'rgba(0,0,0,0.50)',
      '--TextOnAccentFillColorDisabledBrush': 'rgba(255,255,255,0.53)',
    }
  }

  const aaFillL = Math.max(0.15, l - 0.15)
  const textFillL = Math.max(0.10, l - 0.30)

  const aaFillHex = hslToHex(h, s, aaFillL)
  const textFillHex = hslToHex(h, s, textFillL)

  return {
    '--accent-base': baseHex,
    '--accent-hover': toRgba(baseHex, 0.90),
    '--accent-pressed': toRgba(baseHex, 0.80),
    '--accent-fill-disabled': 'rgba(0,0,0,0.22)',
    '--accent-aa-fill': aaFillHex,
    '--accent-aa-text': '#FFFFFF',
    '--accent-text': '#FFFFFF',
    '--accent-text-secondary': 'rgba(255,255,255,0.70)',
    '--accent-text-fill-color-primary': textFillHex,
    '--AccentFillColorDefaultBrush': baseHex,
    '--AccentFillColorSecondaryBrush': toRgba(baseHex, 0.90),
    '--AccentFillColorTertiaryBrush': toRgba(baseHex, 0.80),
    '--AccentFillColorDisabledBrush': 'rgba(0,0,0,0.22)',
    '--SystemFillColorAttentionBrush': baseHex,
    '--TextOnAccentFillColorPrimaryBrush': '#FFFFFF',
    '--TextOnAccentFillColorSecondaryBrush': 'rgba(255,255,255,0.70)',
    '--TextOnAccentFillColorDisabledBrush': '#FFFFFF',
  }
}

export const PRESET_COLORS = [
  '#0067C0',
  '#0078D4',
  '#8654C7',
  '#C239B3',
  '#E3008C',
  '#BF0077',
  '#E81123',
  '#FF8C00',
  '#298A3B',
  '#009E62',
  '#00B7C3',
  '#4CC2FF',
] as const

export const DEFAULT_ACCENT_COLOR = '#0067C0'
