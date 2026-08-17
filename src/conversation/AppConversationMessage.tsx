import { useAppLocale } from '../localization/useAppLocale'
import type {
  AppConversationMessageProps,
  AppConversationMessageRole,
} from './types'
import './AppConversationMessage.css'

export function AppConversationMessage({
  actions,
  avatar,
  children,
  className,
  footer,
  header,
  label,
  role,
  style,
  timestamp,
  timestampDateTime,
  metaVisibility,
  timestampVisibility,
  ...rest
}: AppConversationMessageProps) {
  const { messages } = useAppLocale()
  const text = messages.conversation
  const roleLabels: Record<AppConversationMessageRole, string> = {
    user: text.user,
    assistant: text.assistant,
    tool: text.tool,
    system: text.system,
  }
  const resolvedLabel = label === undefined ? roleLabels[role] : label
  const defaultHeader =
    label !== null && resolvedLabel != null ? (
      <span className="app-conversation-message__label">{resolvedLabel}</span>
    ) : null
  const resolvedHeader = header ?? defaultHeader
  const resolvedMetaVisibility = metaVisibility ?? timestampVisibility ?? 'always'
  const showMetaOnHover = resolvedMetaVisibility === 'hover'
  const timestampNode = timestamp != null ? (
    <time
      className={[
        'app-conversation-message__timestamp',
        showMetaOnHover ? 'app-conversation-message__timestamp--hover' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      dateTime={timestampDateTime}
    >
      {timestamp}
    </time>
  ) : null
  const meta = timestampNode || actions != null ? (
    <div
      className={[
        'app-conversation-message__meta',
        showMetaOnHover ? 'app-conversation-message__meta--hover' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {role === 'user' ? timestampNode : null}
      {actions != null ? (
        <div className="app-conversation-message__actions">{actions}</div>
      ) : null}
      {role !== 'user' ? timestampNode : null}
    </div>
  ) : null

  return (
    <article
      {...rest}
      className={[
        'app-conversation-message',
        `app-conversation-message--${role}`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-message-role={role}
      style={style}
    >
      {avatar != null ? (
        <div className="app-conversation-message__avatar">{avatar}</div>
      ) : null}
      <div className="app-conversation-message__body">
        {resolvedHeader != null ? (
          <header className="app-conversation-message__header">
            {resolvedHeader}
          </header>
        ) : null}
        <div className="app-conversation-message__content">{children}</div>
        {footer != null ? (
          <footer className="app-conversation-message__footer">{footer}</footer>
        ) : null}
        {meta}
      </div>
    </article>
  )
}
