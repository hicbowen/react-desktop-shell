import { cloneElement, isValidElement, useMemo } from 'react'
import type { ReactElement, ReactNode } from 'react'
import type { AppRailProps } from '../navigation/types'
import type { PaneController } from './usePaneController'

function MenuIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="18"
      viewBox="0 0 18 18"
      width="18"
    >
      <path
        d="M3 5h12M3 9h12M3 13h12"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
    </svg>
  )
}

export function ShellPaneToggleButton({
  ariaLabel,
  expanded,
  onToggle,
}: {
  ariaLabel: string
  expanded: boolean
  onToggle: () => void
}) {
  return (
    <button
      aria-expanded={expanded}
      aria-label={ariaLabel}
      className="app-shell__pane-toggle"
      onClick={onToggle}
      type="button"
    >
      <MenuIcon />
    </button>
  )
}

export function ShellSidebarHeader({
  appTitle,
  ariaLabel,
  compact,
  icon,
  onToggle,
  showToggle,
}: {
  appTitle?: ReactNode
  ariaLabel: string
  compact: boolean
  icon?: ReactNode
  onToggle: () => void
  showToggle: boolean
}) {
  return (
    <div className="app-shell__sidebar-header">
      {showToggle && (
        <ShellPaneToggleButton
          ariaLabel={ariaLabel}
          expanded={!compact}
          onToggle={onToggle}
        />
      )}
      {!compact && icon && (
        <span className="app-shell__sidebar-icon">{icon}</span>
      )}
      {!compact && appTitle && (
        <span className="app-shell__sidebar-title">{appTitle}</span>
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
  pane,
  rail,
  sidebarHeader,
  title,
  icon,
  ariaLabel,
}: {
  pane: PaneController
  rail: ReactNode
  sidebarHeader: ReactNode
  title: ReactNode
  icon: ReactNode
  ariaLabel: string
}) {
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
    >
      <button
        aria-label="Close navigation"
        className="app-shell__pane-backdrop"
        onClick={pane.close}
        type="button"
      />
      <div
        className="app-shell__pane-overlay"
        onAnimationEnd={(event) => {
          if (pane.isClosing && event.currentTarget === event.target) {
            pane.finishClosing()
          }
        }}
        style={{ width: pane.expandedWidth }}
      >
        {sidebarHeader ?? (
          <ShellSidebarHeader
            appTitle={title}
            ariaLabel={ariaLabel}
            compact={false}
            icon={icon}
            onToggle={pane.toggle}
            showToggle={pane.collapsible}
          />
        )}
        <div className="app-shell__pane-overlay-sidebar">{renderedRail}</div>
      </div>
    </div>
  )
}
