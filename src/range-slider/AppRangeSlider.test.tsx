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

  it('provides a formatted tooltip for each thumb and keeps accessible value text in sync', () => {
    act(() => root.render(<AppRangeSlider defaultValue={[20, 60]} formatValue={(value) => `${value}%`} />))
    const inputs = host.querySelectorAll<HTMLInputElement>('input')
    expect(inputs[0]!.getAttribute('aria-valuetext')).toBe('20%')
    expect(inputs[1]!.getAttribute('aria-valuetext')).toBe('60%')

    act(() => inputs[0]!.focus())
    expect(document.body.querySelector('[role="tooltip"]')?.textContent).toBe('20%')

    act(() => inputs[1]!.focus())
    expect(document.body.querySelector('[role="tooltip"]')?.textContent).toBe('60%')
  })

  it('can disable tooltips without changing native range values', () => {
    act(() => root.render(<AppRangeSlider defaultValue={[20, 60]} showTooltip={false} />))
    const inputs = host.querySelectorAll<HTMLInputElement>('input')

    act(() => inputs[0]!.focus())
    expect(document.body.querySelector('[role="tooltip"]')).toBeNull()
    expect(Array.from(inputs).map((input) => input.value)).toEqual(['20', '60'])
  })

  it('only activates hover feedback for the thumb under the pointer', () => {
    act(() => root.render(<AppRangeSlider defaultValue={[25, 75]} />))
    const slider = host.querySelector<HTMLElement>('.app-range-slider')!
    const thumbs = Array.from(host.querySelectorAll<HTMLElement>('.app-range-slider__thumb'))
    vi.spyOn(thumbs[0]!, 'getBoundingClientRect').mockReturnValue({
      bottom: 27,
      height: 18,
      left: 41,
      right: 59,
      top: 9,
      width: 18,
      x: 41,
      y: 9,
      toJSON: () => ({}),
    } as DOMRect)
    vi.spyOn(thumbs[1]!, 'getBoundingClientRect').mockReturnValue({
      bottom: 27,
      height: 18,
      left: 141,
      right: 159,
      top: 9,
      width: 18,
      x: 141,
      y: 9,
      toJSON: () => ({}),
    } as DOMRect)

    act(() => slider.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: 100, clientY: 18, pointerType: 'mouse' })))
    expect(thumbs[0]!.className).not.toContain('app-range-slider__thumb--hovered')
    expect(thumbs[1]!.className).not.toContain('app-range-slider__thumb--hovered')

    act(() => slider.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: 50, clientY: 18, pointerType: 'mouse' })))
    expect(thumbs[0]!.className).toContain('app-range-slider__thumb--hovered')
    expect(thumbs[1]!.className).not.toContain('app-range-slider__thumb--hovered')

    act(() => slider.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: 150, clientY: 18, pointerType: 'mouse' })))
    expect(thumbs[0]!.className).not.toContain('app-range-slider__thumb--hovered')
    expect(thumbs[1]!.className).toContain('app-range-slider__thumb--hovered')
  })
})
