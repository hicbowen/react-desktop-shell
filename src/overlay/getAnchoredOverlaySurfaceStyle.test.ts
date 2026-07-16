import { describe, expect, it } from 'vitest'
import { getAnchoredOverlaySurfaceStyle } from './getAnchoredOverlaySurfaceStyle'

describe('getAnchoredOverlaySurfaceStyle', () => {
  it('returns fixed content-sized geometry after measurement', () => {
    const style = getAnchoredOverlaySurfaceStyle({
      hasOverlayHost: true,
      position: {
        x: 120,
        y: 160,
        placement: 'bottom-start',
        maxHeight: 320,
        maxWidth: 480,
        measured: true,
      },
    })

    expect(style).toMatchObject({
      position: 'fixed',
      boxSizing: 'border-box',
      width: 'max-content',
      left: 120,
      top: 160,
      maxHeight: 320,
      maxWidth: 480,
      pointerEvents: 'auto',
      visibility: 'visible',
    })
  })

  it('keeps an unmeasured surface hidden and non-interactive', () => {
    const style = getAnchoredOverlaySurfaceStyle({
      hasOverlayHost: true,
      position: {
        x: 0,
        y: 0,
        placement: 'bottom-start',
        maxHeight: 0,
        maxWidth: 0,
        measured: false,
      },
    })

    expect(style.maxHeight).toBeUndefined()
    expect(style.maxWidth).toBeUndefined()
    expect(style.pointerEvents).toBe('none')
    expect(style.visibility).toBe('hidden')
  })

  it('adds fallback surface colors without an overlay host', () => {
    const style = getAnchoredOverlaySurfaceStyle({
      hasOverlayHost: false,
      position: {
        x: 10,
        y: 20,
        placement: 'bottom-start',
        maxHeight: 100,
        maxWidth: 200,
        measured: true,
      },
    })

    expect(style.background).toBeDefined()
    expect(style.borderColor).toBeDefined()
    expect(style.boxShadow).toBeDefined()
  })
})
