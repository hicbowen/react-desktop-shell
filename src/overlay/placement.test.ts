import { describe, expect, it } from 'vitest'
import { placeAnchoredOverlay } from './placement'

const viewport = { width: 800, height: 600 }

function rect(left: number, top: number, width: number, height: number) {
  return {
    bottom: top + height,
    height,
    left,
    right: left + width,
    top,
    width,
  } as DOMRect
}

describe('placeAnchoredOverlay', () => {
  it('uses the preferred bottom-end placement when it fits', () => {
    const position = placeAnchoredOverlay(
      rect(500, 100, 100, 32),
      rect(0, 0, 260, 200),
      viewport,
      { gap: 5, preferredPlacement: 'bottom-end', viewportPadding: 8 },
    )

    expect(position).toEqual({
      x: 340,
      y: 137,
      placement: 'bottom-end',
      maxHeight: 455,
    })
  })

  it('flips to top-end when the bottom does not fit and top has more space', () => {
    const position = placeAnchoredOverlay(
      rect(500, 500, 100, 32),
      rect(0, 0, 260, 240),
      viewport,
      { gap: 5, preferredPlacement: 'bottom-end', viewportPadding: 8 },
    )

    expect(position.placement).toBe('top-end')
    expect(position.y).toBe(255)
    expect(position.maxHeight).toBe(487)
  })

  it('chooses the side with more room when neither side fits', () => {
    const position = placeAnchoredOverlay(
      rect(300, 350, 100, 32),
      rect(0, 0, 260, 500),
      viewport,
      {
        gap: 5,
        maxHeight: 500,
        preferredPlacement: 'bottom-start',
        viewportPadding: 8,
      },
    )

    expect(position.placement).toBe('top-start')
    expect(position.maxHeight).toBe(337)
    expect(position.y).toBe(8)
  })

  it('clamps right and left overflow within viewport padding', () => {
    const right = placeAnchoredOverlay(
      rect(780, 100, 20, 30),
      rect(0, 0, 300, 100),
      viewport,
      { preferredPlacement: 'bottom-start', viewportPadding: 12 },
    )
    const left = placeAnchoredOverlay(
      rect(-40, 100, 20, 30),
      rect(0, 0, 300, 100),
      viewport,
      { preferredPlacement: 'bottom-end', viewportPadding: 12 },
    )

    expect(right.x).toBe(488)
    expect(left.x).toBe(12)
  })

  it('caps maxHeight using both the visual limit and available space', () => {
    const capped = placeAnchoredOverlay(
      rect(100, 50, 100, 30),
      rect(0, 0, 260, 700),
      viewport,
      {
        gap: 5,
        maxHeight: 420,
        preferredPlacement: 'bottom-start',
        viewportPadding: 10,
      },
    )
    const constrained = placeAnchoredOverlay(
      rect(100, 300, 100, 30),
      rect(0, 0, 260, 700),
      viewport,
      {
        gap: 5,
        maxHeight: 420,
        preferredPlacement: 'bottom-start',
        viewportPadding: 10,
      },
    )

    expect(capped.maxHeight).toBe(420)
    expect(constrained.placement).toBe('top-start')
    expect(constrained.maxHeight).toBe(285)
  })

  it('returns a usable x coordinate when the overlay is wider than the viewport', () => {
    const position = placeAnchoredOverlay(
      rect(200, 100, 100, 30),
      rect(0, 0, 1000, 100),
      viewport,
      { viewportPadding: 16 },
    )

    expect(position.x).toBe(16)
  })
})
