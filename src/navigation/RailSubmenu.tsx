import type { RefCallback } from 'react'
import { ChevronDown16Regular } from '@fluentui/react-icons/svg/chevron-down'
import type { RailSubmenu as RailSubmenuModel } from './types'
import { RailItem } from './RailItem'
import { RailBadge } from './RailBadge'
import type { SelectionDirection } from './types'
import { AppTooltip } from '../tooltip/AppTooltip'
import { getRailDepthStyle } from './railDepth'

export function RailSubmenu({
  item,
  depth = 0,
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
  depth?: number
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

  const trigger = (
    <button
      ref={triggerRef}
      aria-label={collapsed ? item.label : undefined}
      aria-expanded={collapsed ? flyoutOpen : expanded}
      aria-haspopup={collapsed ? 'dialog' : undefined}
      className={classNames.filter(Boolean).join(' ')}
      disabled={item.disabled}
      onClick={() => onToggle(item)}
      type="button"
    >
      <span
        className="app-rail__item-content"
        data-depth={depth}
        style={getRailDepthStyle(depth)}
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
              <ChevronDown16Regular aria-hidden="true" focusable="false" />
            </span>
          </>
        )}
      </span>
    </button>
  )
  const renderedTrigger = collapsed ? (
    <AppTooltip
      content={item.label}
      disabled={flyoutOpen}
      placement="right"
    >
      {trigger}
    </AppTooltip>
  ) : (
    trigger
  )

  return (
    <div className="app-rail__submenu">
      {renderedTrigger}

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
                depth={depth + 1}
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
