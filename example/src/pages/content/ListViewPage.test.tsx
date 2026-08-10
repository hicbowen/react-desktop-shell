// @vitest-environment jsdom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ListViewPage } from './ListViewPage'

describe('ListViewPage demo', () => {
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

  it('switches selection mode and density on the shared list preview', () => {
    act(() => root.render(<ListViewPage />))

    const list = host.querySelector<HTMLElement>('.demo-list-selection')!
    expect(list.classList).toContain('app-list-view--standard')
    expect(list.querySelectorAll('input[type="radio"]')).toHaveLength(3)
    expect(host.querySelector<HTMLInputElement>('input[value="single"]')?.checked).toBe(true)

    act(() => host.querySelector<HTMLInputElement>('input[value="multiple"]')?.click())

    expect(list.querySelectorAll('input[type="checkbox"]')).toHaveLength(3)
    expect(list.querySelectorAll('input[type="radio"]')).toHaveLength(0)

    const densitySwitch = host.querySelector<HTMLInputElement>('[role="switch"]')!
    act(() => densitySwitch.click())

    expect(list.classList).toContain('app-list-view--compact')
  })
})
