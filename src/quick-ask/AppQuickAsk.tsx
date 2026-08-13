import { forwardRef, useLayoutEffect, useRef } from 'react'
import { Sparkle16Regular } from '@fluentui/react-icons/svg/sparkle'
import { useAppLocale } from '../localization/useAppLocale'
import { AppProgressRing } from '../progress'
import { AppScrollArea } from '../scroll-area'
import { AppSpotlightSurface } from '../spotlight-surface'
import { AppAiComposer } from '../ai/AppAiComposer'
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
    const text = messages.ai
    const inputRef = useRef<HTMLTextAreaElement | null>(null)
    const responseViewportRef = useRef<HTMLDivElement | null>(null)
    const shouldFollowOutputRef = useRef(true)
    const wasOpenRef = useRef(false)
    const busy = status === 'submitting' || status === 'streaming'
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
        <AppAiComposer
          appearance="embedded"
          clearOnSubmit={clearOnSubmit}
          defaultValue={defaultValue}
          disabled={disabled}
          inputAriaLabel={inputAriaLabel}
          leadingIcon={leadingIcon}
          onCancel={onCancel}
          onSubmit={(prompt) => {
            shouldFollowOutputRef.current = true
            if (followOutput && responseViewportRef.current) {
              responseViewportRef.current.scrollTop =
                responseViewportRef.current.scrollHeight
            }
            onSubmit(prompt)
          }}
          onValueChange={onValueChange}
          placeholder={placeholder}
          ref={setInputRef}
          status={status}
          value={value}
        />

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
