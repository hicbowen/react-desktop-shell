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
  onItemSelect,
  secondaryText,
  selected = false,
  selectionMode = 'none',
  selectionName,
  style,
  tabIndex = -1,
  title,
  trailing,
  value,
}: AppListViewItemInternalProps) {
  const invoke = itemRole === 'button'
  const selectable = selectionMode !== 'none'
  const classes = [
    'app-list-view-item',
    invoke ? 'app-list-view-item--invoke' : '',
    selectable ? 'app-list-view-item--selection' : '',
    selected ? 'app-list-view-item--selected' : '',
    disabled ? 'app-list-view-item--disabled' : '',
    interactive ? 'app-list-view-item--interactive' : '',
    className,
  ].filter(Boolean).join(' ')
  const content = <>
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

  if (selectable) {
    return <div
      aria-disabled={disabled || undefined}
      className={classes}
      role="listitem"
      style={style}
    >
      <label className="app-list-view-item__main-action">
        <input
          checked={selected}
          className="app-list-view-item__selection"
          data-value={value}
          disabled={disabled}
          name={selectionMode === 'single' ? selectionName : undefined}
          onChange={() => onItemSelect?.(value)}
          type={selectionMode === 'single' ? 'radio' : 'checkbox'}
        />
        {content}
      </label>
      {trailing
        ? <span
            aria-disabled={disabled || undefined}
            className="app-list-view-item__trailing"
            inert={disabled ? true : undefined}
          >
            {trailing}
          </span>
        : null}
    </div>
  }

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
