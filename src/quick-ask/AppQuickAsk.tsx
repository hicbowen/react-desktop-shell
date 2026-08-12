import {
  forwardRef,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import { Send16Regular } from '@fluentui/react-icons/svg/send'
import { Sparkle16Regular } from '@fluentui/react-icons/svg/sparkle'
import { Stop16Regular } from '@fluentui/react-icons/svg/stop'
import { AppIconButton } from '../button'
import { useAppLocale } from '../localization/useAppLocale'
import { AppProgressRing } from '../progress'
import { AppScrollArea } from '../scroll-area'
import { AppSpotlightSurface } from '../spotlight-surface'
import { AppTextArea } from '../text-input'
import type { AppQuickAskProps } from './types'
import './AppQuickAsk.css'

const FOLLOW_OUTPUT_THRESHOLD = 48

export const AppQuickAsk = forwardRef<HTMLTextAreaElement, AppQuickAskProps>(
  function AppQuickAsk(
    {
      open,
      onOpenChange,
      onSubmit,
      value,
      defaultValue = '',
      onValueChange,
      status = 'idle',
      answer,
      error,
      answerActions,
      footer,
      leadingIcon,
      onCancel,
      clearOnSubmit = true,
      followOutput = true,
      disabled = false,
      placeholder,
      ariaLabel,
      inputAriaLabel,
      responseAriaLabel,
      closeOnOutsideClick = true,
      closeOnWindowBlur = true,
      width = 720,
      className,
      style,
    },
    forwardedRef,
  ) {
    const { messages } = useAppLocale()
    const text = messages.quickAsk
    const controlled = value !== undefined
    const [internalValue, setInternalValue] = useState(defaultValue)
    const inputRef = useRef<HTMLTextAreaElement | null>(null)
    const responseViewportRef = useRef<HTMLDivElement | null>(null)
    const composingRef = useRef(false)
    const shouldFollowOutputRef = useRef(true)
    const wasOpenRef = useRef(false)
    const currentValue = value ?? internalValue
    const busy = status === 'submitting' || status === 'streaming'
    const awaitingApproval = status === 'awaiting-approval'
    const hasAnswer = answer !== undefined && answer !== null && answer !== ''
    const showResponse = status !== 'idle' || hasAnswer || error != null
    const showResponseHeader =
      status === 'submitting' ||
      status === 'streaming' ||
      status === 'awaiting-approval' ||
      status === 'error'

    useLayoutEffect(() => {
      const opening = open && !wasOpenRef.current
      wasOpenRef.current = open

      if (!open || !followOutput) return
      if (opening) shouldFollowOutputRef.current = true

      const viewport = responseViewportRef.current
      if (viewport && shouldFollowOutputRef.current) {
        viewport.scrollTop = viewport.scrollHeight
      }
    })

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
      shouldFollowOutputRef.current = true
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

    return (
      <AppSpotlightSurface
        ariaLabel={ariaLabel ?? text.label}
        className={['app-quick-ask', className].filter(Boolean).join(' ')}
        closeOnOutsideClick={closeOnOutsideClick}
        closeOnWindowBlur={closeOnWindowBlur}
        initialFocusRef={inputRef}
        onOpenChange={onOpenChange}
        open={open}
        style={style}
        width={width}
      >
        <div className="app-quick-ask__composer">
          <span aria-hidden="true" className="app-quick-ask__leading">
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
              className="app-quick-ask__submit"
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
              className="app-quick-ask__submit"
              disabled={disabled || awaitingApproval || !currentValue.trim()}
              icon={<Send16Regular />}
              onClick={submit}
              shape="circular"
            />
          )}
        </div>

        {showResponse ? (
          <div
            className={[
              'app-quick-ask__response',
              showResponseHeader
                ? ''
                : 'app-quick-ask__response--without-header',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {showResponseHeader ? (
              <div
                aria-live="polite"
                className="app-quick-ask__response-header"
              >
                {busy ? (
                  <AppProgressRing
                    ariaLabel={statusText}
                    labelPosition="hidden"
                    size="small"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="app-quick-ask__response-icon"
                  >
                    <Sparkle16Regular />
                  </span>
                )}
                <span>{statusText}</span>
              </div>
            ) : null}
            <AppScrollArea
              className="app-quick-ask__response-scroll"
              onScroll={() => {
                const viewport = responseViewportRef.current
                if (!viewport) return
                const distanceFromBottom =
                  viewport.scrollHeight -
                  viewport.clientHeight -
                  viewport.scrollTop
                shouldFollowOutputRef.current =
                  distanceFromBottom <= FOLLOW_OUTPUT_THRESHOLD
              }}
              ref={responseViewportRef}
              viewportClassName="app-quick-ask__response-viewport"
            >
              <div
                aria-label={responseAriaLabel ?? text.response}
                aria-live={status === 'completed' ? 'polite' : 'off'}
                className={[
                  'app-quick-ask__answer',
                  status === 'error' ? 'app-quick-ask__answer--error' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                role={status === 'error' ? 'alert' : 'region'}
              >
                {status === 'error' ? (
                  (error ?? text.error)
                ) : hasAnswer ? (
                  answer
                ) : busy ? (
                  <span aria-hidden="true" className="app-quick-ask__thinking">
                    <i />
                    <i />
                  </span>
                ) : null}
              </div>
            </AppScrollArea>
            {answerActions && (hasAnswer || status === 'error') ? (
              <div className="app-quick-ask__answer-actions">
                {answerActions}
              </div>
            ) : null}
          </div>
        ) : null}

        {footer ? <div className="app-quick-ask__footer">{footer}</div> : null}
      </AppSpotlightSurface>
    )
  },
)
