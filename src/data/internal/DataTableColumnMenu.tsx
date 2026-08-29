import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Column } from "@tanstack/react-table";
import { ArrowSortDown16Regular } from "@fluentui/react-icons/svg/arrow-sort-down";
import { ArrowSortUp16Regular } from "@fluentui/react-icons/svg/arrow-sort-up";
import { Filter16Regular } from "@fluentui/react-icons/svg/filter";
import { MoreVertical16Regular } from "@fluentui/react-icons/svg/more-vertical";
import { AppButton } from "../../button/AppButton";
import { AppPopover } from "../../popover/AppPopover";
import { AppSearchBox } from "../../search-box/AppSearchBox";
import { useAppLocale } from "../../localization/useAppLocale";
import { AppScrollArea } from "../../scroll-area/AppScrollArea";
import { AppCheckBox } from "../../selection-controls/AppCheckBox";
import { AppCheckBoxGroup } from "../../selection-controls/AppCheckBoxGroup";
import { AppRadioGroup } from "../../selection-controls/AppRadioGroup";
import type { AppDataTableFilterDefinition } from "../types";
import { hasFilterValue } from "./dataTableFilters";
import "../../context-menu/AppContextMenuLayer.css";

type FilterDraft = string | string[] | undefined;

function filterLabel(label: ReactNode, fallback: string) {
  if (typeof label === "string" || typeof label === "number") {
    return String(label);
  }

  return fallback;
}

function nodeSearchText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(nodeSearchText).join(" ");
  }

  return "";
}

function getFilterDraft(value: unknown, mode: "single" | "multiple") {
  if (mode === "multiple") {
    return Array.isArray(value)
      ? value.map(String)
      : value === undefined || value === null || value === ""
        ? []
        : [String(value)];
  }

  return value === undefined || value === null || value === ""
    ? undefined
    : String(value);
}

function getFilterValueForCommit(
  draft: FilterDraft,
  mode: "single" | "multiple",
) {
  if (mode === "multiple") {
    return Array.isArray(draft) && draft.length > 0 ? draft : undefined;
  }

  return typeof draft === "string" && draft.length > 0 ? draft : undefined;
}

interface DataTableColumnMenuProps<TData> {
  column: Column<TData>;
  filterDefinition?: AppDataTableFilterDefinition<TData>;
}

export function DataTableColumnMenu<TData>({
  column,
  filterDefinition,
}: DataTableColumnMenuProps<TData>) {
  const { messages } = useAppLocale();
  const locale = messages.dataTable;
  const [open, setOpen] = useState(false);
  const [filterDraft, setFilterDraft] = useState<FilterDraft>(undefined);
  const [filterDirty, setFilterDirty] = useState(false);
  const [optionSearch, setOptionSearch] = useState("");
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const filterSearchRef = useRef<HTMLInputElement | null>(null);
  const firstActionRef = useRef<HTMLButtonElement | null>(null);
  const mode = filterDefinition?.mode ?? "single";
  const filterOptions = useMemo(
    () => filterDefinition?.options ?? [],
    [filterDefinition?.options],
  );
  const sorted = column.getIsSorted();
  const canSort = column.getCanSort();
  const hasFilter = hasFilterValue(column.getFilterValue());
  const filterName = filterLabel(filterDefinition?.label, column.id);
  const normalizedSearch = optionSearch.trim().toLocaleLowerCase();
  const visibleOptions = useMemo(
    () =>
      filterOptions.filter((option) => {
        if (!normalizedSearch) return true;

        const labelText = nodeSearchText(option.label).toLocaleLowerCase();
        return (
          labelText.includes(normalizedSearch) ||
          option.value.toLocaleLowerCase().includes(normalizedSearch)
        );
      }),
    [filterOptions, normalizedSearch],
  );
  const selectedValues = useMemo(
    () => (Array.isArray(filterDraft) ? filterDraft : []),
    [filterDraft],
  );
  const selectedValueSet = useMemo(
    () => new Set(selectedValues),
    [selectedValues],
  );
  const allVisibleOptionsSelected =
    mode === "multiple" &&
    visibleOptions.length > 0 &&
    visibleOptions.every((option) => selectedValueSet.has(option.value));
  const someVisibleOptionsSelected =
    mode === "multiple" &&
    visibleOptions.some((option) => selectedValueSet.has(option.value));
  const closeMenu = () => {
    setOpen(false);
    setFilterDraft(undefined);
    setFilterDirty(false);
    setOptionSearch("");
  };

  const closeMenuAndRestoreFocus = () => {
    closeMenu();
    triggerRef.current?.focus({ preventScroll: true });
  };

  useEffect(() => {
    if (!open || filterDefinition) return;

    const frame = requestAnimationFrame(() => {
      firstActionRef.current?.focus({ preventScroll: true });
    });

    return () => cancelAnimationFrame(frame);
  }, [filterDefinition, open]);

  const openMenu = () => {
    setFilterDraft(getFilterDraft(column.getFilterValue(), mode));
    setFilterDirty(false);
    setOptionSearch("");
    setOpen(true);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) openMenu();
    else closeMenu();
  };

  const updateFilterDraft = (next: FilterDraft) => {
    setFilterDraft(next);
    setFilterDirty(true);
  };

  const applyFilter = () => {
    if (filterDirty) {
      column.setFilterValue(getFilterValueForCommit(filterDraft, mode));
    }

    closeMenuAndRestoreFocus();
  };

  const selectAllVisibleOptions = () => {
    if (mode !== "multiple" || visibleOptions.length === 0) return;

    const visibleValues = new Set(visibleOptions.map((option) => option.value));
    const next = allVisibleOptionsSelected
      ? selectedValues.filter((value) => !visibleValues.has(value))
      : [...new Set([...selectedValues, ...visibleValues])];
    updateFilterDraft(next);
  };

  const clearFilter = () => {
    updateFilterDraft(mode === "multiple" ? [] : undefined);
  };

  const runColumnAction = (
    action: "sort-ascending" | "sort-descending" | "clear-sorting",
  ) => {
    switch (action) {
      case "sort-ascending":
        column.toggleSorting(false);
        break;
      case "sort-descending":
        column.toggleSorting(true);
        break;
      case "clear-sorting":
        column.clearSorting();
        break;
    }

    closeMenuAndRestoreFocus();
  };

  const actionButton = (
    action: "sort-ascending" | "sort-descending" | "clear-sorting",
    label: string,
    disabled: boolean,
    icon?: ReactNode,
    ref?: React.MutableRefObject<HTMLButtonElement | null>,
  ) => (
    <button
      ref={ref}
      className="app-context-menu__item app-data-table__column-menu-item"
      data-action={action}
      disabled={disabled}
      type="button"
      onClick={() => runColumnAction(action)}
    >
      <span aria-hidden="true" className="app-context-menu__icon">
        {icon}
      </span>
      <span className="app-context-menu__label">{label}</span>
    </button>
  );

  if (!canSort && !filterDefinition) return null;

  const trigger = (
    <button
      ref={triggerRef}
      aria-label={locale.columnActions(column.id)}
      className="app-data-table__column-menu-button"
      type="button"
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => {
        if (event.key === "ArrowDown") {
          event.preventDefault();
          if (!open) openMenu();
        }
      }}
    >
      {hasFilter ? (
        <span
          aria-hidden="true"
          className="app-data-table__filter-indicator"
        >
          <Filter16Regular aria-hidden="true" focusable="false" />
        </span>
      ) : (
        <MoreVertical16Regular aria-hidden="true" focusable="false" />
      )}
    </button>
  );

  return (
    <AppPopover
      ariaLabel={locale.filterColumn(filterName)}
      className="app-data-table__column-menu"
      initialFocusRef={filterDefinition ? filterSearchRef : undefined}
      offset={5}
      onOpenChange={handleOpenChange}
      open={open}
      placement="bottom-end"
      trigger={trigger}
    >
      <div className="app-data-table__column-menu-actions">
        {actionButton(
          "sort-ascending",
          locale.sortAscending,
          !canSort || sorted === "asc",
          <ArrowSortUp16Regular aria-hidden="true" focusable="false" />,
          firstActionRef,
        )}
        {actionButton(
          "sort-descending",
          locale.sortDescending,
          !canSort || sorted === "desc",
          <ArrowSortDown16Regular aria-hidden="true" focusable="false" />,
        )}
        {actionButton("clear-sorting", locale.clearSorting, !sorted)}
      </div>

      {filterDefinition ? (
        <>
          <div className="app-context-menu__separator" role="separator" />
          <div className="app-data-table__column-filter-actions">
            <button
              className="app-context-menu__item app-data-table__column-menu-item"
              data-action="clear-filter"
              disabled={!hasFilterValue(filterDraft)}
              type="button"
              onClick={clearFilter}
            >
              <span aria-hidden="true" className="app-context-menu__icon" />
              <span className="app-context-menu__label">
                {locale.clearColumnFilter}
              </span>
            </button>
          </div>
          <div
            aria-label={filterName}
            className="app-data-table__column-filter"
            role="group"
          >
            <div className="app-data-table__column-filter-heading">
              <Filter16Regular aria-hidden="true" focusable="false" />
              <span>{filterDefinition.label}</span>
            </div>
            <AppSearchBox
              ref={filterSearchRef}
              aria-label={locale.searchOptions}
              className="app-data-table__column-filter-search"
              clearOnEscape={false}
              onValueChange={setOptionSearch}
              placeholder={locale.searchOptions}
              value={optionSearch}
            />
            {mode === "multiple" ? (
              <>
                <div className="app-data-table__column-filter-select-all">
                  <AppCheckBox
                    aria-label={locale.selectAllOptions}
                    checked={allVisibleOptionsSelected}
                    disabled={visibleOptions.length === 0}
                    indeterminate={
                      someVisibleOptionsSelected && !allVisibleOptionsSelected
                    }
                    label={locale.selectAllOptions}
                    onCheckedChange={selectAllVisibleOptions}
                  />
                </div>
                <div
                  className="app-context-menu__separator app-data-table__column-filter-select-all-separator"
                  role="separator"
                />
              </>
            ) : null}
            <AppScrollArea
              className="app-data-table__column-filter-scroll"
              orientation="vertical"
              scrollbar="auto"
              viewportClassName="app-data-table__column-filter-content"
            >
              {visibleOptions.length > 0 ? (
                mode === "multiple" ? (
                  <AppCheckBoxGroup
                    ariaLabel={filterName}
                    className="app-data-table__column-filter-option-group"
                    onValueChange={updateFilterDraft}
                    options={visibleOptions}
                    value={selectedValues}
                  />
                ) : (
                  <AppRadioGroup
                    ariaLabel={filterName}
                    className="app-data-table__column-filter-option-group"
                    onValueChange={updateFilterDraft}
                    options={visibleOptions}
                    value={
                      typeof filterDraft === "string" ? filterDraft : ""
                    }
                  />
                )
              ) : (
                <div className="app-data-table__column-filter-empty">
                  {locale.noMatchingOptions}
                </div>
              )}
            </AppScrollArea>
          </div>
          <div
            className="app-context-menu__separator app-data-table__column-filter-footer-separator"
            role="separator"
          />
          <div className="app-data-table__column-filter-footer">
            <AppButton
              block
              className="app-data-table__column-filter-cancel"
              data-action="cancel-filter"
              onClick={closeMenuAndRestoreFocus}
            >
              {locale.cancelFilter}
            </AppButton>
            <AppButton
              appearance="primary"
              block
              className="app-data-table__column-filter-apply"
              data-action="apply-filter"
              onClick={applyFilter}
            >
              {locale.applyFilter}
            </AppButton>
          </div>
        </>
      ) : null}
    </AppPopover>
  );
}
