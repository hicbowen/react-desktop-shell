import { forwardRef } from 'react'
import type { AppScrollAreaProps } from './types'
import './AppScrollArea.css'

export const AppScrollArea = forwardRef<HTMLDivElement, AppScrollAreaProps>(
  function AppScrollArea(
    {
      orientation = 'vertical',
      scrollbar = 'auto',
      gutter = 'auto',
      className,
      children,
      ...rest
    },
    ref,
  ) {
    const classNames = [
      'app-scroll-area',
      `app-scroll-area--${orientation}`,
      `app-scroll-area--scrollbar-${scrollbar}`,
      `app-scroll-area--gutter-${gutter}`,
    ]

    if (className) {
      classNames.push(className)
    }

    return (
      <div
        {...rest}
        className={classNames.join(' ')}
        data-gutter={gutter}
        data-orientation={orientation}
        data-scrollbar={scrollbar}
        ref={ref}
      >
        {children}
      </div>
    )
  },
)
