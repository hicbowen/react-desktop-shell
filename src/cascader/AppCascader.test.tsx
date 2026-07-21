// @vitest-environment jsdom
import { act, createRef } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppField } from '../field'
import { AppCascader } from './AppCascader'

const options = [
  { value: 'a', label: 'Alpha', children: [{ value: 'a1', label: 'Alpha one' }, { value: 'a2', label: 'Alpha two', disabled: true }] },
  { value: 'b', label: 'Beta', children: [{ value: 'b1', label: 'Beta one' }] },
]

describe('AppCascader', () => {
  let host: HTMLDivElement
  let root: ReturnType<typeof createRoot>
  beforeEach(() => {
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)
  })
  afterEach(() => { act(() => root.unmount()); host.remove() })
  const trigger = () => host.querySelector<HTMLButtonElement>('.app-cascader__trigger')!

  it('renders a selected path and commits a leaf from successive columns', () => {
    const changed = vi.fn()
    act(() => root.render(<AppCascader defaultValue={['a', 'a1']} onValueChange={changed} options={options} />))
    expect(trigger().textContent).toBe('Alpha / Alpha one')
    act(() => trigger().click())
    const beta = Array.from(host.querySelectorAll<HTMLButtonElement>('.app-cascader__option')).find((item) => item.textContent === 'Beta')!
    act(() => beta.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true })))
    const betaOne = Array.from(host.querySelectorAll<HTMLButtonElement>('.app-cascader__option')).find((item) => item.textContent === 'Beta one')!
    act(() => betaOne.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true })))
    expect(changed).toHaveBeenCalledWith(['b', 'b1'], [options[1], options[1]!.children![0]])
    expect(trigger().textContent).toBe('Beta / Beta one')
    expect(trigger().getAttribute('aria-expanded')).toBe('false')
  })

  it('navigates levels with the keyboard and skips disabled leaves', () => {
    const changed = vi.fn()
    act(() => root.render(<AppCascader onValueChange={changed} options={options} />))
    act(() => trigger().dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowDown' })))
    act(() => trigger().dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowDown' })))
    act(() => trigger().dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight' })))
    act(() => trigger().dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowDown' })))
    act(() => trigger().dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' })))
    expect(changed).toHaveBeenCalledWith(['a', 'a1'], [options[0], options[0]!.children![0]])
  })

  it('supports controlled values, clearing, hidden form values, and AppField', () => {
    const changed = vi.fn()
    const ref = createRef<HTMLButtonElement>()
    act(() => root.render(<AppField description="Choose one" id="region" label="Region" required><AppCascader clearable name="region-path" onValueChange={changed} options={options} ref={ref} value={['b', 'b1']} /></AppField>))
    expect(ref.current).toBe(trigger())
    expect(trigger().id).toBe('region')
    expect(trigger().getAttribute('aria-describedby')).toBe(host.querySelector('.app-field__message')?.id)
    expect(host.querySelector<HTMLInputElement>('input[type="hidden"]')?.value).toBe('b/b1')
    act(() => host.querySelector<HTMLButtonElement>('.app-cascader__clear')?.click())
    expect(changed).toHaveBeenCalledWith([], [])
    expect(trigger().textContent).toBe('Beta / Beta one')
  })

  it('shows localized empty content and disabled state', () => {
    act(() => root.render(<AppCascader disabled options={[]} />))
    expect(trigger().disabled).toBe(true)
    act(() => root.render(<AppCascader defaultOpen key="empty" options={[]} />))
    expect(host.textContent).toContain('No options')
  })
})
