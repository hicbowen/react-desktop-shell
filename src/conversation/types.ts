import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'

export type AppConversationMessageRole = 'user' | 'assistant' | 'tool'

export interface AppConversationMessage {
  id: string
  role: AppConversationMessageRole
  content: ReactNode
  label?: ReactNode
}

export interface AppConversationThreadProps {
  messages: readonly AppConversationMessage[]
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
