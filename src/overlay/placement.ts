export type AnchoredOverlayPlacement =
  | 'bottom-start'
  | 'bottom-end'
  | 'top-start'
  | 'top-end'

export interface PlaceAnchoredOverlayOptions {
  gap?: number
  viewportPadding?: number
  preferredPlacement?: AnchoredOverlayPlacement
  maxHeight?: number
}

export interface AnchoredOverlayPosition {
  x: number
  y: number
  placement: AnchoredOverlayPlacement
  maxHeight: number
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), Math.max(min, max))
}

export function placeAnchoredOverlay(
  triggerRect: DOMRect,
  overlayRect: DOMRect,
  viewport: { width: number; height: number },
  options: PlaceAnchoredOverlayOptions = {},
): AnchoredOverlayPosition {
  const gap = options.gap ?? 4
  const viewportPadding = options.viewportPadding ?? 8
  const preferredPlacement = options.preferredPlacement ?? 'bottom-start'
  const preferredDirection = preferredPlacement.startsWith('bottom')
    ? 'bottom'
    : 'top'
  const alignment = preferredPlacement.endsWith('end') ? 'end' : 'start'
  const availableBottom = Math.max(
    0,
    viewport.height - viewportPadding - triggerRect.bottom - gap,
  )
  const availableTop = Math.max(
    0,
    triggerRect.top - viewportPadding - gap,
  )
  const heightLimit = options.maxHeight ?? Number.POSITIVE_INFINITY
  const desiredHeight = Math.min(overlayRect.height, heightLimit)
  const preferredSpace =
    preferredDirection === 'bottom' ? availableBottom : availableTop
  const oppositeSpace =
    preferredDirection === 'bottom' ? availableTop : availableBottom
  const direction =
    preferredSpace < desiredHeight && oppositeSpace > preferredSpace
      ? preferredDirection === 'bottom'
        ? 'top'
        : 'bottom'
      : preferredDirection
  const availableHeight =
    direction === 'bottom' ? availableBottom : availableTop
  const maxHeight = Math.min(heightLimit, availableHeight)
  const renderedHeight = Math.min(overlayRect.height, maxHeight)
  const idealX =
    alignment === 'end'
      ? triggerRect.right - overlayRect.width
      : triggerRect.left
  const maxX = viewport.width - viewportPadding - overlayRect.width
  const x = clamp(idealX, viewportPadding, maxX)
  const idealY =
    direction === 'bottom'
      ? triggerRect.bottom + gap
      : triggerRect.top - gap - renderedHeight
  const maxY = viewport.height - viewportPadding - renderedHeight
  const y = clamp(idealY, viewportPadding, maxY)

  return {
    x,
    y,
    placement: `${direction}-${alignment}` as AnchoredOverlayPlacement,
    maxHeight,
  }
}
