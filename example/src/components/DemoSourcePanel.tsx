import { useEffect, useRef, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { AppButton, AppExpander } from '../../../src'
import { useDemoI18n } from '../i18n/DemoI18nContext'

export function DemoSourcePanel({
  className,
  highlightedHtml,
  source,
}: {
  className?: string
  highlightedHtml?: string
  source: string
}) {
  const { messages } = useDemoI18n()
  const text = messages.componentPage
  const [copyStatus, setCopyStatus] =
    useState<'idle' | 'copied' | 'error'>('idle')
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current)
  }, [])

  const copySource = async () => {
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard write is unavailable')
      }
      await navigator.clipboard.writeText(source)
      setCopyStatus('copied')
    } catch {
      setCopyStatus('error')
    }

    if (resetTimerRef.current) clearTimeout(resetTimerRef.current)
    resetTimerRef.current = setTimeout(() => setCopyStatus('idle'), 1600)
  }

  const copied = copyStatus === 'copied'
  const buttonLabel = copied
    ? text.copied
    : copyStatus === 'error'
      ? text.copyFailed
      : text.copySource

  return (
    <AppExpander
      actions={
        <AppButton
          aria-live="polite"
          icon={copied ? <Check /> : <Copy />}
          onClick={() => void copySource()}
          size="compact"
        >
          {buttonLabel}
        </AppButton>
      }
      className={['demo-source-panel', className].filter(Boolean).join(' ')}
      title={text.sourceCode}
    >
      {highlightedHtml ? (
        <div
          className="demo-source-highlight app-shell__selectable"
          // The HTML is generated from trusted local TSX by Shiki at build time.
          dangerouslySetInnerHTML={{ __html: highlightedHtml }}
        />
      ) : (
        <pre className="demo-source-code app-shell__selectable" tabIndex={0}>
          <code>{source}</code>
        </pre>
      )}
    </AppExpander>
  )
}
