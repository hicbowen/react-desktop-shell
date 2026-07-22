import type { CSSProperties, ReactNode } from 'react'

export type AppPresenceStatus = 'available' | 'away' | 'busy' | 'offline' | 'unknown'
export type AppAvatarSize = 'small' | 'medium' | 'large' | 'extra-large'

export interface AppAvatarProps {
  name?: string
  src?: string
  alt?: string
  icon?: ReactNode
  initials?: string
  size?: AppAvatarSize
  shape?: 'circular' | 'square'
  status?: AppPresenceStatus
  className?: string
  style?: CSSProperties
}

export interface AppPersonaProps {
  name: ReactNode
  secondaryText?: ReactNode
  tertiaryText?: ReactNode
  avatar?: Omit<AppAvatarProps, 'name'>
  size?: AppAvatarSize
  textPosition?: 'after' | 'below'
  className?: string
  style?: CSSProperties
}
