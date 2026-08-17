import { forwardRef, useLayoutEffect, useRef } from 'react'
import { useAppLocale } from '../localization/useAppLocale'
import { AppScrollArea } from '../scroll-area'
import { AppSpotlightSurface } from '../spotlight-surface'
import { AppAiComposer } from '../ai/AppAiComposer'
import { AppAiRunIndicator } from '../ai/AppAiRunIndicator'
import { isAppAiRunBlocked, isAppAiRunBusy } from '../ai/runStatus'
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
      runStatus = 'idle',
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
    const busy = isAppAiRunBusy(runStatus)
    const blocked = isAppAiRunBlocked(runStatus)
    const composerRunStatus = runStatus === 'using-tool' ? 'responding' : runStatus
    const hasAnswer = answer !== undefined && answer !== null && answer !== ''
    const showResponse = runStatus !== 'idle' || hasAnswer || error != null
    const showResponseHeader = busy || blocked || runStatus === 'error'

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
          disabled={disabled || blocked}
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
          runStatus={composerRunStatus}
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
              <AppAiRunIndicator
                className="app-quick-ask__response-status"
                status={runStatus}
              />
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
                aria-live={runStatus === 'completed' ? 'polite' : 'off'}
                className={[
                  'app-quick-ask__answer',
                  runStatus === 'error' ? 'app-quick-ask__answer--error' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                role={runStatus === 'error' ? 'alert' : 'region'}
              >
                {runStatus === 'error' ? (
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
            {answerActions && (hasAnswer || runStatus === 'error') ? (
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
