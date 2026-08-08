import { forwardRef, type Ref } from 'react'
import { ChevronDown16Regular } from '@fluentui/react-icons/svg/chevron-down'
import { AppButton } from '../button'
import { AppMenuFlyout } from '../menu-flyout'
import type { AppDropDownButtonProps } from './types'
import './AppDropDownButton.css'

export const AppDropDownButton = forwardRef<HTMLButtonElement, AppDropDownButtonProps>(function AppDropDownButton({
  children,
  className,
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
      <AppButton {...buttonProps} className={['app-dropdown-button', className].filter(Boolean).join(' ')} disabled={disabled}>
        {icon ? <span className="app-dropdown-button__leading-icon">{icon}</span> : null}
        <span className="app-dropdown-button__label">{children}</span>
        <ChevronDown16Regular aria-hidden="true" className="app-dropdown-button__chevron" focusable="false" />
      </AppButton>
    </AppMenuFlyout>
  )
})
