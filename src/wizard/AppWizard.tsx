import { useEffect, useId, useRef, useState } from 'react'
import { AppButton } from '../button/AppButton'
import { useAppLocale } from '../localization/useAppLocale'
import { AppScrollArea } from '../scroll-area/AppScrollArea'
import type { AppWizardProps, AppWizardStep } from './types'
import './AppWizard.css'

const stepScrollMargin = 8

function resolveStep(
  steps: readonly AppWizardStep[],
  key: string | undefined,
) {
  return steps.find((step) => step.key === key) ?? steps[0]
}

export function AppWizard({
  ariaLabel,
  className,
  completeLabel,
  defaultValue,
  onCancel,
  onComplete,
  onNext,
  onValueChange,
  primaryDisabled = false,
  steps,
  style,
  value,
}: AppWizardProps) {
  const { messages } = useAppLocale()
  const text = messages.wizard
  const generatedId = useId().replace(/:/g, '')
  const controlled = value !== undefined
  const [internalValue, setInternalValue] = useState<string | undefined>(
    () => resolveStep(steps, defaultValue)?.key,
  )
  const currentStep = resolveStep(steps, controlled ? value : internalValue)
  const currentKey = currentStep?.key
  const currentIndex = currentStep
    ? steps.findIndex((step) => step.key === currentStep.key)
    : -1
  const [pending, setPending] = useState<'next' | 'complete' | null>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const stepRefs = useRef(new Map<string, HTMLLIElement>())
  const stepsScrollRef = useRef<HTMLDivElement>(null)
  const previousKeyRef = useRef(currentKey)

  useEffect(() => {
    if (currentKey === undefined || currentKey === previousKeyRef.current) {
      return
    }

    previousKeyRef.current = currentKey
    headingRef.current?.focus()

    const stepNode = stepRefs.current.get(currentKey)
    const viewport = stepsScrollRef.current
    if (!stepNode || !viewport || typeof viewport.scrollBy !== 'function') {
      return
    }

    const viewportRect = viewport.getBoundingClientRect()
    const stepRect = stepNode.getBoundingClientRect()
    if (viewportRect.height <= 0 || stepRect.height <= 0) {
      return
    }

    const visibleTop = viewportRect.top + stepScrollMargin
    const visibleBottom = viewportRect.bottom - stepScrollMargin
    const scrollDelta =
      stepRect.top < visibleTop
        ? stepRect.top - visibleTop
        : stepRect.bottom > visibleBottom
          ? stepRect.bottom - visibleBottom
          : 0

    if (scrollDelta === 0) {
      return
    }

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    viewport.scrollBy({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      top: scrollDelta,
    })
  }, [currentKey])

  if (!currentStep || currentIndex < 0) {
    return null
  }

  const isFirst = currentIndex === 0
  const isLast = currentIndex === steps.length - 1
  const busy = pending !== null
  const headingId = `${generatedId}-heading`

  const selectStep = (step: AppWizardStep) => {
    if (!controlled) {
      setInternalValue(step.key)
    }
    onValueChange?.(step.key)
  }

  const handleBack = () => {
    if (isFirst || busy) return
    const previousStep = steps[currentIndex - 1]
    if (previousStep) selectStep(previousStep)
  }

  const handleNext = async () => {
    if (isLast || busy || primaryDisabled) return

    setPending('next')
    if (!onNext) {
      const nextStep = steps[currentIndex + 1]
      if (nextStep) selectStep(nextStep)
      setPending(null)
      return
    }

    try {
      const result = await onNext(currentStep)
      if (result === false) return

      const nextStep = steps[currentIndex + 1]
      if (nextStep) selectStep(nextStep)
    } catch {
      // The current step owns validation and error feedback.
    } finally {
      setPending(null)
    }
  }

  const handleComplete = async () => {
    if (!isLast || busy || primaryDisabled) return

    setPending('complete')
    try {
      await onComplete()
    } catch {
      // The host owns completion errors and can keep the wizard mounted.
    } finally {
      setPending(null)
    }
  }

  const rootClassName = ['app-wizard', className].filter(Boolean).join(' ')

  return (
    <div
      aria-busy={busy || undefined}
      className={rootClassName}
      style={style}
    >
      <div className="app-wizard__layout">
        <nav
          aria-label={ariaLabel ?? text.steps}
          className="app-wizard__steps"
        >
          <AppScrollArea
            className="app-wizard__steps-scroll"
            gutter="stable"
            ref={stepsScrollRef}
          >
            <ol className="app-wizard__step-list">
              {steps.map((step, index) => {
                const current = index === currentIndex
                const complete = index < currentIndex
                const stepClassName = [
                  'app-wizard__step',
                  current ? 'app-wizard__step--current' : '',
                  complete ? 'app-wizard__step--complete' : '',
                ]
                  .filter(Boolean)
                  .join(' ')

                return (
                  <li
                    aria-current={current ? 'step' : undefined}
                    className={stepClassName}
                    key={step.key}
                    ref={(node) => {
                      if (node) {
                        stepRefs.current.set(step.key, node)
                      } else {
                        stepRefs.current.delete(step.key)
                      }
                    }}
                  >
                    <span aria-hidden="true" className="app-wizard__step-marker">
                      {complete ? '✓' : index + 1}
                    </span>
                    <span className="app-wizard__step-label">
                      <span className="app-wizard__step-title">{step.title}</span>
                      {step.optional ? (
                        <span className="app-wizard__step-optional">
                          {text.optional}
                        </span>
                      ) : null}
                    </span>
                  </li>
                )
              })}
            </ol>
          </AppScrollArea>
        </nav>

        <div className="app-wizard__compact-progress">
          <div className="app-wizard__compact-meta" aria-live="polite">
            <span>{text.step(currentIndex + 1, steps.length)}</span>
          </div>
          <div
            aria-label={text.steps}
            aria-valuemax={steps.length}
            aria-valuemin={1}
            aria-valuenow={currentIndex + 1}
            className="app-wizard__compact-track"
            role="progressbar"
          >
            <span
              className="app-wizard__compact-indicator"
              style={{ width: `${((currentIndex + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        <section
          aria-labelledby={headingId}
          className="app-wizard__main"
        >
          <header className="app-wizard__header">
            <h2 id={headingId} ref={headingRef} tabIndex={-1}>
              {currentStep.title}
            </h2>
            {currentStep.description ? (
              <p>{currentStep.description}</p>
            ) : null}
          </header>
          <div className="app-wizard__content">{currentStep.content}</div>
        </section>

        <footer className="app-wizard__footer">
          {onCancel ? (
            <AppButton disabled={busy} onClick={onCancel}>
              {messages.common.cancel}
            </AppButton>
          ) : null}
          <div className="app-wizard__actions">
            <AppButton disabled={isFirst || busy} onClick={handleBack}>
              {text.back}
            </AppButton>
            {isLast ? (
              <AppButton
                appearance="primary"
                disabled={primaryDisabled}
                loading={pending === 'complete'}
                onClick={handleComplete}
              >
                {completeLabel ?? text.finish}
              </AppButton>
            ) : (
              <AppButton
                appearance="primary"
                disabled={primaryDisabled}
                loading={pending === 'next'}
                onClick={handleNext}
              >
                {text.next}
              </AppButton>
            )}
          </div>
        </footer>
      </div>
    </div>
  )
}
