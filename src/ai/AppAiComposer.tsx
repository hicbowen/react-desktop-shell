import { forwardRef, useRef, useState, type KeyboardEvent } from 'react'
import { Send16Regular } from '@fluentui/react-icons/svg/send'
import { Sparkle16Regular } from '@fluentui/react-icons/svg/sparkle'
import { Stop16Regular } from '@fluentui/react-icons/svg/stop'
import { AppIconButton } from '../button'
import { useAppLocale } from '../localization/useAppLocale'
import { AppTextArea } from '../text-input'
import { AppAiRunIndicator } from './AppAiRunIndicator'
import { isAppAiRunBlocked, isAppAiRunBusy } from './runStatus'
import type { AppAiComposerProps } from './types'
import './AppAiComposer.css'

export const AppAiComposer = forwardRef<
  HTMLTextAreaElement,
  AppAiComposerProps
>(function AppAiComposer(
  {
    appearance = 'surface',
    cancelIcon,
    className,
    clearOnSubmit = true,
    defaultValue = '',
    disabled = false,
    inputAriaLabel,
    header,
    leadingIcon,
    maxRows,
    minRows,
    onCancel,
    onSubmit,
    onValueChange,
    placeholder,
    showRunStatus = true,
    runStatus = 'idle',
    style,
    submitIcon,
    toolbarAriaLabel,
    toolbarEnd,
    toolbarStart,
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
  const busy = isAppAiRunBusy(runStatus)
  const blocked = isAppAiRunBlocked(runStatus)
  const resolvedLeadingIcon =
    leadingIcon === undefined
      ? appearance === 'embedded'
        ? <Sparkle16Regular />
        : null
      : leadingIcon
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
    if (!prompt || disabled || busy || blocked) return
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
      className={[
        'app-ai-composer',
        `app-ai-composer--${appearance}`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
    >
      {header ? <div className="app-ai-composer__header">{header}</div> : null}
      <div className="app-ai-composer__input">
        {resolvedLeadingIcon ? (
          <span aria-hidden="true" className="app-ai-composer__leading">
            {resolvedLeadingIcon}
          </span>
        ) : null}
        <AppTextArea
          aria-label={inputAriaLabel ?? text.inputLabel}
          autoResize
          disabled={disabled}
          fullWidth
          maxRows={maxRows ?? (appearance === 'surface' ? 8 : 4)}
          minRows={minRows ?? (appearance === 'surface' ? 2 : 1)}
          onChange={(event) => change(event.currentTarget.value)}
          onCompositionEnd={handleCompositionEnd}
          onCompositionStart={handleCompositionStart}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? text.placeholder}
          ref={setInputRef}
          value={currentValue}
        />
      </div>
      <div
        aria-label={toolbarAriaLabel ?? text.composerToolbar}
        className="app-ai-composer__toolbar"
        role="toolbar"
      >
        {toolbarStart || (showRunStatus && runStatus !== 'idle') ? (
          <div className="app-ai-composer__toolbar-start">
            {toolbarStart}
            {showRunStatus && runStatus !== 'idle' ? (
              <AppAiRunIndicator
                className="app-ai-composer__status"
                status={runStatus}
              />
            ) : null}
          </div>
        ) : null}
        <div className="app-ai-composer__toolbar-end">
          {toolbarEnd}
          {busy && onCancel ? (
            <AppIconButton
              appearance="standard"
              ariaLabel={text.stop}
              className="app-ai-composer__submit"
              icon={cancelIcon ?? <Stop16Regular />}
              onClick={onCancel}
              shape="circular"
            />
          ) : busy ? null : (
            <AppIconButton
              appearance="primary"
              ariaLabel={text.send}
              className="app-ai-composer__submit"
              disabled={disabled || blocked || !currentValue.trim()}
              icon={submitIcon ?? <Send16Regular />}
              onClick={submit}
              shape="circular"
            />
          )}
        </div>
      </div>
    </div>
  )
})
