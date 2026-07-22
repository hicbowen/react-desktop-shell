// @vitest-environment jsdom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppSearchBox } from './AppSearchBox'

describe('AppSearchBox', () => {
  let container: HTMLDivElement
  let root: Root
  beforeEach(() => { vi.useFakeTimers(); container = document.createElement('div'); document.body.append(container); root = createRoot(container) })
  afterEach(() => { act(() => root.unmount()); container.remove(); vi.useRealTimers() })
  const input = () => container.querySelector<HTMLInputElement>('input')!

  it('submits the current value on Enter', () => {
    const onSearch = vi.fn()
    act(() => root.render(<AppSearchBox defaultValue="report" onSearch={onSearch} />))
    act(() => input().dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' })))
    expect(onSearch).toHaveBeenCalledWith('report')
  })

  it('clears on Escape', () => {
    const onValueChange = vi.fn()
    const onSearch = vi.fn()
    act(() => root.render(<AppSearchBox defaultValue="query" onSearch={onSearch} onValueChange={onValueChange} />))
    act(() => input().dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Escape' })))
    expect(input().value).toBe('')
    expect(onValueChange).toHaveBeenCalledWith('')
    expect(onSearch).toHaveBeenCalledWith('')
  })

  it('optionally debounces search requests', () => {
    const onSearch = vi.fn()
    act(() => root.render(<AppSearchBox debounceMs={200} onSearch={onSearch} />))
    act(() => { const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!; setter.call(input(), 'alpha'); input().dispatchEvent(new Event('input', { bubbles: true })) })
    expect(onSearch).not.toHaveBeenCalled()
    act(() => vi.advanceTimersByTime(200))
    expect(onSearch).toHaveBeenCalledWith('alpha')
  })
})
