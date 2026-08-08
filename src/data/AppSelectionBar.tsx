import { Checkmark16Regular } from '@fluentui/react-icons/svg/checkmark'
import { Dismiss16Regular } from '@fluentui/react-icons/svg/dismiss'
import { useAppLocale } from '../localization/useAppLocale'
import type { AppSelectionBarProps } from './types'
import './AppDataView.css'

export function AppSelectionBar({
  count,
  label,
  actions,
  onClear,
  className,
  style,
}: AppSelectionBarProps) {
  const { messages } = useAppLocale()
  return (
    <div
      className={`app-selection-bar ${className ?? ''}`.trim()}
      style={style}
    >
      <div className="app-selection-bar__label">
        <Checkmark16Regular aria-hidden="true" focusable="false" />
        <span>{label ?? messages.dataTable.selectedCount(count)}</span>
      </div>
      {actions != null || onClear ? (
        <div className="app-selection-bar__actions">
          {actions}
          {onClear ? (
            <button
              aria-label={messages.dataTable.clearSelection}
              className="app-selection-bar__clear"
              type="button"
              onClick={onClear}
            >
              <Dismiss16Regular aria-hidden="true" focusable="false" />
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
