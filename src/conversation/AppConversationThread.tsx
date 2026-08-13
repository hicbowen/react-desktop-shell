import { useAppLocale } from '../localization/useAppLocale'
import { AppConversationMessage } from './AppConversationMessage'
import type { AppConversationThreadProps } from './types'
import './AppConversationThread.css'

export function AppConversationThread({
  messages,
  ariaLabel,
  className,
  style,
}: AppConversationThreadProps) {
  const { messages: localeMessages } = useAppLocale()
  const text = localeMessages.conversation

  return (
    <div
      aria-label={ariaLabel ?? text.label}
      className={['app-conversation-thread', className]
        .filter(Boolean)
        .join(' ')}
      role="log"
      style={style}
    >
      {messages.map(({ content, id, ...message }) => (
        <AppConversationMessage {...message} key={id}>
          {content}
        </AppConversationMessage>
      ))}
    </div>
  )
}
