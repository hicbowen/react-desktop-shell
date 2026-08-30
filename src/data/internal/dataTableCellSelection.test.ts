import { describe, expect, it } from "vitest";
import {
  getCellRangeBounds,
  getCellRangeState,
  isCellInRange,
  normalizeCellRange,
} from "./dataTableCellSelection";

const rows = ["r1", "r2", "r3", "r4"];
const columns = ["a", "b", "c", "d"];

describe("dataTableCellSelection", () => {
  const reverseRange = {
    anchor: { rowId: "r4", columnId: "d" },
    focus: { rowId: "r2", columnId: "b" },
  };

  it("normalizes ranges dragged in reverse", () => {
    expect(getCellRangeBounds(reverseRange, rows, columns)).toEqual({
      top: 1,
      bottom: 3,
      left: 1,
      right: 3,
    });
    expect(normalizeCellRange(reverseRange, rows, columns)).toEqual({
      anchor: { rowId: "r2", columnId: "b" },
      focus: { rowId: "r4", columnId: "d" },
    });
  });

  it("reports membership and only the outer range edges", () => {
    expect(
      isCellInRange(
        { rowId: "r3", columnId: "c" },
        reverseRange,
        rows,
        columns,
      ),
    ).toBe(true);
    expect(
      getCellRangeState(
        { rowId: "r2", columnId: "c" },
        reverseRange,
        rows,
        columns,
      ),
    ).toEqual({
      selected: true,
      top: true,
      bottom: false,
      left: false,
      right: false,
    });
    expect(
      getCellRangeState(
        { rowId: "r1", columnId: "a" },
        reverseRange,
        rows,
        columns,
      ).selected,
    ).toBe(false);
  });

  it("rejects endpoints absent from the current row or column model", () => {
    expect(
      getCellRangeBounds(
        {
          anchor: { rowId: "missing", columnId: "a" },
          focus: { rowId: "r2", columnId: "b" },
        },
        rows,
        columns,
      ),
    ).toBeNull();
  });
});
