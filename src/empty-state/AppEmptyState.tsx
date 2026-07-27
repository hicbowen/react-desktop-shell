import type { ReactNode } from 'react'
import type { AppEmptyStateProps } from './types'
import './AppEmptyState.css'

function DefaultVisual({ simple = false }: { simple?: boolean }) {
  return <svg aria-hidden="true" fill="none" viewBox="0 0 64 52">
    <path d="M9 15.5 18.5 5h27L55 15.5v28H9v-28Z" fill="currentColor" opacity=".08" />
    <path d="M9 15.5h14l3.5 5h11l3.5-5h14M18.5 5h27L55 15.5v28H9v-28L18.5 5Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    {!simple ? <path d="M24 31h16M27 37h10" opacity=".55" stroke="currentColor" strokeLinecap="round" strokeWidth="2" /> : null}
  </svg>
}

function resolveVisual(visual: AppEmptyStateProps['visual'], icon: ReactNode) {
  if (visual === 'none') return null
  if (visual === 'default') return { content: <DefaultVisual />, decorative: true }
  if (visual === 'simple') return { content: <DefaultVisual simple />, decorative: true }
  if (visual !== undefined) return visual == null || visual === false ? null : { content: visual, decorative: false }
  return icon == null ? null : { content: icon, decorative: true }
}

export function AppEmptyState({
  action,
  actions,
  align = 'center',
  appearance = 'regular',
  as: Component = 'section',
  className,
  classNames,
  description,
  icon,
  layout = 'content',
  size,
  style,
  styles,
  title,
  visual,
  ...rest
}: AppEmptyStateProps) {
  const resolvedSize = size ?? (appearance === 'compact' ? 'small' : 'medium')
  const resolvedActions = actions ?? action
  const resolvedVisual = resolveVisual(visual, icon)
  const classes = [
    'app-empty-state',
    `app-empty-state--${resolvedSize}`,
    `app-empty-state--layout-${layout}`,
    `app-empty-state--${align}`,
    appearance ? `app-empty-state--${appearance}` : null,
    classNames?.root,
    className,
  ].filter(Boolean).join(' ')

  return <Component {...rest} className={classes} style={{ ...styles?.root, ...style }}>
    <div className="app-empty-state__content">
      {resolvedVisual ? <div aria-hidden={resolvedVisual.decorative || undefined} className={['app-empty-state__visual', 'app-empty-state__icon', classNames?.visual].filter(Boolean).join(' ')} style={styles?.visual}>{resolvedVisual.content}</div> : null}
      {title != null ? <div className={['app-empty-state__title', classNames?.title].filter(Boolean).join(' ')} style={styles?.title}>{title}</div> : null}
      {description != null ? <div className={['app-empty-state__description', classNames?.description].filter(Boolean).join(' ')} style={styles?.description}>{description}</div> : null}
      {resolvedActions != null ? <div className={['app-empty-state__actions', 'app-empty-state__action', classNames?.actions].filter(Boolean).join(' ')} style={styles?.actions}>{resolvedActions}</div> : null}
    </div>
  </Component>
}
