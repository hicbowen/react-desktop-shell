// @vitest-environment jsdom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppField } from '../field/AppField'
import { AppComboBox } from './AppComboBox'

describe('AppComboBox', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
      .IS_REACT_ACT_ENVIRONMENT = true
    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
  })

  const options = [
    { value: 'python', label: 'Python' },
    { value: 'scratch', label: 'Scratch' },
    { value: 'disabled', label: 'Disabled', disabled: true },
  ]
  const render = (node: React.ReactNode) => act(() => root.render(node))
  const input = () => container.querySelector<HTMLInputElement>('[role="combobox"]')!
  const key = (value: string) => act(() => input().dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: value })))

  it('filters and commits custom values on blur', () => {
    const change = vi.fn()
    render(<AppComboBox options={options} onValueChange={change} />)
    act(() => input().focus())
    act(() => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
      setter?.call(input(), 'py')
      input().dispatchEvent(new Event('input', { bubbles: true }))
    })
    expect(container.querySelectorAll('[role="option"]')).toHaveLength(1)
    expect(change).toHaveBeenLastCalledWith('py')
  })

  it('supports keyboard selection and skips disabled options', () => {
    const change = vi.fn()
    render(<AppComboBox options={options} onValueChange={change} />)
    act(() => input().focus())
    key('End')
    expect(input().getAttribute('aria-activedescendant')).toContain('-1')
    key('Enter')
    expect(change).toHaveBeenCalledWith('scratch')
    expect(input().value).toBe('scratch')
    expect(input().getAttribute('aria-expanded')).toBe('false')
  })

  it('clears values and inherits AppField state', () => {
    const change = vi.fn()
    render(
      <AppField error="Required" label="Course" required>
        <AppComboBox clearable options={options} value="python" onValueChange={change} />
      </AppField>,
    )
    expect(input().getAttribute('aria-invalid')).toBe('true')
    expect(input().required).toBe(true)
    expect(input().getAttribute('aria-describedby')).not.toBeNull()
    act(() => container.querySelector<HTMLButtonElement>('.app-combo-box__clear')?.click())
    expect(change).toHaveBeenCalledWith('')
    expect(document.activeElement).toBe(input())
  })

  it('honors controlled value and open state', () => {
    const valueChange = vi.fn()
    const openChange = vi.fn()
    render(
      <AppComboBox
        onOpenChange={openChange}
        onValueChange={valueChange}
        open={false}
        options={options}
        value="python"
      />,
    )
    act(() => input().click())
    expect(openChange).toHaveBeenCalledWith(true)
    expect(input().getAttribute('aria-expanded')).toBe('false')
    expect(input().value).toBe('python')
  })

  it('restores focus after keyboard selection', () => {
    render(<AppComboBox options={options} />)
    act(() => input().focus())
    key('ArrowDown')
    key('Enter')
    expect(document.activeElement).toBe(input())
    expect(input().getAttribute('aria-activedescendant')).toBeNull()
  })

  it('reverts unsupported input when custom values are disabled', () => {
    render(<AppComboBox allowCustomValue={false} defaultValue="python" options={options} />)
    act(() => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
      setter?.call(input(), 'unknown')
      input().dispatchEvent(new Event('input', { bubbles: true }))
      input().dispatchEvent(new FocusEvent('focusout', { bubbles: true }))
    })
    expect(input().value).toBe('python')
  })
})
