import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import type { AppDataTableFilterDefinition } from '../types'

function getColumnDefinitionId<TData>(column: ColumnDef<TData>) {
  if (column.id) {
    return column.id
  }

  const accessorKey = 'accessorKey' in column ? column.accessorKey : undefined
  return typeof accessorKey === 'string'
    ? accessorKey.replaceAll('.', '_')
    : undefined
}

const singleValueFilter: FilterFn<unknown> = (row, columnId, value) =>
  String(row.getValue(columnId)) === String(value)

singleValueFilter.autoRemove = (value) =>
  value === undefined || value === null || value === ''

const multipleValueFilter: FilterFn<unknown> = (row, columnId, value) =>
  Array.isArray(value) && value.includes(String(row.getValue(columnId)))

multipleValueFilter.autoRemove = (value) =>
  !Array.isArray(value) || value.length === 0

export function resolveControlFilterColumns<TData>(
  columns: ColumnDef<TData>[],
  definitions: AppDataTableFilterDefinition<TData>[],
): ColumnDef<TData>[] {
  if (definitions.length === 0) {
    return columns
  }

  const definitionsByColumn = new Map(
    definitions.map((definition) => [definition.columnId, definition]),
  )

  return columns.map((column) => {
    const columnId = getColumnDefinitionId(column)
    const definition = columnId
      ? definitionsByColumn.get(columnId)
      : undefined

    if (!definition || column.filterFn !== undefined) {
      return column
    }

    return {
      ...column,
      filterFn:
        definition.filterFn ??
        (definition.mode === 'multiple'
          ? (multipleValueFilter as FilterFn<TData>)
          : (singleValueFilter as FilterFn<TData>)),
    }
  })
}
