import { useEffect, useRef, useState } from 'react'
import { Checkmark16Regular } from '@fluentui/react-icons/svg/checkmark'
import { Copy16Regular } from '@fluentui/react-icons/svg/copy'
import { useAppLocale } from '../localization/useAppLocale'
import type { AppCopyableTextProps } from './types'
import './AppCopyableText.css'

function CopyIcon({ copied }: { copied: boolean }) {
  return copied
    ? <Checkmark16Regular aria-hidden="true" focusable="false" />
    : <Copy16Regular aria-hidden="true" focusable="false" />
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
