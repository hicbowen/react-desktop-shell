// @vitest-environment jsdom

import { act, useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { ColumnDef } from '@tanstack/react-table'
import { AppDataTable } from './AppDataTable'
import { AppDataView } from './AppDataView'
import { AppSelectionBar } from './AppSelectionBar'

interface RowData {
  id: string
  name: string
}

const columns: ColumnDef<RowData>[] = [
  { accessorKey: 'name', header: 'Name' },
]
const data = [{ id: '1', name: 'Ada' }]

describe('AppDataView height modes', () => {
  let container: HTMLDivElement
  let root: Root

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
  })

  it('uses auto layout by default and preserves a custom class', () => {
    act(() => {
      root.render(
        <AppDataView className="custom-data-view">
          <AppDataTable columns={columns} data={data} />
        </AppDataView>,
      )
    })

    const view = container.querySelector('.app-data-view')
    expect(view?.classList).toContain('custom-data-view')
    expect(view?.classList).toContain('app-data-view--auto')
    expect(view?.classList).not.toContain('app-data-view--fill')
  })

  it('adds the fill class without creating another scroll container', () => {
    act(() => {
      root.render(
        <AppDataView height="fill">
          <AppDataTable columns={columns} data={data} />
        </AppDataView>,
      )
    })

    expect(container.querySelector('.app-data-view--fill')).not.toBeNull()
    expect(container.querySelectorAll('.app-data-table__scroll')).toHaveLength(1)
  })

  it('keeps maxHeight on the table scroll element', () => {
    act(() => {
      root.render(
        <AppDataView height="auto">
          <AppDataTable columns={columns} data={data} maxHeight={320} />
        </AppDataView>,
      )
    })

    const scroll = container.querySelector<HTMLElement>(
      '.app-data-table__scroll',
    )
    expect(scroll?.style.maxHeight).toBe('320px')
  })

  it('clears maxHeight when the prop is removed during a mode switch', () => {
    act(() => {
      root.render(
        <AppDataView height="auto">
          <AppDataTable columns={columns} data={data} maxHeight="50vh" />
        </AppDataView>,
      )
    })
    expect(
      container.querySelector<HTMLElement>('.app-data-table__scroll')?.style
        .maxHeight,
    ).toBe('50vh')

    act(() => {
      root.render(
        <AppDataView height="fill">
          <AppDataTable columns={columns} data={data} />
        </AppDataView>,
      )
    })
    expect(
      container.querySelector<HTMLElement>('.app-data-table__scroll')?.style
        .maxHeight,
    ).toBe('')
  })

  it('returns SelectionBar space without changing table data', () => {
    function Harness() {
      const [selected, setSelected] = useState(false)

      return (
        <AppDataView
          height="fill"
          selectionBar={
            selected ? (
              <AppSelectionBar count={1} onClear={() => setSelected(false)} />
            ) : null
          }
          toolbar={
            <button type="button" onClick={() => setSelected(true)}>
              Select row
            </button>
          }
        >
          <AppDataTable columns={columns} data={data} />
        </AppDataView>
      )
    }

    act(() => root.render(<Harness />))
    expect(container.textContent).toContain('Ada')

    act(() => container.querySelector('button')?.click())
    expect(container.querySelector('.app-selection-bar')).not.toBeNull()
    expect(container.textContent).toContain('Ada')

    act(() =>
      container
        .querySelector<HTMLButtonElement>('[aria-label="Clear selection"]')
        ?.click(),
    )
    expect(container.querySelector('.app-selection-bar')).toBeNull()
    expect(container.textContent).toContain('Ada')
  })
})
