/* eslint-disable react-refresh/only-export-components */
import {
  memo,
  useCallback,
  useMemo,
  useEffect,
  useState,
  type CSSProperties,
  type ClipboardEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type RefObject,
} from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnPinningState,
  type ColumnResizeMode,
  type ColumnSizingState,
  type OnChangeFn,
  type PaginationState,
  type Row,
  type SortingState,
  type Table,
  type VisibilityState,
} from "@tanstack/react-table";
import { ArrowSortDown16Regular } from "@fluentui/react-icons/svg/arrow-sort-down";
import { ArrowSortUp16Regular } from "@fluentui/react-icons/svg/arrow-sort-up";
import { Pin16Regular } from "@fluentui/react-icons/svg/pin";
import { DataTableCheckbox } from "../DataTableCheckbox";
import { useAppLocale } from "../../localization/useAppLocale";
import { AppScrollArea } from "../../scroll-area/AppScrollArea";
import type {
  AppDataTableFilterDefinition,
  AppDataTablePaginationOptions,
  AppDataTableProps,
} from "../types";
import { DataTableColumnMenu } from "./DataTableColumnMenu";
import {
  getColumnDefinitionId,
  resolveControlFilterColumns,
} from "./dataTableFilters";
import type { DataTableCellSelectionInteraction } from "./useDataTableCellSelection";
import { isDataTableInteractiveTarget } from "./dataTableInteraction";

export const APP_DATA_TABLE_ROW_SELECTION_COLUMN_ID =
  "__app_data_table_row_selection";

const internalColumnIds = new Set([APP_DATA_TABLE_ROW_SELECTION_COLUMN_ID]);

export function isAppDataTableInternalColumn(columnId: string) {
  return internalColumnIds.has(columnId);
}

export interface DataTableStickyLayout {
  offsets: ReadonlyMap<string, number>;
  naturalOffsets: ReadonlyMap<string, number>;
  edgeColumnId?: string;
}

export interface DataTableActiveCell {
  rowId: string;
  columnId: string;
}

export interface DataTableCellNavigation {
  activeCell: DataTableActiveCell | null;
  activateCell: (
    rowId: string,
    columnId: string,
    cell: HTMLTableCellElement,
    focus: boolean,
  ) => void;
  onKeyDown: (
    rowId: string,
    columnId: string,
    event: KeyboardEvent<HTMLTableCellElement>,
  ) => void;
}

interface DataTableLayoutState {
  columnPinning: ColumnPinningState;
  columnSizing: ColumnSizingState;
  columnVisibility: VisibilityState;
}

function createStickyColumnLayout<TData>(
  table: Table<TData>,
  stickyColumns: string[] | undefined,
  layoutState: DataTableLayoutState,
): DataTableStickyLayout {
  const requestedIds = new Set(stickyColumns ?? []);
  const pinnedIds = new Set([
    ...(layoutState.columnPinning.left ?? []),
    ...(layoutState.columnPinning.right ?? []),
  ]);
  const leftPinnedIds = layoutState.columnPinning.left ?? [];
  const isVisible = (columnId: string) =>
    layoutState.columnVisibility[columnId] !== false;
  const getSize = (column: Column<TData>) => {
    const configuredSize = layoutState.columnSizing[column.id];
    if (configuredSize === undefined) return column.getSize();

    return Math.min(
      Math.max(configuredSize, column.columnDef.minSize ?? 20),
      column.columnDef.maxSize ?? 1000,
    );
  };
  let offset = leftPinnedIds.reduce((width, columnId) => {
    const column = table.getColumn(columnId);
    return column && isVisible(column.id) ? width + getSize(column) : width;
  }, 0);
  const offsets = new Map<string, number>();
  const naturalOffsets = new Map<string, number>();
  let edgeColumnId: string | undefined;
  let naturalOffset = 0;

  for (const column of table.getVisibleLeafColumns()) {
    if (!pinnedIds.has(column.id) && requestedIds.has(column.id)) {
      offsets.set(column.id, offset);
      naturalOffsets.set(column.id, naturalOffset);
      offset += getSize(column);
      edgeColumnId = column.id;
    }

    naturalOffset += getSize(column);
  }

  return { offsets, naturalOffsets, edgeColumnId };
}

function areColumnIdListsEqual(first: string[], second: string[]) {
  return (
    first.length === second.length &&
    first.every((columnId, index) => columnId === second[index])
  );
}

function getActiveStickyColumnIds<TData>(
  table: Table<TData>,
  stickyLayout: DataTableStickyLayout,
  scrollLeft: number,
) {
  if (scrollLeft <= 0 || stickyLayout.offsets.size === 0) return [];

  return table
    .getVisibleLeafColumns()
    .filter((column) => {
      const stickyLeft = stickyLayout.offsets.get(column.id);
      const naturalLeft = stickyLayout.naturalOffsets.get(column.id);
      if (stickyLeft === undefined || naturalLeft === undefined) return false;

      const activationOffset = Math.max(0, naturalLeft - stickyLeft);
      return scrollLeft + 1 >= activationOffset;
    })
    .map((column) => column.id);
}

function getPositionedColumnStyles<TData>(
  column: Column<TData>,
  isHeader: boolean,
  stickyHeader: boolean,
  stickyLayout: DataTableStickyLayout,
): CSSProperties {
  const pinned = column.getIsPinned();
  const stickyLeft = pinned ? undefined : stickyLayout.offsets.get(column.id);
  const sticky = stickyLeft !== undefined;

  return {
    position:
      pinned || sticky || (isHeader && stickyHeader)
        ? "sticky"
        : isHeader
          ? "relative"
          : undefined,
    left:
      pinned === "left"
        ? column.getStart("left")
        : sticky
          ? stickyLeft
          : undefined,
    right: pinned === "right" ? column.getAfter("right") : undefined,
    top: isHeader && stickyHeader ? 0 : undefined,
    width: column.getSize(),
    zIndex: isHeader
      ? stickyHeader
        ? pinned || sticky
          ? 4
          : 3
        : pinned || sticky
          ? 2
          : undefined
      : pinned || sticky
        ? 1
        : undefined,
  };
}

function getPinnedEdge<TData>(column: Column<TData>) {
  const pinned = column.getIsPinned();

  if (pinned === "left" && column.getIsLastColumn("left")) {
    return "left";
  }
  if (pinned === "right" && column.getIsFirstColumn("right")) {
    return "right";
  }
  return undefined;
}

export interface DataTableStickyState {
  activeColumnIds: ReadonlySet<string>;
  activeEdgeColumnId?: string;
}

export function useDataTableStickyState<TData>(
  scrollRef: RefObject<HTMLDivElement | null> | undefined,
  table: Table<TData>,
  stickyLayout: DataTableStickyLayout,
): DataTableStickyState {
  const [activeColumnIds, setActiveColumnIds] = useState<string[]>([]);
  const updateActiveColumns = useCallback(() => {
    const next = getActiveStickyColumnIds(
      table,
      stickyLayout,
      scrollRef?.current?.scrollLeft ?? 0,
    );

    setActiveColumnIds((current) =>
      areColumnIdListsEqual(current, next) ? current : next,
    );
  }, [scrollRef, stickyLayout, table]);

  useEffect(() => {
    const viewport = scrollRef?.current;
    if (!viewport) return;

    updateActiveColumns();
    viewport.addEventListener("scroll", updateActiveColumns, {
      passive: true,
    });

    return () => viewport.removeEventListener("scroll", updateActiveColumns);
  }, [scrollRef, updateActiveColumns]);

  const activeColumnIdSet = useMemo(
    () => new Set(activeColumnIds),
    [activeColumnIds],
  );

  return {
    activeColumnIds: activeColumnIdSet,
    activeEdgeColumnId: activeColumnIds[activeColumnIds.length - 1],
  };
}

export function useAppDataTable<TData>({
  data,
  columns,
  controls,
  pagination,
  getRowId,
  rowSelection,
  sorting,
  defaultSorting = [],
  onSortingChange,
  manualSorting = false,
  globalFilter,
  defaultGlobalFilter,
  onGlobalFilterChange,
  globalFilterFn,
  columnFilters,
  defaultColumnFilters = [],
  onColumnFiltersChange,
  filterFns,
  manualFiltering = false,
  columnVisibility,
  defaultColumnVisibility = {},
  onColumnVisibilityChange,
  enableColumnResizing = false,
  columnSizing,
  defaultColumnSizing = {},
  onColumnSizingChange,
  columnResizeMode = "onEnd",
  stickyHeader = false,
  stickyColumns,
  maxHeight,
  enableColumnPinning = true,
  columnPinning,
  defaultColumnPinning = {},
  onColumnPinningChange,
  loading = false,
  loadingContent,
  emptyContent,
  density = "compact",
  onRowClick,
  onRowContextMenu,
  className,
  style,
}: AppDataTableProps<TData>) {
  const { messages } = useAppLocale();
  const resolvedLoadingContent = loadingContent ?? messages.dataTable.loading;
  const resolvedEmptyContent = emptyContent ?? messages.dataTable.empty;
  const paginationEnabled = Boolean(pagination);
  const paginationOptions: AppDataTablePaginationOptions =
    typeof pagination === "object" ? pagination : {};
  const [internalSorting, setInternalSorting] = useState<SortingState>(
    () => defaultSorting,
  );
  const [internalGlobalFilter, setInternalGlobalFilter] = useState<unknown>(
    () => defaultGlobalFilter,
  );
  const [internalColumnFilters, setInternalColumnFilters] =
    useState<ColumnFiltersState>(() => defaultColumnFilters);
  const [internalColumnVisibility, setInternalColumnVisibility] =
    useState<VisibilityState>(() => defaultColumnVisibility);
  const [internalColumnSizing, setInternalColumnSizing] =
    useState<ColumnSizingState>(() => defaultColumnSizing);
  const [internalColumnPinning, setInternalColumnPinning] =
    useState<ColumnPinningState>(() => defaultColumnPinning);
  const [internalPagination, setInternalPagination] = useState<PaginationState>(
    () => ({
      pageIndex: 0,
      pageSize: 10,
      ...paginationOptions.defaultValue,
    }),
  );
  const resolvedSorting = sorting ?? internalSorting;
  const resolvedGlobalFilter =
    globalFilter !== undefined ? globalFilter : internalGlobalFilter;
  const resolvedColumnFilters = columnFilters ?? internalColumnFilters;
  const resolvedColumnVisibility = columnVisibility ?? internalColumnVisibility;
  const resolvedColumnSizing = columnSizing ?? internalColumnSizing;
  const resolvedColumnPinning = columnPinning ?? internalColumnPinning;
  const resolvedPagination = paginationOptions.value ?? internalPagination;
  const rowSelectionEnabled = rowSelection !== undefined;
  const rowSelectionMode = rowSelection?.mode ?? "multiple";
  const effectiveColumnPinning = useMemo<ColumnPinningState>(() => {
    if (!rowSelectionEnabled) return resolvedColumnPinning;

    const left = resolvedColumnPinning.left ?? [];
    const right = resolvedColumnPinning.right ?? [];

    return {
      ...resolvedColumnPinning,
      left: [
        APP_DATA_TABLE_ROW_SELECTION_COLUMN_ID,
        ...left.filter(
          (columnId) => columnId !== APP_DATA_TABLE_ROW_SELECTION_COLUMN_ID,
        ),
      ],
      right: right.filter(
        (columnId) => columnId !== APP_DATA_TABLE_ROW_SELECTION_COLUMN_ID,
      ),
    };
  }, [resolvedColumnPinning, rowSelectionEnabled]);
  const effectiveColumnVisibility = useMemo(
    () => ({
      ...resolvedColumnVisibility,
      ...(rowSelectionEnabled
        ? { [APP_DATA_TABLE_ROW_SELECTION_COLUMN_ID]: true }
        : undefined),
    }),
    [resolvedColumnVisibility, rowSelectionEnabled],
  );
  const selectAllMode = rowSelection?.selectAllMode ?? "filtered";
  const columnsWithControlFilters = useMemo(
    () => resolveControlFilterColumns(columns, controls?.filters ?? []),
    [columns, controls?.filters],
  );
  const getOptionalPaginationRowModel = useMemo(() => {
    const createPaginationRowModel = getPaginationRowModel<TData>();

    return (table: Table<TData>) => {
      const getPaginatedRows = createPaginationRowModel(table);

      return () =>
        (
          table.options.meta as
            { __appDataTablePaginationEnabled?: boolean } | undefined
        )?.__appDataTablePaginationEnabled
          ? getPaginatedRows()
          : table.getPrePaginationRowModel();
    };
  }, []);

  const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
    if (sorting === undefined) setInternalSorting(updater);
    onSortingChange?.(updater);
  };
  const handleGlobalFilterChange: OnChangeFn<unknown> = (updater) => {
    if (globalFilter === undefined) setInternalGlobalFilter(updater);
    onGlobalFilterChange?.(updater);
  };
  const handleColumnFiltersChange: OnChangeFn<ColumnFiltersState> = (
    updater,
  ) => {
    if (columnFilters === undefined) setInternalColumnFilters(updater);
    onColumnFiltersChange?.(updater);
  };
  const handleColumnVisibilityChange: OnChangeFn<VisibilityState> = (
    updater,
  ) => {
    if (columnVisibility === undefined) setInternalColumnVisibility(updater);
    onColumnVisibilityChange?.(updater);
  };
  const handleColumnSizingChange: OnChangeFn<ColumnSizingState> = (updater) => {
    if (columnSizing === undefined) setInternalColumnSizing(updater);
    onColumnSizingChange?.(updater);
  };
  const handleColumnPinningChange: OnChangeFn<ColumnPinningState> = (
    updater,
  ) => {
    if (columnPinning === undefined) setInternalColumnPinning(updater);
    onColumnPinningChange?.(updater);
  };
  const handlePaginationChange: OnChangeFn<PaginationState> = (updater) => {
    if (paginationOptions.value === undefined) {
      setInternalPagination(updater);
    }
    paginationOptions.onChange?.(updater);
  };

  const resolvedColumns = useMemo<ColumnDef<TData>[]>(() => {
    if (!rowSelectionEnabled) {
      return columnsWithControlFilters;
    }

    const rowSelectionColumnSize = rowSelectionMode === "single" ? 16 : 44;
    const rowSelectionColumn: ColumnDef<TData> = {
      id: APP_DATA_TABLE_ROW_SELECTION_COLUMN_ID,
      size: rowSelectionColumnSize,
      minSize: rowSelectionColumnSize,
      maxSize: rowSelectionColumnSize,
      enableSorting: false,
      enableHiding: false,
      enableResizing: false,
      enablePinning: false,
      header: ({ table }) => {
        if (rowSelectionMode === "single") return null;

        if (selectAllMode === "all") {
          return (
            <DataTableCheckbox
              aria-label={messages.dataTable.selectAllRows}
              animateIndicator={false}
              checked={table.getIsAllRowsSelected()}
              disabled={
                !table
                  .getCoreRowModel()
                  .flatRows.some((row) => row.getCanSelect())
              }
              indeterminate={table.getIsSomeRowsSelected()}
              onChange={table.getToggleAllRowsSelectedHandler()}
            />
          );
        }

        const selectionRowModel =
          selectAllMode === "page"
            ? table.getRowModel()
            : table.getFilteredRowModel();
        const selectableRows = selectionRowModel.flatRows.filter((row) =>
          row.getCanSelect(),
        );
        const selectedRowCount = selectableRows.filter((row) =>
          row.getIsSelected(),
        ).length;
        const allSelected =
          selectableRows.length > 0 &&
          selectedRowCount === selectableRows.length;

        return (
          <DataTableCheckbox
            aria-label={
              selectAllMode === "page"
                ? messages.dataTable.selectAllPageRows
                : messages.dataTable.selectAllFilteredRows
            }
            animateIndicator={false}
            checked={allSelected}
            disabled={selectableRows.length === 0}
            indeterminate={selectedRowCount > 0 && !allSelected}
            onChange={(event) => {
              const shouldSelect = event.currentTarget.checked;
              table.setRowSelection((current) => {
                const next = { ...current };
                for (const row of selectableRows) {
                  if (shouldSelect) {
                    next[row.id] = true;
                  } else {
                    delete next[row.id];
                  }
                }
                return next;
              });
            }}
          />
        );
      },
      cell: ({ row }) =>
        rowSelectionMode === "single" ? (
          <span
            aria-hidden="true"
            className="app-data-table__selection-indicator"
          />
        ) : (
          <DataTableCheckbox
            aria-label={messages.dataTable.selectRow(row.id)}
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            indeterminate={row.getIsSomeSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
    };
    return [rowSelectionColumn, ...columnsWithControlFilters];
  }, [
    columnsWithControlFilters,
    messages.dataTable,
    selectAllMode,
    rowSelectionEnabled,
    rowSelectionMode,
  ]);

  // TanStack Table intentionally exposes mutable table helpers to its renderer.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns: resolvedColumns,
    getRowId,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getOptionalPaginationRowModel,
    manualSorting,
    manualFiltering,
    ...(globalFilterFn !== undefined ? { globalFilterFn } : {}),
    filterFns,
    enableRowSelection: rowSelection?.enableRowSelection,
    enableMultiRowSelection: rowSelectionMode === "multiple",
    enableColumnResizing,
    columnResizeMode,
    enableColumnPinning,
    meta: { __appDataTablePaginationEnabled: paginationEnabled },
    state: {
      sorting: resolvedSorting,
      globalFilter: resolvedGlobalFilter,
      columnFilters: resolvedColumnFilters,
      columnVisibility: effectiveColumnVisibility,
      columnSizing: resolvedColumnSizing,
      columnPinning: effectiveColumnPinning,
      ...(rowSelection ? { rowSelection: rowSelection.value } : {}),
      ...(paginationEnabled ? { pagination: resolvedPagination } : {}),
    },
    onSortingChange: handleSortingChange,
    onGlobalFilterChange: handleGlobalFilterChange,
    onColumnFiltersChange: handleColumnFiltersChange,
    onColumnVisibilityChange: handleColumnVisibilityChange,
    onColumnSizingChange: handleColumnSizingChange,
    onColumnPinningChange: handleColumnPinningChange,
    onRowSelectionChange: rowSelection?.onChange,
    onPaginationChange: handlePaginationChange,
    autoResetPageIndex: paginationOptions.autoResetPageIndex ?? true,
  });
  const filterColumnIds = useMemo(
    () =>
      new Set(
        columnsWithControlFilters
          .map(getColumnDefinitionId)
          .filter((columnId): columnId is string => columnId !== undefined),
      ),
    [columnsWithControlFilters],
  );
  const filterDefinitions = useMemo(
    () =>
      controls?.filters?.filter((definition) =>
        filterColumnIds.has(definition.columnId),
      ) ?? [],
    [controls?.filters, filterColumnIds],
  );
  const tableState = table.getState();
  const stickyColumnKey = stickyColumns?.join("\u0000");
  const stickyColumnIds = useMemo(
    () =>
      stickyColumnKey === undefined
        ? undefined
        : stickyColumnKey === ""
          ? []
          : stickyColumnKey.split("\u0000"),
    [stickyColumnKey],
  );
  const stickyLayoutState = useMemo<DataTableLayoutState>(
    () => ({
      columnPinning: tableState.columnPinning,
      columnSizing: tableState.columnSizing,
      columnVisibility: tableState.columnVisibility,
    }),
    [
      tableState.columnPinning,
      tableState.columnSizing,
      tableState.columnVisibility,
    ],
  );
  const stickyLayout = useMemo(
    () => createStickyColumnLayout(table, stickyColumnIds, stickyLayoutState),
    [table, stickyColumnIds, stickyLayoutState],
  );

  useEffect(() => {
    if (!paginationEnabled) return;

    const pageCount = table.getPageCount();
    const pageIndex = table.getState().pagination.pageIndex;
    if (pageCount > 0 && pageIndex >= pageCount) {
      table.setPageIndex(pageCount - 1);
    }
  }, [
    data,
    paginationEnabled,
    resolvedColumnFilters,
    resolvedGlobalFilter,
    resolvedPagination.pageIndex,
    resolvedPagination.pageSize,
    resolvedSorting,
    table,
  ]);

  return {
    table,
    visibleColumnCount: table.getVisibleLeafColumns().length,
    density,
    stickyHeader,
    maxHeight,
    enableColumnResizing,
    columnResizeMode,
    loading,
    loadingContent: resolvedLoadingContent,
    emptyContent: resolvedEmptyContent,
    onRowClick,
    onRowContextMenu,
    className,
    style,
    paginationEnabled,
    paginationOptions,
    filterDefinitions,
    stickyLayout,
    rowSelectionEnabled,
    rowSelectionMode,
    selectAllMode,
  };
}

interface DataTableHeaderProps<TData> {
  filterDefinitions: AppDataTableFilterDefinition<TData>[];
  table: Table<TData>;
  stickyHeader: boolean;
  enableColumnResizing: boolean;
  columnResizeMode: ColumnResizeMode;
  stickyLayout: DataTableStickyLayout;
  stickyActiveColumnIds: ReadonlySet<string>;
  stickyActiveEdgeColumnId?: string;
}

function DataTableHeader<TData>({
  filterDefinitions,
  table,
  stickyHeader,
  enableColumnResizing,
  columnResizeMode,
  stickyLayout,
  stickyActiveColumnIds,
  stickyActiveEdgeColumnId,
}: DataTableHeaderProps<TData>) {
  const { messages } = useAppLocale();
  const filterDefinitionsByColumn = useMemo(
    () =>
      new Map(
        filterDefinitions.map((definition) => [
          definition.columnId,
          definition,
        ]),
      ),
    [filterDefinitions],
  );

  return (
    <thead>
      {table.getHeaderGroups().map((headerGroup) => (
        <tr key={headerGroup.id}>
          {headerGroup.headers.map((header) => {
            const sorted = header.column.getIsSorted();
            const canSort = header.column.getCanSort();
            const canResize =
              enableColumnResizing && header.column.getCanResize();
            const isResizing = header.column.getIsResizing();
            const resizeOffset =
              columnResizeMode === "onEnd" && isResizing
                ? (table.getState().columnSizingInfo.deltaOffset ?? 0)
                : 0;
            const resizeHandler = header.getResizeHandler();
            const isSelection =
              header.column.id === APP_DATA_TABLE_ROW_SELECTION_COLUMN_ID;
            const columnFilter = filterDefinitionsByColumn.get(
              header.column.id,
            );
            const isStickyColumn = stickyLayout.offsets.has(header.column.id);
            const pinned = header.column.getIsPinned();
            const isPinnedColumn = !isSelection && pinned !== false;
            const columnPosition = isStickyColumn
              ? "sticky"
              : isPinnedColumn
                ? "pinned"
                : undefined;
            const columnPositionLabel =
              columnPosition === "sticky"
                ? messages.dataTable.stickyColumn(header.column.id)
                : columnPosition === "pinned"
                  ? messages.dataTable.pinnedColumn(header.column.id)
                  : undefined;

            return (
              <th
                aria-sort={
                  sorted === "asc"
                    ? "ascending"
                    : sorted === "desc"
                      ? "descending"
                      : canSort
                        ? "none"
                        : undefined
                }
                colSpan={header.colSpan}
                data-column-id={header.column.id}
                data-pinned={header.column.getIsPinned() || undefined}
                data-pinned-edge={getPinnedEdge(header.column)}
                data-sticky-column={
                  isStickyColumn || undefined
                }
                data-sticky-edge={
                  stickyLayout.edgeColumnId === header.column.id
                    ? "left"
                    : undefined
                }
                data-sticky-active={
                  stickyActiveColumnIds.has(header.column.id) || undefined
                }
                data-sticky-active-edge={
                  stickyActiveEdgeColumnId === header.column.id
                    ? "left"
                    : undefined
                }
                key={header.id}
                role="columnheader"
                style={{
                  ...getPositionedColumnStyles(
                    header.column,
                    true,
                    stickyHeader,
                    stickyLayout,
                  ),
                  ...(isResizing ? { zIndex: 5 } : {}),
                }}
              >
                <div className="app-data-table__header-content">
                  {header.isPlaceholder ? null : isSelection ? (
                    <div className="app-data-table__header-label app-data-table__header-label--control">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </div>
                  ) : (
                    <>
                      {canSort ? (
                        <button
                          className="app-data-table__sort-button"
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <span className="app-data-table__header-title">
                            <span className="app-data-table__header-text">
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                            </span>
                            {columnPosition && columnPositionLabel ? (
                              <span
                                aria-label={columnPositionLabel}
                                className="app-data-table__column-position-indicator"
                                data-column-position={columnPosition}
                                role="img"
                                title={columnPositionLabel}
                              >
                                <Pin16Regular
                                  aria-hidden="true"
                                  focusable="false"
                                />
                              </span>
                            ) : null}
                          </span>
                        </button>
                      ) : (
                        <div className="app-data-table__header-label">
                          <span className="app-data-table__header-title">
                            <span className="app-data-table__header-text">
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                            </span>
                            {columnPosition && columnPositionLabel ? (
                              <span
                                aria-label={columnPositionLabel}
                                className="app-data-table__column-position-indicator"
                                data-column-position={columnPosition}
                                role="img"
                                title={columnPositionLabel}
                              >
                                <Pin16Regular
                                  aria-hidden="true"
                                  focusable="false"
                                />
                              </span>
                            ) : null}
                          </span>
                        </div>
                      )}
                      <div className="app-data-table__header-actions">
                        <span
                          aria-hidden="true"
                          className="app-data-table__header-status"
                        >
                          {sorted ? (
                            <span className="app-data-table__sort-indicator">
                              {sorted === "asc" ? (
                                <ArrowSortUp16Regular focusable="false" />
                              ) : (
                                <ArrowSortDown16Regular focusable="false" />
                              )}
                            </span>
                          ) : null}
                        </span>
                        <DataTableColumnMenu
                          column={header.column}
                          filterDefinition={columnFilter}
                        />
                      </div>
                    </>
                  )}
                </div>
                {canResize ? (
                  <div
                    aria-hidden="true"
                    className="app-data-table__resize-handle"
                    data-resizing={isResizing || undefined}
                    style={{ transform: `translateX(${resizeOffset}px)` }}
                    onDoubleClick={(event) => {
                      event.stopPropagation();
                      header.column.resetSize();
                    }}
                    onMouseDown={(event) => {
                      event.stopPropagation();
                      resizeHandler(event);
                    }}
                    onTouchStart={(event) => {
                      event.stopPropagation();
                      resizeHandler(event);
                    }}
                  >
                    <span className="app-data-table__resize-indicator" />
                  </div>
                ) : null}
              </th>
            );
          })}
        </tr>
      ))}
    </thead>
  );
}

interface DataTableFrameProps<TData> {
  filterDefinitions: AppDataTableFilterDefinition<TData>[];
  table: Table<TData>;
  density: "comfortable" | "compact";
  stickyHeader: boolean;
  maxHeight?: number | string;
  enableColumnResizing: boolean;
  columnResizeMode: ColumnResizeMode;
  loading: boolean;
  controls?: ReactNode;
  pagination?: ReactNode;
  state?: "empty" | "loading";
  stateContent?: ReactNode;
  scrollRef?: RefObject<HTMLDivElement | null>;
  virtualized?: boolean;
  stickyLayout: DataTableStickyLayout;
  stickyActiveColumnIds: ReadonlySet<string>;
  stickyActiveEdgeColumnId?: string;
  rowSelectionEnabled: boolean;
  rowSelectionMode: "single" | "multiple";
  cellSelectionEnabled?: boolean;
  cellSelecting?: boolean;
  onCopy?: (event: ClipboardEvent<HTMLDivElement>) => void;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

export function DataTableFrame<TData>({
  filterDefinitions,
  table,
  density,
  stickyHeader,
  maxHeight,
  enableColumnResizing,
  columnResizeMode,
  loading,
  controls,
  pagination,
  state,
  stateContent,
  scrollRef,
  virtualized = false,
  stickyLayout,
  stickyActiveColumnIds,
  stickyActiveEdgeColumnId,
  rowSelectionEnabled,
  rowSelectionMode,
  cellSelectionEnabled = false,
  cellSelecting = false,
  onCopy,
  className,
  style,
  children,
}: DataTableFrameProps<TData>) {
  const tableWidth = table.getTotalSize();

  return (
    <div
      className={`app-data-table app-data-table--${density} ${stickyHeader ? "app-data-table--sticky-header" : ""} ${controls ? "app-data-table--with-controls" : ""} ${pagination ? "app-data-table--with-pagination" : ""} ${virtualized ? "app-data-table--virtualized" : ""} ${rowSelectionEnabled ? `app-data-table--row-selection-${rowSelectionMode}` : ""} ${className ?? ""}`.trim()}
      data-cell-selecting={cellSelecting || undefined}
      data-cell-selection={cellSelectionEnabled || undefined}
      onCopy={onCopy}
      style={style}
    >
      {controls}
      <div
        className={[
          "app-data-table__viewport",
          state ? "app-data-table__viewport--with-state" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        style={{ maxHeight }}
      >
        <AppScrollArea
          className="app-data-table__scroll-area"
          orientation="both"
          ref={scrollRef}
          style={{ maxHeight }}
          viewportClassName="app-data-table__scroll"
          viewportStyle={{ maxHeight }}
        >
          <table
            aria-busy={loading || undefined}
            aria-colcount={table.getVisibleLeafColumns().length}
            aria-multiselectable={
              cellSelectionEnabled ||
              (rowSelectionEnabled && rowSelectionMode === "multiple")
                ? true
                : undefined
            }
            aria-rowcount={table.getRowModel().rows.length}
            className="app-data-table__table"
            role="grid"
            style={{ width: tableWidth, minWidth: tableWidth }}
          >
            <DataTableHeader
              columnResizeMode={columnResizeMode}
              enableColumnResizing={enableColumnResizing}
              filterDefinitions={filterDefinitions}
              stickyHeader={stickyHeader}
              stickyActiveColumnIds={stickyActiveColumnIds}
              stickyActiveEdgeColumnId={stickyActiveEdgeColumnId}
              stickyLayout={stickyLayout}
              table={table}
            />
            <tbody>{children}</tbody>
          </table>
        </AppScrollArea>
        {state ? (
          <div
            className="app-data-table__state-overlay"
            data-state={state}
            role={state === "loading" ? "status" : undefined}
          >
            {stateContent}
          </div>
        ) : null}
      </div>
      {pagination}
    </div>
  );
}

interface DataTableRowProps<TData> {
  row: Row<TData>;
  isSelected: boolean;
  isSomeSelected: boolean;
  canSelect: boolean;
  stickyHeader: boolean;
  onRowClick?: AppDataTableProps<TData>["onRowClick"];
  onRowContextMenu?: AppDataTableProps<TData>["onRowContextMenu"];
  rowHeight?: number;
  stickyLayout: DataTableStickyLayout;
  stickyActiveColumnIds: ReadonlySet<string>;
  stickyActiveEdgeColumnId?: string;
  cellNavigation?: DataTableCellNavigation;
  cellSelection?: DataTableCellSelectionInteraction;
  rowSelectionMode?: "single" | "multiple";
}

function DataTableRowImpl<TData>({
  row,
  isSelected,
  isSomeSelected,
  canSelect,
  stickyHeader,
  onRowClick,
  onRowContextMenu,
  rowHeight,
  stickyLayout,
  stickyActiveColumnIds,
  stickyActiveEdgeColumnId,
  cellNavigation,
  cellSelection,
  rowSelectionMode,
}: DataTableRowProps<TData>) {
  const selectionState = isSelected
    ? "selected"
    : isSomeSelected
      ? "mixed"
      : canSelect
        ? undefined
        : "disabled";
  const handleClick = (event: MouseEvent<HTMLTableRowElement>) => {
    if (isDataTableInteractiveTarget(event.target)) return;
    if (cellSelection?.consumeRowClick()) return;
    if (rowSelectionMode === "single" && row.getCanSelect()) {
      row.toggleSelected(true);
    }
    onRowClick?.(row, event);
  };
  const handleContextMenu = (event: MouseEvent<HTMLTableRowElement>) => {
    if (!onRowContextMenu || isDataTableInteractiveTarget(event.target)) return;
    onRowContextMenu(row, event);
  };

  return (
    <tr
      className={
        onRowClick || rowSelectionMode === "single"
          ? "app-data-table__row--clickable"
          : undefined
      }
      data-row-id={row.id}
      data-selected={isSelected || undefined}
      data-selection-state={selectionState}
      style={rowHeight !== undefined ? { height: rowHeight } : undefined}
      onClick={handleClick}
      onContextMenu={onRowContextMenu ? handleContextMenu : undefined}
    >
      {row.getVisibleCells().map((cell) => {
        const navigable = !isAppDataTableInternalColumn(cell.column.id);
        const active =
          navigable &&
          cellNavigation?.activeCell?.rowId === row.id &&
          cellNavigation.activeCell.columnId === cell.column.id;
        const position = { rowId: row.id, columnId: cell.column.id };
        const cellRangeState = navigable
          ? cellSelection?.getCellState(position)
          : undefined;

        return (
          <td
            aria-selected={
              cellSelection?.enabled
                ? Boolean(cellRangeState?.selected)
                : undefined
            }
            data-active-cell={active || undefined}
            data-column-id={cell.column.id}
            data-grid-cell={navigable || undefined}
            data-cell-selected={cellRangeState?.selected || undefined}
            data-cell-range-top={cellRangeState?.top || undefined}
            data-cell-range-bottom={cellRangeState?.bottom || undefined}
            data-cell-range-left={cellRangeState?.left || undefined}
            data-cell-range-right={cellRangeState?.right || undefined}
            data-pinned={cell.column.getIsPinned() || undefined}
            data-pinned-edge={getPinnedEdge(cell.column)}
            data-sticky-column={
              stickyLayout.offsets.has(cell.column.id) || undefined
            }
            data-sticky-edge={
              stickyLayout.edgeColumnId === cell.column.id ? "left" : undefined
            }
            data-sticky-active={
              stickyActiveColumnIds.has(cell.column.id) || undefined
            }
            data-sticky-active-edge={
              stickyActiveEdgeColumnId === cell.column.id ? "left" : undefined
            }
            key={cell.id}
            role="gridcell"
            tabIndex={navigable ? (active ? 0 : -1) : undefined}
            style={getPositionedColumnStyles(
              cell.column,
              false,
              stickyHeader,
              stickyLayout,
            )}
            onClick={
              navigable && cellNavigation
                ? (event) =>
                    cellNavigation.activateCell(
                      row.id,
                      cell.column.id,
                      event.currentTarget,
                      !isDataTableInteractiveTarget(event.target),
                    )
                : undefined
            }
            onPointerDown={
              navigable && cellSelection?.enabled
                ? (event) => cellSelection.onPointerDown(position, event)
                : undefined
            }
            onPointerEnter={
              navigable && cellSelection?.enabled
                ? () => cellSelection.onPointerEnter(position)
                : undefined
            }
            onFocus={
              navigable && cellNavigation
                ? (event) =>
                    cellNavigation.activateCell(
                      row.id,
                      cell.column.id,
                      event.currentTarget,
                      false,
                    )
                : undefined
            }
            onKeyDown={
              navigable && cellNavigation
                ? (event) => {
                    if (isDataTableInteractiveTarget(event.target)) return;
                    if (
                      event.key === "Enter" &&
                      (onRowClick || rowSelectionMode === "single")
                    ) {
                      event.preventDefault();
                      cellSelection?.clearRowClickSuppression();
                      event.currentTarget.closest("tr")?.click();
                      return;
                    }
                    cellNavigation.onKeyDown(row.id, cell.column.id, event);
                  }
                : undefined
            }
          >
            <div className="app-data-table__cell-content">
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </div>
          </td>
        );
      })}
    </tr>
  );
}

export const DataTableRow = memo(DataTableRowImpl) as typeof DataTableRowImpl;
