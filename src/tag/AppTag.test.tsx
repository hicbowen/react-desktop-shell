// @vitest-environment jsdom
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppShell } from '../shell/AppShell'
import { AppTag } from './AppTag'

describe('AppTag', () => {
  let host: HTMLDivElement
  let root: ReturnType<typeof createRoot>
  beforeEach(() => {
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)
  })
  afterEach(() => { act(() => root.unmount()); host.remove() })

  it('applies palette, appearance, size, and shape variants', () => {
    act(() => root.render(<AppTag appearance="outline" color="purple" shape="circular" size="small">Design</AppTag>))
    const tag = host.querySelector('.app-tag')!
    expect(tag.className).toContain('app-tag--purple')
    expect(tag.className).toContain('app-tag--outline')
    expect(tag.className).toContain('app-tag--circular')
    expect(tag.className).toContain('app-tag--small')
  })

  it('dismisses from its localized button without making the tag interactive', () => {
    const dismiss = vi.fn()
    act(() => root.render(<AppTag onDismiss={dismiss}>React</AppTag>))
    expect(host.querySelector('.app-tag')?.getAttribute('role')).toBeNull()
    const button = host.querySelector('button')!
    expect(button.getAttribute('aria-label')).toBe('Remove tag')
    act(() => button.click())
    expect(dismiss).toHaveBeenCalledOnce()
  })

  it('disables dismissal and uses the AppShell locale', () => {
    const dismiss = vi.fn()
    act(() => root.render(<AppShell locale="zh-CN"><AppTag disabled onDismiss={dismiss}>React</AppTag></AppShell>))
    const tag = host.querySelector('.app-tag')!
    const button = host.querySelector('button')!
    expect(tag.getAttribute('aria-disabled')).toBe('true')
    expect(button.disabled).toBe(true)
    expect(button.getAttribute('aria-label')).toBe('移除标签')
    act(() => button.click())
    expect(dismiss).not.toHaveBeenCalled()
  })
})
