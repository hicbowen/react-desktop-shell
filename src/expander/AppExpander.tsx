import { useEffect, useId, useRef, useState } from 'react'
import type { TransitionEvent } from 'react'
import type { AppExpanderProps } from './types'
import './AppExpander.css'

function useReducedMotion() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(media.matches)
    update()
    media.addEventListener?.('change', update)
    return () => media.removeEventListener?.('change', update)
  }, [])

  return reduced
}

export function AppExpander({
  actions,
  appearance = 'default',
  children,
  className,
  defaultExpanded = false,
  description,
  disabled = false,
  expanded,
  icon,
  onExpandedChange,
  style,
  title,
}: AppExpanderProps) {
  const generatedId = useId()
  const triggerId = `${generatedId}-trigger`
  const regionId = `${generatedId}-panel`
  const controlled = expanded !== undefined
  const [internal, setInternal] = useState(defaultExpanded)
  const open = controlled ? expanded : internal
  const reducedMotion = useReducedMotion()
  const [retainedContent, setRetainedContent] = useState(open)
  const [animatedExpanded, setAnimatedExpanded] = useState(open)
  const animatedExpandedRef = useRef(open)
  const animationFrameRef = useRef<number | null>(null)
  const transitionGenerationRef = useRef(0)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const regionRef = useRef<HTMLDivElement>(null)
  const contentVisible = open || (!reducedMotion && retainedContent)
  const visiblyExpanded = open && (reducedMotion || animatedExpanded)

  const restoreFocusIfNeeded = () => {
    if (regionRef.current?.contains(document.activeElement)) {
      triggerRef.current?.focus({ preventScroll: true })
    }
  }

  /* eslint-disable react-hooks/set-state-in-effect -- the first committed
   * expansion state must expose content before the next-frame class change. */
  useEffect(() => {
    const generation = ++transitionGenerationRef.current
    if (animationFrameRef.current != null) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    if (open) {
      setRetainedContent(true)
      if (reducedMotion) {
        animatedExpandedRef.current = true
        setAnimatedExpanded(true)
      } else if (!animatedExpandedRef.current) {
        setAnimatedExpanded(false)
        animationFrameRef.current = requestAnimationFrame(() => {
          if (transitionGenerationRef.current !== generation) return
          animationFrameRef.current = null
          animatedExpandedRef.current = true
          setAnimatedExpanded(true)
        })
      }
    } else {
      const expansionStarted = animatedExpandedRef.current
      animatedExpandedRef.current = false
      setAnimatedExpanded(false)
      if (reducedMotion || !expansionStarted) {
        restoreFocusIfNeeded()
        setRetainedContent(false)
      }
    }

    return () => {
      if (animationFrameRef.current != null) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }, [open, reducedMotion])
  /* eslint-enable react-hooks/set-state-in-effect */

  const toggle = () => {
    if (disabled) return
    const next = !open
    if (!controlled) setInternal(next)
    onExpandedChange?.(next)
  }

  const finishTransition = (event: TransitionEvent<HTMLDivElement>) => {
    if (
      event.target !== event.currentTarget ||
      open ||
      animatedExpandedRef.current
    ) {
      return
    }
    restoreFocusIfNeeded()
    setRetainedContent(false)
  }

  return <section
    className={[
      'app-expander',
      `app-expander--${appearance}`,
      visiblyExpanded ? 'app-expander--expanded' : '',
      disabled ? 'app-expander--disabled' : '',
      className,
    ].filter(Boolean).join(' ')}
    style={style}
  >
    <header className="app-expander__header">
      <button
        aria-controls={regionId}
        aria-expanded={open}
        className="app-expander__trigger"
        disabled={disabled}
        id={triggerId}
        onClick={toggle}
        ref={triggerRef}
        type="button"
      >
        {icon ? <span aria-hidden="true" className="app-expander__icon">{icon}</span> : null}
        <span className="app-expander__heading">
          <span className="app-expander__title">{title}</span>
          {description
            ? <span className="app-expander__description">{description}</span>
            : null}
        </span>
        <span aria-hidden="true" className="app-expander__chevron">⌄</span>
      </button>
      {actions ? <div className="app-expander__actions">{actions}</div> : null}
    </header>
    <div
      aria-labelledby={triggerId}
      className="app-expander__region"
      hidden={!contentVisible}
      id={regionId}
      inert={!open ? true : undefined}
      onTransitionEnd={finishTransition}
      ref={regionRef}
      role="region"
    >
      <div className="app-expander__region-inner">
        <div className="app-expander__content">{children}</div>
      </div>
    </div>
  </section>
}
