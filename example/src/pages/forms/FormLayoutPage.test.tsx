// @vitest-environment jsdom
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { AppFormLayoutPage } from './FormLayoutPage'

function enterValue(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    'value',
  )?.set

  setter?.call(input, value)
  input.dispatchEvent(new Event('input', { bubbles: true }))
}

describe('AppFormLayoutPage', () => {
  let host: HTMLDivElement
  let root: Root

  beforeEach(() => {
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
      .IS_REACT_ACT_ENVIRONMENT = true
    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)
  })

  afterEach(() => {
    act(() => root.unmount())
    host.remove()
  })

  it('validates and submits form-owned email state', async () => {
    act(() => root.render(<AppFormLayoutPage />))

    const email = host.querySelector<HTMLInputElement>('#app-form-field-email')!
    expect(email.labels?.[0]?.textContent).toContain('Email')

    await act(async () => {
      host.querySelector<HTMLButtonElement>('button[type="submit"]')!.click()
      await Promise.resolve()
    })

    expect(email.getAttribute('aria-invalid')).toBe('true')
    expect(host.textContent).toContain('Email is required')

    await act(async () => {
      enterValue(email, 'hello@example')
      await Promise.resolve()
    })

    expect(email.getAttribute('aria-invalid')).toBe('true')
    expect(host.textContent).toContain('Enter a valid email address')

    await act(async () => {
      enterValue(email, 'hicbowen@gmail.com')
      await Promise.resolve()
    })

    expect(email.getAttribute('aria-invalid')).toBeNull()
    expect(host.querySelector('.app-form-error-summary')).toBeNull()
    expect(host.querySelector('.app-field__message--error')).toBeNull()

    await act(async () => {
      host.querySelector<HTMLButtonElement>('button[type="submit"]')!.click()
      await Promise.resolve()
    })

    expect(host.textContent).toContain('Submitted: Anonymous · hicbowen@gmail.com · 1 contacts')
  })

  it('maps a rejected submission to a field error', async () => {
    act(() => root.render(<AppFormLayoutPage />))

    const email = host.querySelector<HTMLInputElement>('#app-form-field-email')!
    await act(async () => {
      enterValue(email, 'used@example.com')
      host.querySelector<HTMLButtonElement>('button[type="submit"]')!.click()
      await Promise.resolve()
      await Promise.resolve()
    })

    expect(email.getAttribute('aria-invalid')).toBe('true')
    expect(host.textContent).toContain('This email is already registered')
    expect(host.querySelector('.app-form-error-summary')).not.toBeNull()
  })
})
