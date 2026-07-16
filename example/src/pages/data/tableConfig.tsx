import type { ColumnDef } from '@tanstack/react-table'
import type { AppDataTableControlsOptions } from '../../../../src/data'
import type { DemoRow } from '../../fixtures/tableRows'
import { tableRows } from '../../fixtures/tableRows'

export const columns: ColumnDef<DemoRow>[] = [
  { accessorKey: 'name', header: 'Name', size: 420 },
  { accessorKey: 'category', header: 'Category', size: 280 },
  {
    accessorKey: 'status',
    header: 'Status',
    size: 220,
    cell: ({ getValue }) => (
      <span
        className={`demo-status demo-status--${String(getValue()).toLowerCase()}`}
      >
        {String(getValue())}
      </span>
    ),
  },
  { accessorKey: 'owner', header: 'Owner', size: 240 },
  {
    accessorKey: 'priority',
    header: 'Priority',
    size: 180,
    cell: ({ getValue }) => (
      <span
        className={`demo-priority demo-priority--${String(getValue()).toLowerCase()}`}
      >
        {String(getValue())}
      </span>
    ),
  },
  { accessorKey: 'region', header: 'Region', size: 240 },
  { accessorKey: 'updated', header: 'Updated', size: 220 },
]

function uniqueOptions(values: string[]) {
  return Array.from(new Set(values)).map((value) => ({ value, label: value }))
}

export const tableControls: AppDataTableControlsOptions<DemoRow> = {
  search: true,
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
    {
      columnId: 'owner',
      label: 'Owner',
      mode: 'multiple',
      options: uniqueOptions(tableRows.map((row) => row.owner)),
    },
    {
      columnId: 'priority',
      label: 'Priority',
      mode: 'multiple',
      options: uniqueOptions(tableRows.map((row) => row.priority)),
    },
    {
      columnId: 'region',
      label: 'Region',
      mode: 'single',
      options: uniqueOptions(tableRows.map((row) => row.region)),
    },
  ],
}
