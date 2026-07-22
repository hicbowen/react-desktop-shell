// @vitest-environment jsdom
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppTreeView } from './AppTreeView'
import type { AppTreeItem } from './types'

const items: AppTreeItem[] = [{ key: 'src', label: 'src', children: [{ key: 'app', label: 'App.tsx' }] }, { key: 'readme', label: 'README.md' }]

describe('AppTreeView', () => {
  let container: HTMLDivElement; let root: Root
  beforeEach(() => { ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true; container = document.createElement('div'); document.body.append(container); root = createRoot(container) })
  afterEach(() => { act(() => root.unmount()); container.remove() })
  const render = (props = {}) => act(() => root.render(<AppTreeView items={items} {...props} />))
  const node = (name: string) => Array.from(container.querySelectorAll<HTMLElement>('[role="treeitem"]')).find((item) => item.textContent?.includes(name))!

  it('expands nodes and exposes hierarchy metadata', () => { render(); expect(node('src').getAttribute('aria-expanded')).toBe('false'); act(() => node('src').querySelector('button')?.click()); expect(node('App.tsx').getAttribute('aria-level')).toBe('2') })
  it('selects a node', () => { const change = vi.fn(); render({ onSelectedKeysChange: change }); act(() => node('README.md').click()); expect(change).toHaveBeenCalledWith(['readme']); expect(node('README.md').getAttribute('aria-selected')).toBe('true') })
  it('supports keyboard navigation and invocation', () => { const invoke = vi.fn(); render({ defaultExpandedKeys: ['src'], onItemInvoke: invoke }); const src = node('src'); act(() => src.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowDown' }))); expect(document.activeElement).toBe(node('App.tsx')); act(() => node('App.tsx').dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }))); expect(invoke).toHaveBeenCalledWith(items[0].children?.[0]) })
  it('requests lazy children when an unloaded parent expands', () => { const load = vi.fn(); act(() => root.render(<AppTreeView items={[{ key: 'lazy', label: 'Lazy', hasChildren: true }]} onLoadChildren={load} />)); act(() => node('Lazy').querySelector('button')?.click()); expect(load).toHaveBeenCalled() })
})
