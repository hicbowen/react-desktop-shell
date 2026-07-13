import type { ColumnDef } from '@tanstack/react-table'
import type { DemoRow } from '../../fixtures/tableRows'

export const columns: ColumnDef<DemoRow>[] = [
  { accessorKey: 'name', header: 'Name', size: 220 },
  { accessorKey: 'category', header: 'Category', size: 140 },
  { accessorKey: 'status', header: 'Status', size: 130, cell: ({ getValue }) => <span className={`demo-status demo-status--${String(getValue()).toLowerCase()}`}>{String(getValue())}</span> },
  { accessorKey: 'updated', header: 'Updated', size: 130 },
]
