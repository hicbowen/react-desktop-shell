// @vitest-environment jsdom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppChangeReviewCard } from './AppChangeReviewCard'

describe('AppChangeReviewCard', () => {
  let host: HTMLDivElement
  let root: Root

  beforeEach(() => {
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)
  })

  afterEach(() => {
    act(() => root.unmount())
    host.remove()
  })

  const files = [
    {
      id: 'summary',
      path: 'Documents/meeting-summary.md',
      summary: 'Add the meeting decisions.',
      additions: 8,
      deletions: 0,
      diff: '@@ +1 @@\n+# Meeting summary',
    },
  ]

  it('renders files, change counts, status, and apply actions', () => {
    const onApply = vi.fn()
    const onReject = vi.fn()
    act(() =>
      root.render(
        <AppChangeReviewCard
          files={files}
          onApply={onApply}
          onReject={onReject}
          title="Review summary"
        />,
      ),
    )

    expect(host.querySelector('[aria-label="Review summary"]')).not.toBeNull()
    expect(host.querySelector('.app-status-badge--warning')).not.toBeNull()
    expect(host.textContent).toContain('Documents/meeting-summary.md')
    expect(host.textContent).toContain('+8')
    expect(host.textContent).toContain('−0')
    expect(host.textContent).toContain('Add the meeting decisions.')

    act(() =>
      Array.from(host.querySelectorAll('button')).find((button) =>
        button.textContent?.includes('Apply changes'),
      )?.click(),
    )
    expect(onApply).toHaveBeenCalledOnce()
    act(() =>
      Array.from(host.querySelectorAll('button')).find((button) =>
        button.textContent?.includes('Reject changes'),
      )?.click(),
    )
    expect(onReject).toHaveBeenCalledOnce()
  })

  it('toggles diff details and reports controlled expansion changes', () => {
    const onExpandedChange = vi.fn()
    act(() =>
      root.render(
        <AppChangeReviewCard
          expanded={false}
          files={files}
          onExpandedChange={onExpandedChange}
        />,
      ),
    )

    expect(host.textContent).not.toContain('# Meeting summary')
    act(() =>
      Array.from(host.querySelectorAll('button')).find((button) =>
        button.textContent?.includes('Show diff'),
      )?.click(),
    )
    expect(onExpandedChange).toHaveBeenCalledWith(true)
    expect(host.textContent).not.toContain('# Meeting summary')
  })

  it('shows applying progress and terminal states without actions', () => {
    act(() =>
      root.render(<AppChangeReviewCard files={files} status="applying" />),
    )
    expect(host.querySelector('.app-progress-ring')).not.toBeNull()
    expect(host.querySelectorAll('button')).toHaveLength(1)

    act(() => root.render(<AppChangeReviewCard files={[]} status="applied" />))
    expect(host.querySelector('.app-status-badge--success')).not.toBeNull()
    expect(host.textContent).toContain('No changes to review')
    expect(host.querySelectorAll('button')).toHaveLength(0)
  })
})
