import type { RailLinkItem } from './types'
import type { SelectionDirection } from './types'

export function RailItem({
  item,
  nested = false,
  collapsed,
  active,
  selectionDirection,
  onChange,
}: {
  item: RailLinkItem
  nested?: boolean
  collapsed: boolean
  active: boolean
  selectionDirection: SelectionDirection
  onChange: (key: string) => void
}) {
  const classNames = [
    'app-rail__item',
    nested ? 'app-rail__submenu-item' : '',
    nested && item.icon ? 'app-rail__submenu-item--with-icon' : '',
  ]

  if (active) {
    classNames.push('app-rail__item--active')

    if (selectionDirection) {
      classNames.push(
        `app-rail__item--indicator-enter-${selectionDirection}`,
      )
    }
  }

  return (
    <button
      className={classNames.filter(Boolean).join(' ')}
      disabled={item.disabled}
      onClick={() => onChange(item.key)}
      title={collapsed && !nested ? item.label : undefined}
      type="button"
    >
      {(item.icon || !nested) && (
        <span className="app-rail__icon">{item.icon}</span>
      )}
      {(!collapsed || nested) && (
        <span className="app-rail__label">{item.label}</span>
      )}
    </button>
  )
}
