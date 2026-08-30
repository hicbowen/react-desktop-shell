import type { AppDataTableCellPosition, AppDataTableCellRange } from "../types";

export interface DataTableCellRangeBounds {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface DataTableCellRangeState {
  selected: boolean;
  top: boolean;
  bottom: boolean;
  left: boolean;
  right: boolean;
}

export function getCellRangeBounds(
  range: AppDataTableCellRange | null,
  rowIds: readonly string[],
  columnIds: readonly string[],
): DataTableCellRangeBounds | null {
  if (!range) return null;

  const anchorRow = rowIds.indexOf(range.anchor.rowId);
  const focusRow = rowIds.indexOf(range.focus.rowId);
  const anchorColumn = columnIds.indexOf(range.anchor.columnId);
  const focusColumn = columnIds.indexOf(range.focus.columnId);
  if (anchorRow < 0 || focusRow < 0 || anchorColumn < 0 || focusColumn < 0) {
    return null;
  }

  return {
    top: Math.min(anchorRow, focusRow),
    bottom: Math.max(anchorRow, focusRow),
    left: Math.min(anchorColumn, focusColumn),
    right: Math.max(anchorColumn, focusColumn),
  };
}

export function normalizeCellRange(
  range: AppDataTableCellRange,
  rowIds: readonly string[],
  columnIds: readonly string[],
): AppDataTableCellRange | null {
  const bounds = getCellRangeBounds(range, rowIds, columnIds);
  if (!bounds) return null;

  return {
    anchor: {
      rowId: rowIds[bounds.top]!,
      columnId: columnIds[bounds.left]!,
    },
    focus: {
      rowId: rowIds[bounds.bottom]!,
      columnId: columnIds[bounds.right]!,
    },
  };
}

export function isCellInRange(
  position: AppDataTableCellPosition,
  range: AppDataTableCellRange | null,
  rowIds: readonly string[],
  columnIds: readonly string[],
) {
  return getCellRangeState(position, range, rowIds, columnIds).selected;
}

export function getCellRangeState(
  position: AppDataTableCellPosition,
  range: AppDataTableCellRange | null,
  rowIds: readonly string[],
  columnIds: readonly string[],
): DataTableCellRangeState {
  const bounds = getCellRangeBounds(range, rowIds, columnIds);
  const row = rowIds.indexOf(position.rowId);
  const column = columnIds.indexOf(position.columnId);
  return getCellRangeStateFromIndices(row, column, bounds);
}

export function getCellRangeStateFromIndices(
  row: number,
  column: number,
  bounds: DataTableCellRangeBounds | null,
): DataTableCellRangeState {
  const selected =
    bounds !== null &&
    row >= bounds.top &&
    row <= bounds.bottom &&
    column >= bounds.left &&
    column <= bounds.right;

  return {
    selected,
    top: selected && row === bounds!.top,
    bottom: selected && row === bounds!.bottom,
    left: selected && column === bounds!.left,
    right: selected && column === bounds!.right,
  };
}
