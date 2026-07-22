import { useEffect, useRef, useState } from 'react'
import { useAppLocale } from '../localization/useAppLocale'
import type { AppCopyableTextProps } from './types'
import './AppCopyableText.css'

function CopyIcon({ copied }: { copied: boolean }) {
  return copied
    ? <svg aria-hidden="true" viewBox="0 0 16 16"><path d="m3 8 3 3 7-7" /></svg>
    : <svg aria-hidden="true" viewBox="0 0 16 16"><rect height="9" rx="1" width="8" x="5" y="2" /><path d="M3 5H2v9h8v-1" /></svg>
}

async function writeClipboard(text: string) {
  if (!navigator.clipboard?.writeText) throw new Error('Clipboard write is unavailable')
  await navigator.clipboard.writeText(text)
}

export function AppCopyableText({
  children,
  className,
  copiedDuration = 1600,
  copy = writeClipboard,
  disabled = false,
  onCopy,
  onCopyError,
  style,
  text,
  truncate = false,
}: AppCopyableTextProps) {
  const { messages } = useAppLocale()
  const [status, setStatus] = useState<'idle' | 'copied' | 'error'>('idle')
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }, [])

  const handleCopy = async () => {
    try {
      await copy(text)
      setStatus('copied')
      onCopy?.(text)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => setStatus('idle'), Math.max(0, copiedDuration))
    } catch (error) {
      setStatus('error')
      onCopyError?.(error)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => setStatus('idle'), Math.max(0, copiedDuration))
    }
  }

  const copied = status === 'copied'
  const statusText = copied ? messages.copyableText.copied : status === 'error' ? messages.copyableText.failed : ''

  return (
    <span className={['app-copyable-text', truncate ? 'app-copyable-text--truncate' : '', disabled ? 'app-copyable-text--disabled' : '', className].filter(Boolean).join(' ')} style={style}>
      <span className="app-copyable-text__content" title={truncate ? text : undefined}>{children ?? text}</span>
      <button aria-label={copied ? messages.copyableText.copied : messages.copyableText.copy} className="app-copyable-text__button" disabled={disabled} onClick={handleCopy} type="button"><CopyIcon copied={copied} /></button>
      <span aria-live="polite" className="app-copyable-text__status">{statusText}</span>
    </span>
  )
}
