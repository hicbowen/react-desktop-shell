import type { HTMLAttributes, ReactNode } from 'react'
import { useDemoI18n } from '../i18n/DemoI18nContext'
import { localizeSectionText } from '../i18n/sectionTranslations'

export function DemoPage({
  children,
  className = '',
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return <div {...rest} className={`demo-page ${className}`}>{children}</div>
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
