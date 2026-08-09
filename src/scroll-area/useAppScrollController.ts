import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react'
import type { AppScrollAreaOrientation } from './types'

export type AppScrollAxis = 'horizontal' | 'vertical'

interface OverflowState {
  horizontal: boolean
  vertical: boolean
}

interface DragState {
  axis: AppScrollAxis
  pointerId: number
  pointerStart: number
  scrollStart: number
  scrollRange: number
  thumbRange: number
}

interface ControllerOptions {
  horizontalThumbRef: RefObject<HTMLDivElement | null>
  horizontalTrackRef: RefObject<HTMLDivElement | null>
  orientation: AppScrollAreaOrientation
  verticalThumbRef: RefObject<HTMLDivElement | null>
  verticalTrackRef: RefObject<HTMLDivElement | null>
  viewportRef: RefObject<HTMLDivElement | null>
}

const minimumThumbLength = 30
const lineScrollAmount = 16

function axisLength(element: HTMLElement, axis: AppScrollAxis) {
  return axis === 'vertical' ? element.clientHeight : element.clientWidth
}

function pointerPosition(
  event: Pick<ReactPointerEvent<HTMLElement>, 'clientX' | 'clientY'>,
  axis: AppScrollAxis,
) {
  return axis === 'vertical' ? event.clientY : event.clientX
}

function getScrollRange(viewport: HTMLDivElement, axis: AppScrollAxis) {
  return axis === 'vertical'
    ? Math.max(0, viewport.scrollHeight - viewport.clientHeight)
    : Math.max(0, viewport.scrollWidth - viewport.clientWidth)
}

function isRtl(viewport: HTMLDivElement) {
  return getComputedStyle(viewport).direction === 'rtl'
}

function getScrollOffset(viewport: HTMLDivElement, axis: AppScrollAxis) {
  if (axis === 'vertical') {
    return viewport.scrollTop
  }

  if (!isRtl(viewport)) {
    return viewport.scrollLeft
  }

  return getScrollRange(viewport, axis) + viewport.scrollLeft
}

function setScrollOffset(
  viewport: HTMLDivElement,
  axis: AppScrollAxis,
  offset: number,
) {
  const scrollRange = getScrollRange(viewport, axis)
  const nextOffset = Math.min(scrollRange, Math.max(0, offset))

  if (axis === 'vertical') {
    viewport.scrollTop = nextOffset
    return
  }

  viewport.scrollLeft = isRtl(viewport)
    ? nextOffset - scrollRange
    : nextOffset
}

function setPointerCapture(element: HTMLElement, pointerId: number) {
  try {
    element.setPointerCapture(pointerId)
  } catch {
    // Synthetic test events and older embedded webviews may not expose capture.
  }
}

function releasePointerCapture(element: HTMLElement, pointerId: number) {
  try {
    if (element.hasPointerCapture(pointerId)) {
      element.releasePointerCapture(pointerId)
    }
  } catch {
    // Losing capture already ends the interaction, so no fallback is required.
  }
}

export function useAppScrollController({
  horizontalThumbRef,
  horizontalTrackRef,
  orientation,
  verticalThumbRef,
  verticalTrackRef,
  viewportRef,
}: ControllerOptions) {
  const [overflow, setOverflow] = useState<OverflowState>({
    horizontal: false,
    vertical: false,
  })
  const overflowRef = useRef(overflow)
  const [draggingAxis, setDraggingAxis] = useState<AppScrollAxis | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const dragRef = useRef<DragState | null>(null)
  const repeatDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const repeatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const axisRefs = useCallback(
    (axis: AppScrollAxis) =>
      axis === 'vertical'
        ? { thumbRef: verticalThumbRef, trackRef: verticalTrackRef }
        : { thumbRef: horizontalThumbRef, trackRef: horizontalTrackRef },
    [
      horizontalThumbRef,
      horizontalTrackRef,
      verticalThumbRef,
      verticalTrackRef,
    ],
  )

  const updateThumb = useCallback(
    (axis: AppScrollAxis) => {
      const viewport = viewportRef.current
      const { thumbRef, trackRef } = axisRefs(axis)
      const track = trackRef.current
      const thumb = thumbRef.current

      if (!viewport || !track || !thumb) {
        return
      }

      const trackLength = axisLength(track, axis)
      const viewportLength = axisLength(viewport, axis)
      const contentLength =
        axis === 'vertical' ? viewport.scrollHeight : viewport.scrollWidth
      const scrollRange = Math.max(0, contentLength - viewportLength)

      if (trackLength <= 0 || viewportLength <= 0 || contentLength <= 0) {
        thumb.style.setProperty('--app-scrollbar-thumb-length', '0px')
        thumb.style.setProperty('--app-scrollbar-thumb-offset', '0px')
        return
      }

      const configuredMinimum = Number.parseFloat(
        getComputedStyle(track).getPropertyValue(
          '--app-scrollbar-min-thumb-size',
        ),
      )
      const minimumLength = Number.isFinite(configuredMinimum)
        ? configuredMinimum
        : minimumThumbLength
      const thumbLength =
        scrollRange === 0
          ? trackLength
          : Math.min(
              trackLength,
              Math.max(
                minimumLength,
                (viewportLength / contentLength) * trackLength,
              ),
            )
      const thumbRange = Math.max(0, trackLength - thumbLength)
      const scrollOffset = getScrollOffset(viewport, axis)
      const thumbOffset =
        scrollRange === 0
          ? 0
          : (Math.min(scrollRange, Math.max(0, scrollOffset)) / scrollRange) *
            thumbRange

      thumb.style.setProperty(
        '--app-scrollbar-thumb-length',
        `${thumbLength}px`,
      )
      thumb.style.setProperty(
        '--app-scrollbar-thumb-offset',
        `${thumbOffset}px`,
      )
    },
    [axisRefs, viewportRef],
  )

  const measure = useCallback(() => {
    const viewport = viewportRef.current
    if (!viewport) {
      return
    }

    const allowsHorizontal = orientation !== 'vertical'
    const allowsVertical = orientation !== 'horizontal'
    const nextOverflow = {
      horizontal:
        allowsHorizontal && viewport.scrollWidth - viewport.clientWidth > 1,
      vertical:
        allowsVertical && viewport.scrollHeight - viewport.clientHeight > 1,
    }

    if (
      overflowRef.current.horizontal !== nextOverflow.horizontal ||
      overflowRef.current.vertical !== nextOverflow.vertical
    ) {
      overflowRef.current = nextOverflow
      setOverflow(nextOverflow)
    }

    if (allowsHorizontal) {
      updateThumb('horizontal')
    }
    if (allowsVertical) {
      updateThumb('vertical')
    }
  }, [orientation, updateThumb, viewportRef])

  const scheduleMeasure = useCallback(() => {
    if (animationFrameRef.current !== null) {
      return
    }

    if (typeof requestAnimationFrame !== 'function') {
      measure()
      return
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      animationFrameRef.current = null
      measure()
    })
  }, [measure])

  useLayoutEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) {
      return
    }

    measure()
    viewport.addEventListener('scroll', scheduleMeasure, { passive: true })
    window.addEventListener('resize', scheduleMeasure)

    const resizeObserver =
      typeof ResizeObserver === 'function'
        ? new ResizeObserver(scheduleMeasure)
        : null
    const observeElements = () => {
      resizeObserver?.observe(viewport)
      if (verticalTrackRef.current) {
        resizeObserver?.observe(verticalTrackRef.current)
      }
      if (horizontalTrackRef.current) {
        resizeObserver?.observe(horizontalTrackRef.current)
      }
      for (const child of viewport.children) {
        resizeObserver?.observe(child)
      }
    }

    observeElements()
    const mutationObserver =
      typeof MutationObserver === 'function'
        ? new MutationObserver(() => {
            observeElements()
            scheduleMeasure()
          })
        : null
    mutationObserver?.observe(viewport, {
      characterData: true,
      childList: true,
      subtree: true,
    })

    return () => {
      viewport.removeEventListener('scroll', scheduleMeasure)
      window.removeEventListener('resize', scheduleMeasure)
      resizeObserver?.disconnect()
      mutationObserver?.disconnect()
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }, [
    horizontalTrackRef,
    measure,
    scheduleMeasure,
    verticalTrackRef,
    viewportRef,
  ])

  useLayoutEffect(() => {
    scheduleMeasure()
  }, [overflow.horizontal, overflow.vertical, scheduleMeasure])

  const stopRepeating = useCallback(() => {
    if (repeatDelayRef.current !== null) {
      clearTimeout(repeatDelayRef.current)
      repeatDelayRef.current = null
    }
    if (repeatIntervalRef.current !== null) {
      clearInterval(repeatIntervalRef.current)
      repeatIntervalRef.current = null
    }
  }, [])

  useLayoutEffect(() => stopRepeating, [stopRepeating])

  const scrollBy = useCallback(
    (axis: AppScrollAxis, amount: number) => {
      const viewport = viewportRef.current
      if (!viewport) {
        return
      }
      setScrollOffset(
        viewport,
        axis,
        getScrollOffset(viewport, axis) + amount,
      )
      scheduleMeasure()
    },
    [scheduleMeasure, viewportRef],
  )

  const onThumbPointerDown = useCallback(
    (axis: AppScrollAxis, event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) {
        return
      }

      const viewport = viewportRef.current
      const { thumbRef, trackRef } = axisRefs(axis)
      const track = trackRef.current
      const thumb = thumbRef.current
      if (!viewport || !track || !thumb) {
        return
      }

      event.preventDefault()
      event.stopPropagation()
      const trackLength = axisLength(track, axis)
      const thumbLength = axisLength(thumb, axis)
      const scrollRange = getScrollRange(viewport, axis)
      const thumbRange = Math.max(0, trackLength - thumbLength)

      dragRef.current = {
        axis,
        pointerId: event.pointerId,
        pointerStart: pointerPosition(event, axis),
        scrollStart: getScrollOffset(viewport, axis),
        scrollRange,
        thumbRange,
      }
      setDraggingAxis(axis)
      setPointerCapture(event.currentTarget, event.pointerId)
    },
    [axisRefs, viewportRef],
  )

  const onThumbPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current
      const viewport = viewportRef.current
      if (!drag || !viewport || drag.pointerId !== event.pointerId) {
        return
      }

      event.preventDefault()
      const pointerDelta = pointerPosition(event, drag.axis) - drag.pointerStart
      const scrollDelta =
        drag.thumbRange === 0
          ? 0
          : (pointerDelta / drag.thumbRange) * drag.scrollRange
      setScrollOffset(viewport, drag.axis, drag.scrollStart + scrollDelta)
      scheduleMeasure()
    },
    [scheduleMeasure, viewportRef],
  )

  const endThumbDrag = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current
      if (!drag || drag.pointerId !== event.pointerId) {
        return
      }

      dragRef.current = null
      setDraggingAxis(null)
      releasePointerCapture(event.currentTarget, event.pointerId)
    },
    [],
  )

  const onTrackPointerDown = useCallback(
    (axis: AppScrollAxis, event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.button !== 0 || event.target !== event.currentTarget) {
        return
      }

      const viewport = viewportRef.current
      const { thumbRef } = axisRefs(axis)
      const thumb = thumbRef.current
      if (!viewport || !thumb) {
        return
      }

      event.preventDefault()
      const thumbRect = thumb.getBoundingClientRect()
      const pointer = pointerPosition(event, axis)
      const thumbStart =
        axis === 'vertical' ? thumbRect.top : thumbRect.left
      const direction = pointer < thumbStart ? -1 : 1
      const viewportLength = axisLength(viewport, axis)
      scrollBy(axis, direction * viewportLength * 0.85)
    },
    [axisRefs, scrollBy, viewportRef],
  )

  const onArrowPointerDown = useCallback(
    (
      axis: AppScrollAxis,
      direction: -1 | 1,
      event: ReactPointerEvent<HTMLDivElement>,
    ) => {
      if (event.button !== 0) {
        return
      }

      event.preventDefault()
      stopRepeating()
      setPointerCapture(event.currentTarget, event.pointerId)
      const step = () => scrollBy(axis, direction * lineScrollAmount)
      step()
      repeatDelayRef.current = setTimeout(() => {
        repeatIntervalRef.current = setInterval(step, 50)
      }, 400)
    },
    [scrollBy, stopRepeating],
  )

  const onArrowPointerEnd = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      stopRepeating()
      releasePointerCapture(event.currentTarget, event.pointerId)
    },
    [stopRepeating],
  )

  return {
    draggingAxis,
    endThumbDrag,
    onArrowPointerDown,
    onArrowPointerEnd,
    onThumbPointerDown,
    onThumbPointerMove,
    onTrackPointerDown,
    overflow,
  }
}
