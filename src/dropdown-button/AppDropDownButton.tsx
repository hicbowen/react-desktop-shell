import { forwardRef, type Ref } from 'react'
import { AppButton } from '../button'
import { AppMenuFlyout } from '../menu-flyout'
import type { AppDropDownButtonProps } from './types'
import './AppDropDownButton.css'

function ChevronDown() {
  return <svg aria-hidden="true" className="app-dropdown-button__chevron" viewBox="0 0 16 16"><path d="m4 6 4 4 4-4" /></svg>
}

export const AppDropDownButton = forwardRef<HTMLButtonElement, AppDropDownButtonProps>(function AppDropDownButton({
  children,
  disabled = false,
  icon,
  items,
  menuAriaLabel,
  onSelect,
  placement,
  ...buttonProps
}, ref) {
  return (
    <AppMenuFlyout
      ariaLabel={menuAriaLabel}
      disabled={disabled}
      items={items}
      onSelect={onSelect}
      placement={placement}
      ref={ref as Ref<HTMLElement>}
    >
      <AppButton {...buttonProps} disabled={disabled}>
        {icon ? <span className="app-dropdown-button__leading-icon">{icon}</span> : null}
        <span className="app-dropdown-button__label">{children}</span>
        <ChevronDown />
      </AppButton>
    </AppMenuFlyout>
  )
})
