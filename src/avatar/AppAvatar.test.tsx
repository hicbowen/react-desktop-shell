// @vitest-environment jsdom

import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { describe, expect, it } from 'vitest'
import { AppAvatar, AppPersona } from './AppAvatar'

describe('avatar and persona', () => {
  it('derives initials and exposes presence', () => {
    const host = document.createElement('div')
    const root = createRoot(host)
    act(() => root.render(<AppAvatar name="Ada Lovelace" status="available" />))
    expect(host.querySelector('.app-avatar__initials')?.textContent).toBe('AL')
    expect(host.querySelector('.app-avatar__presence')?.getAttribute('aria-label')).toBe('available')
    act(() => root.unmount())
  })

  it('composes persona text with avatar identity', () => {
    const host = document.createElement('div')
    const root = createRoot(host)
    act(() => root.render(<AppPersona name="Ada Lovelace" secondaryText="Engineer" tertiaryText="Available" />))
    expect(host.querySelector('.app-persona__name')?.textContent).toBe('Ada Lovelace')
    expect(host.querySelector('.app-avatar')?.getAttribute('aria-label')).toBe('Ada Lovelace')
    act(() => root.unmount())
  })
})
