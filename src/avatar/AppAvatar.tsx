import { useState } from 'react'
import type { AppAvatarProps, AppPersonaProps } from './types'
import './AppAvatar.css'

function initialsFromName(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toLocaleUpperCase()
}

export function AppAvatar({
  alt,
  className,
  icon,
  initials,
  name,
  shape = 'circular',
  size = 'medium',
  src,
  status,
  style,
}: AppAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const fallback = initials ?? initialsFromName(name)
  return (
    <span
      aria-label={alt ?? name}
      className={['app-avatar', `app-avatar--${size}`, `app-avatar--${shape}`, className].filter(Boolean).join(' ')}
      role={alt || name ? 'img' : undefined}
      style={style}
    >
      {src && !imageFailed ? <img alt="" onError={() => setImageFailed(true)} src={src} /> : icon ? <span className="app-avatar__icon">{icon}</span> : <span className="app-avatar__initials">{fallback || '?'}</span>}
      {status ? <span aria-label={status} className={`app-avatar__presence app-avatar__presence--${status}`} role="img" /> : null}
    </span>
  )
}

export function AppPersona({
  avatar,
  className,
  name,
  secondaryText,
  size = 'medium',
  style,
  tertiaryText,
  textPosition = 'after',
}: AppPersonaProps) {
  const accessibleName = typeof name === 'string' ? name : undefined
  return (
    <div className={['app-persona', `app-persona--${size}`, `app-persona--${textPosition}`, className].filter(Boolean).join(' ')} style={style}>
      <AppAvatar {...avatar} name={accessibleName} size={size} />
      <div className="app-persona__text">
        <strong className="app-persona__name">{name}</strong>
        {secondaryText ? <span className="app-persona__secondary">{secondaryText}</span> : null}
        {tertiaryText ? <span className="app-persona__tertiary">{tertiaryText}</span> : null}
      </div>
    </div>
  )
}
