import type { ColumnDef } from '@tanstack/react-table'
import type { AppDataTableControlsOptions } from '../../../../src/data'
import type { DemoRow } from '../../fixtures/tableRows'
import { tableRows } from '../../fixtures/tableRows'

type Translate = (text: string) => string

const rowNamePrefixes = ['Alpha item', 'Beta item', 'Gamma item', 'Delta item']

export function localizeTableValue(t: Translate, value: string) {
  const prefix = rowNamePrefixes.find((candidate) => value.startsWith(candidate))
  return prefix ? `${t(prefix)}${value.slice(prefix.length)}` : t(value)
}

export function createColumns(t: Translate): ColumnDef<DemoRow>[] {
  return [
    {
      accessorKey: 'name',
      header: t('Name'),
      size: 420,
      cell: ({ getValue }) => localizeTableValue(t, String(getValue())),
    },
    {
      accessorKey: 'category',
      header: t('Category'),
      size: 280,
      cell: ({ getValue }) => t(String(getValue())),
    },
    {
      accessorKey: 'status',
      header: t('Status'),
      size: 220,
      cell: ({ getValue }) => (
        <span
          className={`demo-status demo-status--${String(getValue()).toLowerCase()}`}
        >
          {t(String(getValue()))}
        </span>
      ),
    },
    {
      accessorKey: 'owner',
      header: t('Owner'),
      size: 240,
      cell: ({ getValue }) => t(String(getValue())),
    },
    {
      accessorKey: 'priority',
      header: t('Priority'),
      size: 180,
      cell: ({ getValue }) => (
        <span
          className={`demo-priority demo-priority--${String(getValue()).toLowerCase()}`}
        >
          {t(String(getValue()))}
        </span>
      ),
    },
    {
      accessorKey: 'region',
      header: t('Region'),
      size: 240,
      cell: ({ getValue }) => t(String(getValue())),
    },
    { accessorKey: 'updated', header: t('Updated'), size: 220 },
  ]
}

function uniqueOptions(t: Translate, values: string[]) {
  return Array.from(new Set(values)).map((value) => ({ value, label: t(value) }))
}

export function createTableControls(t: Translate): AppDataTableControlsOptions<DemoRow> {
  return {
    search: true,
    filters: [
      {
        columnId: 'category',
        label: t('Category'),
        mode: 'single',
        options: uniqueOptions(t, tableRows.map((row) => row.category)),
      },
      {
        columnId: 'status',
        label: t('Status'),
        mode: 'multiple',
        options: uniqueOptions(t, tableRows.map((row) => row.status)),
      },
      {
        columnId: 'owner',
        label: t('Owner'),
        mode: 'multiple',
        options: uniqueOptions(t, tableRows.map((row) => row.owner)),
      },
      {
        columnId: 'priority',
        label: t('Priority'),
        mode: 'multiple',
        options: uniqueOptions(t, tableRows.map((row) => row.priority)),
      },
      {
        columnId: 'region',
        label: t('Region'),
        mode: 'single',
        options: uniqueOptions(t, tableRows.map((row) => row.region)),
      },
    ],
  }
}
