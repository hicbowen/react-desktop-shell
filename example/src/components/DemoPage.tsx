import {
  Children,
  cloneElement,
  isValidElement,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react'
import { useDemoI18n } from '../i18n/DemoI18nContext'
import { localizeInteractiveText } from '../i18n/interactiveTranslations'
import { localizeSectionText } from '../i18n/sectionTranslations'

const translatedPropNames = new Set([
  'aria-label',
  'ariaLabel',
  'cancelText',
  'confirmText',
  'content',
  'description',
  'dismissLabel',
  'emptyContent',
  'emptyText',
  'error',
  'label',
  'message',
  'menuAriaLabel',
  'placeholder',
  'rejectDescription',
  'secondaryText',
  'tertiaryText',
  'title',
])

function localizeStructuredValue(
  value: unknown,
  locale: 'zh-CN' | 'en-US',
  propertyName?: string,
): unknown {
  if (typeof value === 'string') {
    return propertyName && translatedPropNames.has(propertyName)
      ? localizeInteractiveText(locale, value)
      : value
  }
  if (isValidElement(value)) return localizeElement(value, locale)
  if (Array.isArray(value)) {
    return value.map((item) => localizeStructuredValue(item, locale))
  }
  if (
    value &&
    typeof value === 'object' &&
    Object.getPrototypeOf(value) === Object.prototype
  ) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        localizeStructuredValue(item, locale, key),
      ]),
    )
  }
  return value
}

function localizeElement(
  element: ReactElement<Record<string, unknown>>,
  locale: 'zh-CN' | 'en-US',
) {
  const props = Object.fromEntries(
    Object.entries(element.props).map(([key, value]) => {
      if (key === 'children') {
        return [key, localizeNode(value as ReactNode, locale)]
      }
      return [key, localizeStructuredValue(value, locale, key)]
    }),
  )
  return cloneElement(element, props)
}

function localizeNode(
  node: ReactNode,
  locale: 'zh-CN' | 'en-US',
): ReactNode {
  if (typeof node === 'string') {
    const leadingWhitespace = node.match(/^\s*/)?.[0] ?? ''
    const trailingWhitespace = node.match(/\s*$/)?.[0] ?? ''
    const visibleText = node.slice(
      leadingWhitespace.length,
      node.length - trailingWhitespace.length,
    )
    if (!visibleText) return node
    return `${leadingWhitespace}${localizeInteractiveText(locale, visibleText)}${trailingWhitespace}`
  }
  if (isValidElement(node)) {
    return localizeElement(
      node as ReactElement<Record<string, unknown>>,
      locale,
    )
  }
  if (Array.isArray(node)) {
    return Children.map(node, (child) => localizeNode(child, locale))
  }
  return node
}

export function DemoPage({
  children,
  className = '',
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  const { locale } = useDemoI18n()
  return <div {...rest} className={`demo-page ${className}`}>{localizeNode(children, locale)}</div>
}

export function DemoSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  const { locale } = useDemoI18n()
  const localizedTitle = localizeSectionText(locale, title)
  const localizedDescription = localizeSectionText(locale, description)
  return <section className="demo-section"><header><h2>{localizedTitle}</h2>{localizedDescription ? <p>{localizedDescription}</p> : null}</header>{children}</section>
}

export function DemoPreview({
  children,
  className = '',
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return <div {...rest} className={`demo-preview ${className}`}>{children}</div>
}

export function DemoControls({ children }: { children: ReactNode }) {
  return <div className="demo-controls">{children}</div>
}
