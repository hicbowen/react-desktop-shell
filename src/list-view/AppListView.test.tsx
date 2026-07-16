// @vitest-environment jsdom
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppListView } from './AppListView'
import { AppListViewItem } from './AppListViewItem'

describe('AppListView', () => {
  let host: HTMLDivElement; let root: ReturnType<typeof createRoot>
  beforeEach(() => { ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true; host = document.createElement('div'); document.body.append(host); root = createRoot(host) })
  afterEach(() => { act(() => root.unmount()); host.remove() })
  const render = (props: Partial<React.ComponentProps<typeof AppListView>> = {}, includeItems = true) => act(() => root.render(<AppListView ariaLabel="Students" {...props}>{includeItems ? [<AppListViewItem key="a" title="Ada" value="a" />, <AppListViewItem disabled key="b" title="Disabled" value="b" />, <AppListViewItem key="c" title="Grace" trailing={<button type="button">Action</button>} value="c" />, <AppListViewItem interactive={false} key="d" title="Static" value="d" />] : null}</AppListView>))
  const rows = () => host.querySelectorAll<HTMLElement>('[data-value]')
  const key = (row: HTMLElement, value: string) => act(() => row.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: value })))

  it('uses list/listitem semantics for non-selectable information', () => { render(); expect(host.querySelector('[role=list]')).not.toBeNull(); expect(rows()[0]?.getAttribute('role')).toBe('listitem'); expect(rows()[0]?.tabIndex).toBe(-1); key(rows()[0]!, ' '); expect(rows()[0]?.tabIndex).toBe(-1) })
  it('uses listbox/option semantics and selects multiple values', () => { const change = vi.fn(); render({ selectionMode: 'multiple', onValueChange: change }); expect(host.querySelector('[role=listbox]')?.getAttribute('aria-multiselectable')).toBe('true'); expect(rows()[0]?.getAttribute('role')).toBe('option'); act(() => rows()[0]!.click()); expect(change).toHaveBeenLastCalledWith(['a']); act(() => rows()[2]!.click()); expect(change).toHaveBeenLastCalledWith(['a', 'c']) })
  it('selects a single value with click and Space', () => { const change = vi.fn(); render({ selectionMode: 'single', onValueChange: change }); act(() => rows()[0]!.click()); expect(change).toHaveBeenLastCalledWith(['a']); key(rows()[2]!, ' '); expect(change).toHaveBeenLastCalledWith(['c']) })
  it('moves focus while skipping disabled and static items', () => { render({ selectionMode: 'single' }); act(() => rows()[0]!.focus()); key(rows()[0]!, 'ArrowDown'); expect(document.activeElement).toBe(rows()[2]) })
  it('invokes in none mode with Enter and Space and isolates trailing buttons', () => { const invoke = vi.fn(); render({ activationMode: 'invoke', onItemInvoke: invoke, selectionMode: 'none' }); expect(rows()[0]?.getAttribute('role')).toBe('button'); key(rows()[0]!, 'Enter'); key(rows()[0]!, ' '); expect(invoke).toHaveBeenCalledTimes(2); act(() => host.querySelector('button')?.click()); expect(invoke).toHaveBeenCalledTimes(2) })
  it('does not invoke from selection mode', () => { const invoke = vi.fn(); render({ selectionMode: 'single', onItemInvoke: invoke }); const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Enter' }); act(() => rows()[0]!.dispatchEvent(event)); expect(event.defaultPrevented).toBe(false); expect(invoke).not.toHaveBeenCalled() })
  it('handles empty and dynamically changing children safely', () => { render({ selectionMode: 'single' }, false); expect(host.querySelector('[role=listbox]')?.children).toHaveLength(0); render({ selectionMode: 'single', value: ['removed'] }); expect(rows()[0]?.tabIndex).toBe(0); expect(rows()[0]?.getAttribute('aria-selected')).toBe('false') })
  it('keeps disabled and interactive=false rows out of the tab order', () => { render({ selectionMode: 'single' }); expect(rows()[1]?.tabIndex).toBe(-1); expect(rows()[1]?.getAttribute('aria-disabled')).toBe('true'); expect(rows()[3]?.getAttribute('role')).toBe('listitem'); expect(rows()[3]?.tabIndex).toBe(-1) })
  it('rejects combining selection and invoke modes at the type level', () => {
    // @ts-expect-error selection and invoke modes are mutually exclusive
    const invalid = <AppListView activationMode="invoke" ariaLabel="Invalid" selectionMode="single">{null}</AppListView>
    expect(invalid).toBeTruthy()
  })
})
