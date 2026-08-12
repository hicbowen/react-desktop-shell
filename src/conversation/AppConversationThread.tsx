import { useAppLocale } from '../localization/useAppLocale'
import type {
  AppConversationMessageRole,
  AppConversationThreadProps,
} from './types'
import './AppConversationThread.css'

export function AppConversationThread({
  messages,
  ariaLabel,
  className,
  style,
}: AppConversationThreadProps) {
  const { messages: localeMessages } = useAppLocale()
  const text = localeMessages.conversation
  const roleLabels: Record<AppConversationMessageRole, string> = {
    user: text.user,
    assistant: text.assistant,
    tool: text.tool,
  }

  return (
    <div
      aria-label={ariaLabel ?? text.label}
      className={['app-conversation-thread', className]
        .filter(Boolean)
        .join(' ')}
      role="log"
      style={style}
    >
      {messages.map((message) => (
        <article
          className={[
            'app-conversation-thread__message',
            `app-conversation-thread__message--${message.role}`,
          ].join(' ')}
          key={message.id}
        >
          <div className="app-conversation-thread__label">
            {message.label ?? roleLabels[message.role]}
          </div>
          <div className="app-conversation-thread__content">
            {message.content}
          </div>
        </article>
      ))}
    </div>
  )
}
