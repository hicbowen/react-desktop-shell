// @vitest-environment jsdom
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { AppForm } from './AppForm'
import { AppFormField } from './AppFormField'
import { AppFormStore } from './AppFormStore'

describe('AppForm layout', () => {
  let host: HTMLDivElement
  let root: Root

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

  it('exposes responsive grid, span, spacing, alignment, and width settings', () => {
    const form = new AppFormStore({ defaultValues: { name: '' } })

    act(() => root.render(
      <AppForm columns={{ base: 1, md: 2 }} controlWidth="100%" form={form} gap={12} labelAlign="end" layout="grid">
        <AppFormField colSpan={{ base: 1, md: 2 }} label="Name" name="name">
          {({ inputId, value, setValue }) => <input id={inputId} value={String(value ?? '')} onChange={(event) => setValue(event.currentTarget.value)} />}
        </AppFormField>
      </AppForm>,
    ))

    const formElement = host.querySelector<HTMLFormElement>('form')!
    const fieldElement = host.querySelector<HTMLElement>('.app-field')!
    expect(formElement.className).toContain('app-form--grid')
    expect(formElement.style.getPropertyValue('--app-form-columns-base')).toBe('1')
    expect(formElement.style.getPropertyValue('--app-form-columns-md')).toBe('2')
    expect(formElement.style.getPropertyValue('--app-form-gap')).toBe('12px')
    expect(formElement.style.getPropertyValue('--app-form-control-width')).toBe('100%')
    expect(fieldElement.className).toContain('app-field--label-end')
    expect(fieldElement.style.getPropertyValue('--app-form-field-span-base')).toBe('1')
    expect(fieldElement.style.getPropertyValue('--app-form-field-span-md')).toBe('2')
    expect(fieldElement.style.getPropertyValue('--app-field-control-width')).toBe('100%')
  })
})
