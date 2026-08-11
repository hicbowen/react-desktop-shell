import { ChevronDown16Regular } from '@fluentui/react-icons/svg/chevron-down'
import { AppMenuFlyout } from '../menu-flyout'
import { useAppLocale } from '../localization/useAppLocale'
import type { AppSplitButtonProps } from './types'
import './AppSplitButton.css'

export function AppSplitButton({
  ariaLabel,
  className,
  disabled = false,
  icon,
  items,
  label,
  menuDisabled = false,
  onClick,
  onSelect,
  placement = 'bottom-end',
  size = 'standard',
}: AppSplitButtonProps) {
  const { messages } = useAppLocale()
  const menuAriaLabel = messages.splitButton.openMore
  const rootClassName = [
    'app-split-button',
    `app-split-button--${size}`,
    disabled ? 'app-split-button--disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')
  const resolvedMenuDisabled = disabled || menuDisabled || items.length === 0

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
          <ChevronDown16Regular aria-hidden="true" focusable="false" />
        </button>
      </AppMenuFlyout>
    </div>
  )
}
