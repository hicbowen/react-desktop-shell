import type { CSSProperties } from 'react'
import { AppButton } from '../button'
import { AppProgressRing } from '../progress'
import { useAppLocale } from '../localization/useAppLocale'
import type { AppLoadingOverlayProps } from './types'
import './AppLoadingOverlay.css'

export function AppLoadingOverlay({ loading, children, label, description, delay = 150, onCancel, cancelLabel, className, style, overlayClassName }: AppLoadingOverlayProps) {
  const { messages } = useAppLocale()
  return <div aria-busy={loading} className={['app-loading-overlay', className].filter(Boolean).join(' ')} style={style}>{children}{loading ? <div aria-live="polite" className={['app-loading-overlay__surface', overlayClassName].filter(Boolean).join(' ')} role="status" style={{ '--app-loading-overlay-delay': `${Math.max(0, delay)}ms` } as CSSProperties}><div className="app-loading-overlay__panel"><AppProgressRing /><strong>{label ?? messages.loadingOverlay.label}</strong>{description ? <span>{description}</span> : null}{onCancel ? <AppButton onClick={onCancel} size="compact">{cancelLabel ?? messages.loadingOverlay.cancel}</AppButton> : null}</div></div> : null}</div>
}
