// @vitest-environment jsdom

import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { describe, expect, it, vi } from 'vitest'
import { AppToolCallCard } from './AppToolCallCard'

describe('AppToolCallCard', () => {
  it('reports a tool call awaiting approval through explicit actions', () => {
    const host = document.createElement('div')
    const root = createRoot(host)
    const approve = vi.fn()
    const reject = vi.fn()
    act(() =>
      root.render(
        <AppToolCallCard
          description="Creates one file"
          details="Documents/summary.md"
          onApprove={approve}
          onReject={reject}
          title="Save summary"
        />,
      ),
    )

    expect(host.textContent).toContain('Approval required')
    expect(host.querySelector('.app-tool-call-card')).not.toBeNull()
    expect(host.querySelector('.app-status-badge--warning')).not.toBeNull()
    expect(host.textContent).toContain('Documents/summary.md')
    const buttons = host.querySelectorAll('button')
    act(() => buttons[0].click())
    act(() => buttons[1].click())
    expect(reject).toHaveBeenCalledOnce()
    expect(approve).toHaveBeenCalledOnce()

    act(() => root.unmount())
  })

  it('shows controlled terminal status without approval actions', () => {
    const host = document.createElement('div')
    const root = createRoot(host)
    act(() =>
      root.render(<AppToolCallCard status="completed" title="Save summary" />),
    )

    expect(host.textContent).toContain('Completed')
    expect(host.querySelector('button')).toBeNull()

    act(() => root.unmount())
  })
})
