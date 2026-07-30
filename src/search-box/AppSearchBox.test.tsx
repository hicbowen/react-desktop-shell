// @vitest-environment jsdom

import { act, useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppSearchBox } from './AppSearchBox'

describe('AppSearchBox', () => {
  let container: HTMLDivElement
  let root: Root
  beforeEach(() => {
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
      .IS_REACT_ACT_ENVIRONMENT = true
    vi.useFakeTimers()
    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)
  })
  afterEach(() => { act(() => root.unmount()); container.remove(); vi.useRealTimers() })
  const input = () => container.querySelector<HTMLInputElement>('input')!
  const setInputValue = (value: string) =>
    act(() => {
      const setter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        'value',
      )!.set!
      setter.call(input(), value)
      input().dispatchEvent(new Event('input', { bubbles: true }))
    })
  const startComposition = () =>
    act(() =>
      input().dispatchEvent(
        new CompositionEvent('compositionstart', { bubbles: true }),
      ),
    )
  const endComposition = () =>
    act(() =>
      input().dispatchEvent(
        new CompositionEvent('compositionend', { bubbles: true }),
      ),
    )

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
    setInputValue('alpha')
    expect(onSearch).not.toHaveBeenCalled()
    act(() => vi.advanceTimersByTime(200))
    expect(onSearch).toHaveBeenCalledWith('alpha')
  })

  it('does not submit or clear from composition keyboard events', () => {
    const onSearch = vi.fn()
    const onValueChange = vi.fn()
    act(() =>
      root.render(
        <AppSearchBox
          defaultValue="query"
          onSearch={onSearch}
          onValueChange={onValueChange}
        />,
      ),
    )
    startComposition()
    act(() =>
      input().dispatchEvent(
        new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          key: 'Enter',
        }),
      ),
    )
    act(() =>
      input().dispatchEvent(
        new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          key: 'Escape',
        }),
      ),
    )

    expect(onSearch).not.toHaveBeenCalled()
    expect(onValueChange).not.toHaveBeenCalled()
    expect(input().value).toBe('query')

    endComposition()
    act(() =>
      input().dispatchEvent(
        new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }),
      ),
    )
    expect(onSearch).toHaveBeenCalledWith('query')
  })

  it('ignores native keyboard events marked as composing', () => {
    const onSearch = vi.fn()
    act(() =>
      root.render(
        <AppSearchBox defaultValue="query" onSearch={onSearch} />,
      ),
    )
    act(() =>
      input().dispatchEvent(
        new KeyboardEvent('keydown', {
          bubbles: true,
          isComposing: true,
          key: 'Enter',
        }),
      ),
    )
    expect(onSearch).not.toHaveBeenCalled()
  })

  it('preserves controlled composition text across parent renders', () => {
    const onValueChange = vi.fn()
    function Harness() {
      const [value, setValue] = useState('')
      return (
        <>
          <AppSearchBox
            onValueChange={(next) => {
              onValueChange(next)
              setValue(next)
            }}
            value={value}
          />
          <span data-controlled-value>{value.toUpperCase()}</span>
        </>
      )
    }
    act(() => root.render(<Harness />))

    startComposition()
    setInputValue('nihao')
    expect(onValueChange).toHaveBeenCalledWith('nihao')
    expect(input().value).toBe('nihao')
    expect(
      container.querySelector('[data-controlled-value]')?.textContent,
    ).toBe('NIHAO')
    endComposition()
    expect(input().value).toBe('nihao')
  })

  it('defers debounced search until composition ends', () => {
    const onCompositionStart = vi.fn()
    const onCompositionEnd = vi.fn()
    const onSearch = vi.fn()
    const onValueChange = vi.fn()
    act(() =>
      root.render(
        <AppSearchBox
          debounceMs={200}
          onCompositionEnd={onCompositionEnd}
          onCompositionStart={onCompositionStart}
          onSearch={onSearch}
          onValueChange={onValueChange}
        />,
      ),
    )

    startComposition()
    setInputValue('ni')
    act(() => vi.advanceTimersByTime(500))
    setInputValue('nihao')
    act(() => vi.advanceTimersByTime(500))

    expect(onCompositionStart).toHaveBeenCalledOnce()
    expect(onValueChange).toHaveBeenNthCalledWith(1, 'ni')
    expect(onValueChange).toHaveBeenNthCalledWith(2, 'nihao')
    expect(onSearch).not.toHaveBeenCalled()

    endComposition()
    expect(onCompositionEnd).toHaveBeenCalledOnce()
    act(() => vi.advanceTimersByTime(199))
    expect(onSearch).not.toHaveBeenCalled()
    act(() => vi.advanceTimersByTime(1))
    expect(onSearch).toHaveBeenCalledOnce()
    expect(onSearch).toHaveBeenCalledWith('nihao')
  })

  it('debounces the next value after an explicit Enter search', () => {
    const onSearch = vi.fn()
    act(() =>
      root.render(
        <AppSearchBox
          debounceMs={200}
          defaultValue="alpha"
          onSearch={onSearch}
        />,
      ),
    )
    act(() =>
      input().dispatchEvent(
        new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }),
      ),
    )
    expect(onSearch).toHaveBeenCalledWith('alpha')

    setInputValue('beta')
    act(() => vi.advanceTimersByTime(200))
    expect(onSearch).toHaveBeenNthCalledWith(2, 'beta')
  })
})
