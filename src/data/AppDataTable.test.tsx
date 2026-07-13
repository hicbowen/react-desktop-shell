// @vitest-environment jsdom

import { act, useState, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import type { ColumnDef, RowSelectionState } from '@tanstack/react-table'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppDataTable } from './AppDataTable'
import type { AppDataTableControlsOptions } from './types'

interface RowData {
  id: string
  name: string
  category: string
  status: string
}

const data: RowData[] = [
  { id: '2', name: 'Beta', category: 'Media', status: 'Processing' },
  { id: '1', name: 'Alpha', category: 'Document', status: 'Ready' },
  { id: '3', name: 'Gamma', category: 'Archive', status: 'Paused' },
  { id: '4', name: 'Delta', category: 'Document', status: 'Ready' },
]

const columns: ColumnDef<RowData>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'category', header: 'Category' },
  { accessorKey: 'status', header: 'Status' },
]

const controls: AppDataTableControlsOptions<RowData> = {
  search: true,
  filters: [
    {
      columnId: 'category',
      label: 'Category',
      options: [
        { value: 'Document', label: 'Document' },
        { value: 'Media', label: 'Media' },
        { value: 'Archive', label: 'Archive' },
      ],
    },
    {
      columnId: 'status',
      label: 'Status',
      mode: 'multiple',
      options: [
        { value: 'Ready', label: 'Ready' },
        { value: 'Processing', label: 'Processing' },
        { value: 'Paused', label: 'Paused' },
      ],
    },
  ],
}

describe('AppDataTable controls', () => {
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
    vi.restoreAllMocks()
  })

  const render = (node: ReactNode) => act(() => root.render(node))
  const renderTable = (
    props: Partial<React.ComponentProps<typeof AppDataTable<RowData>>> = {},
  ) =>
    render(
      <AppDataTable
        columns={columns}
        controls={controls}
        data={data}
        getRowId={(row) => row.id}
        {...props}
      />,
    )
  const bodyRows = () => Array.from(container.querySelectorAll('tbody tr'))
  const searchInput = () =>
    container.querySelector<HTMLInputElement>('[aria-label="Search rows"]')!
  const setSearch = (value: string) => {
    const input = searchInput()
    const valueSetter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value',
    )?.set
    act(() => {
      valueSetter?.call(input, value)
      input.dispatchEvent(new Event('input', { bubbles: true }))
    })
  }
  const filterButton = () =>
    container.querySelector<HTMLButtonElement>('[aria-haspopup="menu"]')!
  const openFilters = () => act(() => filterButton().click())
  const option = (role: 'menuitemradio' | 'menuitemcheckbox', label: string) =>
    Array.from(
      container.querySelectorAll<HTMLButtonElement>(`[role="${role}"]`),
    ).find((button) => button.textContent?.trim().endsWith(label))!

  it('does not render control DOM when controls are omitted', () => {
    render(<AppDataTable columns={columns} data={data} />)

    expect(container.querySelector('.app-data-table__controls')).toBeNull()
    expect(container.querySelector('.app-data-table--with-controls')).toBeNull()
    expect(bodyRows()).toHaveLength(4)
  })

  it('updates uncontrolled global filtering from search input', () => {
    renderTable()
    setSearch('Alpha')

    expect(bodyRows()).toHaveLength(1)
    expect(bodyRows()[0]?.textContent).toContain('Alpha')
  })

  it('reports controlled search changes without changing controlled state', () => {
    const onGlobalFilterChange = vi.fn()
    renderTable({ globalFilter: '', onGlobalFilterChange })
    setSearch('Alpha')

    expect(onGlobalFilterChange).toHaveBeenCalledWith('Alpha')
    expect(searchInput().value).toBe('')
    expect(bodyRows()).toHaveLength(4)
  })

  it('clears search and restores all rows', () => {
    renderTable()
    setSearch('Alpha')
    act(() =>
      container
        .querySelector<HTMLButtonElement>('[aria-label="Clear search"]')
        ?.click(),
    )

    expect(searchInput().value).toBe('')
    expect(bodyRows()).toHaveLength(4)
  })

  it('applies and clears a single-value filter', () => {
    renderTable()
    openFilters()
    act(() => option('menuitemradio', 'Document').click())

    expect(bodyRows()).toHaveLength(2)
    expect(filterButton().getAttribute('aria-label')).toBe('Filters, 1 active')

    act(() =>
      container
        .querySelector<HTMLButtonElement>(
          '[aria-label="Clear Category filter"]',
        )
        ?.click(),
    )
    expect(bodyRows()).toHaveLength(4)
  })

  it('reports controlled column filter changes without changing controlled state', () => {
    const onColumnFiltersChange = vi.fn()
    renderTable({ columnFilters: [], onColumnFiltersChange })
    openFilters()
    act(() => option('menuitemradio', 'Document').click())

    const update = onColumnFiltersChange.mock.calls[0]?.[0]
    const next = typeof update === 'function' ? update([]) : update
    expect(next).toEqual([{ id: 'category', value: 'Document' }])
    expect(bodyRows()).toHaveLength(4)
    expect(filterButton().getAttribute('aria-label')).toBe('Filters')
  })

  it('adds and removes multiple filter values', () => {
    renderTable()
    openFilters()
    act(() => option('menuitemcheckbox', 'Ready').click())
    act(() => option('menuitemcheckbox', 'Processing').click())

    expect(bodyRows()).toHaveLength(3)
    expect(option('menuitemcheckbox', 'Ready').getAttribute('aria-checked')).toBe(
      'true',
    )

    act(() => option('menuitemcheckbox', 'Ready').click())
    expect(bodyRows()).toHaveLength(1)
    expect(bodyRows()[0]?.textContent).toContain('Beta')
  })

  it('combines global search and column filters', () => {
    renderTable()
    setSearch('a')
    openFilters()
    act(() => option('menuitemcheckbox', 'Ready').click())

    expect(bodyRows()).toHaveLength(2)
    expect(bodyRows().every((row) => row.textContent?.includes('Ready'))).toBe(
      true,
    )
  })

  it('clears all search and column filter state', () => {
    renderTable()
    setSearch('Alpha')
    openFilters()
    act(() => option('menuitemradio', 'Document').click())
    act(() =>
      container
        .querySelector<HTMLButtonElement>(
          '[aria-label="Clear all search and filters"]',
        )
        ?.click(),
    )

    expect(searchInput().value).toBe('')
    expect(bodyRows()).toHaveLength(4)
    expect(filterButton().getAttribute('aria-label')).toBe('Filters')
  })

  it('reports filter state without filtering rows in manual mode', () => {
    const onGlobalFilterChange = vi.fn()
    renderTable({ manualFiltering: true, onGlobalFilterChange })
    setSearch('Alpha')

    expect(onGlobalFilterChange).toHaveBeenCalledWith('Alpha')
    expect(bodyRows()).toHaveLength(4)
  })

  it('selects only filtered rows from the header checkbox', () => {
    function Harness() {
      const [selection, setSelection] = useState<RowSelectionState>({})
      return (
        <>
          <output data-testid="selected-count">
            {Object.values(selection).filter(Boolean).length}
          </output>
          <AppDataTable
            columns={columns}
            controls={controls}
            data={data}
            getRowId={(row) => row.id}
            selection={{ value: selection, onChange: setSelection }}
          />
        </>
      )
    }

    render(<Harness />)
    openFilters()
    act(() => option('menuitemradio', 'Document').click())
    act(() =>
      container.querySelector<HTMLInputElement>('thead input')?.click(),
    )

    expect(
      container.querySelector('[data-testid="selected-count"]')?.textContent,
    ).toBe('2')
  })

  it('closes the filter menu on outside click and Escape', () => {
    renderTable()
    openFilters()
    expect(container.querySelector('[role="menu"]')).not.toBeNull()

    act(() =>
      document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })),
    )
    expect(container.querySelector('[role="menu"]')).toBeNull()

    openFilters()
    act(() =>
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })),
    )
    expect(container.querySelector('[role="menu"]')).toBeNull()
    expect(document.activeElement).toBe(filterButton())
  })

  it('opens and selects filter options with the keyboard', () => {
    renderTable()
    act(() =>
      filterButton().dispatchEvent(
        new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }),
      ),
    )
    const ready = option('menuitemcheckbox', 'Ready')
    act(() =>
      ready.dispatchEvent(
        new KeyboardEvent('keydown', { bubbles: true, key: ' ' }),
      ),
    )

    expect(bodyRows()).toHaveLength(2)
    expect(option('menuitemcheckbox', 'Ready').getAttribute('aria-checked')).toBe(
      'true',
    )
  })

  it('ignores invalid filter column IDs without crashing', () => {
    renderTable({
      controls: {
        filters: [
          {
            columnId: 'missing',
            label: 'Missing',
            options: [{ value: 'x', label: 'X' }],
          },
        ],
      },
    })

    expect(bodyRows()).toHaveLength(4)
    expect(container.querySelector('.app-data-table__controls')).toBeNull()
  })

  it('keeps loading and empty states working with controls', () => {
    renderTable({ loading: true, loadingContent: 'Loading records' })
    expect(container.textContent).toContain('Loading records')
    expect(container.querySelector('.app-data-table__controls')).not.toBeNull()

    renderTable({ data: [], emptyContent: 'No matching records' })
    expect(container.textContent).toContain('No matching records')
  })

  it('keeps sorting, resizing, and pinning available with controls', () => {
    renderTable({
      enableColumnResizing: true,
      defaultColumnPinning: { left: ['name'] },
    })

    expect(container.querySelector('.app-data-table__resize-handle')).not.toBeNull()
    expect(
      container.querySelector('[data-column-id="name"][data-pinned="left"]'),
    ).not.toBeNull()

    const nameSort = Array.from(
      container.querySelectorAll<HTMLButtonElement>(
        '.app-data-table__sort-button',
      ),
    ).find((button) => button.textContent?.includes('Name'))
    act(() => nameSort?.click())
    expect(bodyRows()[0]?.textContent).toContain('Alpha')
  })
})
