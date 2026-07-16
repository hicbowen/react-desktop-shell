import { useMemo } from 'react'
import type { AppTitleBarProps } from './types'
import { useAppLocale } from './localization/useAppLocale'
import './AppTitleBar.css'

function MinimizeIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="16"
      viewBox="0 0 16 16"
      width="16"
    >
      <path
        d="M3 8h10"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
    </svg>
  )
}

function MaximizeIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="13"
      viewBox="0 0 13 13"
      width="13"
    >
      <rect
        height="8"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.3"
        width="8"
        x="2.5"
        y="2.5"
      />
    </svg>
  )
}

function RestoreIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="13"
      viewBox="0 0 13 13"
      width="13"
    >
      <path
        d="M4.5 3.5v-1h6v6h-1"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.3"
      />
      <rect
        height="6"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.3"
        width="6"
        x="2.5"
        y="4.5"
      />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="18"
      viewBox="0 0 18 18"
      width="18"
    >
      <path
        d="m5 5 8 8M13 5l-8 8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
    </svg>
  )
}

export function AppTitleBar({
  title,
  icon,
  actions,
  onMinimize,
  maximized = false,
  onToggleMaximize,
  onClose,
  showMinimize = true,
  showMaximize = true,
  showClose = true,
  className,
  style,
}: AppTitleBarProps) {
  const { messages } = useAppLocale()
  const rootClassName = useMemo(() => {
    const classes = ['app-title-bar']

    if (className) {
      classes.push(className)
    }

    return classes.join(' ')
  }, [className])

  return (
    <header className={rootClassName} style={style}>
      <div className="app-title-bar__left">
        {icon && <span className="app-title-bar__icon">{icon}</span>}
        {title && <span className="app-title-bar__title">{title}</span>}
      </div>

      <div className="app-title-bar__right">
        {actions && <div className="app-title-bar__actions">{actions}</div>}

        <div className="app-title-bar__controls">
          {showMinimize && (
            <button
              aria-label={messages.window.minimize}
              className="app-title-bar__button"
              onClick={() => onMinimize?.()}
              type="button"
            >
              <MinimizeIcon />
            </button>
          )}
          {showMaximize && (
            <button
              aria-label={
                maximized ? messages.window.restore : messages.window.maximize
              }
              className="app-title-bar__button"
              onClick={() => onToggleMaximize?.()}
              type="button"
            >
              {maximized ? <RestoreIcon /> : <MaximizeIcon />}
            </button>
          )}
          {showClose && (
            <button
              aria-label={messages.window.close}
              className="app-title-bar__button app-title-bar__button--danger"
              onClick={() => onClose?.()}
              type="button"
            >
              <CloseIcon />
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
