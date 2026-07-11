import type { ReactNode } from 'react'

export function RailBadge({
  content,
  ariaLabel,
  collapsed,
}: {
  content: ReactNode
  ariaLabel?: string
  collapsed: boolean
}) {
  const hasBadge =
    content !== undefined && content !== null && content !== false

  if (!hasBadge) {
    return null
  }

  if (collapsed) {
    return (
      <span className="app-rail__badge app-rail__badge--collapsed">
        <span className="app-rail__badge-indicator" aria-hidden="true" />
        <span className="app-rail__badge-accessible">
          {ariaLabel ?? content}
        </span>
      </span>
    )
  }

  return (
    <span className="app-rail__badge">
      <span
        className="app-rail__badge-content"
        aria-hidden={ariaLabel ? true : undefined}
      >
        {content}
      </span>
      {ariaLabel ? (
        <span className="app-rail__badge-accessible">{ariaLabel}</span>
      ) : null}
    </span>
  )
}
