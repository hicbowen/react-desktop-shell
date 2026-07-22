export interface AppHsvColor { h: number; s: number; v: number }

export function normalizeHexColor(value: string) {
  const raw = value.trim().replace(/^#/, '')
  const expanded = raw.length === 3 ? raw.split('').map((part) => part + part).join('') : raw
  return /^[0-9a-f]{6}$/i.test(expanded) ? `#${expanded.toUpperCase()}` : null
}

export function hexToHsv(hex: string): AppHsvColor {
  const normalized = normalizeHexColor(hex) ?? '#000000'
  const [r, g, b] = [1, 3, 5].map((index) => parseInt(normalized.slice(index, index + 2), 16) / 255)
  const max = Math.max(r!, g!, b!), min = Math.min(r!, g!, b!), delta = max - min
  let h = 0
  if (delta) {
    if (max === r) h = 60 * (((g! - b!) / delta) % 6)
    else if (max === g) h = 60 * ((b! - r!) / delta + 2)
    else h = 60 * ((r! - g!) / delta + 4)
  }
  return { h: (h + 360) % 360, s: max === 0 ? 0 : delta / max, v: max }
}

export function hsvToHex({ h, s, v }: AppHsvColor) {
  const chroma = v * s
  const segment = ((h % 360) + 360) % 360 / 60
  const x = chroma * (1 - Math.abs(segment % 2 - 1))
  const [r1, g1, b1] = segment < 1 ? [chroma, x, 0] : segment < 2 ? [x, chroma, 0] : segment < 3 ? [0, chroma, x] : segment < 4 ? [0, x, chroma] : segment < 5 ? [x, 0, chroma] : [chroma, 0, x]
  const m = v - chroma
  return `#${[r1, g1, b1].map((part) => Math.round((part + m) * 255).toString(16).padStart(2, '0')).join('').toUpperCase()}`
}
