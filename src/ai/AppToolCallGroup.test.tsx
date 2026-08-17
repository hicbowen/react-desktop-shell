// @vitest-environment jsdom

import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { describe, expect, it, vi } from 'vitest'
import { AppToolCallGroup } from './AppToolCallGroup'
import type { AppToolCallGroupItem } from './types'

const activeItems: AppToolCallGroupItem[] = [
  { id: 'read', status: 'completed', title: 'Read project README' },
  { id: 'search', status: 'running', title: 'Search meeting notes' },
  { id: 'write', status: 'running', title: 'Prepare meeting summary' },
]

describe('AppToolCallGroup', () => {
  it('aggregates parallel progress into one animated spinner', () => {
    const host = document.createElement('div')
    const root = createRoot(host)
    const cancel = vi.fn()
    act(() =>
      root.render(<AppToolCallGroup items={activeItems} onCancel={cancel} />),
    )

    expect(host.querySelectorAll('.app-progress-ring')).toHaveLength(1)
    expect(
      host.querySelectorAll('.app-tool-activity__running-dot'),
    ).toHaveLength(2)
    expect(host.textContent).toContain('1 of 3 completed')
    expect(
      host.querySelector('.app-tool-call-group')?.getAttribute('aria-busy'),
    ).toBe('true')
    const stopButtons = Array.from(host.querySelectorAll('button')).filter(
      (button) => button.textContent === 'Stop',
    )
    act(() => stopButtons[0]?.click())
    expect(cancel).toHaveBeenCalledWith(activeItems[1])

    act(() => root.unmount())
  })

  it('supports disclosure without changing item state', () => {
    const host = document.createElement('div')
    const root = createRoot(host)
    const onExpandedChange = vi.fn()
    act(() =>
      root.render(
        <AppToolCallGroup
          items={activeItems}
          onExpandedChange={onExpandedChange}
        />,
      ),
    )

    expect(host.querySelector('.app-tool-call-group__list')).not.toBeNull()
    act(() =>
      host
        .querySelector<HTMLButtonElement>(
          'button[aria-label="Hide tool activity"]',
        )
        ?.click(),
    )
    expect(onExpandedChange).toHaveBeenCalledWith(false)
    expect(host.querySelector('.app-tool-call-group__list')).toBeNull()

    act(() => root.unmount())
  })

  it('replaces progress with one quiet aggregate terminal status', () => {
    const host = document.createElement('div')
    const root = createRoot(host)
    const completedItems = activeItems.map((item) => ({
      ...item,
      status: 'completed' as const,
    }))
    act(() => root.render(<AppToolCallGroup items={completedItems} />))

    expect(host.querySelector('.app-progress-ring')).toBeNull()
    expect(host.querySelectorAll('.app-status-badge')).toHaveLength(1)
    expect(host.querySelector('.app-status-badge--success')).not.toBeNull()
    expect(host.textContent).toContain('3 tools completed')

    act(() => root.unmount())
  })

  it('keeps active progress visible while surfacing a completed failure count', () => {
    const host = document.createElement('div')
    const root = createRoot(host)
    const mixedItems: AppToolCallGroupItem[] = [
      { id: 'read', status: 'completed', title: 'Read project README' },
      { id: 'search', status: 'error', title: 'Search meeting notes' },
      { id: 'write', status: 'running', title: 'Prepare meeting summary' },
    ]
    act(() => root.render(<AppToolCallGroup items={mixedItems} />))

    expect(host.querySelectorAll('.app-progress-ring')).toHaveLength(1)
    expect(host.textContent).toContain('1 of 3 completed · 1 failed')
    expect(
      host.querySelector('.app-tool-call-group')?.getAttribute('aria-busy'),
    ).toBe('true')

    act(() => root.unmount())
  })
})
