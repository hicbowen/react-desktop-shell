// @vitest-environment jsdom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppPagination } from './AppPagination'

describe('AppPagination', () => {
  let container: HTMLDivElement
  let root: Root
  beforeEach(() => {
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)
  })
  afterEach(() => { act(() => root.unmount()); container.remove() })

  it('changes pages without owning the item collection', () => {
    const onValueChange = vi.fn()
    act(() => root.render(<AppPagination defaultValue={{ pageIndex: 0, pageSize: 10 }} onValueChange={onValueChange} total={35} />))
    act(() => container.querySelector<HTMLButtonElement>('[aria-label="Next page"]')!.click())
    expect(onValueChange).toHaveBeenCalledWith({ pageIndex: 1, pageSize: 10 })
    expect(container.textContent).toContain('Page 2 of 4')
  })

  it('resets to the first page when page size changes', () => {
    const onValueChange = vi.fn()
    act(() => root.render(<AppPagination defaultValue={{ pageIndex: 2, pageSize: 10 }} onValueChange={onValueChange} total={50} />))
    const select = container.querySelector('select')!
    act(() => { select.value = '20'; select.dispatchEvent(new Event('change', { bubbles: true })) })
    expect(onValueChange).toHaveBeenCalledWith({ pageIndex: 0, pageSize: 20 })
  })

  it('clamps controlled pages to the available range', () => {
    act(() => root.render(<AppPagination total={15} value={{ pageIndex: 9, pageSize: 10 }} />))
    expect(container.textContent).toContain('Page 2 of 2')
    expect(container.querySelector<HTMLButtonElement>('[aria-label="Next page"]')!.disabled).toBe(true)
  })
})
