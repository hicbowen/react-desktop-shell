import { Check, X } from 'lucide-react'
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
        <Check aria-hidden="true" size={16} strokeWidth={2.25} />
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
              <X aria-hidden="true" size={16} />
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
