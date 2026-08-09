import { useMemo } from 'react'
import type { AppPageProps } from './types'
import { AppScrollArea } from './scroll-area/AppScrollArea'
import './AppPage.css'

export function AppPage({
  title,
  description,
  actions,
  children,
  sidePane,
  layout = 'flow',
  animated = true,
  className,
  style,
  contentClassName,
  contentStyle,
}: AppPageProps) {
  const hasHeader = Boolean(title || description || actions)

  const rootClassName = useMemo(() => {
    const classes = ['app-page']

    if (sidePane) {
      classes.push('app-page--with-side-pane')
    }

    if (layout === 'fill') {
      classes.push('app-page--fill')
    }

    if (className) {
      classes.push(className)
    }

    return classes.join(' ')
  }, [className, layout, sidePane])

  const innerClassName = useMemo(() => {
    const classes = ['app-page__inner']

    if (animated) {
      classes.push('app-page--animated')
    }

    return classes.join(' ')
  }, [animated])

  const contentClassNames = useMemo(() => {
    const classes = ['app-page__content']

    if (contentClassName) {
      classes.push(contentClassName)
    }

    return classes.join(' ')
  }, [contentClassName])

  return (
    <div className={rootClassName} style={style}>
      <div
        className={`app-page__frame${
          sidePane ? ' app-page__layout' : ''
        }`}
      >
        <AppScrollArea
          className="app-page__scroll-area"
          orientation="both"
          viewportClassName={innerClassName}
        >
          {hasHeader && (
            <header className="app-page__header">
              <div className="app-page__heading">
                {title && <div className="app-page__title">{title}</div>}
                {description && (
                  <div className="app-page__description">{description}</div>
                )}
              </div>

              {actions && <div className="app-page__actions">{actions}</div>}
            </header>
          )}

          <div className={contentClassNames} style={contentStyle}>
            {children}
          </div>
        </AppScrollArea>
        {sidePane ? (
          <div className="app-page__side-pane-slot">{sidePane}</div>
        ) : null}
      </div>
    </div>
  )
}
