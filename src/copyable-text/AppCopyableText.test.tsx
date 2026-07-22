// @vitest-environment jsdom

import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AppCopyableText } from './AppCopyableText'

describe('AppCopyableText', () => {
  afterEach(() => vi.useRealTimers())

  it('copies text and announces temporary success', async () => {
    vi.useFakeTimers()
    const host = document.createElement('div')
    const root = createRoot(host)
    const copy = vi.fn().mockResolvedValue(undefined)
    act(() => root.render(<AppCopyableText copiedDuration={100} copy={copy} text="ABC-123" />))
    await act(async () => host.querySelector<HTMLButtonElement>('button')?.click())
    expect(copy).toHaveBeenCalledWith('ABC-123')
    expect(host.querySelector('button')?.getAttribute('aria-label')).toBe('Copied')
    act(() => vi.advanceTimersByTime(100))
    expect(host.querySelector('button')?.getAttribute('aria-label')).toBe('Copy')
    act(() => root.unmount())
  })

  it('reports clipboard errors without showing success', async () => {
    const host = document.createElement('div')
    const root = createRoot(host)
    const error = new Error('denied')
    const onCopyError = vi.fn()
    act(() => root.render(<AppCopyableText copy={() => Promise.reject(error)} onCopyError={onCopyError} text="secret" />))
    await act(async () => host.querySelector<HTMLButtonElement>('button')?.click())
    expect(onCopyError).toHaveBeenCalledWith(error)
    expect(host.querySelector('button')?.getAttribute('aria-label')).toBe('Copy')
    expect(host.querySelector('[aria-live="polite"]')?.textContent).toBe('Could not copy')
    act(() => root.unmount())
  })
})
