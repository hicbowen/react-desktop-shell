import { Check, X } from 'lucide-react'
import type { AppSelectionBarProps } from './types'

export function AppSelectionBar({
  count,
  label,
  actions,
  onClear,
  clearAriaLabel = 'Clear selection',
  className,
  style,
}: AppSelectionBarProps) {
  return (
    <div
      className={`app-selection-bar ${className ?? ''}`.trim()}
      style={style}
    >
      <div className="app-selection-bar__label">
        <Check aria-hidden="true" size={16} strokeWidth={2.25} />
        <span>{label ?? `${count} selected`}</span>
      </div>
      {actions != null || onClear ? (
        <div className="app-selection-bar__actions">
          {actions}
          {onClear ? (
            <button
              aria-label={clearAriaLabel}
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
