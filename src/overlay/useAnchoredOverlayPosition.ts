import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from 'react'
import {
  placeAnchoredOverlay,
  type AnchoredOverlayPlacement,
  type AnchoredOverlayPosition,
} from './placement'

export interface UseAnchoredOverlayPositionOptions {
  open: boolean
  triggerRef?: RefObject<HTMLElement | null>
  triggerRect?: DOMRect | null
  overlayRef: RefObject<HTMLElement | null>
  preferredPlacement?: AnchoredOverlayPlacement
  gap?: number
  viewportPadding?: number
  maxHeight?: number
  maxWidth?: number
  dependencies?: readonly unknown[]
}

export interface AnchoredOverlayPositionState
  extends AnchoredOverlayPosition {
  measured: boolean
}

const useBrowserLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect

function initialPosition(
  placement: AnchoredOverlayPlacement,
): AnchoredOverlayPositionState {
  return {
    x: 0,
    y: 0,
    placement,
    maxHeight: 0,
    maxWidth: 0,
    measured: false,
  }
}

function sameDependencies(
  previous: readonly unknown[],
  next: readonly unknown[],
) {
  return (
    previous.length === next.length &&
    previous.every((value, index) => Object.is(value, next[index]))
  )
}

function useDependencyVersion(dependencies: readonly unknown[]) {
  const dependenciesRef = useRef(dependencies)
  const [version, setVersion] = useState(0)

  useBrowserLayoutEffect(() => {
    if (!sameDependencies(dependenciesRef.current, dependencies)) {
      dependenciesRef.current = dependencies
      setVersion((current) => current + 1)
    }
  })

  return version
}

export function useAnchoredOverlayPosition({
  open,
  triggerRef,
  triggerRect,
  overlayRef,
  preferredPlacement = 'bottom-start',
  gap,
  viewportPadding,
  maxHeight,
  maxWidth,
  dependencies = [],
}: UseAnchoredOverlayPositionOptions): AnchoredOverlayPositionState {
  const [position, setPosition] = useState(() =>
    initialPosition(preferredPlacement),
  )
  const dependencyVersion = useDependencyVersion(dependencies)

  useBrowserLayoutEffect(() => {
    if (!open || typeof window === 'undefined') {
      setPosition((current) =>
        !current.measured && current.placement === preferredPlacement
          ? current
          : initialPosition(preferredPlacement),
      )
      return
    }

    setPosition(initialPosition(preferredPlacement))

    const measure = () => {
      const resolvedTriggerRect =
        triggerRect ?? triggerRef?.current?.getBoundingClientRect()
      const overlay = overlayRef.current

      if (!resolvedTriggerRect || !overlay) {
        return
      }

      setPosition({
        ...placeAnchoredOverlay(
          resolvedTriggerRect,
          overlay.getBoundingClientRect(),
          { width: window.innerWidth, height: window.innerHeight },
          {
            gap,
            maxHeight,
            maxWidth,
            preferredPlacement,
            viewportPadding,
          },
        ),
        measured: true,
      })
    }
    const frame = window.requestAnimationFrame?.(measure)

    if (frame === undefined) {
      measure()
      return
    }

    return () => window.cancelAnimationFrame(frame)
  }, [
    dependencyVersion,
    gap,
    maxHeight,
    maxWidth,
    open,
    overlayRef,
    preferredPlacement,
    triggerRect?.bottom,
    triggerRect?.height,
    triggerRect?.left,
    triggerRect?.right,
    triggerRect?.top,
    triggerRect?.width,
    triggerRef,
    viewportPadding,
  ])

  return position
}
