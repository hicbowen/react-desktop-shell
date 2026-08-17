// @vitest-environment jsdom

import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { describe, expect, it, vi } from 'vitest'
import { AppToolActivity } from './AppToolActivity'

describe('AppToolActivity', () => {
  it('shows one compact spinner with specific activity text', () => {
    const host = document.createElement('div')
    const root = createRoot(host)
    const cancel = vi.fn()
    act(() =>
      root.render(
        <AppToolActivity
          description="Documents/meeting-summary.md"
          onCancel={cancel}
          title="Saving meeting summary…"
        />,
      ),
    )

    expect(host.querySelector('.app-progress-ring')).not.toBeNull()
    expect(host.querySelector('.app-progress-ring')?.getAttribute('aria-hidden')).toBe('true')
    expect(host.querySelector('.app-tool-activity')?.getAttribute('role')).toBe(
      'status',
    )
    expect(host.querySelector('.app-status-badge')).toBeNull()
    expect(host.textContent).toContain('Saving meeting summary…')
    expect(host.textContent).not.toContain('Running')
    expect(
      host.querySelector('.app-tool-activity')?.getAttribute('aria-busy'),
    ).toBe('true')
    act(() => host.querySelector<HTMLButtonElement>('button')?.click())
    expect(cancel).toHaveBeenCalledOnce()

    act(() => root.unmount())
  })

  it('renders quiet, distinct terminal status without a spinner', () => {
    const host = document.createElement('div')
    const root = createRoot(host)
    act(() =>
      root.render(
        <AppToolActivity status="canceled" title="Save meeting summary" />,
      ),
    )

    expect(host.querySelector('.app-progress-ring')).toBeNull()
    expect(host.querySelector('.app-tool-activity--canceled')).not.toBeNull()
    expect(host.textContent).toContain('Canceled')
    expect(host.textContent).not.toContain('Rejected')

    act(() => root.unmount())
  })

  it('renders an activity error without an approval control', () => {
    const host = document.createElement('div')
    const root = createRoot(host)
    act(() =>
      root.render(
        <AppToolActivity status="error" title="Prepare meeting summary" />,
      ),
    )

    expect(host.querySelector('.app-tool-activity--error')).not.toBeNull()
    expect(host.querySelector('button')).toBeNull()

    act(() => root.unmount())
  })
})
