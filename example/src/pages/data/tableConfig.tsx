import type { ColumnDef } from '@tanstack/react-table'
import type { AppDataTableControlsOptions } from '../../../../src/data'
import type { DemoRow } from '../../fixtures/tableRows'
import { tableRows } from '../../fixtures/tableRows'

export const columns: ColumnDef<DemoRow>[] = [
  { accessorKey: 'name', header: 'Name', size: 420 },
  { accessorKey: 'category', header: 'Category', size: 280 },
  { accessorKey: 'status', header: 'Status', size: 260, cell: ({ getValue }) => <span className={`demo-status demo-status--${String(getValue()).toLowerCase()}`}>{String(getValue())}</span> },
  { accessorKey: 'updated', header: 'Updated', size: 280 },
]

function uniqueOptions(values: string[]) {
  return Array.from(new Set(values)).map((value) => ({ value, label: value }))
}

export const tableControls: AppDataTableControlsOptions<DemoRow> = {
  search: {
    placeholder: 'Search table rows',
    ariaLabel: 'Search table rows',
  },
  filters: [
    {
      columnId: 'category',
      label: 'Category',
      mode: 'single',
      options: uniqueOptions(tableRows.map((row) => row.category)),
    },
    {
      columnId: 'status',
      label: 'Status',
      mode: 'multiple',
      options: uniqueOptions(tableRows.map((row) => row.status)),
    },
  ],
}
