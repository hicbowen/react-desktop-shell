import { cloneElement, isValidElement, useEffect, useMemo, useRef } from 'react'
import type { ReactElement, ReactNode, Ref, RefObject } from 'react'
import { Navigation20Regular } from '@fluentui/react-icons/svg/navigation'
import type { AppRailProps } from '../navigation/types'
import { useAppLocale } from '../localization/useAppLocale'
import type { PaneController } from './usePaneController'

interface PaneInteractionModeRef {
  current: 'keyboard' | 'pointer'
}

export function ShellPaneToggleButton({
  ariaLabel,
  buttonRef,
  expanded,
  interactionModeRef,
  onToggle,
}: {
  ariaLabel: string
  buttonRef?: Ref<HTMLButtonElement>
  expanded: boolean
  interactionModeRef?: PaneInteractionModeRef
  onToggle: () => void
}) {
  return (
    <button
      aria-expanded={expanded}
      aria-label={ariaLabel}
      className="app-shell__pane-toggle"
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          if (interactionModeRef) {
            interactionModeRef.current = 'keyboard'
          }
        }
      }}
      onClick={onToggle}
      onPointerDown={() => {
        if (interactionModeRef) {
          interactionModeRef.current = 'pointer'
        }
      }}
      ref={buttonRef}
      type="button"
    >
      <Navigation20Regular aria-hidden="true" focusable="false" />
    </button>
  )
}

export function ShellTitleBarApp({
  appTitle,
  ariaLabel,
  expanded,
  icon,
  interactionModeRef,
  onToggle,
  showToggle,
  toggleButtonRef,
}: {
  appTitle?: ReactNode
  ariaLabel: string
  expanded: boolean
  icon?: ReactNode
  interactionModeRef?: PaneInteractionModeRef
  onToggle: () => void
  showToggle: boolean
  toggleButtonRef?: Ref<HTMLButtonElement>
}) {
  return (
    <div className="app-shell__titlebar-app">
      {showToggle && (
        <ShellPaneToggleButton
          ariaLabel={ariaLabel}
          buttonRef={toggleButtonRef}
          expanded={expanded}
          interactionModeRef={interactionModeRef}
          onToggle={onToggle}
        />
      )}
      {icon && (
        <span className="app-shell__titlebar-icon">{icon}</span>
      )}
      {appTitle && (
        <span className="app-shell__titlebar-title">{appTitle}</span>
      )}
    </div>
  )
}

function cloneRail(
  rail: ReactNode,
  props: Partial<AppRailProps>,
) {
  if (!isValidElement(rail)) {
    return rail
  }

  return cloneElement(
    rail as ReactElement<Partial<AppRailProps>>,
    props,
  )
}

export function ShellInlinePane({
  pane,
  rail,
  onCollapsedChange,
}: {
  pane: PaneController
  rail: ReactNode
  onCollapsedChange?: (collapsed: boolean) => void
}) {
  const renderedRail = useMemo(() => {
    if (!rail || !pane.collapsible) {
      return rail
    }

    return cloneRail(rail, {
      collapsed: pane.collapsed,
      onCollapsedChange,
    })
  }, [onCollapsedChange, pane.collapsed, pane.collapsible, rail])

  return <div className="app-shell__sidebar">{renderedRail}</div>
}

export function ShellPaneLayer({
  interactionModeRef,
  pane,
  rail,
  toggleButtonRef,
}: {
  interactionModeRef: PaneInteractionModeRef
  pane: PaneController
  rail: ReactNode
  toggleButtonRef: RefObject<HTMLButtonElement | null>
}) {
  const { messages } = useAppLocale()
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const restoreFocus = useRef(false)
  const renderedRail = useMemo(() => {
    if (!rail) {
      return null
    }

    if (!isValidElement(rail)) {
      return rail
    }

    const railElement = rail as ReactElement<Partial<AppRailProps>>
    const originalOnChange = railElement.props.onChange

    return cloneElement(railElement, {
      collapsed: false,
      onChange: (key: string) => {
        originalOnChange?.(key)
        pane.close()
      },
      onCollapsedChange: undefined,
    })
  }, [pane, rail])

  useEffect(() => {
    if (pane.isMinimal && pane.isOpen) {
      restoreFocus.current = true
      const overlay = overlayRef.current
      const focusTarget = overlay?.querySelector<HTMLElement>(
        '[aria-current="page"]:not(:disabled), button:not(:disabled), [href]',
      )

      if (interactionModeRef.current === 'keyboard') {
        ;(focusTarget ?? overlay)?.focus({ preventScroll: true })
      }
      return
    }

    if (restoreFocus.current && !pane.isOpen && !pane.isClosing) {
      restoreFocus.current = false
      if (interactionModeRef.current === 'keyboard') {
        toggleButtonRef.current?.focus({ preventScroll: true })
      }
    }
  }, [interactionModeRef, pane.isClosing, pane.isMinimal, pane.isOpen, toggleButtonRef])

  if (!pane.isMinimal || (!pane.isOpen && !pane.isClosing)) {
    return null
  }

  return (
    <div
      className={[
        'app-shell__pane-layer',
        pane.isClosing ? 'app-shell__pane-layer--closing' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onKeyDownCapture={() => {
        interactionModeRef.current = 'keyboard'
      }}
      onPointerDownCapture={() => {
        interactionModeRef.current = 'pointer'
      }}
    >
      <button
        aria-label={messages.shell.closeNavigation}
        className="app-shell__pane-backdrop"
        onClick={pane.close}
        tabIndex={-1}
        type="button"
      />
      <div
        className="app-shell__pane-overlay"
        onAnimationEnd={(event) => {
          if (pane.isClosing && event.currentTarget === event.target) {
            pane.finishClosing()
          }
        }}
        ref={overlayRef}
        style={{ width: pane.expandedWidth }}
        tabIndex={-1}
      >
        <div className="app-shell__pane-overlay-sidebar">{renderedRail}</div>
      </div>
    </div>
  )
}
