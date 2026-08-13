import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'

export type AppConversationMessageRole =
  | 'user'
  | 'assistant'
  | 'tool'
  | 'system'

export interface AppConversationMessageProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'children' | 'role'
> {
  role: AppConversationMessageRole
  children: ReactNode
  label?: ReactNode
  timestamp?: ReactNode
  timestampDateTime?: string
  metaVisibility?: 'always' | 'hover'
  /** @deprecated Use metaVisibility to keep timestamps and actions consistent. */
  timestampVisibility?: 'always' | 'hover'
  avatar?: ReactNode
  header?: ReactNode
  footer?: ReactNode
  actions?: ReactNode
}

export interface AppConversationMessageItem extends Omit<
  AppConversationMessageProps,
  'children' | 'content'
> {
  id: string
  content: ReactNode
}

export interface AppConversationThreadProps {
  messages: readonly AppConversationMessageItem[]
  ariaLabel?: string
  className?: string
  style?: CSSProperties
}

export interface AppConversationViewportProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'onScroll'
> {
  children: ReactNode
  followOutput?: boolean
  hasMore?: boolean
  loadingOlder?: boolean
  onLoadOlder?: () => void
  latestLabel?: ReactNode
  loadEarlierLabel?: ReactNode
  loadingEarlierLabel?: ReactNode
  ariaLabel?: string
  viewportClassName?: string
  viewportStyle?: CSSProperties
}
