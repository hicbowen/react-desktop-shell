import { forwardRef, useRef, useState, type KeyboardEvent } from 'react'
import { Send16Regular } from '@fluentui/react-icons/svg/send'
import { Sparkle16Regular } from '@fluentui/react-icons/svg/sparkle'
import { Stop16Regular } from '@fluentui/react-icons/svg/stop'
import { AppIconButton } from '../button'
import { useAppLocale } from '../localization/useAppLocale'
import { AppTextArea } from '../text-input'
import type { AppAiComposerProps } from './types'
import './AppAiComposer.css'

export const AppAiComposer = forwardRef<
  HTMLTextAreaElement,
  AppAiComposerProps
>(function AppAiComposer(
  {
    className,
    clearOnSubmit = true,
    defaultValue = '',
    disabled = false,
    inputAriaLabel,
    leadingIcon,
    onCancel,
    onSubmit,
    onValueChange,
    placeholder,
    status = 'idle',
    style,
    value,
  },
  forwardedRef,
) {
  const { messages } = useAppLocale()
  const text = messages.ai
  const controlled = value !== undefined
  const [internalValue, setInternalValue] = useState(defaultValue)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const composingRef = useRef(false)
  const currentValue = value ?? internalValue
  const busy = status === 'submitting' || status === 'streaming'
  const awaitingApproval = status === 'awaiting-approval'
  const statusText =
    status === 'submitting'
      ? text.thinking
      : status === 'streaming'
        ? text.responding
        : status === 'awaiting-approval'
          ? text.awaitingApproval
          : status === 'error'
            ? text.failed
            : text.response

  const setInputRef = (node: HTMLTextAreaElement | null) => {
    inputRef.current = node
    if (typeof forwardedRef === 'function') forwardedRef(node)
    else if (forwardedRef) forwardedRef.current = node
  }

  const change = (next: string) => {
    if (!controlled) setInternalValue(next)
    onValueChange?.(next)
  }

  const submit = () => {
    const prompt = currentValue.trim()
    if (!prompt || disabled || busy || awaitingApproval) return
    onSubmit(prompt)
    if (clearOnSubmit) change('')
  }

  const handleCompositionStart = () => {
    composingRef.current = true
  }

  const handleCompositionEnd = () => {
    composingRef.current = false
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      event.key !== 'Enter' ||
      event.shiftKey ||
      composingRef.current ||
      event.nativeEvent.isComposing
    ) {
      return
    }
    event.preventDefault()
    submit()
  }

  return (
    <div
      className={['app-ai-composer', className].filter(Boolean).join(' ')}
      style={style}
    >
      <span aria-hidden="true" className="app-ai-composer__leading">
        {leadingIcon ?? <Sparkle16Regular />}
      </span>
      <AppTextArea
        aria-label={inputAriaLabel ?? text.inputLabel}
        autoResize
        disabled={disabled}
        fullWidth
        maxRows={4}
        minRows={1}
        onChange={(event) => change(event.currentTarget.value)}
        onCompositionEnd={handleCompositionEnd}
        onCompositionStart={handleCompositionStart}
        onKeyDown={handleKeyDown}
        placeholder={placeholder ?? text.placeholder}
        ref={setInputRef}
        value={currentValue}
      />
      {busy ? (
        <AppIconButton
          appearance={onCancel ? 'standard' : 'subtle'}
          ariaLabel={onCancel ? text.stop : statusText}
          className="app-ai-composer__submit"
          disabled={!onCancel}
          icon={<Stop16Regular />}
          loading={!onCancel}
          onClick={onCancel}
          shape="circular"
        />
      ) : (
        <AppIconButton
          appearance="primary"
          ariaLabel={text.send}
          className="app-ai-composer__submit"
          disabled={disabled || awaitingApproval || !currentValue.trim()}
          icon={<Send16Regular />}
          onClick={submit}
          shape="circular"
        />
      )}
    </div>
  )
})
