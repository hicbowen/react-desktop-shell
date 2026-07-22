// @vitest-environment jsdom

import { act, createRef } from 'react'
import { createRoot } from 'react-dom/client'
import { describe, expect, it, vi } from 'vitest'
import { AppDropDownButton } from './AppDropDownButton'

describe('AppDropDownButton', () => {
  it('forwards its button ref and selects menu commands', () => {
    const host = document.createElement('div')
    document.body.append(host)
    const root = createRoot(host)
    const ref = createRef<HTMLButtonElement>()
    const select = vi.fn()
    act(() => root.render(<AppDropDownButton items={[{ key: 'pdf', label: 'PDF' }]} onSelect={select} ref={ref}>Export</AppDropDownButton>))
    expect(ref.current?.textContent).toContain('Export')
    act(() => ref.current?.click())
    const item = document.body.querySelector<HTMLButtonElement>('[role="menuitem"]')
    expect(item?.textContent).toContain('PDF')
    act(() => item?.click())
    expect(select).toHaveBeenCalledWith('pdf')
    act(() => root.unmount())
    host.remove()
  })

  it('does not open when disabled', () => {
    const host = document.createElement('div')
    document.body.append(host)
    const root = createRoot(host)
    act(() => root.render(<AppDropDownButton disabled items={[{ key: 'one', label: 'One' }]}>More</AppDropDownButton>))
    act(() => host.querySelector<HTMLButtonElement>('button')?.click())
    expect(document.body.querySelector('[role="menu"]')).toBeNull()
    act(() => root.unmount())
    host.remove()
  })

  it('keeps a leading icon alongside the menu chevron', () => {
    const host = document.createElement('div')
    const root = createRoot(host)
    act(() => root.render(<AppDropDownButton icon={<svg data-leading="true" />} items={[]}>Export</AppDropDownButton>))
    expect(host.querySelector('[data-leading="true"]')).not.toBeNull()
    expect(host.querySelector('.app-dropdown-button__chevron')).not.toBeNull()
    act(() => root.unmount())
  })
})
