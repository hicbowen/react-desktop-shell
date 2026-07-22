// @vitest-environment jsdom

import { act, createRef } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppInlineEdit } from './AppInlineEdit'
import type { AppInlineEditHandle } from './types'

describe('AppInlineEdit', () => {
  let host: HTMLDivElement
  let root: Root

  beforeEach(() => {
    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)
  })

  afterEach(() => {
    act(() => root.unmount())
    host.remove()
  })

  const setInput = (value: string) => {
    const input = host.querySelector<HTMLInputElement>('input')!
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!
    act(() => {
      setter.call(input, value)
      input.dispatchEvent(new Event('input', { bubbles: true }))
    })
    return input
  }

  it('supports F2 editing, Enter commit, and Escape cancel', async () => {
    const onValueChange = vi.fn()
    act(() => root.render(<AppInlineEdit defaultValue="notes.txt" onValueChange={onValueChange} />))
    const view = host.querySelector<HTMLButtonElement>('button')!
    act(() => view.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'F2' })))
    const input = setInput('readme.txt')
    await act(async () => input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' })))
    expect(onValueChange).toHaveBeenCalledWith('readme.txt')
    expect(host.querySelector('.app-inline-edit__view')?.textContent).toBe('readme.txt')

    act(() => host.querySelector<HTMLButtonElement>('button')?.dispatchEvent(new MouseEvent('dblclick', { bubbles: true })))
    setInput('discarded.txt')
    act(() => host.querySelector('input')?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' })))
    expect(host.querySelector('.app-inline-edit__view')?.textContent).toBe('readme.txt')
  })

  it('selects a filename basename and exposes imperative controls', async () => {
    const ref = createRef<AppInlineEditHandle>()
    act(() => root.render(<AppInlineEdit defaultValue="archive.tar.gz" ref={ref} selection="basename" />))
    act(() => ref.current?.startEditing())
    expect(ref.current?.input?.selectionStart).toBe(0)
    expect(ref.current?.input?.selectionEnd).toBe(11)
    setInput('bundle.zip')
    expect(await act(async () => ref.current?.commit())).toBe(true)
    expect(host.querySelector('.app-inline-edit__view')?.textContent).toBe('bundle.zip')
  })

  it('keeps editing and reports validation errors', async () => {
    act(() => root.render(<AppInlineEdit defaultEditing defaultValue="Valid" validate={(value) => value.length < 3 ? 'Too short' : null} />))
    setInput('x')
    await act(async () => host.querySelector('input')?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' })))
    expect(host.querySelector('[role="alert"]')?.textContent).toBe('Too short')
    expect(host.querySelector('input')).not.toBeNull()
  })
})
