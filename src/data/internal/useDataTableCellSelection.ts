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
  getCellRangeBounds,
  getCellRangeStateFromIndices,
  type DataTableCellRangeState,
} from "./dataTableCellSelection";

const EDGE_SIZE = 32;
const MAX_SCROLL_SPEED = 18;

const interactiveSelector = [
  "a",
  "button",
  "input",
  "select",
  "textarea",
  '[contenteditable="true"]',
  '[role="button"]',
  '[role="checkbox"]',
  '[role="link"]',
  '[role="menuitem"]',
  '[role="switch"]',
].join(",");

export function isDataTableInteractiveTarget(target: EventTarget | null) {
  return (
    target instanceof Element && target.closest(interactiveSelector) !== null
  );
}

interface UseDataTableCellSelectionOptions {
  options: boolean | AppDataTableCellSelectionOptions | undefined;
  rowIds: readonly string[];
  columnIds: readonly string[];
  scrollRef: RefObject<HTMLDivElement | null>;
  pageIndex?: number;
  activateCell: (position: AppDataTableCellPosition, focus: boolean) => void;
}

export interface DataTableCellSelectionInteraction {
  enabled: boolean;
  selecting: boolean;
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
}

export function useDataTableCellSelection({
  options,
  rowIds,
  columnIds,
  scrollRef,
  pageIndex,
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
  const pointerRef = useRef({ x: 0, y: 0 });
  const frameRef = useRef<number | null>(null);
  const previousPageIndexRef = useRef(pageIndex);

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

  const updateFromPoint = useCallback(
    (x: number, y: number) => {
      if (typeof document.elementFromPoint !== "function") return;
      const cell = document
        .elementFromPoint(x, y)
        ?.closest<HTMLTableCellElement>('td[data-grid-cell="true"]');
      const rowId = cell?.closest("tr")?.dataset.rowId;
      const columnId = cell?.dataset.columnId;
      if (
        cell &&
        scrollRef.current?.contains(cell) &&
        rowId &&
        columnId &&
        rowIds.includes(rowId) &&
        columnIds.includes(columnId)
      ) {
        const position = { rowId, columnId };
        extendSelection(position);
        activateCell(position, false);
      }
    },
    [activateCell, columnIds, extendSelection, rowIds, scrollRef],
  );

  const stopSelecting = useCallback(() => {
    selectingRef.current = false;
    setSelecting(false);
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
  }, []);

  useEffect(() => {
    if (!selecting) return;

    const autoScroll = () => {
      const viewport = scrollRef.current;
      if (!viewport || !selectingRef.current) return;
      const rect = viewport.getBoundingClientRect();
      const { x, y } = pointerRef.current;
      const edgeSpeed = (distance: number) =>
        Math.ceil(MAX_SCROLL_SPEED * Math.min(1, distance / EDGE_SIZE));
      let dx = 0;
      let dy = 0;
      if (x < rect.left + EDGE_SIZE) dx = -edgeSpeed(rect.left + EDGE_SIZE - x);
      else if (x > rect.right - EDGE_SIZE)
        dx = edgeSpeed(x - rect.right + EDGE_SIZE);
      if (y < rect.top + EDGE_SIZE) dy = -edgeSpeed(rect.top + EDGE_SIZE - y);
      else if (y > rect.bottom - EDGE_SIZE)
        dy = edgeSpeed(y - rect.bottom + EDGE_SIZE);
      if (dx || dy) {
        viewport.scrollLeft += dx;
        viewport.scrollTop += dy;
        updateFromPoint(x, y);
      }
      frameRef.current = requestAnimationFrame(autoScroll);
    };
    const handlePointerMove = (event: PointerEvent) => {
      pointerRef.current = { x: event.clientX, y: event.clientY };
      updateFromPoint(event.clientX, event.clientY);
    };
    const handlePointerUp = () => stopSelecting();
    document.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("blur", handlePointerUp);
    frameRef.current = requestAnimationFrame(autoScroll);
    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("blur", handlePointerUp);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    };
  }, [scrollRef, selecting, stopSelecting, updateFromPoint]);

  useEffect(() => {
    if (previousPageIndexRef.current === pageIndex) return;
    previousPageIndexRef.current = pageIndex;
    clearSelection();
  }, [clearSelection, pageIndex]);

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
      event.preventDefault();
      pointerRef.current = { x: event.clientX, y: event.clientY };
      if (event.shiftKey)
        extendSelection(position, rangeRef.current?.anchor ?? position);
      else selectCell(position);
      activateCell(position, true);
      selectingRef.current = true;
      setSelecting(true);
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

  const rangeBounds = useMemo(
    () => getCellRangeBounds(range, rowIds, columnIds),
    [columnIds, range, rowIds],
  );
  const rowIndices = useMemo(
    () => new Map(rowIds.map((rowId, index) => [rowId, index])),
    [rowIds],
  );
  const columnIndices = useMemo(
    () => new Map(columnIds.map((columnId, index) => [columnId, index])),
    [columnIds],
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

  return useMemo(
    () => ({
      enabled,
      selecting,
      range,
      selectCell,
      extendSelection,
      clearSelection,
      getCellState,
      onPointerDown,
      onPointerEnter,
    }),
    [
      clearSelection,
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
