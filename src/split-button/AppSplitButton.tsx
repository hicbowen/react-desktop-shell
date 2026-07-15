import { AppMenuFlyout } from '../menu-flyout'
import type { AppSplitButtonProps } from './types'
import './AppSplitButton.css'

function ChevronDownIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16">
      <path d="M4.15 6.15a.5.5 0 0 1 .7 0L8 9.29l3.15-3.14a.5.5 0 1 1 .7.7l-3.5 3.5a.5.5 0 0 1-.7 0l-3.5-3.5a.5.5 0 0 1 0-.7Z" />
    </svg>
  )
}

export function AppSplitButton({
  ariaLabel,
  className,
  disabled = false,
  icon,
  items,
  label,
  menuAriaLabel = 'Open more options',
  menuDisabled = false,
  onClick,
  onSelect,
  placement = 'bottom-end',
}: AppSplitButtonProps) {
  const rootClassName = [
    'app-split-button',
    disabled ? 'app-split-button--disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')
  const resolvedMenuDisabled = disabled || menuDisabled

  return (
    <div className={rootClassName}>
      <button
        aria-label={ariaLabel}
        className="app-split-button__primary"
        disabled={disabled}
        onClick={onClick}
        type="button"
      >
        {icon ? <span className="app-split-button__icon">{icon}</span> : null}
        <span className="app-split-button__label">{label}</span>
      </button>
      <AppMenuFlyout
        ariaLabel={menuAriaLabel}
        disabled={resolvedMenuDisabled}
        items={items}
        onSelect={onSelect}
        placement={placement}
      >
        <button
          aria-label={menuAriaLabel}
          className="app-split-button__menu"
          disabled={resolvedMenuDisabled}
          type="button"
        >
          <ChevronDownIcon />
        </button>
      </AppMenuFlyout>
    </div>
  )
}
