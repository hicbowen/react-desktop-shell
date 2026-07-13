import type { HTMLAttributes, ReactNode } from 'react'

export function DemoPage({
  children,
  className = '',
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return <div {...rest} className={`demo-page ${className}`}>{children}</div>
}

export function DemoSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return <section className="demo-section"><header><h2>{title}</h2>{description ? <p>{description}</p> : null}</header>{children}</section>
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
