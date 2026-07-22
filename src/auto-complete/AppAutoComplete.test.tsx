// @vitest-environment jsdom
import { act, createRef } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppField } from '../field'
import { AppAutoComplete } from './AppAutoComplete'

const options = [
  { value: 'TypeScript' },
  { value: 'JavaScript' },
  { value: 'Python' },
  { value: 'Rust', disabled: true },
]

describe('AppAutoComplete', () => {
  let host: HTMLDivElement
  let root: ReturnType<typeof createRoot>
  beforeEach(() => {
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)
  })
  afterEach(() => { act(() => root.unmount()); host.remove() })
  const input = () => host.querySelector<HTMLInputElement>('input')!
  const type = (value: string) => act(() => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(input(), value)
    input().dispatchEvent(new Event('input', { bubbles: true }))
  })

  it('filters suggestions while keeping free text as the value', () => {
    const changed = vi.fn()
    act(() => root.render(<AppAutoComplete onValueChange={changed} options={options} />))
    type('script')
    expect(changed).toHaveBeenLastCalledWith('script')
    expect(document.body.querySelectorAll('.app-auto-complete__listbox [role="option"]')).toHaveLength(2)
  })

  it('selects an active suggestion with the keyboard', () => {
    const changed = vi.fn()
    const selected = vi.fn()
    act(() => root.render(<AppAutoComplete onOptionSelect={selected} onValueChange={changed} options={options} />))
    act(() => input().focus())
    act(() => input().dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowDown' })))
    act(() => input().dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' })))
    expect(input().value).toBe('TypeScript')
    expect(selected).toHaveBeenCalledWith(options[0])
  })

  it('supports controlled values, empty and loading states', () => {
    act(() => root.render(<AppAutoComplete emptyContent="Nothing found" options={options} value="Swift" />))
    act(() => input().focus())
    expect(document.body.querySelector('.app-auto-complete__listbox')?.textContent).toContain('Nothing found')
    act(() => root.render(<AppAutoComplete loading options={[]} value="" />))
    expect(document.body.querySelector('.app-auto-complete__listbox')?.textContent).toContain('Loading suggestions')
    expect(input().getAttribute('aria-expanded')).toBe('true')
  })

  it('integrates with AppField and forwards the input ref', () => {
    const ref = createRef<HTMLInputElement>()
    act(() => root.render(<AppField description="Choose one" id="language" label="Language" required><AppAutoComplete options={options} ref={ref} /></AppField>))
    expect(ref.current).toBe(input())
    expect(input().id).toBe('language')
    expect(input().required).toBe(true)
    expect(input().getAttribute('aria-describedby')).toBe(host.querySelector('.app-field__message')?.id)
  })
})
