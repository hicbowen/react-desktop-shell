import type { AppListViewItemInternalProps } from './types'
import './AppListView.css'

export function AppListViewItem({
  className,
  description,
  disabled = false,
  focusable = false,
  icon,
  interactive = true,
  itemRole = 'listitem',
  onItemClick,
  onItemKeyDown,
  secondaryText,
  selected = false,
  style,
  tabIndex = -1,
  title,
  trailing,
  value,
}: AppListViewItemInternalProps) {
  const invoke = itemRole === 'button'
  const classes = [
    'app-list-view-item',
    invoke ? 'app-list-view-item--invoke' : '',
    selected ? 'app-list-view-item--selected' : '',
    disabled ? 'app-list-view-item--disabled' : '',
    interactive ? 'app-list-view-item--interactive' : '',
    className,
  ].filter(Boolean).join(' ')
  const content = <>
    {itemRole === 'option'
      ? <span aria-hidden="true" className="app-list-view-item__selection">{selected ? '✓' : ''}</span>
      : null}
    {icon ? <span aria-hidden="true" className="app-list-view-item__icon">{icon}</span> : null}
    <span className="app-list-view-item__content">
      <span className="app-list-view-item__top">
        <span className="app-list-view-item__title">{title}</span>
        {secondaryText
          ? <span className="app-list-view-item__secondary">{secondaryText}</span>
          : null}
      </span>
      {description
        ? <span className="app-list-view-item__description">{description}</span>
        : null}
    </span>
  </>

  if (invoke) {
    return <div className={classes} role="listitem" style={style}>
      <div
        aria-disabled={disabled || undefined}
        className="app-list-view-item__main-action"
        data-value={value}
        onClick={(event) => onItemClick?.(value, event)}
        onKeyDown={(event) => onItemKeyDown?.(value, event)}
        role="button"
        tabIndex={disabled || !interactive || !focusable ? -1 : tabIndex}
      >
        {content}
      </div>
      {trailing
        ? <span className="app-list-view-item__trailing">{trailing}</span>
        : null}
    </div>
  }

  return <div
    aria-disabled={disabled || undefined}
    aria-selected={itemRole === 'option' ? selected : undefined}
    className={classes}
    data-value={value}
    onClick={(event) => onItemClick?.(value, event)}
    onKeyDown={(event) => onItemKeyDown?.(value, event)}
    role={itemRole}
    style={style}
    tabIndex={disabled || !interactive || !focusable ? -1 : tabIndex}
  >
    {content}
    {trailing
      ? <span className="app-list-view-item__trailing">{trailing}</span>
      : null}
  </div>
}
