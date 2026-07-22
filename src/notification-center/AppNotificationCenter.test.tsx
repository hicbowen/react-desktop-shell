// @vitest-environment jsdom

import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { describe, expect, it, vi } from 'vitest'
import { AppNotificationCenter, AppNotificationIndicator } from './AppNotificationCenter'

const notifications = [
  { id: 'build', title: 'Build complete', body: 'Release is ready', status: 'success' as const, read: false, dismissible: true, actions: [{ key: 'open', label: 'Open', primary: true }] },
  { id: 'sync', title: 'Sync paused', read: true },
]

describe('AppNotificationCenter', () => {
  it('emits controlled notification requests', () => {
    const host = document.createElement('div')
    const root = createRoot(host)
    const invoke = vi.fn()
    const action = vi.fn()
    const markRead = vi.fn()
    const dismiss = vi.fn()
    const markAll = vi.fn()
    const clear = vi.fn()
    act(() => root.render(<AppNotificationCenter notifications={notifications} onAction={action} onClearAll={clear} onDismiss={dismiss} onInvoke={invoke} onMarkAllRead={markAll} onMarkRead={markRead} />))
    const buttons = Array.from(host.querySelectorAll<HTMLButtonElement>('button'))
    act(() => buttons.find((button) => button.textContent === 'Build completeRelease is ready')?.click())
    act(() => buttons.find((button) => button.textContent === 'Open')?.click())
    act(() => buttons.find((button) => button.getAttribute('aria-label') === 'Mark as read')?.click())
    act(() => buttons.find((button) => button.getAttribute('aria-label') === 'Dismiss notification')?.click())
    act(() => buttons.find((button) => button.textContent === 'Mark all as read')?.click())
    act(() => buttons.find((button) => button.textContent === 'Clear all')?.click())
    expect(invoke).toHaveBeenCalledWith('build')
    expect(action).toHaveBeenCalledWith('build', 'open')
    expect(markRead).toHaveBeenCalledWith('build', true)
    expect(dismiss).toHaveBeenCalledWith('build')
    expect(markAll).toHaveBeenCalledOnce()
    expect(clear).toHaveBeenCalledOnce()
    act(() => root.unmount())
  })

  it('renders empty content and caps unread indicator counts', () => {
    const host = document.createElement('div')
    const root = createRoot(host)
    act(() => root.render(<><AppNotificationCenter notifications={[]} /><AppNotificationIndicator max={1} notifications={notifications.map(() => ({ read: false }))} /></>))
    expect(host.textContent).toContain('No notifications')
    expect(host.querySelector('.app-notification-indicator')?.textContent).toBe('1+')
    expect(host.querySelector('.app-notification-indicator')?.getAttribute('aria-label')).toBe('2 unread notifications')
    act(() => root.unmount())
  })

  it('does not expose notification content as a button without an invoke handler', () => {
    const host = document.createElement('div')
    const root = createRoot(host)
    act(() => root.render(<AppNotificationCenter notifications={[notifications[0]]} />))
    expect(host.querySelector('.app-notification-center__main')?.tagName).toBe('DIV')
    act(() => root.unmount())
  })
})
