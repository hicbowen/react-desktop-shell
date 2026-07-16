// @vitest-environment jsdom
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppListView } from './AppListView'
import { AppListViewItem } from './AppListViewItem'
import type { AppListViewProps } from './types'

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown
  ? Omit<T, K>
  : never
type TestProps = DistributiveOmit<AppListViewProps, 'ariaLabel' | 'children'>

describe('AppListView', () => {
  let host: HTMLDivElement
  let root: ReturnType<typeof createRoot>

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

  const render = (props: TestProps = {}, includeItems = true) => act(() => root.render(
    <AppListView ariaLabel="Students" {...props}>
      {includeItems ? [
        <AppListViewItem key="a" title="Ada" value="a" />,
        <AppListViewItem disabled key="b" title="Disabled" value="b" />,
        <AppListViewItem
          key="c"
          title="Grace"
          trailing={<button type="button">Action</button>}
          value="c"
        />,
        <AppListViewItem interactive={false} key="d" title="Static" value="d" />,
      ] : null}
    </AppListView>,
  ))
  const rows = () => host.querySelectorAll<HTMLElement>('[data-value]')
  const key = (row: HTMLElement, value: string) => act(() => row.dispatchEvent(
    new KeyboardEvent('keydown', { bubbles: true, key: value }),
  ))

  it('uses list/listitem semantics for static information', () => {
    render()
    expect(host.querySelector('[role=list]')).not.toBeNull()
    expect(rows()[0]?.getAttribute('role')).toBe('listitem')
    expect(rows()[0]?.tabIndex).toBe(-1)
    key(rows()[0]!, ' ')
    expect(rows()[0]?.tabIndex).toBe(-1)
  })

  it('uses listbox/option semantics and selects multiple values', () => {
    const change = vi.fn()
    render({ selectionMode: 'multiple', onValueChange: change })
    expect(host.querySelector('[role=listbox]')?.getAttribute('aria-multiselectable')).toBe('true')
    expect(rows()[0]?.getAttribute('role')).toBe('option')
    act(() => rows()[0]!.click())
    expect(change).toHaveBeenLastCalledWith(['a'])
    act(() => rows()[2]!.click())
    expect(change).toHaveBeenLastCalledWith(['a', 'c'])
  })

  it('selects a single value with click and Space', () => {
    const change = vi.fn()
    render({ selectionMode: 'single', onValueChange: change })
    act(() => rows()[0]!.click())
    expect(change).toHaveBeenLastCalledWith(['a'])
    key(rows()[2]!, ' ')
    expect(change).toHaveBeenLastCalledWith(['c'])
  })

  it('moves selection focus while skipping disabled and static items', () => {
    render({ selectionMode: 'single' })
    act(() => rows()[0]!.focus())
    key(rows()[0]!, 'ArrowDown')
    expect(document.activeElement).toBe(rows()[2])
  })

  it('separates invoke actions from trailing buttons', () => {
    const invoke = vi.fn()
    render({ activationMode: 'invoke', onItemInvoke: invoke })
    const list = host.querySelector<HTMLElement>('[role=list]')!
    const item = list.children[2] as HTMLElement
    const mainAction = rows()[2]!
    const trailingButton = item.querySelector<HTMLButtonElement>('button')!

    expect(item.getAttribute('role')).toBe('listitem')
    expect(mainAction.getAttribute('role')).toBe('button')
    expect(mainAction.contains(trailingButton)).toBe(false)
    act(() => mainAction.click())
    key(mainAction, 'Enter')
    key(mainAction, ' ')
    expect(invoke).toHaveBeenCalledTimes(3)
    act(() => trailingButton.click())
    expect(invoke).toHaveBeenCalledTimes(3)
  })

  it('moves invoke focus with Arrow, Home, and End', () => {
    render({ activationMode: 'invoke', onItemInvoke: vi.fn() })
    act(() => rows()[0]!.focus())
    key(rows()[0]!, 'ArrowDown')
    expect(document.activeElement).toBe(rows()[2])
    key(rows()[2]!, 'Home')
    expect(document.activeElement).toBe(rows()[0])
    key(rows()[0]!, 'End')
    expect(document.activeElement).toBe(rows()[2])
  })

  it('handles empty and dynamically changing selection children safely', () => {
    render({ selectionMode: 'single' }, false)
    expect(host.querySelector('[role=listbox]')?.children).toHaveLength(0)
    render({ selectionMode: 'single', value: ['removed'] })
    expect(rows()[0]?.tabIndex).toBe(0)
    expect(rows()[0]?.getAttribute('aria-selected')).toBe('false')
  })

  it('keeps disabled and static invoke rows out of the tab order', () => {
    render({ activationMode: 'invoke', onItemInvoke: vi.fn() })
    expect(rows()[1]?.tabIndex).toBe(-1)
    expect(rows()[1]?.getAttribute('aria-disabled')).toBe('true')
    expect(rows()[3]?.getAttribute('role')).toBe('listitem')
    expect(rows()[3]?.tabIndex).toBe(-1)
  })

  it('rejects invalid interaction props at the type level', () => {
    // @ts-expect-error invoke mode requires an invoke handler
    const missingHandler = <AppListView activationMode="invoke" ariaLabel="Invalid">{null}</AppListView>
    // @ts-expect-error selection mode cannot receive an invoke handler
    const selectionInvoke = <AppListView ariaLabel="Invalid" onItemInvoke={() => undefined} selectionMode="single">{null}</AppListView>
    // @ts-expect-error selection and invoke modes are mutually exclusive
    const combinedModes = <AppListView activationMode="invoke" ariaLabel="Invalid" onItemInvoke={() => undefined} selectionMode="single">{null}</AppListView>
    // @ts-expect-error invoke mode cannot receive selection values
    const invokeValue = <AppListView activationMode="invoke" ariaLabel="Invalid" onItemInvoke={() => undefined} value={[]}>{null}</AppListView>
    expect([missingHandler, selectionInvoke, combinedModes, invokeValue]).toHaveLength(4)
  })
})
