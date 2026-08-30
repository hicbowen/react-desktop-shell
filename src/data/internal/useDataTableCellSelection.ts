import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";
import type {
  AppDataTableCellPosition,
  AppDataTableCellRange,
  AppDataTableCellSelectionOptions,
} from "../types";
import {
  getCellRangeBoundsFromIndices,
  getCellRangeStateFromIndices,
  type DataTableCellRangeState,
} from "./dataTableCellSelection";
import { isDataTableInteractiveTarget } from "./dataTableInteraction";

const EDGE_SIZE = 32;
const MAX_SCROLL_SPEED = 18;
const DRAG_THRESHOLD = 4;

interface UseDataTableCellSelectionOptions {
  options: boolean | AppDataTableCellSelectionOptions | undefined;
  rowIds: readonly string[];
  columnIds: readonly string[];
  scrollRef: RefObject<HTMLDivElement | null>;
  activateCell: (position: AppDataTableCellPosition, focus: boolean) => void;
}

export interface DataTableCellSelectionInteraction {
  enabled: boolean;
  selecting: boolean;
  didDrag: boolean;
  range: AppDataTableCellRange | null;
  selectCell: (position: AppDataTableCellPosition) => void;
  extendSelection: (
    position: AppDataTableCellPosition,
    fallbackAnchor?: AppDataTableCellPosition,
  ) => void;
  clearSelection: () => void;
  getCellState: (position: AppDataTableCellPosition) => DataTableCellRangeState;
  onPointerDown: (
    position: AppDataTableCellPosition,
    event: ReactPointerEvent<HTMLTableCellElement>,
  ) => void;
  onPointerEnter: (position: AppDataTableCellPosition) => void;
  consumeRowClick: () => boolean;
}

export function useDataTableCellSelection({
  options,
  rowIds,
  columnIds,
  scrollRef,
  activateCell,
}: UseDataTableCellSelectionOptions): DataTableCellSelectionInteraction {
  const enabled = Boolean(options);
  const config = typeof options === "object" ? options : undefined;
  const controlled = config?.value !== undefined;
  const [internalRange, setInternalRange] =
    useState<AppDataTableCellRange | null>(null);
  const range = controlled ? (config.value ?? null) : internalRange;
  const rangeRef = useRef(range);
  const [selecting, setSelecting] = useState(false);
  const selectingRef = useRef(false);
  const [didDrag, setDidDrag] = useState(false);
  const didDragRef = useRef(false);
  const pointerDownRef = useRef(false);
  const pointerOriginRef = useRef({ x: 0, y: 0 });
  const pointerRef = useRef({ x: 0, y: 0 });
  const frameRef = useRef<number | null>(null);
  const invalidRangeRef = useRef<string | null>(null);

  const rowIndices = useMemo(
    () => new Map(rowIds.map((rowId, index) => [rowId, index])),
    [rowIds],
  );
  const columnIndices = useMemo(
    () => new Map(columnIds.map((columnId, index) => [columnId, index])),
    [columnIds],
  );

  useEffect(() => {
    rangeRef.current = range;
  }, [range]);

  const updateRange = useCallback(
    (next: AppDataTableCellRange | null) => {
      rangeRef.current = next;
      if (!controlled) setInternalRange(next);
      config?.onChange?.(next);
    },
    [config, controlled],
  );

  const selectCell = useCallback(
    (position: AppDataTableCellPosition) => {
      if (!enabled) return;
      updateRange({ anchor: position, focus: position });
    },
    [enabled, updateRange],
  );

  const extendSelection = useCallback(
    (
      position: AppDataTableCellPosition,
      fallbackAnchor: AppDataTableCellPosition = position,
    ) => {
      if (!enabled) return;
      updateRange({
        anchor: rangeRef.current?.anchor ?? fallbackAnchor,
        focus: position,
      });
    },
    [enabled, updateRange],
  );

  const clearSelection = useCallback(() => updateRange(null), [updateRange]);

  const rangeBounds = useMemo(
    () => getCellRangeBoundsFromIndices(range, rowIndices, columnIndices),
    [columnIndices, range, rowIndices],
  );

  useEffect(() => {
    if (!range || rangeBounds !== null) {
      invalidRangeRef.current = null;
      return;
    }
    const invalidKey = [
      range.anchor.rowId,
      range.anchor.columnId,
      range.focus.rowId,
      range.focus.columnId,
      rowIds.join("\u0001"),
      columnIds.join("\u0001"),
    ].join("\u0000");
    if (invalidRangeRef.current === invalidKey) return;
    invalidRangeRef.current = invalidKey;
    clearSelection();
  }, [clearSelection, columnIds, range, rangeBounds, rowIds]);

  const clampPointToViewport = useCallback(
    (x: number, y: number) => {
      const viewport = scrollRef.current;
      if (!viewport) return { x, y };
      const rect = viewport.getBoundingClientRect();
      if (rect.right <= rect.left || rect.bottom <= rect.top) return { x, y };
      return {
        x: Math.min(Math.max(x, rect.left), rect.right - 1),
        y: Math.min(Math.max(y, rect.top), rect.bottom - 1),
      };
    },
    [scrollRef],
  );

  const updateFromPoint = useCallback(
    (x: number, y: number) => {
      if (typeof document.elementFromPoint !== "function") return;
      const point = clampPointToViewport(x, y);
      const cell = document
        .elementFromPoint(point.x, point.y)
        ?.closest<HTMLTableCellElement>('td[data-grid-cell="true"]');
      const viewport = scrollRef.current;
      const rowId = cell?.closest("tr")?.dataset.rowId;
      const columnId = cell?.dataset.columnId;
      const rowIndex = rowId === undefined ? undefined : rowIndices.get(rowId);
      const columnIndex =
        columnId === undefined ? undefined : columnIndices.get(columnId);
      if (
        cell &&
        viewport?.contains(cell) &&
        rowId !== undefined &&
        columnId !== undefined &&
        rowIndex !== undefined &&
        columnIndex !== undefined
      ) {
        const position = { rowId, columnId };
        extendSelection(position);
        activateCell(position, false);
      }
    },
    [
      activateCell,
      clampPointToViewport,
      columnIndices,
      extendSelection,
      rowIndices,
      scrollRef,
    ],
  );

  const stopSelecting = useCallback(() => {
    pointerDownRef.current = false;
    selectingRef.current = false;
    setSelecting(false);
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const autoScroll = () => {
      const viewport = scrollRef.current;
      if (!viewport || !pointerDownRef.current || !selectingRef.current) {
        frameRef.current = null;
        return;
      }
      const rect = viewport.getBoundingClientRect();
      const { x, y } = pointerRef.current;
      const edgeSpeed = (distance: number) =>
        Math.ceil(MAX_SCROLL_SPEED * Math.min(1, distance / EDGE_SIZE));
      let dx = 0;
      let dy = 0;
      if (x < rect.left + EDGE_SIZE) {
        dx = -edgeSpeed(rect.left + EDGE_SIZE - x);
      } else if (x > rect.right - EDGE_SIZE) {
        dx = edgeSpeed(x - rect.right + EDGE_SIZE);
      }
      if (y < rect.top + EDGE_SIZE) {
        dy = -edgeSpeed(rect.top + EDGE_SIZE - y);
      } else if (y > rect.bottom - EDGE_SIZE) {
        dy = edgeSpeed(y - rect.bottom + EDGE_SIZE);
      }
      if (dx || dy) {
        viewport.scrollLeft += dx;
        viewport.scrollTop += dy;
        updateFromPoint(x, y);
      }
      frameRef.current = requestAnimationFrame(autoScroll);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!pointerDownRef.current) return;
      pointerRef.current = { x: event.clientX, y: event.clientY };
      if (!selectingRef.current) {
        const origin = pointerOriginRef.current;
        const distance = Math.hypot(
          event.clientX - origin.x,
          event.clientY - origin.y,
        );
        if (distance < DRAG_THRESHOLD) return;
        event.preventDefault();
        selectingRef.current = true;
        didDragRef.current = true;
        setSelecting(true);
        setDidDrag(true);
        autoScroll();
      }
      updateFromPoint(event.clientX, event.clientY);
    };
    const handlePointerUp = () => stopSelecting();

    document.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
    window.addEventListener("blur", handlePointerUp);
    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
      window.removeEventListener("blur", handlePointerUp);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    };
  }, [enabled, scrollRef, stopSelecting, updateFromPoint]);

  const onPointerDown = useCallback(
    (
      position: AppDataTableCellPosition,
      event: ReactPointerEvent<HTMLTableCellElement>,
    ) => {
      if (
        !enabled ||
        event.button !== 0 ||
        !event.isPrimary ||
        isDataTableInteractiveTarget(event.target)
      ) {
        return;
      }
      pointerDownRef.current = true;
      selectingRef.current = false;
      didDragRef.current = false;
      setSelecting(false);
      setDidDrag(false);
      pointerOriginRef.current = { x: event.clientX, y: event.clientY };
      pointerRef.current = { x: event.clientX, y: event.clientY };
      if (event.shiftKey) {
        extendSelection(position, rangeRef.current?.anchor ?? position);
      } else {
        selectCell(position);
      }
      activateCell(position, true);
    },
    [activateCell, enabled, extendSelection, selectCell],
  );

  const onPointerEnter = useCallback(
    (position: AppDataTableCellPosition) => {
      if (!selectingRef.current) return;
      extendSelection(position);
      activateCell(position, false);
    },
    [activateCell, extendSelection],
  );

  const getCellState = useCallback(
    (position: AppDataTableCellPosition) =>
      getCellRangeStateFromIndices(
        rowIndices.get(position.rowId) ?? -1,
        columnIndices.get(position.columnId) ?? -1,
        rangeBounds,
      ),
    [columnIndices, rangeBounds, rowIndices],
  );

  const consumeRowClick = useCallback(() => {
    if (!didDragRef.current) return false;
    didDragRef.current = false;
    setDidDrag(false);
    return true;
  }, []);

  return useMemo(
    () => ({
      enabled,
      selecting,
      didDrag,
      range,
      selectCell,
      extendSelection,
      clearSelection,
      getCellState,
      onPointerDown,
      onPointerEnter,
      consumeRowClick,
    }),
    [
      clearSelection,
      consumeRowClick,
      didDrag,
      enabled,
      extendSelection,
      getCellState,
      onPointerDown,
      onPointerEnter,
      range,
      selectCell,
      selecting,
    ],
  );
}
