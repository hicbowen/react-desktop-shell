export type AnchoredOverlayPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end'

export interface PlaceAnchoredOverlayOptions {
  gap?: number
  viewportPadding?: number
  preferredPlacement?: AnchoredOverlayPlacement
  maxHeight?: number
  maxWidth?: number
}

export interface AnchoredOverlayPosition {
  x: number
  y: number
  placement: AnchoredOverlayPlacement
  maxHeight: number
  maxWidth: number
}

type OverlayDirection = 'top' | 'bottom' | 'left' | 'right'
type OverlayAlignment = 'start' | 'center' | 'end'

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), Math.max(min, max))
}

function parsePlacement(placement: AnchoredOverlayPlacement): {
  direction: OverlayDirection
  alignment: OverlayAlignment
} {
  const [direction, alignment = 'center'] = placement.split('-')

  return {
    direction: direction as OverlayDirection,
    alignment: alignment as OverlayAlignment,
  }
}

function oppositeDirection(direction: OverlayDirection): OverlayDirection {
  switch (direction) {
    case 'top':
      return 'bottom'
    case 'bottom':
      return 'top'
    case 'left':
      return 'right'
    case 'right':
      return 'left'
  }
}

function resolvePlacement(
  direction: OverlayDirection,
  alignment: OverlayAlignment,
): AnchoredOverlayPlacement {
  return alignment === 'center' ? direction : `${direction}-${alignment}`
}

function finiteLimit(value: number | undefined) {
  return value === undefined
    ? Number.POSITIVE_INFINITY
    : Math.max(0, value)
}

export function placeAnchoredOverlay(
  triggerRect: DOMRect,
  overlayRect: DOMRect,
  viewport: { width: number; height: number },
  options: PlaceAnchoredOverlayOptions = {},
): AnchoredOverlayPosition {
  const gap = Math.max(0, options.gap ?? 4)
  const viewportPadding = Math.max(0, options.viewportPadding ?? 8)
  const preferredPlacement = options.preferredPlacement ?? 'bottom-start'
  const { direction: preferredDirection, alignment } =
    parsePlacement(preferredPlacement)
  const available = {
    top: Math.max(0, triggerRect.top - viewportPadding - gap),
    bottom: Math.max(
      0,
      viewport.height - viewportPadding - triggerRect.bottom - gap,
    ),
    left: Math.max(0, triggerRect.left - viewportPadding - gap),
    right: Math.max(
      0,
      viewport.width - viewportPadding - triggerRect.right - gap,
    ),
  }
  const heightLimit = finiteLimit(options.maxHeight)
  const widthLimit = finiteLimit(options.maxWidth)
  const vertical =
    preferredDirection === 'top' || preferredDirection === 'bottom'
  const desiredMainSize = vertical
    ? Math.min(overlayRect.height, heightLimit)
    : Math.min(overlayRect.width, widthLimit)
  const opposite = oppositeDirection(preferredDirection)
  const direction =
    available[preferredDirection] < desiredMainSize &&
    available[opposite] > available[preferredDirection]
      ? opposite
      : preferredDirection
  const resolvedVertical = direction === 'top' || direction === 'bottom'
  const viewportWidth = Math.max(0, viewport.width - viewportPadding * 2)
  const viewportHeight = Math.max(0, viewport.height - viewportPadding * 2)
  const maxHeight = Math.max(
    0,
    Math.min(
      heightLimit,
      resolvedVertical ? available[direction] : viewportHeight,
    ),
  )
  const maxWidth = Math.max(
    0,
    Math.min(
      widthLimit,
      resolvedVertical ? viewportWidth : available[direction],
    ),
  )
  const renderedWidth = Math.min(overlayRect.width, maxWidth)
  const renderedHeight = Math.min(overlayRect.height, maxHeight)
  let idealX: number
  let idealY: number

  if (resolvedVertical) {
    idealX =
      alignment === 'start'
        ? triggerRect.left
        : alignment === 'end'
          ? triggerRect.right - renderedWidth
          : triggerRect.left + (triggerRect.width - renderedWidth) / 2
    idealY =
      direction === 'bottom'
        ? triggerRect.bottom + gap
        : triggerRect.top - gap - renderedHeight
  } else {
    idealX =
      direction === 'right'
        ? triggerRect.right + gap
        : triggerRect.left - gap - renderedWidth
    idealY =
      alignment === 'start'
        ? triggerRect.top
        : alignment === 'end'
          ? triggerRect.bottom - renderedHeight
          : triggerRect.top + (triggerRect.height - renderedHeight) / 2
  }

  return {
    x: clamp(
      idealX,
      viewportPadding,
      viewport.width - viewportPadding - renderedWidth,
    ),
    y: clamp(
      idealY,
      viewportPadding,
      viewport.height - viewportPadding - renderedHeight,
    ),
    placement: resolvePlacement(direction, alignment),
    maxHeight,
    maxWidth,
  }
}
