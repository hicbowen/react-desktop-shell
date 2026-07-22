// @vitest-environment jsdom

import { act, createRef } from 'react'
import { createRoot } from 'react-dom/client'
import { describe, expect, it, vi } from 'vitest'
import { AppLink } from './AppLink'

describe('AppLink', () => {
  it('forwards refs and prevents disabled navigation', () => {
    const host = document.createElement('div')
    const root = createRoot(host)
    const ref = createRef<HTMLAnchorElement>()
    const click = vi.fn()
    act(() => root.render(<AppLink disabled href="#next" onClick={click} ref={ref}>Next</AppLink>))
    expect(ref.current?.tabIndex).toBe(-1)
    expect(ref.current?.click()).toBeUndefined()
    expect(click).not.toHaveBeenCalled()
    act(() => root.unmount())
  })

  it('marks target blank links with an external icon', () => {
    const host = document.createElement('div')
    const root = createRoot(host)
    act(() => root.render(<AppLink href="https://example.com" target="_blank">Docs</AppLink>))
    expect(host.querySelector('.app-link__external')).not.toBeNull()
    act(() => root.unmount())
  })
})
