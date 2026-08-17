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

  it('uses a plain spinner label and optional cancellation while running', () => {
    const host = document.createElement('div')
    const root = createRoot(host)
    const cancel = vi.fn()
    act(() =>
      root.render(
        <AppToolCallCard
          onCancel={cancel}
          status="running"
          statusLabel="Saving meeting summary…"
          title="Save summary"
        />,
      ),
    )

    expect(
      host.querySelector('.app-tool-call-card')?.getAttribute('aria-busy'),
    ).toBe('true')
    expect(host.querySelector('.app-progress-ring')).not.toBeNull()
    expect(host.querySelector('.app-status-badge')).toBeNull()
    expect(host.textContent).toContain('Saving meeting summary…')
    const stop = Array.from(host.querySelectorAll('button')).find(
      (button) => button.textContent === 'Stop',
    )
    act(() => stop?.click())
    expect(cancel).toHaveBeenCalledOnce()

    act(() => root.unmount())
  })

  it('collapses historical details and distinguishes canceled from rejected', () => {
    const host = document.createElement('div')
    const root = createRoot(host)
    const onExpandedChange = vi.fn()
    act(() =>
      root.render(
        <AppToolCallCard
          details="No files were changed"
          onExpandedChange={onExpandedChange}
          status="canceled"
          title="Save summary"
        />,
      ),
    )

    expect(host.textContent).toContain('Canceled')
    expect(host.textContent).not.toContain('Rejected')
    expect(host.textContent).not.toContain('No files were changed')
    const toggle = Array.from(host.querySelectorAll('button')).find(
      (button) => button.textContent === 'Show details',
    )
    act(() => toggle?.click())
    expect(onExpandedChange).toHaveBeenCalledWith(true)
    expect(host.textContent).toContain('No files were changed')

    act(() => root.unmount())
  })
})
