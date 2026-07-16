import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { CSSProperties } from 'react'
import type { AppSidePaneProps } from './types'
import { useAppLocale } from './localization/useAppLocale'
import './AppSidePane.css'
import './scroll-area/AppScrollArea.css'

const DEFAULT_WIDTH = 380
const DEFAULT_MIN_WIDTH = 320
const DEFAULT_MAX_WIDTH = 560
const MAX_WIDTH_RATIO = 0.55
const EXIT_DURATION = 180

export function AppSidePane({
  open,
  title,
  children,
  width,
  defaultWidth = DEFAULT_WIDTH,
  minWidth = DEFAULT_MIN_WIDTH,
  maxWidth = DEFAULT_MAX_WIDTH,
  resizable = false,
  onWidthChange,
  onClose,
  footer,
  className,
  style,
}: AppSidePaneProps) {
  const { messages } = useAppLocale()
  const rootRef = useRef<HTMLElement | null>(null)
  const dragRef = useRef<{
    pointerId: number
    startX: number
    startWidth: number
  } | null>(null)
  const [rendered, setRendered] = useState(open)
  const [exiting, setExiting] = useState(false)
  const [layoutWidth, setLayoutWidth] = useState(0)
  const [internalWidth, setInternalWidth] = useState(defaultWidth)
  const controlled = width !== undefined
  const effectiveMaxWidth = Math.max(
    minWidth,
    Math.min(maxWidth, layoutWidth > 0 ? layoutWidth * MAX_WIDTH_RATIO : maxWidth),
  )
  const currentWidth = clamp(
    controlled ? width : internalWidth,
    minWidth,
    effectiveMaxWidth,
  )

  useEffect(() => {
    if (open) {
      // Presence state keeps the pane mounted long enough to play exit motion.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRendered(true)
      setExiting(false)
      return
    }

    if (!rendered) {
      return
    }

    setExiting(true)
    const timeout = window.setTimeout(() => {
      setRendered(false)
      setExiting(false)
    }, EXIT_DURATION)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [open, rendered])

  useLayoutEffect(() => {
    const layout = rootRef.current?.closest<HTMLElement>('.app-page__layout')

    if (!layout) {
      return
    }

    const updateLayoutWidth = () => {
      setLayoutWidth(layout.getBoundingClientRect().width)
    }

    updateLayoutWidth()

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateLayoutWidth)

      return () => {
        window.removeEventListener('resize', updateLayoutWidth)
      }
    }

    const observer = new ResizeObserver(updateLayoutWidth)
    observer.observe(layout)

    return () => {
      observer.disconnect()
    }
  }, [rendered])

  const setPaneWidth = useCallback(
    (nextWidth: number) => {
      const clamped = clamp(nextWidth, minWidth, effectiveMaxWidth)

      if (!controlled) {
        setInternalWidth(clamped)
      }

      onWidthChange?.(clamped)
    },
    [controlled, effectiveMaxWidth, minWidth, onWidthChange],
  )

  const stopDragging = useCallback(() => {
    const drag = dragRef.current

    if (!drag) {
      return
    }

    dragRef.current = null
    document.body.style.cursor = ''
    document.body.style.userSelect = ''

    try {
      rootRef.current?.releasePointerCapture(drag.pointerId)
    } catch {
      // Pointer capture may already be released by the browser.
    }
  }, [])

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!resizable || event.button !== 0) {
        return
      }

      event.preventDefault()
      dragRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startWidth: currentWidth,
      }
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
      rootRef.current?.setPointerCapture(event.pointerId)
    },
    [currentWidth, resizable],
  )

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      const drag = dragRef.current

      if (!drag || event.pointerId !== drag.pointerId) {
        return
      }

      setPaneWidth(drag.startWidth - (event.clientX - drag.startX))
    },
    [setPaneWidth],
  )

  useEffect(() => stopDragging, [stopDragging])

  const paneClassName = useMemo(() => {
    const classes = [
      'app-side-pane',
      exiting ? 'app-side-pane--exit' : '',
      resizable ? 'app-side-pane--resizable' : '',
    ]

    if (className) {
      classes.push(className)
    }

    return classes.filter(Boolean).join(' ')
  }, [className, exiting, resizable])

  const paneStyle = useMemo(
    () =>
      ({
        ...style,
        '--app-side-pane-width': `${currentWidth}px`,
      }) as CSSProperties,
    [currentWidth, style],
  )

  if (!rendered) {
    return null
  }

  return (
    <aside
      ref={rootRef}
      className={paneClassName}
      style={paneStyle}
      aria-label={typeof title === 'string' ? title : undefined}
      onPointerMove={handlePointerMove}
      onPointerUp={stopDragging}
      onPointerCancel={stopDragging}
    >
      {resizable ? (
        <div
          className="app-side-pane__resize-handle"
          role="separator"
          aria-orientation="vertical"
          aria-label={messages.sidePane.resize}
          onPointerDown={handlePointerDown}
        />
      ) : null}
      {(title || onClose) && (
        <header className="app-side-pane__header">
          {title ? <div className="app-side-pane__title">{title}</div> : null}
          {onClose ? (
            <button
              className="app-side-pane__close"
              type="button"
              aria-label={messages.sidePane.close}
              onClick={onClose}
            >
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path
                  d="M4.22 4.22a.75.75 0 0 1 1.06 0L8 6.94l2.72-2.72a.75.75 0 1 1 1.06 1.06L9.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L8 9.06l-2.72 2.72a.75.75 0 0 1-1.06-1.06L6.94 8 4.22 5.28a.75.75 0 0 1 0-1.06Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          ) : null}
        </header>
      )}
      <div className="app-side-pane__body app-scrollbar">{children}</div>
      {footer ? <footer className="app-side-pane__footer">{footer}</footer> : null}
    </aside>
  )
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}
