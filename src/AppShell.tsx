import { useMemo } from 'react'
import type { AppShellProps } from './types'
import './AppShell.css'

export function AppShell({
  theme = 'system',
  titleBar,
  rail,
  children,
  className,
  style,
  contentClassName,
  contentStyle,
}: AppShellProps) {
  const rootClassName = useMemo(() => {
    const classes = ['app-shell']

    if (className) {
      classes.push(className)
    }

    return classes.join(' ')
  }, [className])

  const contentClassNames = useMemo(() => {
    const classes = ['app-shell__content']

    if (contentClassName) {
      classes.push(contentClassName)
    }

    return classes.join(' ')
  }, [contentClassName])

  return (
    <div className={rootClassName} data-theme={theme} style={style}>
      {titleBar}
      <div className="app-shell__body">
        {rail}
        <div className={contentClassNames} style={contentStyle}>
          {children}
        </div>
      </div>
    </div>
  )
}
