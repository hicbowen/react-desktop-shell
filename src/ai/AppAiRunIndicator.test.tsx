// @vitest-environment jsdom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { AppAiRunIndicator } from './AppAiRunIndicator'

describe('AppAiRunIndicator', () => {
  let host: HTMLDivElement
  let root: Root

  beforeEach(() => {
    ;(
      globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
    ).IS_REACT_ACT_ENVIRONMENT = true
    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)
  })

  afterEach(() => {
    act(() => root.unmount())
    host.remove()
  })

  it('renders a localized active status', () => {
    act(() =>
      root.render(
        <AppAiRunIndicator
          detail="Searching the current workspace."
          status="searching"
        />,
      ),
    )

    expect(host.querySelector('[aria-label="Searching…"]')).not.toBeNull()
    expect(
      host.querySelector('.app-ai-run-indicator--searching'),
    ).not.toBeNull()
    expect(host.querySelector('.app-progress-ring')).not.toBeNull()
    expect(host.textContent).toContain('Searching the current workspace.')
  })

  it('renders a quiet terminal status and an optional action', () => {
    act(() =>
      root.render(
        <AppAiRunIndicator
          action={<button type="button">Review</button>}
          appearance="card"
          ariaLabel="AI run status"
          label="Waiting for confirmation"
          status="awaiting-approval"
        />,
      ),
    )

    expect(host.querySelector('[aria-label="AI run status"]')).not.toBeNull()
    expect(host.querySelector('.app-status-badge--warning')).not.toBeNull()
    expect(host.querySelector('.app-progress-ring')).toBeNull()
    expect(host.querySelector('.app-ai-run-indicator--card')).not.toBeNull()
    expect(host.textContent).toContain('Waiting for confirmation')
    expect(host.textContent).toContain('Review')
  })

  it('does not render an idle status', () => {
    act(() => root.render(<AppAiRunIndicator status="idle" />))

    expect(host.querySelector('.app-ai-run-indicator')).toBeNull()
  })
})
