// @vitest-environment jsdom
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { AppFieldPage } from './AppFieldPage'

function enterValue(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    'value',
  )?.set

  setter?.call(input, value)
  input.dispatchEvent(new Event('input', { bubbles: true }))
}

describe('AppFieldPage', () => {
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

  it('updates the email field as its value becomes valid', () => {
    act(() => root.render(<AppFieldPage />))

    const email = host.querySelector<HTMLInputElement>('#email')!
    expect(email.labels?.[0]?.textContent).toContain('Email')
    expect(email.getAttribute('aria-invalid')).toBe('true')
    expect(host.textContent).toContain('Email is required')

    act(() => enterValue(email, 'hello@example'))

    expect(email.getAttribute('aria-invalid')).toBe('true')
    expect(host.textContent).toContain('Enter a valid email address')

    act(() => enterValue(email, 'hicbowen@gmail.com'))

    expect(email.getAttribute('aria-invalid')).toBeNull()
    expect(host.querySelector('.app-field__message--error')).toBeNull()
  })
})
