import { describe, expect, it } from 'vitest'
import {
  APP_THEME_PRESETS,
  defineAppTheme,
  getAppThemeStyle,
} from './AppTheme'

describe('AppTheme', () => {
  it('exposes the supported preset ids', () => {
    expect(APP_THEME_PRESETS).toEqual([
      'blue',
      'teal',
      'green',
      'violet',
      'orange',
      'rose',
    ])
  })

  it('keeps defineAppTheme as a typed identity helper', () => {
    const theme = { light: { accentColor: '#6d5ce7' } }
    expect(defineAppTheme(theme)).toBe(theme)
  })

  it('merges common tokens before mode overrides', () => {
    const style = getAppThemeStyle({
      common: {
        accentColor: '#6d5ce7',
        contentBg: '#faf9ff',
      },
      light: { contentBg: '#ffffff' },
      dark: {
        accentColor: '#b9adff',
        contentBg: '#252330',
      },
    }) as Record<string, string>

    expect(style['--app-theme-light-accent-color']).toBe('#6d5ce7')
    expect(style['--app-theme-light-content-bg']).toBe('#ffffff')
    expect(style['--app-theme-dark-accent-color']).toBe('#b9adff')
    expect(style['--app-theme-dark-content-bg']).toBe('#252330')
  })

  it('derives every dependent accent token without leaking preset colors', () => {
    const style = getAppThemeStyle({
      light: { accentColor: '#6d5ce7' },
      dark: {
        accentColor: '#b9adff',
        accentHoverColor: '#9988ee',
      },
    }) as Record<string, string>

    expect(style['--app-theme-light-accent-hover-color']).toContain(
      'var(--app-theme-light-accent-color) 90%',
    )
    expect(style['--app-theme-light-accent-pressed-color']).toContain(
      'var(--app-theme-light-accent-color) 80%',
    )
    expect(style['--app-theme-light-active-bg']).toContain('8%')
    expect(style['--app-theme-light-accent-text-color']).toBe('#ffffff')
    expect(style['--app-theme-light-focus-ring-color']).toBe(
      'var(--app-theme-light-accent-color)',
    )
    expect(style['--app-theme-light-info-fg']).toBe(
      'var(--app-theme-light-accent-color)',
    )
    expect(style['--app-theme-dark-accent-hover-color']).toBe('#9988ee')
    expect(style['--app-theme-dark-active-bg']).toContain('14%')
    expect(style['--app-theme-dark-accent-text-color']).toBe('#00131f')
  })

  it('does not emit styles when no custom theme is provided', () => {
    expect(getAppThemeStyle(undefined)).toBeUndefined()
  })
})

describe('theme preset contrast', () => {
  const accents = {
    blue: ['#115ea3', '#60cdff'],
    teal: ['#0f6c6d', '#5cd6d3'],
    green: ['#107c10', '#6ccb5f'],
    violet: ['#5c2e91', '#c5a7ff'],
    orange: ['#a74100', '#ffb26b'],
    rose: ['#b1467b', '#f09ac4'],
  } as const

  const toRgb = (hex: string) =>
    [1, 3, 5].map((index) => Number.parseInt(hex.slice(index, index + 2), 16))
  const mixWithBlack = (hex: string, amount: number) =>
    `#${toRgb(hex)
      .map((channel) => Math.round(channel * amount).toString(16).padStart(2, '0'))
      .join('')}`
  const luminance = (hex: string) => {
    const [red = 0, green = 0, blue = 0] = toRgb(hex)
      .map((channel) => channel / 255)
      .map((channel) =>
        channel <= 0.04045
          ? channel / 12.92
          : ((channel + 0.055) / 1.055) ** 2.4,
      )
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue
  }
  const contrast = (foreground: string, background: string) => {
    const first = luminance(foreground)
    const second = luminance(background)
    return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05)
  }

  it.each(Object.entries(accents))(
    '%s keeps accent text readable in every interaction state',
    (_preset, [light, dark]) => {
      for (const accent of [light, mixWithBlack(light, 0.9), mixWithBlack(light, 0.8)]) {
        expect(contrast('#ffffff', accent)).toBeGreaterThanOrEqual(4.5)
      }
      for (const accent of [dark, mixWithBlack(dark, 0.9), mixWithBlack(dark, 0.8)]) {
        expect(contrast('#00131f', accent)).toBeGreaterThanOrEqual(4.5)
      }
    },
  )
})
