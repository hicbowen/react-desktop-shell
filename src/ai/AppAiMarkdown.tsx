import {
  Children,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react'
import {
  defaultUrlTransform,
  type Components,
  type ExtraProps,
} from 'react-markdown'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Checkmark16Regular } from '@fluentui/react-icons/svg/checkmark'
import { Copy16Regular } from '@fluentui/react-icons/svg/copy'
import { AppIconButton } from '../button'
import { useAppLocale } from '../localization/useAppLocale'
import {
  highlightMarkdownCode,
  resolveMarkdownLanguage,
} from './markdownHighlight'
import type { AppAiMarkdownProps } from './types'
import './AppAiMarkdown.css'

type MarkdownCodeProps = ComponentPropsWithoutRef<'code'> & ExtraProps
type MarkdownPreProps = ComponentPropsWithoutRef<'pre'> & ExtraProps
type MarkdownLinkProps = ComponentPropsWithoutRef<'a'> & ExtraProps
type MarkdownTableProps = ComponentPropsWithoutRef<'table'> & ExtraProps

function getTextContent(value: ReactNode): string {
  if (value == null || typeof value === 'boolean') return ''
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value)
  }
  if (Array.isArray(value)) return value.map(getTextContent).join('')
  if (isValidElement(value)) {
    const props = value.props as { children?: ReactNode }
    return getTextContent(props.children)
  }
  return ''
}

function getCodeContent(children: ReactNode) {
  return getTextContent(children).replace(/\n$/, '')
}

function getCodeLanguage(children: ReactNode) {
  const firstChild = Children.toArray(children)[0]
  if (!isValidElement(firstChild)) return undefined
  const props = firstChild.props as { className?: string }
  return props.className?.match(/(?:^|\s)language-([^\s]+)/)?.[1]
}

function MarkdownCode({
  children,
  className,
  node,
  ...rest
}: MarkdownCodeProps) {
  void node
  return (
    <code
      {...rest}
      className={['app-ai-markdown__code', className].filter(Boolean).join(' ')}
    >
      {children}
    </code>
  )
}

function MarkdownLink({ href, node, ...rest }: MarkdownLinkProps) {
  void node
  const external = href != null && /^https?:\/\//i.test(href)
  return (
    <a
      {...rest}
      href={href}
      rel={external ? 'noreferrer' : rest.rel}
      target={external ? '_blank' : rest.target}
    />
  )
}

function MarkdownTable({ children, node, ...rest }: MarkdownTableProps) {
  void node
  return (
    <div className="app-ai-markdown__table-wrap">
      <table {...rest}>{children}</table>
    </div>
  )
}

function MarkdownCodeBlock({
  children,
  className,
  node,
  onCopyCode,
  highlightCode,
  copyCode,
  ...rest
}: MarkdownPreProps & {
  onCopyCode?: (code: string) => void | Promise<void>
  highlightCode: boolean
  copyCode: boolean
}) {
  void node
  const { messages } = useAppLocale()
  const text = messages.ai
  const [status, setStatus] = useState<'idle' | 'copied' | 'error'>('idle')
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const code = getCodeContent(children)
  const language = getCodeLanguage(children)
  const resolvedLanguage = resolveMarkdownLanguage(language)
  const highlightKey = `${resolvedLanguage ?? 'plain'}\u0000${code}`
  const [highlightState, setHighlightState] = useState<{
    key: string
    html: string | null
  }>({ key: '', html: null })
  const highlightedHtml =
    highlightCode && highlightState.key === highlightKey
      ? highlightState.html
      : null

  useEffect(() => {
    let active = true

    if (!highlightCode || resolvedLanguage == null) {
      return () => {
        active = false
      }
    }

    const timeout = setTimeout(() => {
      void highlightMarkdownCode(code, resolvedLanguage).then((html) => {
        if (active) setHighlightState({ key: highlightKey, html })
      })
    }, 120)

    return () => {
      active = false
      clearTimeout(timeout)
    }
  }, [code, highlightCode, highlightKey, resolvedLanguage])

  useEffect(
    () => () => {
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current)
    },
    [],
  )

  const setTemporaryStatus = (next: 'copied' | 'error') => {
    setStatus(next)
    if (timeoutRef.current !== null) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setStatus('idle'), 1600)
  }

  const handleCopy = async () => {
    try {
      if (onCopyCode) {
        await onCopyCode(code)
      } else if (
        typeof navigator !== 'undefined' &&
        navigator.clipboard?.writeText
      ) {
        await navigator.clipboard.writeText(code)
      } else {
        throw new Error('Clipboard write is unavailable')
      }
      setTemporaryStatus('copied')
    } catch {
      setTemporaryStatus('error')
    }
  }

  const copied = status === 'copied'
  const buttonLabel = copied ? text.codeCopied : text.copyCode
  const statusText = copied
    ? text.codeCopied
    : status === 'error'
      ? text.codeCopyFailed
      : ''

  return (
    <div
      className={['app-ai-markdown__code-block', className]
        .filter(Boolean)
        .join(' ')}
    >
      {copyCode ? (
        <div className="app-ai-markdown__code-header">
          <span>{language ?? text.code}</span>
          <AppIconButton
            appearance="subtle"
            ariaLabel={buttonLabel}
            icon={copied ? <Checkmark16Regular /> : <Copy16Regular />}
            onClick={handleCopy}
            shape="rounded"
            size="compact"
          />
        </div>
      ) : null}
      {highlightedHtml != null ? (
        <div
          className="app-ai-markdown__highlighted-code"
          dangerouslySetInnerHTML={{ __html: highlightedHtml }}
        />
      ) : (
        <pre {...rest}>{children}</pre>
      )}
      <span aria-live="polite" className="app-ai-markdown__status">
        {statusText}
      </span>
    </div>
  )
}

export function AppAiMarkdown({
  className,
  components,
  content,
  copyCode = true,
  highlightCode = true,
  onCopyCode,
  style,
  ...rest
}: AppAiMarkdownProps) {
  const defaultComponents: Components = {
    a: MarkdownLink,
    code: MarkdownCode,
    table: MarkdownTable,
    ...(copyCode || highlightCode
      ? {
          pre: (props) => (
            <MarkdownCodeBlock
              {...props}
              copyCode={copyCode}
              highlightCode={highlightCode}
              onCopyCode={onCopyCode}
            />
          ),
        }
      : {}),
  }

  return (
    <div
      {...rest}
      className={['app-ai-markdown', className].filter(Boolean).join(' ')}
      style={style}
    >
      <Markdown
        components={{ ...defaultComponents, ...components }}
        remarkPlugins={[remarkGfm]}
        skipHtml
        urlTransform={defaultUrlTransform}
      >
        {content}
      </Markdown>
    </div>
  )
}
