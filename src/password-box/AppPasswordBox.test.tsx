// @vitest-environment jsdom
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { AppPasswordBox } from './AppPasswordBox'

describe('AppPasswordBox', () => {
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

  it('peeks at the password while the reveal button is held', () => {
    act(() => root.render(<AppPasswordBox defaultValue="secret" />))
    const input = host.querySelector('input')!
    const button = host.querySelector('button')!

    expect(input.type).toBe('password')
    expect(button.querySelector('svg[data-fui-icon]')).not.toBeNull()
    act(() => button.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'mouse' })))
    expect(input.type).toBe('text')
    act(() => button.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerType: 'mouse' })))
    expect(input.type).toBe('password')
  })

  it('supports persistent reveal through toggle mode', () => {
    act(() => root.render(<AppPasswordBox defaultValue="secret" revealMode="toggle" />))
    const input = host.querySelector('input')!
    const button = host.querySelector('button')!

    act(() => button.click())
    expect(input.type).toBe('text')
    expect(button.getAttribute('aria-pressed')).toBe('true')
  })

  it('only renders the reveal action when the password has content', () => {
    act(() => root.render(<AppPasswordBox />))
    expect(host.querySelector('button')).toBeNull()
  })

  it('exposes a tooltip for the reveal action', () => {
    act(() => root.render(<AppPasswordBox defaultValue="secret" revealMode="toggle" />))
    act(() => host.querySelector('button')!.focus())
    expect(document.body.querySelector('[role="tooltip"]')?.textContent).toBe('Show password')
  })

  it('renders strength content', () => {
    act(() => root.render(<AppPasswordBox strength={<span>Strong</span>} />))
    expect(host.textContent).toContain('Strong')
  })
})
