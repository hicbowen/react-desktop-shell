import type { RailLinkItem } from './types'
import type { SelectionDirection } from './types'
import { AppTooltip } from '../tooltip/AppTooltip'
import { RailBadge } from './RailBadge'
import { getRailDepthStyle } from './railDepth'

export function RailItem({
  item,
  depth = 0,
  collapsed,
  active,
  selectionDirection,
  onChange,
}: {
  item: RailLinkItem
  depth?: number
  collapsed: boolean
  active: boolean
  selectionDirection: SelectionDirection
  onChange: (key: string) => void
}) {
  const nested = depth > 0
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

  const button = (
    <button
      aria-current={active ? 'page' : undefined}
      aria-label={collapsed && !nested ? item.label : undefined}
      className={classNames.filter(Boolean).join(' ')}
      disabled={item.disabled}
      onClick={() => onChange(item.key)}
      type="button"
    >
      <span
        className="app-rail__item-content"
        data-depth={depth}
        style={getRailDepthStyle(depth)}
      >
        {(item.icon || !nested) && (
          <span className="app-rail__icon">
            {item.icon}
            {collapsed && !nested ? (
              <RailBadge
                content={item.badge}
                ariaLabel={item.badgeAriaLabel}
                collapsed
              />
            ) : null}
          </span>
        )}
        {(!collapsed || nested) && (
          <span className="app-rail__label">{item.label}</span>
        )}
        {!collapsed || nested ? (
          <RailBadge
            content={item.badge}
            ariaLabel={item.badgeAriaLabel}
            collapsed={false}
          />
        ) : null}
      </span>
    </button>
  )

  return collapsed && !nested ? (
    <AppTooltip content={item.label} placement="right">
      {button}
    </AppTooltip>
  ) : (
    button
  )
}
