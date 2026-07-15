// @vitest-environment jsdom

import { act, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import type { ColumnDef } from '@tanstack/react-table'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppDataTable } from '../data/AppDataTable'
import { AppShell } from '../shell/AppShell'
import { AppContextMenu } from './AppContextMenu'
import { useAppContextMenu } from './AppContextMenuContext'
import type { AppContextMenuApi } from './types'

interface TestRow {
  id: string
  name: string
}

const rows: TestRow[] = [
  { id: 'a', name: 'Alpha' },
  { id: 'b', name: 'Beta' },
]
const columns: ColumnDef<TestRow>[] = [
  { accessorKey: 'name', header: 'Name' },
]

describe('useAppContextMenu', () => {
  let container: HTMLDivElement
  let root: Root
  let api: AppContextMenuApi

  beforeEach(() => {
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
      .IS_REACT_ACT_ENVIRONMENT = true
    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
    vi.restoreAllMocks()
  })

  function CaptureApi({ children }: { children?: ReactNode }) {
    api = useAppContextMenu()
    return children
  }

  const render = (node: ReactNode) => act(() => root.render(node))
  const renderShell = (
    children: ReactNode = <CaptureApi />,
    contextMenu: 'native' | 'app' = 'native',
  ) => render(<AppShell contextMenu={contextMenu}>{children}</AppShell>)
  const menu = () => container.querySelector<HTMLElement>('[role="menu"]')
  const menuItem = (label: string) =>
    Array.from(
      container.querySelectorAll<HTMLButtonElement>('[role="menuitem"]'),
    ).find((item) => item.textContent?.includes(label))
  const settlePlacement = () =>
    act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 20))
    })
  const open = (
    items: Parameters<AppContextMenuApi['open']>[0]['items'],
    options: Partial<Parameters<AppContextMenuApi['open']>[0]> = {},
  ) =>
    act(() =>
      api.open({ items, x: 24, y: 36, ...options }),
    )
  const contextMenu = (target: Element, x = 12, y = 18) =>
    act(() =>
      target.dispatchEvent(
        new MouseEvent('contextmenu', {
          bubbles: true,
          cancelable: true,
          clientX: x,
          clientY: y,
        }),
      ),
    )

  it('throws a clear error outside AppShell', () => {
    function Outside() {
      useAppContextMenu()
      return null
    }
    vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => render(<Outside />)).toThrow(
      'useAppContextMenu must be used within AppShell',
    )
  })

  it('returns a stable API inside AppShell', () => {
    renderShell()
    const firstApi = api
    renderShell()
    expect(api).toBe(firstApi)
  })

  it('opens at the supplied coordinates and runs an item before closing', async () => {
    const onClick = vi.fn()
    renderShell()
    open([{ key: 'open', label: 'Open item', onClick }], { x: 40, y: 60 })
    await settlePlacement()

    expect(menuItem('Open item')).toBeDefined()
    expect(menu()?.style.left).toBe('40px')
    expect(menu()?.style.top).toBe('60px')
    act(() => menuItem('Open item')?.click())
    expect(onClick).toHaveBeenCalledOnce()
    expect(menu()).toBeNull()
  })

  it('closes through the API and restores trigger focus', () => {
    renderShell(<><button type="button">Trigger</button><CaptureApi /></>)
    const trigger = container.querySelector<HTMLButtonElement>('button')!
    trigger.focus()
    open([{ key: 'open', label: 'Open' }], { trigger })
    act(() => api.close())

    expect(menu()).toBeNull()
    expect(document.activeElement).toBe(trigger)
  })

  it('immediately replaces the current item snapshot', () => {
    renderShell()
    open([{ key: 'a', label: 'Alpha action' }])
    expect(menuItem('Alpha action')).toBeDefined()
    open([{ key: 'b', label: 'Beta action' }])

    expect(menuItem('Alpha action')).toBeUndefined()
    expect(menuItem('Beta action')).toBeDefined()
  })

  it('retains disabled, danger, shortcut, separator, and submenu behavior', () => {
    const disabledClick = vi.fn()
    renderShell()
    open([
      { key: 'disabled', label: 'Disabled', disabled: true, onClick: disabledClick },
      { key: 'danger', label: 'Danger', danger: true, shortcut: 'Del' },
      { type: 'separator' },
      { key: 'more', label: 'More', submenu: [{ key: 'child', label: 'Child' }] },
    ])

    const disabled = menuItem('Disabled')!
    act(() => disabled.click())
    expect(disabledClick).not.toHaveBeenCalled()
    expect(menuItem('Danger')?.classList.contains('app-context-menu__item--danger')).toBe(true)
    expect(menuItem('Danger')?.textContent).toContain('Del')
    expect(container.querySelector('[role="separator"]')).not.toBeNull()
    expect(menuItem('More')?.getAttribute('aria-haspopup')).toBe('menu')
  })

  it('keeps outside click, Escape, and scroll dismissal', () => {
    renderShell()
    open([{ key: 'open', label: 'Open' }])
    act(() => document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })))
    expect(menu()).toBeNull()

    open([{ key: 'open', label: 'Open' }])
    act(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })))
    expect(menu()).toBeNull()

    open([{ key: 'open', label: 'Open' }])
    act(() => window.dispatchEvent(new Event('scroll')))
    expect(menu()).toBeNull()
  })

  it('keeps root and submenu scrolling open but closes on external scroll', () => {
    renderShell()
    open([
      {
        key: 'more',
        label: 'More',
        submenu: [{ key: 'child', label: 'Child action' }],
      },
    ])
    const rootMenu = container.querySelectorAll<HTMLElement>('[role="menu"]')[0]!
    act(() => rootMenu.dispatchEvent(new Event('scroll')))
    expect(menu()).not.toBeNull()

    act(() => menuItem('More')?.click())
    const submenu = container.querySelectorAll<HTMLElement>('[role="menu"]')[1]!
    act(() => submenu.dispatchEvent(new Event('scroll')))
    expect(container.querySelectorAll('[role="menu"]')).toHaveLength(2)

    act(() => container.dispatchEvent(new Event('scroll')))
    expect(menu()).toBeNull()
  })

  it('keeps window blur and resize dismissal', () => {
    renderShell()
    open([{ key: 'open', label: 'Open' }])
    act(() => window.dispatchEvent(new Event('blur')))
    expect(menu()).toBeNull()

    open([{ key: 'open', label: 'Open' }])
    act(() => window.dispatchEvent(new Event('resize')))
    expect(menu()).toBeNull()
  })

  it('opens command submenus through the existing menu layer', () => {
    renderShell()
    open([
      {
        key: 'more',
        label: 'More',
        submenu: [{ key: 'child', label: 'Child action' }],
      },
    ])
    act(() => menuItem('More')?.click())
    expect(menuItem('Child action')).toBeDefined()
    expect(container.querySelectorAll('[role="menu"]')).toHaveLength(2)
  })

  it('continues to support declarative menus', () => {
    renderShell(
      <AppContextMenu items={[{ key: 'declared', label: 'Declared action' }]}>
        <button type="button">Declared target</button>
      </AppContextMenu>,
      'app',
    )
    contextMenu(container.querySelector('button')!)
    expect(menuItem('Declared action')).toBeDefined()
  })

  it('keeps the nearest declarative registration priority', () => {
    renderShell(
      <AppContextMenu items={[{ key: 'outer', label: 'Outer action' }]}>
        <div>
          <AppContextMenu items={[{ key: 'inner', label: 'Inner action' }]}>
            <button type="button">Nested target</button>
          </AppContextMenu>
        </div>
      </AppContextMenu>,
      'app',
    )
    contextMenu(container.querySelector('button')!)
    expect(menuItem('Inner action')).toBeDefined()
    expect(menuItem('Outer action')).toBeUndefined()
  })

  it('continues to resolve editable and selected-text menus', () => {
    renderShell(<><input defaultValue="Editable" /><span>Selected text</span></>, 'app')
    contextMenu(container.querySelector('input')!)
    expect(menuItem('Copy')).toBeDefined()

    act(() => api.close())
    vi.spyOn(window, 'getSelection').mockReturnValue({
      toString: () => 'Selected text',
    } as Selection)
    contextMenu(container.querySelector('span')!)
    expect(menuItem('Copy')).toBeDefined()
  })

  it('opens explicitly in native mode', () => {
    renderShell(<CaptureApi />, 'native')
    open([{ key: 'manual', label: 'Manual native-mode menu' }])
    expect(menuItem('Manual native-mode menu')).toBeDefined()
  })

  it('lets an app-mode bubble handler open after the capture handler', () => {
    function Target() {
      const context = useAppContextMenu()
      return (
        <button
          type="button"
          onContextMenu={(event) => {
            event.preventDefault()
            context.open({
              items: [{ key: 'manual', label: 'Bubble menu' }],
              x: event.clientX,
              y: event.clientY,
              trigger: event.currentTarget,
            })
          }}
        >
          Target
        </button>
      )
    }
    renderShell(<Target />, 'app')
    contextMenu(container.querySelector('button')!, 70, 80)
    expect(menuItem('Bubble menu')).toBeDefined()
  })

  it('opens row-specific AppDataTable menus without stale data', () => {
    function Table() {
      const context = useAppContextMenu()
      return (
        <AppDataTable
          columns={columns}
          data={rows}
          getRowId={(row) => row.id}
          onRowContextMenu={(row, event) => {
            event.preventDefault()
            context.open({
              items: [{ key: row.id, label: `Open ${row.original.name}` }],
              x: event.clientX,
              y: event.clientY,
              trigger: event.currentTarget,
            })
          }}
        />
      )
    }
    renderShell(<Table />, 'app')
    const tableRows = container.querySelectorAll('tbody tr')
    contextMenu(tableRows[0]!)
    expect(menuItem('Open Alpha')).toBeDefined()
    contextMenu(tableRows[1]!)
    expect(menuItem('Open Alpha')).toBeUndefined()
    expect(menuItem('Open Beta')).toBeDefined()
  })
})
