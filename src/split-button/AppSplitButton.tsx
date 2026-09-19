import { ChevronDown16Regular } from '@fluentui/react-icons/svg/chevron-down'
import { AppMenuFlyout } from '../menu-flyout'
import {
  executeAppCommandReference,
  resolveAppCommand,
  useOptionalAppCommands,
} from '../command'
import { useAppLocale } from '../localization/useAppLocale'
import type { AppSplitButtonProps } from './types'
import './AppSplitButton.css'

export function AppSplitButton({
  ariaLabel,
  className,
  command,
  commandId,
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
  const commandApi = useOptionalAppCommands()
  const resolvedCommand = resolveAppCommand({ command, commandId }, commandApi)
  const resolvedDisabled =
    disabled ||
    Boolean(resolvedCommand?.disabled) ||
    Boolean(commandId && commandApi?.isPending(commandId))
  const resolvedIcon = icon ?? resolvedCommand?.icon
  const resolvedLabel = label ?? resolvedCommand?.label ?? commandId
  const menuAriaLabel = messages.splitButton.openMore
  const rootClassName = [
    'app-split-button',
    `app-split-button--${size}`,
    resolvedDisabled ? 'app-split-button--disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')
  const resolvedMenuDisabled = resolvedDisabled || menuDisabled || items.length === 0

  return (
    <div className={rootClassName}>
      <button
        aria-label={ariaLabel}
        className="app-split-button__primary"
        disabled={resolvedDisabled}
        onClick={(event) => {
          executeAppCommandReference({ command, commandId }, commandApi, 'toolbar')
          onClick?.(event)
        }}
        type="button"
      >
        {resolvedIcon ? <span className="app-split-button__icon">{resolvedIcon}</span> : null}
        <span className="app-split-button__label">{resolvedLabel}</span>
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
