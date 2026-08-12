import { useAppLocale } from '../localization/useAppLocale'
import type { AppQuickAskMessageRole, AppQuickAskThreadProps } from './types'
import './AppQuickAskThread.css'

export function AppQuickAskThread({
  messages,
  ariaLabel,
  className,
  style,
}: AppQuickAskThreadProps) {
  const { messages: localeMessages } = useAppLocale()
  const text = localeMessages.quickAsk
  const roleLabels: Record<AppQuickAskMessageRole, string> = {
    user: text.user,
    assistant: text.assistant,
    tool: text.tool,
  }

  return (
    <div
      aria-label={ariaLabel ?? text.conversation}
      className={['app-quick-ask-thread', className].filter(Boolean).join(' ')}
      role="log"
      style={style}
    >
      {messages.map((message) => (
        <article
          className={[
            'app-quick-ask-thread__message',
            `app-quick-ask-thread__message--${message.role}`,
          ].join(' ')}
          key={message.id}
        >
          <div className="app-quick-ask-thread__label">
            {message.label ?? roleLabels[message.role]}
          </div>
          <div className="app-quick-ask-thread__content">{message.content}</div>
        </article>
      ))}
    </div>
  )
}
