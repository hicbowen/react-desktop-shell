// @vitest-environment jsdom
import { act, createRef } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppField } from '../field'
import { AppSelect } from './AppSelect'

describe('AppSelect', () => {
  let host: HTMLDivElement
  let root: ReturnType<typeof createRoot>

  beforeEach(() => {
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)
  })

  afterEach(() => {
    act(() => root.unmount())
    host.remove()
  })

  it('changes native select values and preserves form attributes', () => {
    const changed = vi.fn()
    const ref = createRef<HTMLSelectElement>()
    act(() => root.render(
      <AppSelect
        name="course"
        onValueChange={changed}
        options={[
          { value: 'one', label: 'One' },
          { value: 'two', label: 'Two', disabled: true },
        ]}
        ref={ref}
      />,
    ))
    act(() => {
      ref.current!.value = 'one'
      ref.current!.dispatchEvent(new Event('change', { bubbles: true }))
    })
    expect(changed).toHaveBeenCalledWith('one')
    expect(ref.current?.name).toBe('course')
    expect(ref.current?.querySelectorAll('option')[1]?.disabled).toBe(true)
  })

  it('renders the Fluent select chevron as an inline svg', () => {
    act(() => root.render(
      <AppSelect options={[{ value: 'one', label: 'One' }]} />,
    ))
    const chevron = host.querySelector<HTMLElement>('.app-select__chevron')!
    const svg = chevron.querySelector('svg')
    expect(chevron.textContent).toBe('')
    expect(svg?.getAttribute('viewBox')).toBe('0 0 16 16')
    expect(svg?.querySelector('path')).not.toBeNull()
  })

  it('supports placeholder, controlled, uncontrolled, and Field context', () => {
    const changed = vi.fn()
    act(() => root.render(
      <AppField description="Choose one" id="choice" label="Choice">
        <AppSelect
          defaultValue="1"
          name="choice"
          onValueChange={changed}
          options={[{ value: '1', label: 'One' }]}
          placeholder="Choose"
        />
      </AppField>,
    ))
    const select = host.querySelector('select')!
    expect(select.value).toBe('1')
    expect(select.name).toBe('choice')
    expect(select.id).toBe('choice')
    const emptyOption = select.querySelector<HTMLOptionElement>(
      'option[value=""]',
    )
    expect(emptyOption?.textContent).toBe('')
    expect(emptyOption?.hidden).toBe(true)
    expect(host.querySelector('.app-select__placeholder')).toBeNull()
    expect(select.getAttribute('aria-describedby')).toBe(
      host.querySelector('.app-field__message')?.id,
    )
    act(() => root.render(
      <AppSelect
        onValueChange={changed}
        options={[
          { value: '1', label: 'One' },
          { value: '2', label: 'Two' },
        ]}
        value="2"
      />,
    ))
    expect(host.querySelector('select')?.value).toBe('2')
    expect(
      host
        .querySelector<HTMLSelectElement>('select')
        ?.style.getPropertyValue('--app-select-selected-offset'),
    ).toBe('34px')
    expect(
      host
        .querySelector<HTMLSelectElement>('select')
        ?.style.getPropertyValue('--app-select-picker-estimated-height'),
    ).toBe('78px')
    expect(
      host
        .querySelector<HTMLSelectElement>('select')
        ?.style.getPropertyValue('--app-select-picker-max-selected-offset'),
    ).toBe('34px')
    expect(
      host
        .querySelector<HTMLSelectElement>('select')
        ?.style.getPropertyValue('--app-select-picker-position-offset'),
    ).toBe('34px')
  })

  it('clears to null while preserving the native select ref', () => {
    const changed = vi.fn()
    const ref = createRef<HTMLSelectElement>()
    act(() => root.render(
      <AppSelect
        clearable
        defaultValue="1"
        onValueChange={changed}
        options={[{ value: '1', label: 'One' }]}
        ref={ref}
      />,
    ))
    act(() => host.querySelector<HTMLButtonElement>('.app-select__clear')?.click())
    expect(changed).toHaveBeenCalledWith(null)
    expect(ref.current?.value).toBe('')
    expect(document.activeElement).toBe(ref.current)
  })

  it('distinguishes a null value from an undefined uncontrolled value', () => {
    act(() => root.render(
      <AppSelect
        options={[{ value: '1', label: 'One' }]}
        placeholder="Choose one"
        value={null}
      />,
    ))
    expect(host.querySelector('select')?.value).toBe('')
    expect(host.querySelector('.app-select__placeholder')?.textContent).toBe(
      'Choose one',
    )
    expect(host.querySelector('select')?.textContent).not.toContain('Choose one')
    act(() => root.render(
      <AppSelect key="uncontrolled" options={[{ value: '1', label: 'One' }]} />,
    ))
    expect(host.querySelector('select')?.value).toBe('1')
  })
})
