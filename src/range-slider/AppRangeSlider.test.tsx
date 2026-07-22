// @vitest-environment jsdom
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppRangeSlider } from './AppRangeSlider'

describe('AppRangeSlider', () => {
  let host: HTMLDivElement
  let root: Root
  beforeEach(() => {
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)
  })
  afterEach(() => { act(() => root.unmount()); host.remove() })

  it('enforces minimum distance', () => {
    const change = vi.fn()
    act(() => root.render(<AppRangeSlider defaultValue={[20, 60]} minDistance={10} onValueChange={change} />))
    const start = host.querySelectorAll<HTMLInputElement>('input')[0]!
    act(() => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!
      setter.call(start, '55')
      start.dispatchEvent(new Event('input', { bubbles: true }))
    })
    expect(change).toHaveBeenLastCalledWith([50, 60])
  })

  it('supports controlled ranges', () => {
    act(() => root.render(<AppRangeSlider value={[25, 75]} />))
    expect(Array.from(host.querySelectorAll<HTMLInputElement>('input')).map((input) => input.value)).toEqual(['25', '75'])
  })
})
