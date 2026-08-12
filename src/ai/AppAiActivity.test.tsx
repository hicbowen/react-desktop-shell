// @vitest-environment jsdom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { AppAiActivity } from './AppAiActivity'

describe('AppAiActivity', () => {
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

  it('renders a localized active phase with optional steps', () => {
    act(() =>
      root.render(
        <AppAiActivity
          detail="Searching the current workspace."
          status="searching"
          steps={[
            { id: 'prepare', label: 'Prepare', status: 'completed' },
            { id: 'search', label: 'Search', status: 'active' },
            { id: 'answer', label: 'Answer', status: 'pending' },
          ]}
        />,
      ),
    )

    expect(host.querySelector('[aria-label="Searching…"]')).not.toBeNull()
    expect(host.querySelector('.app-ai-activity--searching')).not.toBeNull()
    expect(host.querySelector('.app-progress-ring')).not.toBeNull()
    expect(host.querySelectorAll('[data-step-id]')).toHaveLength(3)
    expect(host.querySelector('[aria-current="step"]')?.textContent).toContain(
      'Search',
    )
    expect(host.textContent).toContain('Searching the current workspace.')
  })

  it('uses terminal status badges and renders a host action', () => {
    act(() =>
      root.render(
        <AppAiActivity
          action={<button type="button">Review</button>}
          ariaLabel="AI run status"
          label="Waiting for confirmation"
          status="awaiting-approval"
        />,
      ),
    )

    expect(host.querySelector('[aria-label="AI run status"]')).not.toBeNull()
    expect(host.querySelector('.app-status-badge--warning')).not.toBeNull()
    expect(host.querySelector('.app-progress-ring')).toBeNull()
    expect(host.textContent).toContain('Waiting for confirmation')
    expect(host.textContent).toContain('Review')
  })

  it('supports custom HTML attributes and compact styling', () => {
    act(() =>
      root.render(
        <AppAiActivity
          className="custom-activity"
          data-testid="activity"
          size="compact"
          status="completed"
        />,
      ),
    )

    expect(host.querySelector('[data-testid="activity"]')).not.toBeNull()
    expect(host.querySelector('.app-ai-activity--compact')).not.toBeNull()
    expect(host.querySelector('.app-status-badge--success')).not.toBeNull()
  })
})
