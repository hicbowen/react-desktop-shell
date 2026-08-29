// @vitest-environment jsdom

import { act, useState, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { ColumnDef, RowSelectionState } from "@tanstack/react-table";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { AppDataTable } from "./AppDataTable";
import { AppShell } from "../shell/AppShell";
import type { AppDataTableControlsOptions } from "./types";

interface RowData {
  id: string;
  name: string;
  category: string;
  status: string;
}

const data: RowData[] = [
  { id: "2", name: "Beta", category: "Media", status: "Processing" },
  { id: "1", name: "Alpha", category: "Document", status: "Ready" },
  { id: "3", name: "Gamma", category: "Archive", status: "Paused" },
  { id: "4", name: "Delta", category: "Document", status: "Ready" },
];

const pagedData: RowData[] = Array.from({ length: 24 }, (_, index) => ({
  id: String(index + 1),
  name: `Item ${String(index + 1).padStart(2, "0")}`,
  category: index % 2 === 0 ? "Document" : "Media",
  status: index % 3 === 0 ? "Ready" : "Processing",
}));

const virtualData: RowData[] = Array.from({ length: 100 }, (_, index) => ({
  id: String(index + 1),
  name: `Virtual ${String(index + 1).padStart(3, "0")}`,
  category: index % 2 === 0 ? "Document" : "Media",
  status: index % 3 === 0 ? "Ready" : "Processing",
}));

const columns: ColumnDef<RowData>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "category", header: "Category" },
  { accessorKey: "status", header: "Status" },
];

const controls: AppDataTableControlsOptions<RowData> = {
  search: true,
  filters: [
    {
      columnId: "category",
      label: "Category",
      options: [
        { value: "Document", label: "Document" },
        { value: "Media", label: "Media" },
        { value: "Archive", label: "Archive" },
      ],
    },
    {
      columnId: "status",
      label: "Status",
      mode: "multiple",
      options: [
        { value: "Ready", label: "Ready" },
        { value: "Processing", label: "Processing" },
        { value: "Paused", label: "Paused" },
      ],
    },
  ],
};

describe("AppDataTable controls", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeAll(async () => {
    await import("./internal/AppDataTableVirtualRows");
  });

  beforeEach(() => {
    (
      globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
    ).IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
      configurable: true,
      get: () => 200,
    });
    Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
      configurable: true,
      get: () => 800,
    });
    Object.defineProperty(HTMLElement.prototype, "scrollHeight", {
      configurable: true,
      get: () => 4800,
    });
    Object.defineProperty(HTMLElement.prototype, "scrollTo", {
      configurable: true,
      value(this: HTMLElement, options: ScrollToOptions | number) {
        this.scrollTop =
          typeof options === "number" ? options : (options.top ?? 0);
      },
    });
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  const render = (node: ReactNode) => act(() => root.render(node));
  const settleVirtualization = () =>
    act(async () => {
      for (let index = 0; index < 3; index += 1) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    });
  const renderTable = (
    props: Partial<React.ComponentProps<typeof AppDataTable<RowData>>> = {},
  ) =>
    render(
      <AppDataTable
        columns={columns}
        controls={controls}
        data={data}
        getRowId={(row) => row.id}
        {...props}
      />,
    );
  const bodyRows = () =>
    Array.from(container.querySelectorAll<HTMLTableRowElement>("tbody tr"));
  const searchInput = () =>
    container.querySelector<HTMLInputElement>('[aria-label="Search rows"]')!;
  const setSearch = (value: string) => {
    const input = searchInput();
    const valueSetter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )?.set;
    act(() => {
      valueSetter?.call(input, value);
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
  };
  const contextMenu = (target: Element, options: MouseEventInit = {}) => {
    const event = new MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
      ...options,
    });
    act(() => target.dispatchEvent(event));
    return event;
  };
  const columnMenuButton = (columnId = "category") =>
    container.querySelector<HTMLButtonElement>(
      `th[data-column-id="${columnId}"] .app-data-table__column-menu-button`,
    )!;
  const filterButton = () => columnMenuButton("category");
  const openFilters = (columnId = "category") =>
    act(() => columnMenuButton(columnId).click());
  const filterMenu = () =>
    document.body.querySelector<HTMLElement>(".app-data-table__column-menu");
  const option = (type: "radio" | "checkbox", label: string) =>
    Array.from(
      document.body.querySelectorAll<HTMLInputElement>(`input[type="${type}"]`),
    ).find((input) =>
      input.closest("label")?.textContent?.trim().endsWith(label),
    )!;
  const flyoutItem = (label: string) =>
    Array.from(
      document.body.querySelectorAll<HTMLButtonElement>("[data-action]"),
    ).find((button) => button.textContent?.trim() === label)!;

  it("renders only the checkbox column for multiple selection and uses compact density by default", () => {
    renderTable({
      selection: { value: {}, onChange: vi.fn() },
      pagination: true,
    });

    const headers = Array.from(container.querySelectorAll("th"));
    expect(headers.map((header) => header.dataset.columnId)).toEqual([
      "__app_data_table_selection",
      "name",
      "category",
      "status",
    ]);
    expect(headers[0]?.style.width).toBe("44px");
    expect(headers[0]?.dataset.pinned).toBe("left");
    expect(headers[0]?.style.position).toBe("sticky");
    expect(headers[0]?.style.left).toBe("0px");
    expect(container.querySelector(".app-data-table--compact")).not.toBeNull();
    expect(
      container.querySelector(".app-data-table--selection-multiple"),
    ).not.toBeNull();
    expect(container.querySelector(".app-pagination--compact")).not.toBeNull();
    expect(
      container.querySelector('[data-column-id="__app_data_table_corner"]'),
    ).toBeNull();
    expect(
      bodyRows()[0]?.querySelector(
        'td[data-column-id="__app_data_table_selection"] .app-data-table__cell-content',
      ),
    ).not.toBeNull();
    expect(
      bodyRows()[0]?.querySelector(
        'td[data-column-id="__app_data_table_selection"]',
      )?.getAttribute("data-pinned"),
    ).toBe("left");
  });

  it("keeps the header mixed-selection visual state stable when selecting rows", () => {
    function Harness() {
      const [selection, setSelection] = useState<RowSelectionState>({});
      return (
        <AppDataTable
          columns={columns}
          data={data}
          getRowId={(row) => row.id}
          selection={{ value: selection, onChange: setSelection }}
        />
      );
    }

    render(<Harness />);

    const rowCheckboxes = () =>
      container.querySelectorAll<HTMLInputElement>(
        "tbody input[type=checkbox]",
      );
    const initialHeaderControl = container.querySelector<HTMLElement>(
      "thead .app-data-table__checkbox-control",
    );
    const headerIndicator = () =>
      container.querySelector<HTMLElement>(
        "thead .app-check-box__indeterminate",
      );

    act(() => rowCheckboxes()[0]?.click());
    expect(
      container.querySelector("thead .app-data-table__checkbox-control"),
    ).toBe(initialHeaderControl);
    expect(initialHeaderControl?.dataset.state).toBe("mixed");
    expect(initialHeaderControl?.className).toContain(
      "app-data-table__checkbox-control--static-indicator",
    );
    expect(container.querySelector<HTMLInputElement>("thead input")?.indeterminate).toBe(
      true,
    );
    expect(headerIndicator()?.className).not.toContain(
      "app-check-box__indeterminate--animated",
    );

    act(() => rowCheckboxes()[1]?.click());
    expect(
      container.querySelector("thead .app-data-table__checkbox-control"),
    ).toBe(initialHeaderControl);
    expect(initialHeaderControl?.dataset.state).toBe("mixed");
    expect(headerIndicator()?.className).not.toContain(
      "app-check-box__indeterminate--animated",
    );
  });

  it("keeps the selection column pinned when column pinning is disabled", () => {
    renderTable({
      enableColumnPinning: false,
      selection: { value: {}, onChange: vi.fn() },
    });

    const selectionHeader = container.querySelector<HTMLElement>(
      'th[data-column-id="__app_data_table_selection"]',
    );
    const selectionCell = container.querySelector<HTMLElement>(
      'tbody td[data-column-id="__app_data_table_selection"]',
    );

    expect(selectionHeader?.dataset.pinned).toBe("left");
    expect(selectionHeader?.style.left).toBe("0px");
    expect(selectionCell?.dataset.pinned).toBe("left");
    expect(selectionCell?.style.left).toBe("0px");
  });

  it("keeps explicit comfortable density available", async () => {
    renderTable({
      density: "comfortable",
      virtualization: true,
      maxHeight: 200,
    });
    await settleVirtualization();

    expect(
      container.querySelector(".app-data-table--comfortable"),
    ).not.toBeNull();
    expect(
      bodyRows().find(
        (row) => !row.classList.contains("app-data-table__virtual-spacer"),
      )?.style.height,
    ).toBe("48px");
  });

  it("opens a column popover without sorting and keeps only sort and filter actions", () => {
    renderTable();
    const trigger = container.querySelector<HTMLButtonElement>(
      '[aria-label="name column actions"]',
    )!;

    act(() => trigger.click());
    expect(bodyRows()[0]?.textContent).toContain("Beta");
    act(() => flyoutItem("Sort ascending").click());
    expect(bodyRows()[0]?.textContent).toContain("Alpha");

    act(() => trigger.click());
    expect(filterMenu()?.classList).toContain("app-popover");
    expect(flyoutItem("Hide column")).toBeUndefined();
    expect(flyoutItem("Pin column left")).toBeUndefined();
    expect(flyoutItem("Reset column width")).toBeUndefined();
  });

  it("uses a narrow indicator column and row activation for single selection", () => {
    function Harness() {
      const [selection, setSelection] = useState<RowSelectionState>({});
      return (
        <>
          <output data-testid="single-selection-count">
            {Object.values(selection).filter(Boolean).length}
          </output>
          <AppDataTable
            columns={columns}
            data={data}
            getRowId={(row) => row.id}
            selection={{
              value: selection,
              onChange: setSelection,
              mode: "single",
            }}
          />
        </>
      );
    }

    render(<Harness />);
    expect(container.querySelector('thead input[type="checkbox"]')).toBeNull();
    const selectionHeader = container.querySelector<HTMLTableCellElement>(
      'th[data-column-id="__app_data_table_selection"]',
    );
    expect(selectionHeader?.style.width).toBe("16px");
    expect(selectionHeader?.dataset.pinned).toBe("left");
    expect(selectionHeader?.style.left).toBe("0px");
    expect(selectionHeader?.querySelector("button")).toBeNull();
    expect(
      bodyRows()[0]?.querySelector(".app-data-table__selection-indicator"),
    ).not.toBeNull();
    expect(
      container.querySelector(".app-data-table--selection-single"),
    ).not.toBeNull();

    act(() => bodyRows()[0]?.click());
    expect(
      container.querySelector('[data-testid="single-selection-count"]')
        ?.textContent,
    ).toBe("1");
    expect(bodyRows()[0]?.dataset.selected).toBe("true");

    act(() => bodyRows()[1]?.click());
    expect(
      container.querySelector('[data-testid="single-selection-count"]')
        ?.textContent,
    ).toBe("1");
    expect(bodyRows()[0]?.hasAttribute("data-selected")).toBe(false);
    expect(bodyRows()[1]?.dataset.selected).toBe("true");
  });

  it("provides roving cell focus and desktop grid keyboard navigation", async () => {
    renderTable();
    const first = container.querySelector<HTMLTableCellElement>(
      'tbody tr[data-row-id="2"] td[data-column-id="name"]',
    )!;
    const category = container.querySelector<HTMLTableCellElement>(
      'tbody tr[data-row-id="2"] td[data-column-id="category"]',
    )!;

    expect(first.tabIndex).toBe(0);
    expect(category.tabIndex).toBe(-1);
    act(() => first.focus());
    act(() =>
      first.dispatchEvent(
        new KeyboardEvent("keydown", { bubbles: true, key: "ArrowRight" }),
      ),
    );
    await act(async () => new Promise((resolve) => setTimeout(resolve, 20)));
    expect(category.dataset.activeCell).toBe("true");
    expect(category.tabIndex).toBe(0);
    expect(document.activeElement).toBe(category);

    act(() =>
      category.dispatchEvent(
        new KeyboardEvent("keydown", { bubbles: true, key: "End" }),
      ),
    );
    await act(async () => new Promise((resolve) => setTimeout(resolve, 20)));
    expect(
      container
        .querySelector('tbody tr[data-row-id="2"] td[data-column-id="status"]')
        ?.getAttribute("data-active-cell"),
    ).toBe("true");
  });

  it("keeps interactive cell descendants out of grid keyboard handling", () => {
    const interactiveColumns: ColumnDef<RowData>[] = [
      {
        accessorKey: "name",
        header: "Name",
        cell: () => <button type="button">Open</button>,
      },
      { accessorKey: "category", header: "Category" },
    ];
    renderTable({ columns: interactiveColumns });
    const button = container.querySelector<HTMLButtonElement>("tbody button")!;
    const cell = button.closest("td")!;

    act(() => button.focus());
    act(() =>
      button.dispatchEvent(
        new KeyboardEvent("keydown", { bubbles: true, key: "ArrowRight" }),
      ),
    );
    expect(cell.dataset.activeCell).toBe("true");
    expect(document.activeElement).toBe(button);
  });

  it("does not render control DOM when controls are omitted", () => {
    render(<AppDataTable columns={columns} data={data} />);

    expect(container.querySelector(".app-data-table__controls")).toBeNull();
    expect(
      container.querySelector(".app-data-table--with-controls"),
    ).toBeNull();
    expect(bodyRows()).toHaveLength(4);
  });

  it("keeps only global search at the top and exposes filters on columns", () => {
    renderTable();

    expect(
      container.querySelector(".app-data-table__filter-button"),
    ).toBeNull();
    expect(columnMenuButton("category")).not.toBeNull();
    expect(columnMenuButton("status")).not.toBeNull();
  });

  it("uses AppScrollArea inside the positioned column filter menu", () => {
    renderTable();
    openFilters();

    const scrollArea = filterMenu()?.querySelector(
      ".app-data-table__column-filter-scroll",
    );
    expect(scrollArea?.classList).toContain("app-scroll-area");
    expect(scrollArea?.getAttribute("data-gutter")).toBe("auto");
    expect(
      scrollArea?.querySelector(".app-data-table__column-filter-content"),
    ).not.toBeNull();
    expect(filterMenu()?.classList).toContain("app-popover");
    expect(
      filterMenu()?.querySelector(".app-context-menu__item"),
    ).not.toBeNull();
    expect(
      filterMenu()?.querySelector(
        '.app-data-table__column-filter-search.app-text-box input[role="searchbox"]',
      ),
    ).not.toBeNull();
    expect(filterMenu()?.querySelector(".app-radio-group")).not.toBeNull();
  });

  it("keeps select-all and standard AppButton actions outside the option scroller", () => {
    renderTable();
    openFilters("status");

    const menu = filterMenu()!;
    const scrollArea = menu.querySelector(
      ".app-data-table__column-filter-scroll",
    )!;
    const selectAll = menu.querySelector<HTMLElement>(
      ".app-data-table__column-filter-select-all",
    )!;
    const footer = menu.querySelector(
      ".app-data-table__column-filter-footer",
    )!;
    const actions = footer.querySelectorAll<HTMLButtonElement>(".app-button");

    expect(scrollArea.contains(selectAll)).toBe(false);
    expect(scrollArea.querySelector(".app-check-box-group")).not.toBeNull();
    expect(selectAll.nextElementSibling?.classList).toContain(
      "app-data-table__column-filter-select-all-separator",
    );
    expect(footer.previousElementSibling?.classList).toContain(
      "app-data-table__column-filter-footer-separator",
    );
    expect(actions).toHaveLength(2);
    expect(actions[0]?.classList).toContain("app-button--standard");
    expect(actions[1]?.classList).toContain("app-button--primary");
    expect(actions[0]?.classList).toContain("app-button--block");
    expect(actions[1]?.classList).toContain("app-button--block");
    expect(
      menu.querySelector(".app-data-table__column-filter-search")?.classList,
    ).toContain("app-text-box--standard");
  });

  it("updates uncontrolled global filtering from search input", () => {
    renderTable();
    setSearch("Alpha");

    expect(bodyRows()).toHaveLength(1);
    expect(bodyRows()[0]?.textContent).toContain("Alpha");
  });

  it("reports controlled search changes without changing controlled state", () => {
    const onGlobalFilterChange = vi.fn();
    renderTable({ globalFilter: "", onGlobalFilterChange });
    setSearch("Alpha");

    expect(onGlobalFilterChange).toHaveBeenCalledWith("Alpha");
    expect(searchInput().value).toBe("");
    expect(bodyRows()).toHaveLength(4);
  });

  it("clears search and restores all rows", () => {
    renderTable();
    setSearch("Alpha");
    act(() =>
      container
        .querySelector<HTMLButtonElement>('[aria-label="Clear search"]')
        ?.click(),
    );

    expect(searchInput().value).toBe("");
    expect(bodyRows()).toHaveLength(4);
  });

  it("applies and clears a single-value filter", () => {
    renderTable();
    openFilters();
    act(() => option("radio", "Document").click());

    expect(bodyRows()).toHaveLength(4);
    act(() =>
      filterMenu()
        ?.querySelector<HTMLButtonElement>('[data-action="apply-filter"]')
        ?.click(),
    );
    expect(bodyRows()).toHaveLength(2);
    expect(
      container.querySelector(
        'th[data-column-id="category"] .app-data-table__filter-indicator',
      ),
    ).not.toBeNull();

    openFilters();
    act(() => flyoutItem("Clear column filter").click());
    expect(bodyRows()).toHaveLength(2);
    expect(option("radio", "Document").checked).toBe(false);
    act(() =>
      filterMenu()
        ?.querySelector<HTMLButtonElement>('[data-action="apply-filter"]')
        ?.click(),
    );
    expect(bodyRows()).toHaveLength(4);
  });

  it("keeps filter changes in a draft until confirmed and discards cancel", () => {
    renderTable();
    openFilters();
    act(() => option("radio", "Document").click());

    expect(bodyRows()).toHaveLength(4);
    act(() =>
      filterMenu()
        ?.querySelector<HTMLButtonElement>('[data-action="cancel-filter"]')
        ?.click(),
    );

    expect(bodyRows()).toHaveLength(4);
    openFilters();
    expect(option("radio", "Document").checked).toBe(false);
  });

  it("selects only the currently searched multiple-filter options", () => {
    renderTable();
    openFilters("status");
    const search = filterMenu()!.querySelector<HTMLInputElement>(
      '[aria-label="Search options"]',
    )!;
    const valueSetter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )?.set;
    act(() => {
      valueSetter?.call(search, "Ready");
      search.dispatchEvent(new Event("input", { bubbles: true }));
    });

    const selectAll = filterMenu()!.querySelector<HTMLInputElement>(
      '[aria-label="Select all matching options"]',
    )!;
    act(() => selectAll.click());

    expect(option("checkbox", "Ready").checked).toBe(true);
    expect(
      Array.from(
        filterMenu()?.querySelectorAll<HTMLInputElement>(
          '.app-check-box-group input[type="checkbox"]',
        ) ?? [],
      ).some((input) =>
        input.closest("label")?.textContent?.trim().endsWith("Processing"),
      ),
    ).toBe(false);
    expect(bodyRows()).toHaveLength(4);

    act(() =>
      filterMenu()
        ?.querySelector<HTMLButtonElement>('[data-action="apply-filter"]')
        ?.click(),
    );
    expect(bodyRows()).toHaveLength(2);
  });

  it("reports controlled column filter changes without changing controlled state", () => {
    const onColumnFiltersChange = vi.fn();
    renderTable({ columnFilters: [], onColumnFiltersChange });
    openFilters();
    act(() => option("radio", "Document").click());

    expect(onColumnFiltersChange).not.toHaveBeenCalled();
    act(() =>
      filterMenu()
        ?.querySelector<HTMLButtonElement>('[data-action="apply-filter"]')
        ?.click(),
    );

    const update = onColumnFiltersChange.mock.calls[0]?.[0];
    const next = typeof update === "function" ? update([]) : update;
    expect(next).toEqual([{ id: "category", value: "Document" }]);
    expect(bodyRows()).toHaveLength(4);
  });

  it("adds and removes multiple filter values", () => {
    renderTable();
    openFilters("status");
    act(() => option("checkbox", "Ready").click());
    act(() => option("checkbox", "Processing").click());

    expect(bodyRows()).toHaveLength(4);
    expect(option("checkbox", "Ready").checked).toBe(true);

    act(() => option("checkbox", "Ready").click());
    act(() =>
      filterMenu()
        ?.querySelector<HTMLButtonElement>('[data-action="apply-filter"]')
        ?.click(),
    );
    expect(bodyRows()).toHaveLength(1);
    expect(bodyRows()[0]?.textContent).toContain("Beta");
  });

  it("combines global search and column filters", () => {
    renderTable();
    setSearch("a");
    openFilters("status");
    act(() => option("checkbox", "Ready").click());
    act(() =>
      filterMenu()
        ?.querySelector<HTMLButtonElement>('[data-action="apply-filter"]')
        ?.click(),
    );

    expect(bodyRows()).toHaveLength(2);
    expect(bodyRows().every((row) => row.textContent?.includes("Ready"))).toBe(
      true,
    );
  });

  it("hides the combined clear-all button by default", () => {
    renderTable();
    setSearch("Alpha");

    expect(
      container.querySelector('[aria-label="Clear all search and filters"]'),
    ).toBeNull();
  });

  it("clears all search and column filter state", () => {
    renderTable({ controls: { ...controls, clearAll: true } });
    setSearch("Alpha");
    openFilters();
    act(() => option("radio", "Document").click());
    act(() =>
      filterMenu()
        ?.querySelector<HTMLButtonElement>('[data-action="apply-filter"]')
        ?.click(),
    );
    act(() =>
      container
        .querySelector<HTMLButtonElement>(
          '[aria-label="Clear all search and filters"]',
        )
        ?.click(),
    );

    expect(searchInput().value).toBe("");
    expect(bodyRows()).toHaveLength(4);
  });

  it("uses localized control labels and aria labels", () => {
    render(
      <AppShell locale="zh-CN">
        <AppDataTable
          columns={columns}
          controls={{ ...controls, clearAll: true }}
          data={data}
          getRowId={(row) => row.id}
        />
      </AppShell>,
    );

    const localizedSearch =
      container.querySelector<HTMLInputElement>('[aria-label="搜索行"]')!;
    expect(localizedSearch.placeholder).toBe("搜索行");

    const valueSetter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )?.set;
    act(() => {
      valueSetter?.call(localizedSearch, "Alpha");
      localizedSearch.dispatchEvent(new Event("input", { bubbles: true }));
    });
    expect(container.querySelector('[aria-label="清除搜索"]')).not.toBeNull();

    openFilters();
    expect(
      document.body
        .querySelector(".app-data-table__column-menu")
        ?.getAttribute("aria-label"),
    ).toBe("筛选Category");
    act(() => option("radio", "Document").click());
    act(() =>
      filterMenu()
        ?.querySelector<HTMLButtonElement>('[data-action="apply-filter"]')
        ?.click(),
    );

    expect(
      container.querySelector(
        'th[data-column-id="category"] .app-data-table__filter-indicator',
      ),
    ).not.toBeNull();
    expect(
      container.querySelector('[aria-label="清除搜索和所有筛选"]')?.textContent,
    ).toBe("全部清除");
  });

  it("reports filter state without filtering rows in manual mode", () => {
    const onGlobalFilterChange = vi.fn();
    renderTable({ manualFiltering: true, onGlobalFilterChange });
    setSearch("Alpha");

    expect(onGlobalFilterChange).toHaveBeenCalledWith("Alpha");
    expect(bodyRows()).toHaveLength(4);
  });

  it("selects only filtered rows from the header checkbox", () => {
    function Harness() {
      const [selection, setSelection] = useState<RowSelectionState>({});
      return (
        <>
          <output data-testid="selected-count">
            {Object.values(selection).filter(Boolean).length}
          </output>
          <AppDataTable
            columns={columns}
            controls={controls}
            data={data}
            getRowId={(row) => row.id}
            selection={{ value: selection, onChange: setSelection }}
          />
        </>
      );
    }

    render(<Harness />);
    openFilters();
    act(() => option("radio", "Document").click());
    act(() =>
      filterMenu()
        ?.querySelector<HTMLButtonElement>('[data-action="apply-filter"]')
        ?.click(),
    );
    act(() =>
      container.querySelector<HTMLInputElement>("thead input")?.click(),
    );

    expect(
      container.querySelector('[data-testid="selected-count"]')?.textContent,
    ).toBe("2");
    expect(
      container.querySelector("thead .app-check-box__check"),
    ).not.toBeNull();
    expect(
      container.querySelectorAll("tbody .app-check-box__check"),
    ).toHaveLength(2);
  });

  it("closes the filter menu on outside click and Escape", () => {
    renderTable();
    openFilters();
    expect(filterMenu()).not.toBeNull();

    act(() =>
      document.body.dispatchEvent(
        new PointerEvent("pointerdown", { bubbles: true }),
      ),
    );
    expect(filterMenu()).toBeNull();

    openFilters();
    act(() =>
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })),
    );
    expect(filterMenu()).toBeNull();
    expect(document.activeElement).toBe(filterButton());
  });

  it("keeps internal popover interactions open", () => {
    renderTable();
    openFilters();
    const menu = filterMenu()!;

    act(() =>
      menu.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true })),
    );
    expect(filterMenu()).not.toBeNull();

    act(() => menu.dispatchEvent(new Event("scroll")));
    expect(filterMenu()).not.toBeNull();
  });

  it("renders the filter menu in the AppShell overlay host", () => {
    render(
      <AppShell>
        <AppDataTable
          columns={columns}
          controls={controls}
          data={data}
          getRowId={(row) => row.id}
        />
      </AppShell>,
    );

    openFilters();

    expect(
      container
        .querySelector(".app-shell__overlay-host")
        ?.contains(filterMenu()),
    ).toBe(true);
  });

  it("opens with the keyboard and uses native checkbox options", () => {
    renderTable();
    act(() =>
      columnMenuButton("status").dispatchEvent(
        new KeyboardEvent("keydown", { bubbles: true, key: "ArrowDown" }),
      ),
    );
    const ready = option("checkbox", "Ready");
    act(() => ready.click());

    expect(bodyRows()).toHaveLength(4);
    expect(option("checkbox", "Ready").checked).toBe(true);
  });

  it("ignores invalid filter column IDs without crashing", () => {
    renderTable({
      controls: {
        filters: [
          {
            columnId: "missing",
            label: "Missing",
            options: [{ value: "x", label: "X" }],
          },
        ],
      },
    });

    expect(bodyRows()).toHaveLength(4);
    expect(container.querySelector(".app-data-table__controls")).toBeNull();
  });

  it("keeps loading and empty states working with controls", () => {
    renderTable({ loading: true, loadingContent: "Loading records" });
    expect(container.textContent).toContain("Loading records");
    expect(container.querySelector(".app-data-table__controls")).not.toBeNull();
    expect(
      container
        .querySelector(".app-data-table__state-overlay")
        ?.getAttribute("data-state"),
    ).toBe("loading");
    expect(
      container
        .querySelector(".app-data-table__state-overlay")
        ?.getAttribute("role"),
    ).toBe("status");
    expect(bodyRows()).toHaveLength(0);

    renderTable({ data: [], emptyContent: "No matching records" });
    expect(container.textContent).toContain("No matching records");
    const overlay = container.querySelector(".app-data-table__state-overlay");
    expect(overlay?.getAttribute("data-state")).toBe("empty");
    expect(overlay?.getAttribute("role")).toBeNull();
    expect(
      overlay?.parentElement?.classList.contains("app-data-table__viewport"),
    ).toBe(true);
    expect(
      overlay?.previousElementSibling?.classList.contains(
        "app-data-table__scroll-area",
      ),
    ).toBe(true);
    expect(
      overlay?.previousElementSibling?.querySelector(".app-data-table__scroll"),
    ).not.toBeNull();
    expect(overlay?.closest("table")).toBeNull();
    expect(bodyRows()).toHaveLength(0);
  });

  it("keeps sorting, resizing, and pinning available with controls", () => {
    renderTable({
      enableColumnResizing: true,
      defaultColumnPinning: { left: ["name"] },
    });

    expect(
      container.querySelector(".app-data-table__resize-handle"),
    ).not.toBeNull();
    expect(
      container.querySelector('[data-column-id="name"][data-pinned="left"]'),
    ).not.toBeNull();

    const nameSort = Array.from(
      container.querySelectorAll<HTMLButtonElement>(
        ".app-data-table__sort-button",
      ),
    ).find((button) => button.textContent?.includes("Name"));
    act(() => nameSort?.click());
    expect(bodyRows()[0]?.textContent).toContain("Alpha");
  });

  it("uses ten rows per page by default and navigates next and previous", () => {
    renderTable({ data: pagedData, pagination: true });

    expect(bodyRows()).toHaveLength(10);
    expect(bodyRows()[0]?.textContent).toContain("Item 01");
    act(() =>
      container
        .querySelector<HTMLButtonElement>('[aria-label="Next page"]')
        ?.click(),
    );
    expect(bodyRows()[0]?.textContent).toContain("Item 11");
    act(() =>
      container
        .querySelector<HTMLButtonElement>('[aria-label="Previous page"]')
        ?.click(),
    );
    expect(bodyRows()[0]?.textContent).toContain("Item 01");
  });

  it("renders every row when pagination is not enabled", () => {
    renderTable({ data: pagedData, pagination: undefined });
    expect(bodyRows()).toHaveLength(24);
    expect(container.querySelector(".app-data-table__pagination")).toBeNull();
  });

  it("restores every row when pagination is disabled at runtime", () => {
    renderTable({
      data: pagedData,
      pagination: { defaultValue: { pageIndex: 0, pageSize: 20 } },
    });
    expect(bodyRows()).toHaveLength(20);

    renderTable({ data: pagedData, pagination: undefined });
    expect(bodyRows()).toHaveLength(24);
    expect(container.querySelector(".app-data-table__pagination")).toBeNull();
  });

  it("jumps between first and last pages and exposes boundary states", () => {
    renderTable({ data: pagedData, pagination: true });
    const first = container.querySelector<HTMLButtonElement>(
      '[aria-label="First page"]',
    )!;
    const previous = container.querySelector<HTMLButtonElement>(
      '[aria-label="Previous page"]',
    )!;
    const next = container.querySelector<HTMLButtonElement>(
      '[aria-label="Next page"]',
    )!;
    const last = container.querySelector<HTMLButtonElement>(
      '[aria-label="Last page"]',
    )!;

    expect(first.disabled).toBe(true);
    expect(previous.disabled).toBe(true);
    act(() => last.click());
    expect(bodyRows()).toHaveLength(4);
    expect(bodyRows()[0]?.textContent).toContain("Item 21");
    expect(next.disabled).toBe(true);
    expect(last.disabled).toBe(true);
    act(() => first.click());
    expect(bodyRows()[0]?.textContent).toContain("Item 01");
  });

  it("changes page size and updates the range and page count", () => {
    renderTable({ data: pagedData, pagination: true });
    const select = container.querySelector<HTMLSelectElement>(
      '[aria-label="Rows per page"]',
    )!;
    act(() => {
      select.value = "20";
      select.dispatchEvent(new Event("change", { bubbles: true }));
    });

    expect(bodyRows()).toHaveLength(20);
    expect(container.textContent).toContain("1–20 of 24");
    expect(container.textContent).toContain("Page 1 of 2");
  });

  it("searches and filters the full result before paginating", () => {
    renderTable({ data: pagedData, pagination: true });
    setSearch("Item 24");
    expect(bodyRows()).toHaveLength(1);
    expect(bodyRows()[0]?.textContent).toContain("Item 24");

    setSearch("");
    openFilters();
    act(() => option("radio", "Document").click());
    act(() =>
      filterMenu()
        ?.querySelector<HTMLButtonElement>('[data-action="apply-filter"]')
        ?.click(),
    );
    expect(bodyRows()).toHaveLength(10);
    expect(container.textContent).toContain("1–10 of 12");
  });

  it("sorts the complete result before taking the current page", () => {
    renderTable({ data: [...pagedData].reverse(), pagination: true });
    const nameSort = Array.from(
      container.querySelectorAll<HTMLButtonElement>(
        ".app-data-table__sort-button",
      ),
    ).find((button) => button.textContent?.includes("Name"));
    act(() => nameSort?.click());

    expect(bodyRows()[0]?.textContent).toContain("Item 01");
    expect(bodyRows()[9]?.textContent).toContain("Item 10");
  });

  it("clamps an invalid page after searching even when auto reset is disabled", () => {
    renderTable({
      data: pagedData,
      pagination: {
        defaultValue: { pageIndex: 2, pageSize: 10 },
        autoResetPageIndex: false,
      },
    });
    expect(bodyRows()[0]?.textContent).toContain("Item 21");
    setSearch("Item 01");

    expect(bodyRows()).toHaveLength(1);
    expect(bodyRows()[0]?.textContent).toContain("Item 01");
    expect(container.textContent).toContain("Page 1 of 1");
  });

  it("returns to the first page when filtering reduces the page count", () => {
    renderTable({
      data: pagedData,
      pagination: { defaultValue: { pageIndex: 2, pageSize: 10 } },
    });
    setSearch("Item 01");
    expect(bodyRows()[0]?.textContent).toContain("Item 01");
    expect(container.textContent).toContain("Page 1 of 1");
  });

  it("shows an empty range and disables navigation with no data", () => {
    renderTable({ data: [], pagination: true });
    expect(container.textContent).toContain("0–0 of 0");
    expect(container.textContent).toContain("Page 0 of 0");
    expect(
      container.querySelector<HTMLButtonElement>('[aria-label="Next page"]')
        ?.disabled,
    ).toBe(true);
  });

  it("disables all pagination operations while loading", () => {
    renderTable({ data: pagedData, loading: true, pagination: true });
    expect(
      Array.from(
        container.querySelectorAll<HTMLButtonElement>(
          ".app-pagination__button",
        ),
      ).every((button) => button.disabled),
    ).toBe(true);
    expect(
      container.querySelector<HTMLSelectElement>('[aria-label="Rows per page"]')
        ?.disabled,
    ).toBe(true);
  });

  it("reports controlled pagination without changing the controlled page", () => {
    const onChange = vi.fn();
    renderTable({
      data: pagedData,
      pagination: { value: { pageIndex: 0, pageSize: 10 }, onChange },
    });
    act(() =>
      container
        .querySelector<HTMLButtonElement>('[aria-label="Next page"]')
        ?.click(),
    );

    expect(onChange).toHaveBeenCalledOnce();
    expect(bodyRows()[0]?.textContent).toContain("Item 01");
    expect(container.textContent).toContain("Page 1 of 3");
  });

  it("selects only the current page in page mode", () => {
    function Harness() {
      const [selection, setSelection] = useState<RowSelectionState>({});
      return (
        <>
          <output data-testid="selected-count">
            {Object.values(selection).filter(Boolean).length}
          </output>
          <AppDataTable
            columns={columns}
            data={pagedData}
            getRowId={(row) => row.id}
            pagination
            selection={{
              value: selection,
              onChange: setSelection,
              selectAllMode: "page",
            }}
          />
        </>
      );
    }
    render(<Harness />);
    act(() =>
      container.querySelector<HTMLInputElement>("thead input")?.click(),
    );
    expect(
      container.querySelector('[data-testid="selected-count"]')?.textContent,
    ).toBe("10");
  });

  it("selects all filtered rows across pages in filtered mode", () => {
    function Harness() {
      const [selection, setSelection] = useState<RowSelectionState>({});
      return (
        <>
          <output data-testid="selected-count">
            {Object.values(selection).filter(Boolean).length}
          </output>
          <AppDataTable
            columns={columns}
            controls={controls}
            data={pagedData}
            getRowId={(row) => row.id}
            pagination
            selection={{
              value: selection,
              onChange: setSelection,
              selectAllMode: "filtered",
            }}
          />
        </>
      );
    }
    render(<Harness />);
    openFilters();
    act(() => option("radio", "Document").click());
    act(() =>
      filterMenu()
        ?.querySelector<HTMLButtonElement>('[data-action="apply-filter"]')
        ?.click(),
    );
    act(() =>
      container.querySelector<HTMLInputElement>("thead input")?.click(),
    );
    expect(
      container.querySelector('[data-testid="selected-count"]')?.textContent,
    ).toBe("12");
  });

  it("supports pagination locale and optional control visibility", () => {
    render(
      <AppShell locale="zh-CN">
        <AppDataTable
          columns={columns}
          data={pagedData}
          pagination={{
            showPageSizeSelector: false,
            showFirstLastButtons: false,
          }}
        />
      </AppShell>,
    );
    expect(container.textContent).toContain("1–10，共 24 行");
    expect(container.textContent).toContain("第 1 页，共 3 页");
    expect(container.querySelector('[aria-label="Rows per page"]')).toBeNull();
    expect(container.querySelector('[aria-label="First page"]')).toBeNull();
    expect(container.querySelector('[aria-label="上一页"]')).not.toBeNull();
  });

  it("composes pagination with sticky headers, resizing, and pinning", () => {
    renderTable({
      data: pagedData,
      pagination: true,
      stickyHeader: true,
      enableColumnResizing: true,
      defaultColumnPinning: { left: ["name"] },
    });
    expect(
      container.querySelector(
        ".app-data-table--sticky-header.app-data-table--with-pagination",
      ),
    ).not.toBeNull();
    expect(
      container.querySelector(".app-data-table__resize-handle"),
    ).not.toBeNull();
    expect(
      container.querySelector('[data-column-id="name"][data-pinned="left"]'),
    ).not.toBeNull();
    expect(
      container.querySelector(
        ".app-data-table__viewport + .app-data-table__pagination",
      ),
    ).not.toBeNull();
  });

  it("keeps ordinary columns unchanged when sticky columns are omitted", () => {
    renderTable();
    const categoryHeader = container.querySelector<HTMLElement>(
      'th[data-column-id="category"]',
    )!;
    const categoryCell = container.querySelector<HTMLElement>(
      'td[data-column-id="category"]',
    )!;

    expect(categoryHeader.hasAttribute("data-sticky-column")).toBe(false);
    expect(categoryCell.hasAttribute("data-sticky-column")).toBe(false);
    expect(categoryCell.style.position).toBe("");
    expect(categoryCell.style.left).toBe("");
  });

  it("keeps a sticky second column in its original DOM position", () => {
    renderTable({ stickyColumns: ["category"] });
    const headerIds = Array.from(container.querySelectorAll("th")).map(
      (header) => header.getAttribute("data-column-id"),
    );
    const categoryHeader = container.querySelector<HTMLElement>(
      'th[data-column-id="category"]',
    )!;
    const categoryCell = container.querySelector<HTMLElement>(
      'td[data-column-id="category"]',
    )!;

    expect(headerIds).toEqual(["name", "category", "status"]);
    expect(categoryHeader.dataset.stickyColumn).toBe("true");
    expect(categoryCell.dataset.stickyColumn).toBe("true");
    expect(categoryCell.hasAttribute("data-pinned")).toBe(false);
    expect(categoryCell.style.position).toBe("sticky");
    expect(categoryCell.style.left).toBe("0px");
  });

  it("shows column position state and activates the sticky boundary only after scrolling", () => {
    renderTable({
      selection: { value: {}, onChange: vi.fn() },
      stickyColumns: ["category"],
    });

    const selectionHeader = container.querySelector<HTMLElement>(
      'th[data-column-id="__app_data_table_selection"]',
    )!;
    const categoryHeader = container.querySelector<HTMLElement>(
      'th[data-column-id="category"]',
    )!;
    const scrollViewport = container.querySelector<HTMLElement>(
      ".app-data-table__scroll",
    )!;

    expect(
      categoryHeader.querySelector(
        '[data-column-position="sticky"]',
      ),
    ).not.toBeNull();
    expect(
      selectionHeader.querySelector("[data-column-position]"),
    ).toBeNull();
    expect(categoryHeader.dataset.stickyActiveEdge).toBeUndefined();

    act(() => {
      scrollViewport.scrollLeft = 151;
      scrollViewport.dispatchEvent(new Event("scroll"));
    });

    expect(categoryHeader.dataset.stickyActive).toBe("true");
    expect(categoryHeader.dataset.stickyActiveEdge).toBe("left");
    expect(
      container.querySelector(
        'td[data-column-id="category"][data-sticky-active-edge="left"]',
      ),
    ).not.toBeNull();
  });

  it("shows the same position indicator for explicitly pinned columns", () => {
    renderTable({ defaultColumnPinning: { left: ["name"] } });

    expect(
      container.querySelector(
        'th[data-column-id="name"] [data-column-position="pinned"]',
      ),
    ).not.toBeNull();
    expect(
      container.querySelector(
        'th[data-column-id="category"] [data-column-position]',
      ),
    ).toBeNull();
  });

  it("orders and offsets multiple sticky columns by visible table order", () => {
    renderTable({ stickyColumns: ["status", "category", "category"] });
    const category = container.querySelector<HTMLElement>(
      'td[data-column-id="category"]',
    )!;
    const status = container.querySelector<HTMLElement>(
      'td[data-column-id="status"]',
    )!;

    expect(category.style.left).toBe("0px");
    expect(status.style.left).toBe("150px");
    expect(category.getAttribute("data-sticky-edge")).toBeNull();
    expect(status.dataset.stickyEdge).toBe("left");
  });

  it("silently ignores hidden and invalid sticky column IDs", () => {
    renderTable({
      stickyColumns: ["missing", "category"],
      columnVisibility: { category: false },
    });

    expect(container.querySelector('[data-column-id="category"]')).toBeNull();
    expect(container.querySelector("[data-sticky-column]")).toBeNull();
  });

  it("starts sticky offsets after visible left-pinned columns", () => {
    renderTable({
      stickyColumns: ["category"],
      defaultColumnPinning: { left: ["name"] },
    });
    const category = container.querySelector<HTMLElement>(
      'td[data-column-id="category"]',
    )!;

    expect(category.style.left).toBe("150px");
    expect(category.dataset.stickyColumn).toBe("true");
  });

  it("gives pinning precedence and ignores right-pinned width", () => {
    renderTable({
      stickyColumns: ["category", "status"],
      defaultColumnPinning: { left: ["category"], right: ["name"] },
    });
    const category = container.querySelector<HTMLElement>(
      'td[data-column-id="category"]',
    )!;
    const status = container.querySelector<HTMLElement>(
      'td[data-column-id="status"]',
    )!;

    expect(category.dataset.pinned).toBe("left");
    expect(category.hasAttribute("data-sticky-column")).toBe(false);
    expect(status.style.left).toBe("150px");
  });

  it("updates later sticky offsets when column sizing changes", () => {
    renderTable({
      stickyColumns: ["category", "status"],
      columnSizing: { category: 210 },
    });
    expect(
      container.querySelector<HTMLElement>('td[data-column-id="status"]')?.style
        .left,
    ).toBe("210px");

    renderTable({
      stickyColumns: ["category", "status"],
      columnSizing: { category: 260 },
    });
    expect(
      container.querySelector<HTMLElement>('td[data-column-id="status"]')?.style
        .left,
    ).toBe("260px");
  });

  it("layers sticky columns correctly with sticky headers and pagination", () => {
    renderTable({
      data: pagedData,
      pagination: true,
      stickyColumns: ["category"],
      stickyHeader: true,
    });
    const header = container.querySelector<HTMLElement>(
      'th[data-column-id="category"]',
    )!;

    expect(header.style.position).toBe("sticky");
    expect(header.style.zIndex).toBe("4");
    expect(bodyRows()).toHaveLength(10);
  });

  it("preserves sticky cells in virtualized selectable rows", async () => {
    function Harness() {
      const [selection, setSelection] = useState<RowSelectionState>({});
      return (
        <AppDataTable
          columns={columns}
          data={virtualData}
          enableColumnResizing
          getRowId={(row) => row.id}
          maxHeight={200}
          selection={{ value: selection, onChange: setSelection }}
          stickyColumns={["category"]}
          virtualization
        />
      );
    }
    render(<Harness />);
    await settleVirtualization();
    const stickyCell = container.querySelector<HTMLElement>(
      'tbody td[data-column-id="category"]',
    )!;
    act(() =>
      container.querySelector<HTMLInputElement>("tbody input")?.click(),
    );

    expect(stickyCell.dataset.stickyColumn).toBe("true");
    expect(stickyCell.closest("tr")?.dataset.selected).toBe("true");
    expect(
      container.querySelector(".app-data-table__resize-handle"),
    ).not.toBeNull();
  });

  it("does not alter rows when no row context-menu callback is provided", () => {
    renderTable();
    const row = bodyRows()[0]!;

    expect(row.classList.contains("app-data-table__row--clickable")).toBe(
      false,
    );
    expect(row.tabIndex).toBe(-1);
    expect(contextMenu(row).defaultPrevented).toBe(false);
  });

  it("reports the correct row and original React context-menu event", () => {
    const onRowContextMenu = vi.fn();
    renderTable({ onRowContextMenu });
    const nativeEvent = contextMenu(bodyRows()[1]!, {
      clientX: 32,
      clientY: 48,
    });

    expect(onRowContextMenu).toHaveBeenCalledOnce();
    const [row, event] = onRowContextMenu.mock.calls[0]!;
    expect(row.id).toBe("1");
    expect(row.original).toBe(data[1]);
    expect(event.type).toBe("contextmenu");
    expect(event.clientX).toBe(32);
    expect(event.clientY).toBe(48);
    expect(event.nativeEvent).toBe(nativeEvent);
    expect(nativeEvent.defaultPrevented).toBe(false);
  });

  it("lets the consumer prevent the native context menu", () => {
    const onRowContextMenu = vi.fn((_row, event) => event.preventDefault());
    renderTable({ onRowContextMenu });
    const event = contextMenu(bodyRows()[0]!);

    expect(onRowContextMenu).toHaveBeenCalledOnce();
    expect(event.defaultPrevented).toBe(true);
  });

  it("reports the corresponding original data for different rows", () => {
    const originals: RowData[] = [];
    renderTable({
      onRowContextMenu: (row) => originals.push(row.original),
    });
    contextMenu(bodyRows()[0]!);
    contextMenu(bodyRows()[2]!);

    expect(originals).toEqual([data[0], data[2]]);
  });

  it("ignores context menus from interactive cell content", () => {
    const onRowContextMenu = vi.fn();
    const interactiveColumns: ColumnDef<RowData>[] = [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ getValue }) => (
          <>
            <button type="button">Action</button>
            <input aria-label="Cell input" />
            <select aria-label="Cell select">
              <option>One</option>
            </select>
            <span role="button" tabIndex={0}>
              Role action
            </span>
            <span data-testid="plain-cell">{String(getValue())}</span>
          </>
        ),
      },
    ];
    renderTable({ columns: interactiveColumns, onRowContextMenu });

    contextMenu(container.querySelector("tbody button")!);
    contextMenu(container.querySelector("tbody input")!);
    contextMenu(container.querySelector("tbody select")!);
    contextMenu(container.querySelector('[role="button"]')!);
    expect(onRowContextMenu).not.toHaveBeenCalled();

    contextMenu(container.querySelector('[data-testid="plain-cell"]')!);
    expect(onRowContextMenu).toHaveBeenCalledOnce();
  });

  it("keeps row click and context-menu callbacks independent", () => {
    const onRowClick = vi.fn();
    const onRowContextMenu = vi.fn();
    renderTable({ onRowClick, onRowContextMenu });
    const row = bodyRows()[0]!;

    contextMenu(row.querySelector("td")!);
    expect(onRowContextMenu).toHaveBeenCalledOnce();
    expect(onRowClick).not.toHaveBeenCalled();

    act(() => row.click());
    expect(onRowClick).toHaveBeenCalledOnce();
    expect(onRowContextMenu).toHaveBeenCalledOnce();
  });

  it("does not change row selection on context menu", () => {
    const onRowContextMenu = vi.fn();
    const onSelectionChange = vi.fn();
    renderTable({
      onRowContextMenu,
      selection: { value: {}, onChange: onSelectionChange },
    });
    contextMenu(bodyRows()[0]!.querySelector('td[data-column-id="name"]')!);

    expect(onRowContextMenu).toHaveBeenCalledOnce();
    expect(onSelectionChange).not.toHaveBeenCalled();
    expect(bodyRows()[0]?.dataset.selected).toBeUndefined();
  });

  it("reports the current row after pagination and filtering", () => {
    const onRowContextMenu = vi.fn();
    renderTable({
      onRowContextMenu,
      pagination: { defaultValue: { pageIndex: 1, pageSize: 2 } },
    });
    contextMenu(bodyRows()[0]!);
    expect(onRowContextMenu.mock.calls[0]?.[0].original.name).toBe("Gamma");

    renderTable({ onRowContextMenu, pagination: false });
    setSearch("Alpha");
    contextMenu(bodyRows()[0]!);
    expect(onRowContextMenu.mock.calls[1]?.[0].original.name).toBe("Alpha");
  });

  it("works with sticky and pinned columns", () => {
    const onRowContextMenu = vi.fn();
    renderTable({
      defaultColumnPinning: { left: ["name"] },
      onRowContextMenu,
      stickyColumns: ["category"],
    });
    contextMenu(bodyRows()[0]!.querySelector('td[data-column-id="category"]')!);

    expect(onRowContextMenu.mock.calls[0]?.[0].original).toBe(data[0]);
    expect(
      bodyRows()[0]?.querySelector('[data-sticky-column="true"]'),
    ).not.toBeNull();
  });

  it("reports virtual rows and ignores loading and empty state rows", async () => {
    const onRowContextMenu = vi.fn();
    renderTable({
      data: virtualData,
      maxHeight: 200,
      onRowContextMenu,
      virtualization: true,
    });
    await settleVirtualization();
    contextMenu(
      container.querySelector("tbody tr:not(.app-data-table__virtual-spacer)")!,
    );
    expect(onRowContextMenu.mock.calls[0]?.[0].original).toBe(virtualData[0]);

    renderTable({ loading: true, onRowContextMenu, virtualization: false });
    expect(bodyRows()).toHaveLength(0);
    renderTable({ data: [], loading: false, onRowContextMenu });
    expect(bodyRows()).toHaveLength(0);
    expect(onRowContextMenu).toHaveBeenCalledOnce();
  });

  it("virtualizes only part of the rows with fixed comfortable height", async () => {
    renderTable({ data: virtualData, maxHeight: 200, virtualization: true });
    await settleVirtualization();
    const renderedRows = Array.from(
      container.querySelectorAll<HTMLTableRowElement>(
        "tbody tr:not(.app-data-table__virtual-spacer)",
      ),
    );

    expect(renderedRows.length).toBeGreaterThan(0);
    expect(renderedRows.length).toBeLessThan(virtualData.length);
    expect(renderedRows[0]?.textContent).toContain("Virtual 001");
    expect(renderedRows[0]?.style.height).toBe("38px");
    expect(
      container.querySelector(".app-data-table--virtualized"),
    ).not.toBeNull();
    expect(
      container.querySelector(".app-data-table__virtual-spacer"),
    ).not.toBeNull();
  });

  it("renders accessible spacer rows with the correct geometry", async () => {
    renderTable({ data: virtualData, maxHeight: 200, virtualization: false });
    const scroll = container.querySelector<HTMLDivElement>(
      ".app-data-table__scroll",
    )!;
    scroll.scrollTop = 2000;
    renderTable({ data: virtualData, maxHeight: 200, virtualization: true });
    await settleVirtualization();

    const spacers = container.querySelectorAll<HTMLTableRowElement>(
      ".app-data-table__virtual-spacer",
    );
    expect(spacers.length).toBeGreaterThan(0);
    expect(spacers[0]?.getAttribute("aria-hidden")).toBe("true");
    expect(spacers[0]?.querySelector("td")?.colSpan).toBe(columns.length);
    expect(spacers[0]?.querySelector("td")?.style.height).not.toBe("0px");
  });

  it("virtualizes search and filter results from the full data set", async () => {
    renderTable({ data: virtualData, maxHeight: 200, virtualization: true });
    await settleVirtualization();
    setSearch("Virtual 100");
    expect(
      container.querySelector("tbody tr:not(.app-data-table__virtual-spacer)")
        ?.textContent,
    ).toContain("Virtual 100");

    setSearch("");
    openFilters();
    act(() => option("radio", "Document").click());
    act(() =>
      filterMenu()
        ?.querySelector<HTMLButtonElement>('[data-action="apply-filter"]')
        ?.click(),
    );
    expect(
      Array.from(
        container.querySelectorAll(
          "tbody tr:not(.app-data-table__virtual-spacer)",
        ),
      ).every((row) => row.textContent?.includes("Document")),
    ).toBe(true);
  });

  it("sorts before virtualizing rows", async () => {
    renderTable({
      data: [...virtualData].reverse(),
      maxHeight: 200,
      virtualization: true,
    });
    await settleVirtualization();
    const nameSort = Array.from(
      container.querySelectorAll<HTMLButtonElement>(
        ".app-data-table__sort-button",
      ),
    ).find((button) => button.textContent?.includes("Name"));
    act(() => nameSort?.click());
    expect(
      container.querySelector("tbody tr:not(.app-data-table__virtual-spacer)")
        ?.textContent,
    ).toContain("Virtual 001");
  });

  it("keeps selection scoped to data rows rather than spacer rows", async () => {
    function Harness() {
      const [selection, setSelection] = useState<RowSelectionState>({});
      return (
        <>
          <output data-testid="selected-count">
            {Object.values(selection).filter(Boolean).length}
          </output>
          <AppDataTable
            columns={columns}
            data={virtualData}
            getRowId={(row) => row.id}
            maxHeight={200}
            selection={{ value: selection, onChange: setSelection }}
            virtualization
          />
        </>
      );
    }
    render(<Harness />);
    await settleVirtualization();
    act(() =>
      container.querySelector<HTMLInputElement>("thead input")?.click(),
    );
    expect(
      container.querySelector('[data-testid="selected-count"]')?.textContent,
    ).toBe("100");
    expect(
      container.querySelectorAll(".app-data-table__virtual-spacer input"),
    ).toHaveLength(0);
  });

  it("keeps sticky headers, pinning, and resizing with virtualization", async () => {
    renderTable({
      data: virtualData,
      maxHeight: 200,
      virtualization: { overscan: 2 },
      stickyHeader: true,
      enableColumnResizing: true,
      defaultColumnPinning: { left: ["name"] },
    });
    await settleVirtualization();
    expect(
      container.querySelector(
        ".app-data-table--sticky-header.app-data-table--virtualized",
      ),
    ).not.toBeNull();
    expect(container.querySelector("thead")).not.toBeNull();
    expect(
      container.querySelector(".app-data-table__resize-handle"),
    ).not.toBeNull();
    expect(
      container.querySelector('[data-column-id="name"][data-pinned="left"]'),
    ).not.toBeNull();
  });

  it("does not create virtual rows for loading or empty states", async () => {
    renderTable({
      data: virtualData,
      loading: true,
      maxHeight: 200,
      virtualization: true,
    });
    await settleVirtualization();
    expect(
      container.querySelector(".app-data-table__virtual-spacer"),
    ).toBeNull();
    expect(container.textContent).toContain("Loading");

    renderTable({
      data: [],
      loading: false,
      maxHeight: 200,
      virtualization: true,
    });
    await settleVirtualization();
    expect(
      container.querySelector(".app-data-table__virtual-spacer"),
    ).toBeNull();
    expect(container.textContent).toContain("No data");
  });

  it("supports compact and custom virtual row heights", async () => {
    renderTable({
      data: virtualData,
      density: "compact",
      maxHeight: 200,
      virtualization: true,
    });
    await settleVirtualization();
    expect(
      container.querySelector<HTMLTableRowElement>(
        "tbody tr:not(.app-data-table__virtual-spacer)",
      )?.style.height,
    ).toBe("38px");

    renderTable({
      data: virtualData,
      maxHeight: 200,
      virtualization: { rowHeight: 52 },
    });
    await settleVirtualization();
    expect(
      container.querySelector<HTMLTableRowElement>(
        "tbody tr:not(.app-data-table__virtual-spacer)",
      )?.style.height,
    ).toBe("52px");
  });

  it("uses custom overscan and can toggle virtualization", async () => {
    renderTable({
      data: virtualData,
      maxHeight: 200,
      virtualization: { overscan: 0 },
    });
    await settleVirtualization();
    const withoutOverscan = container.querySelectorAll(
      "tbody tr:not(.app-data-table__virtual-spacer)",
    ).length;

    renderTable({
      data: virtualData,
      maxHeight: 200,
      virtualization: { overscan: 10 },
    });
    await settleVirtualization();
    const withOverscan = container.querySelectorAll(
      "tbody tr:not(.app-data-table__virtual-spacer)",
    ).length;
    expect(withOverscan).toBeGreaterThan(withoutOverscan);

    renderTable({ data: virtualData, maxHeight: 200, virtualization: false });
    expect(bodyRows()).toHaveLength(virtualData.length);
    expect(container.querySelector(".app-data-table--virtualized")).toBeNull();
  });

  it("virtualizes only the current page when pagination is enabled", async () => {
    renderTable({
      data: virtualData,
      maxHeight: 100,
      pagination: { defaultValue: { pageIndex: 1, pageSize: 10 } },
      virtualization: { overscan: 0 },
    });
    await settleVirtualization();
    const text = container.querySelector("tbody")?.textContent ?? "";
    expect(text).toContain("Virtual 011");
    expect(text).not.toContain("Virtual 001");
    expect(text).not.toContain("Virtual 021");
  });
});
