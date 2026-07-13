import {
  DataTableFrame,
  DataTableRow,
  DataTableStateRow,
  useAppDataTable,
  APP_DATA_TABLE_SELECTION_COLUMN_ID,
} from './internal/dataTableCore'
import { AppDataTableControls } from './AppDataTableControls'
import type { AppDataTableProps } from './types'

export { APP_DATA_TABLE_SELECTION_COLUMN_ID }

export function AppDataTable<TData>(props: AppDataTableProps<TData>) {
  const core = useAppDataTable(props)
  const rows = core.table.getRowModel().rows
  const filterDefinitions =
    props.controls?.filters?.filter((definition) =>
      Boolean(core.table.getColumn(definition.columnId)),
    ) ?? []
  const controls =
    props.controls &&
    (Boolean(props.controls.search) || filterDefinitions.length > 0) ? (
      <AppDataTableControls
        filterDefinitions={filterDefinitions}
        options={props.controls}
        table={core.table}
      />
    ) : undefined

  return (
    <DataTableFrame
      className={core.className}
      columnResizeMode={core.columnResizeMode}
      controls={controls}
      density={core.density}
      enableColumnResizing={core.enableColumnResizing}
      loading={core.loading}
      maxHeight={core.maxHeight}
      stickyHeader={core.stickyHeader}
      style={core.style}
      table={core.table}
    >
      {core.loading ? (
        <DataTableStateRow
          columnCount={core.visibleColumnCount}
          content={core.loadingContent}
        />
      ) : rows.length === 0 ? (
        <DataTableStateRow
          columnCount={core.visibleColumnCount}
          content={core.emptyContent}
        />
      ) : (
        rows.map((row) => (
          <DataTableRow
            key={row.id}
            onRowClick={core.onRowClick}
            row={row}
            stickyHeader={core.stickyHeader}
          />
        ))
      )}
    </DataTableFrame>
  )
}
