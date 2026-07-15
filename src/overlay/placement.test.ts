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
  it('positions bottom-start and bottom-end placements', () => {
    const start = placeAnchoredOverlay(
      rect(100, 100, 100, 30),
      rect(0, 0, 200, 100),
      viewport,
      { preferredPlacement: 'bottom-start' },
    )
    const end = placeAnchoredOverlay(
      rect(500, 100, 100, 30),
      rect(0, 0, 200, 100),
      viewport,
      { preferredPlacement: 'bottom-end' },
    )

    expect(start).toEqual({
      x: 100,
      y: 134,
      placement: 'bottom-start',
      maxHeight: 458,
      maxWidth: 784,
    })
    expect(end.x).toBe(400)
    expect(end.placement).toBe('bottom-end')
  })

  it('centers top and right placements on their cross axes', () => {
    const top = placeAnchoredOverlay(
      rect(300, 300, 100, 30),
      rect(0, 0, 200, 100),
      viewport,
      { preferredPlacement: 'top' },
    )
    const right = placeAnchoredOverlay(
      rect(100, 100, 100, 30),
      rect(0, 0, 200, 100),
      viewport,
      { preferredPlacement: 'right' },
    )

    expect(top).toMatchObject({ x: 250, y: 196, placement: 'top' })
    expect(right).toMatchObject({ x: 204, y: 65, placement: 'right' })
  })

  it('positions a right-start placement when it fits', () => {
    const position = placeAnchoredOverlay(
      rect(100, 100, 100, 30),
      rect(0, 0, 200, 100),
      viewport,
      { preferredPlacement: 'right-start' },
    )

    expect(position).toMatchObject({
      x: 204,
      y: 100,
      placement: 'right-start',
      maxHeight: 584,
      maxWidth: 588,
    })
  })

  it('flips right to left and bottom to top when the opposite side has more room', () => {
    const horizontal = placeAnchoredOverlay(
      rect(700, 100, 80, 30),
      rect(0, 0, 200, 100),
      viewport,
      { preferredPlacement: 'right-start' },
    )
    const vertical = placeAnchoredOverlay(
      rect(100, 500, 100, 30),
      rect(0, 0, 200, 100),
      viewport,
      { preferredPlacement: 'bottom-start' },
    )

    expect(horizontal).toMatchObject({
      x: 496,
      placement: 'left-start',
    })
    expect(vertical).toMatchObject({ y: 396, placement: 'top-start' })
  })

  it('preserves end alignment when flipping directions', () => {
    const position = placeAnchoredOverlay(
      rect(700, 200, 80, 40),
      rect(0, 0, 200, 100),
      viewport,
      { preferredPlacement: 'right-end' },
    )

    expect(position).toMatchObject({
      x: 496,
      y: 140,
      placement: 'left-end',
    })
  })

  it('chooses the larger side when neither side fits', () => {
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

    expect(position).toMatchObject({
      y: 8,
      placement: 'top-start',
      maxHeight: 337,
    })
  })

  it('clamps left, right, top, and bottom overflow', () => {
    const left = placeAnchoredOverlay(
      rect(-40, 100, 20, 30),
      rect(0, 0, 200, 100),
      viewport,
      { preferredPlacement: 'bottom-start' },
    )
    const right = placeAnchoredOverlay(
      rect(780, 100, 40, 30),
      rect(0, 0, 200, 100),
      viewport,
      { preferredPlacement: 'bottom-end' },
    )
    const top = placeAnchoredOverlay(
      rect(100, -40, 30, 20),
      rect(0, 0, 200, 100),
      viewport,
      { preferredPlacement: 'right-start' },
    )
    const bottom = placeAnchoredOverlay(
      rect(100, 580, 30, 40),
      rect(0, 0, 200, 100),
      viewport,
      { preferredPlacement: 'right-end' },
    )

    expect(left.x).toBe(8)
    expect(right.x).toBe(592)
    expect(top.y).toBe(8)
    expect(bottom.y).toBe(492)
  })

  it('returns dynamic maxHeight and maxWidth for the chosen direction', () => {
    const vertical = placeAnchoredOverlay(
      rect(100, 300, 100, 30),
      rect(0, 0, 260, 700),
      viewport,
      { gap: 5, preferredPlacement: 'bottom-start', viewportPadding: 10 },
    )
    const horizontal = placeAnchoredOverlay(
      rect(300, 100, 30, 100),
      rect(0, 0, 700, 260),
      viewport,
      { gap: 5, preferredPlacement: 'right-start', viewportPadding: 10 },
    )

    expect(vertical).toMatchObject({
      placement: 'top-start',
      maxHeight: 285,
      maxWidth: 780,
    })
    expect(horizontal).toMatchObject({
      placement: 'right-start',
      maxHeight: 580,
      maxWidth: 455,
    })
  })

  it('handles overlays larger than the viewport with stable coordinates', () => {
    const wider = placeAnchoredOverlay(
      rect(200, 100, 100, 30),
      rect(0, 0, 1000, 100),
      viewport,
      { viewportPadding: 16 },
    )
    const taller = placeAnchoredOverlay(
      rect(300, 290, 100, 20),
      rect(0, 0, 200, 1000),
      viewport,
      { preferredPlacement: 'bottom', viewportPadding: 16 },
    )

    expect(wider).toMatchObject({ x: 16, maxWidth: 768 })
    expect(taller).toMatchObject({ y: 314, maxHeight: 270 })
  })

  it('honors viewport padding and explicit size limits', () => {
    const position = placeAnchoredOverlay(
      rect(0, 100, 100, 30),
      rect(0, 0, 400, 400),
      viewport,
      {
        maxHeight: 150,
        maxWidth: 180,
        preferredPlacement: 'bottom-start',
        viewportPadding: 20,
      },
    )

    expect(position).toMatchObject({
      x: 20,
      maxHeight: 150,
      maxWidth: 180,
    })
  })

  it('never returns negative size limits', () => {
    const position = placeAnchoredOverlay(
      rect(0, 0, 800, 600),
      rect(0, 0, 400, 400),
      { width: 10, height: 10 },
      { maxHeight: -20, maxWidth: -30, viewportPadding: 20 },
    )

    expect(position.maxHeight).toBe(0)
    expect(position.maxWidth).toBe(0)
  })
})
