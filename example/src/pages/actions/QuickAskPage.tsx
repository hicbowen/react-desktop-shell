import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AppButton,
  AppCommandProvider,
  AppQuickAsk,
  formatAppShortcut,
  type AppCommand,
  type AppQuickAskStatus,
} from '../../../../src'
import { Copy, Open16Regular, Sparkles } from '../../components/fluentIcons'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'
import { useDemoCopy } from '../../i18n/interactiveTranslations'

const shortcut = { ctrl: true, shift: true, key: 'k' } as const

export function AppQuickAskPage() {
  const t = useDemoCopy()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [answer, setAnswer] = useState('')
  const [lastPrompt, setLastPrompt] = useState('')
  const [status, setStatus] = useState<AppQuickAskStatus>('idle')
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<number | null>(null)
  const sampleAnswer = t(
    'Use a top-level spotlight surface for focus and dismissal, keep AI state in the host, and hide rather than destroy the native window so generation can continue.',
  )

  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    },
    [],
  )

  const stopTimer = () => {
    if (timerRef.current === null) return
    window.clearTimeout(timerRef.current)
    timerRef.current = null
  }
  const submit = (prompt: string) => {
    stopTimer()
    setLastPrompt(prompt)
    setAnswer('')
    setCopied(false)
    setStatus('submitting')
    let cursor = 0
    const stream = () => {
      cursor = Math.min(sampleAnswer.length, cursor + 3)
      setAnswer(sampleAnswer.slice(0, cursor))
      if (cursor < sampleAnswer.length) {
        timerRef.current = window.setTimeout(stream, 28)
      } else {
        timerRef.current = null
        setStatus('completed')
      }
    }
    timerRef.current = window.setTimeout(() => {
      setStatus('streaming')
      stream()
    }, 420)
  }
  const cancel = () => {
    stopTimer()
    setAnswer((current) => current || t('Generation stopped.'))
    setStatus('completed')
  }
  const commands = useMemo<AppCommand[]>(
    () => [
      {
        id: 'ai.quickAsk',
        label: t('Open quick ask'),
        icon: <Sparkles />,
        shortcut,
        execute: () => setOpen((current) => !current),
      },
    ],
    [t],
  )

  return (
    <DemoPage>
      <DemoSection
        title="Quick AI conversation"
        description="Open a focused prompt with a command, stream a host-owned response, and hide it without cancelling the work."
      >
        <DemoPreview className="demo-component-row">
          <AppCommandProvider commands={commands}>
            <AppButton icon={<Sparkles />} onClick={() => setOpen(true)}>
              {t('Open quick ask')} · {formatAppShortcut(shortcut)}
            </AppButton>
            <AppQuickAsk
              answer={answer ? <p>{answer}</p> : undefined}
              answerActions={
                <>
                  <AppButton
                    appearance="subtle"
                    disabled={!answer}
                    icon={<Copy />}
                    onClick={() => {
                      void navigator.clipboard?.writeText(answer)
                      setCopied(true)
                    }}
                    size="compact"
                  >
                    {copied ? t('Copied') : t('Copy')}
                  </AppButton>
                  <AppButton
                    appearance="subtle"
                    disabled={
                      !lastPrompt ||
                      status === 'submitting' ||
                      status === 'streaming'
                    }
                    icon={<Open16Regular />}
                    onClick={() => submit(lastPrompt)}
                    size="compact"
                  >
                    {t('Ask again')}
                  </AppButton>
                </>
              }
              footer={
                <>
                  <span>
                    <kbd>Enter</kbd> {t('to send')}
                  </span>
                  <span>
                    <kbd>Shift+Enter</kbd> {t('for a new line')}
                  </span>
                  <span>
                    <kbd>Esc</kbd> {t('to hide')}
                  </span>
                </>
              }
              onCancel={cancel}
              onOpenChange={setOpen}
              onSubmit={submit}
              onValueChange={setDraft}
              open={open}
              status={status}
              value={draft}
            />
          </AppCommandProvider>
        </DemoPreview>
        <p className="demo-note">
          {t(
            'The simulated request continues while the surface is hidden. Use the same shortcut to reopen the current response.',
          )}
        </p>
      </DemoSection>
    </DemoPage>
  )
}
