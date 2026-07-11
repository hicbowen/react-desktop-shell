import type { RefCallback } from 'react'
import type { RailSubmenu as RailSubmenuModel } from './types'
import { RailItem } from './RailItem'
import { RailBadge } from './RailBadge'
import type { SelectionDirection } from './types'

function ChevronIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path
        d="M3.22 5.97a.75.75 0 0 1 1.06 0L8 9.69l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L3.22 7.03a.75.75 0 0 1 0-1.06Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function RailSubmenu({
  item,
  collapsed,
  expanded,
  active,
  activeValue,
  flyoutOpen,
  selectionDirection,
  triggerRef,
  onToggle,
  onChange,
}: {
  item: RailSubmenuModel
  collapsed: boolean
  expanded: boolean
  active: boolean
  activeValue?: string
  flyoutOpen: boolean
  selectionDirection: SelectionDirection
  triggerRef: RefCallback<HTMLButtonElement>
  onToggle: (item: RailSubmenuModel) => void
  onChange: (key: string) => void
}) {
  const classNames = [
    'app-rail__item',
    'app-rail__submenu-trigger',
    active ? 'app-rail__item--active' : '',
  ]

  if (active && selectionDirection) {
    classNames.push(`app-rail__item--indicator-enter-${selectionDirection}`)
  }

  return (
    <div className="app-rail__submenu">
      <button
        ref={triggerRef}
        className={classNames.filter(Boolean).join(' ')}
        disabled={item.disabled}
        onClick={() => onToggle(item)}
        title={collapsed ? item.label : undefined}
        type="button"
        aria-expanded={collapsed ? flyoutOpen : expanded}
        aria-haspopup={collapsed ? 'dialog' : undefined}
      >
        {(item.icon || collapsed) && (
          <span className="app-rail__icon">
            {item.icon}
            {collapsed ? (
              <RailBadge
                content={item.badge}
                ariaLabel={item.badgeAriaLabel}
                collapsed
              />
            ) : null}
          </span>
        )}
        {!collapsed && (
          <>
            <span className="app-rail__label">{item.label}</span>
            <RailBadge
              content={item.badge}
              ariaLabel={item.badgeAriaLabel}
              collapsed={false}
            />
            <span
              className={[
                'app-rail__submenu-chevron',
                expanded ? 'app-rail__submenu-chevron--expanded' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <ChevronIcon />
            </span>
          </>
        )}
      </button>

      {!collapsed && (
        <div
          className={[
            'app-rail__submenu-content',
            expanded ? 'app-rail__submenu-content--expanded' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <div className="app-rail__submenu-inner">
            {item.children.map((child) => (
              <RailItem
                key={child.key}
                item={child}
                nested
                collapsed={collapsed}
                active={activeValue === child.key}
                selectionDirection={selectionDirection}
                onChange={onChange}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
