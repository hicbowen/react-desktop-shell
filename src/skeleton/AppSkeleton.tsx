import { useAppLocale } from '../localization/useAppLocale'
import type { AppSkeletonGroupProps, AppSkeletonProps } from './types'
import './AppSkeleton.css'

export function AppSkeleton({
  shape = 'text',
  width,
  height,
  lines = 1,
  animated = true,
  className,
  style,
}: AppSkeletonProps) {
  const count = Math.max(1, Math.floor(lines))
  const classes = [
    'app-skeleton',
    `app-skeleton--${shape}`,
    animated ? 'app-skeleton--animated' : '',
    className,
  ].filter(Boolean).join(' ')
  const resolvedStyle = { width, height, ...style }
  if (shape === 'text' && count > 1) {
    return <div aria-hidden="true" className="app-skeleton-lines" style={resolvedStyle}>{Array.from({ length: count }, (_, index) => <span className={classes} key={index} style={index === count - 1 ? { width: '72%' } : undefined} />)}</div>
  }
  return <span aria-hidden="true" className={classes} style={resolvedStyle} />
}

export function AppSkeletonGroup({ children, label, className, style }: AppSkeletonGroupProps) {
  const { messages } = useAppLocale()
  return <div aria-busy="true" aria-label={label ?? messages.skeleton.loading} className={['app-skeleton-group', className].filter(Boolean).join(' ')} role="status" style={style}>{children}</div>
}
