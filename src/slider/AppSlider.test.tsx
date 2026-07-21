// @vitest-environment jsdom
import { act, createRef } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppField } from '../field'
import { AppSlider } from './AppSlider'

describe('AppSlider', () => {
  let host: HTMLDivElement
  let root: ReturnType<typeof createRoot>
  beforeEach(() => {
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)
  })
  afterEach(() => { act(() => root.unmount()); host.remove() })
  const input = () => host.querySelector<HTMLInputElement>('input[type="range"]')!
  const setValue = (value: number) => act(() => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(input(), String(value))
    input().dispatchEvent(new Event('input', { bubbles: true }))
    input().dispatchEvent(new Event('change', { bubbles: true }))
  })

  it('updates an uncontrolled value and reports numeric changes', () => {
    const changed = vi.fn()
    act(() => root.render(<AppSlider defaultValue={25} onValueChange={changed} showValue />))
    expect(input().value).toBe('25')
    setValue(60)
    expect(changed).toHaveBeenLastCalledWith(60)
    expect(host.querySelector('output')?.textContent).toBe('60')
  })

  it('preserves controlled values and formats accessible value text', () => {
    const changed = vi.fn()
    act(() => root.render(<AppSlider formatValue={(value) => `${value}%`} onValueChange={changed} showValue value={40} />))
    setValue(70)
    expect(changed).toHaveBeenLastCalledWith(70)
    expect(input().value).toBe('40')
    expect(input().getAttribute('aria-valuetext')).toBe('40%')
    expect(host.querySelector('output')?.textContent).toBe('40%')
  })

  it('renders bounded marks and vertical orientation', () => {
    act(() => root.render(<AppSlider marks={[{ value: -1 }, { value: 0, label: 'Low' }, { value: 100, label: 'High' }, { value: 101 }]} orientation="vertical" />))
    expect(host.querySelector('.app-slider')?.className).toContain('app-slider--vertical')
    expect(input().getAttribute('aria-orientation')).toBe('vertical')
    expect(host.querySelectorAll('.app-slider__mark')).toHaveLength(2)
  })

  it('integrates with AppField and forwards native attributes and refs', () => {
    const ref = createRef<HTMLInputElement>()
    act(() => root.render(<AppField description="Choose a size" id="size" label="Size" required><AppSlider disabled={false} max={10} min={1} name="size" ref={ref} /></AppField>))
    expect(ref.current).toBe(input())
    expect(input().id).toBe('size')
    expect(input().name).toBe('size')
    expect(input().required).toBe(true)
    expect(input().getAttribute('aria-describedby')).toBe(host.querySelector('.app-field__message')?.id)
  })
})
