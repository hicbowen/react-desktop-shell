import {
  useCallback,
  useMemo,
  useState,
} from 'react'
import type { KeyboardEvent } from 'react'
import { AppExpanderGroupContext } from './AppExpanderGroupContext'
import type {
  AppExpanderGroupProps,
  AppExpanderGroupValue,
} from './types'
import './AppExpander.css'

function normalizeValue(
  expansionMode: 'single' | 'multiple',
  value: AppExpanderGroupValue | undefined,
) {
  if (expansionMode === 'single') {
    if (typeof value === 'string') return value
    return Array.isArray(value) ? value[0] ?? null : null
  }

  if (Array.isArray(value)) return [...new Set(value)]
  return typeof value === 'string' ? [value] : []
}

export function AppExpanderGroup({
  children,
  className,
  collapsible = true,
  defaultValue = null,
  expansionMode = 'independent',
  onKeyDown,
  onValueChange,
  value,
  ...rest
}: AppExpanderGroupProps) {
  const controlled = value !== undefined
  const [internalValue, setInternalValue] =
    useState<AppExpanderGroupValue>(defaultValue)
  const coordinated = expansionMode !== 'independent'
  const selectedValue = useMemo(
    () => coordinated
      ? normalizeValue(expansionMode, controlled ? value : internalValue)
      : null,
    [controlled, coordinated, expansionMode, internalValue, value],
  )
  const selectedItems = useMemo(
    () => Array.isArray(selectedValue)
      ? selectedValue
      : selectedValue == null ? [] : [selectedValue],
    [selectedValue],
  )

  const requestExpandedChange = useCallback((
    itemValue: string,
    expanded: boolean,
  ) => {
    if (!coordinated) return true

    let nextValue: string | string[] | null
    if (expansionMode === 'single') {
      if (!expanded && !collapsible) return false
      nextValue = expanded ? itemValue : null
    } else {
      nextValue = expanded
        ? selectedItems.includes(itemValue)
          ? [...selectedItems]
          : [...selectedItems, itemValue]
        : selectedItems.filter((entry) => entry !== itemValue)
    }

    if (!controlled) setInternalValue(nextValue)
    onValueChange?.(nextValue)
    return true
  }, [
    collapsible,
    controlled,
    coordinated,
    expansionMode,
    onValueChange,
    selectedItems,
  ])

  const contextValue = useMemo(() => ({
    isExpanded: (itemValue: string) => selectedItems.includes(itemValue),
    requestExpandedChange,
  }), [requestExpandedChange, selectedItems])

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event)
    if (
      event.defaultPrevented ||
      !coordinated ||
      !(event.target instanceof HTMLButtonElement) ||
      !event.target.classList.contains('app-expander__trigger')
    ) {
      return
    }

    const triggers = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>(
        '.app-expander__trigger',
      ),
    ).filter((trigger) => (
      !trigger.disabled &&
      trigger.closest('.app-expander')?.parentElement === event.currentTarget
    ))
    const currentIndex = triggers.indexOf(event.target)
    if (currentIndex < 0 || triggers.length === 0) return

    let nextIndex: number
    if (event.key === 'ArrowDown') {
      nextIndex = (currentIndex + 1) % triggers.length
    } else if (event.key === 'ArrowUp') {
      nextIndex = (currentIndex - 1 + triggers.length) % triggers.length
    } else if (event.key === 'Home') {
      nextIndex = 0
    } else if (event.key === 'End') {
      nextIndex = triggers.length - 1
    } else {
      return
    }

    event.preventDefault()
    triggers[nextIndex]?.focus()
  }

  const group = (
    <div
      {...rest}
      className={[
        'app-expander-group',
        `app-expander-group--${expansionMode}`,
        className,
      ].filter(Boolean).join(' ')}
      data-expansion-mode={expansionMode}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  )

  return coordinated
    ? (
        <AppExpanderGroupContext.Provider value={contextValue}>
          {group}
        </AppExpanderGroupContext.Provider>
      )
    : group
}
