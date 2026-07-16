import type { CSSProperties } from 'react'
import { OVERLAY_SURFACE_FALLBACK_STYLE } from './surfaceFallback'
import type { AnchoredOverlayPositionState } from './useAnchoredOverlayPosition'

interface AnchoredOverlaySurfaceStyleOptions {
  position: AnchoredOverlayPositionState
  hasOverlayHost: boolean
}

export function getAnchoredOverlaySurfaceStyle({
  position,
  hasOverlayHost,
}: AnchoredOverlaySurfaceStyleOptions): CSSProperties {
  return {
    ...(hasOverlayHost ? undefined : OVERLAY_SURFACE_FALLBACK_STYLE),
    position: 'fixed',
    boxSizing: 'border-box',
    width: 'max-content',
    left: position.x,
    top: position.y,
    maxWidth: position.measured ? position.maxWidth : undefined,
    maxHeight: position.measured ? position.maxHeight : undefined,
    pointerEvents: position.measured ? 'auto' : 'none',
    visibility: position.measured ? 'visible' : 'hidden',
  }
}
