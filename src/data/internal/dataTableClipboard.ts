import type { Cell, Table } from "@tanstack/react-table";
import type { AppDataTableCellRange } from "../types";
import { getCellRangeBounds } from "./dataTableCellSelection";

/** Escapes a value for a TSV document while preserving tabs, line breaks, and quotes. */
export function escapeTsvValue(value: string) {
  if (!/[\t\r\n"]/.test(value)) return value;
  return `"${value.replace(/"/g, '""')}"`;
}

export function serializeDataTableCellRange<TData>(
  table: Table<TData>,
  range: AppDataTableCellRange | null,
  rowIds: readonly string[],
  columnIds: readonly string[],
  getCellCopyValue?: (cell: Cell<TData, unknown>) => string,
) {
  const bounds = getCellRangeBounds(range, rowIds, columnIds);
  if (!bounds) return "";

  const rowsById = new Map(
    table.getRowModel().rows.map((row) => [row.id, row]),
  );
  return rowIds
    .slice(bounds.top, bounds.bottom + 1)
    .map((rowId) => {
      const row = rowsById.get(rowId);
      if (!row) return "";
      const cellsByColumnId = new Map(
        row.getAllCells().map((cell) => [cell.column.id, cell]),
      );
      return columnIds
        .slice(bounds.left, bounds.right + 1)
        .map((columnId) => {
          const cell = cellsByColumnId.get(columnId);
          if (!cell) return "";
          const value = getCellCopyValue
            ? getCellCopyValue(cell)
            : String(cell.getValue() ?? "");
          return escapeTsvValue(String(value));
        })
        .join("\t");
    })
    .join("\n");
}
