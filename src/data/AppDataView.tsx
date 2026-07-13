import type { AppDataViewProps } from './types'

export function AppDataView({
  height = 'auto',
  toolbar,
  selectionBar,
  footer,
  children,
  className,
  style,
}: AppDataViewProps) {
  const header = selectionBar ?? toolbar

  return (
    <div
      className={[
        'app-data-view',
        `app-data-view--${height}`,
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
    >
      {header != null ? (
        <div className="app-data-view__header">{header}</div>
      ) : null}
      <div className="app-data-view__body">{children}</div>
      {footer != null ? (
        <div className="app-data-view__footer">{footer}</div>
      ) : null}
    </div>
  )
}
