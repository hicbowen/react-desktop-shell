import { ArrowClockwise16Regular } from '@fluentui/react-icons/svg/arrow-clockwise'
import { Copy16Regular } from '@fluentui/react-icons/svg/copy'
import { Edit16Regular } from '@fluentui/react-icons/svg/edit'
import { ThumbDislike16Regular } from '@fluentui/react-icons/svg/thumb-dislike'
import { ThumbLike16Regular } from '@fluentui/react-icons/svg/thumb-like'
import { AppIconButton } from '../button'
import { useAppLocale } from '../localization/useAppLocale'
import type {
  AppAiMessageActionsProps,
  AppAiMessageFeedback,
} from './types'
import './AppAiMessageActions.css'

export function AppAiMessageActions({
  ariaLabel,
  children,
  className,
  disabled = false,
  feedback = null,
  onCopy,
  onEdit,
  onFeedbackChange,
  onRetry,
  style,
  ...rest
}: AppAiMessageActionsProps) {
  const { messages } = useAppLocale()
  const text = messages.ai
  const changeFeedback = (next: Exclude<AppAiMessageFeedback, null>) => {
    onFeedbackChange?.(feedback === next ? null : next)
  }

  return (
    <div
      {...rest}
      aria-label={ariaLabel ?? text.messageActions}
      className={['app-ai-message-actions', className]
        .filter(Boolean)
        .join(' ')}
      role="toolbar"
      style={style}
    >
      {onCopy ? (
        <AppIconButton
          appearance="subtle"
          ariaLabel={text.copyResponse}
          disabled={disabled}
          icon={<Copy16Regular />}
          onClick={onCopy}
          size="compact"
        />
      ) : null}
      {onRetry ? (
        <AppIconButton
          appearance="subtle"
          ariaLabel={text.retryResponse}
          disabled={disabled}
          icon={<ArrowClockwise16Regular />}
          onClick={onRetry}
          size="compact"
        />
      ) : null}
      {onEdit ? (
        <AppIconButton
          appearance="subtle"
          ariaLabel={text.editMessage}
          disabled={disabled}
          icon={<Edit16Regular />}
          onClick={onEdit}
          size="compact"
        />
      ) : null}
      {onFeedbackChange ? (
        <>
          <AppIconButton
            appearance="subtle"
            aria-pressed={feedback === 'like'}
            ariaLabel={text.helpful}
            disabled={disabled}
            icon={<ThumbLike16Regular />}
            onClick={() => changeFeedback('like')}
            size="compact"
          />
          <AppIconButton
            appearance="subtle"
            aria-pressed={feedback === 'dislike'}
            ariaLabel={text.notHelpful}
            disabled={disabled}
            icon={<ThumbDislike16Regular />}
            onClick={() => changeFeedback('dislike')}
            size="compact"
          />
        </>
      ) : null}
      {children}
    </div>
  )
}
