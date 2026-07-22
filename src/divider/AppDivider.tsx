import type { AppDividerProps } from './types'
import './AppDivider.css'

export function AppDivider({
  align = 'center',
  appearance = 'subtle',
  children,
  className,
  inset = false,
  orientation = 'horizontal',
  style,
}: AppDividerProps) {
  const classes = [
    'app-divider',
    `app-divider--${orientation}`,
    `app-divider--${appearance}`,
    children ? `app-divider--with-content app-divider--align-${align}` : '',
    inset ? 'app-divider--inset' : '',
    className,
  ].filter(Boolean).join(' ')

  return (
    <div
      aria-orientation={orientation}
      className={classes}
      role="separator"
      style={style}
    >
      {children && orientation === 'horizontal' ? <span className="app-divider__content">{children}</span> : null}
    </div>
  )
}

export const AppSeparator = AppDivider
