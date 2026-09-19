import {
  Children,
  cloneElement,
  isValidElement,
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useCollectionTypeahead } from '../collection/typeahead'
import { useControllableState } from '../collection/useControllableState'
import type { AppListViewItemInternalProps, AppListViewProps } from './types'
import { AppListViewItem } from './AppListViewItem'
import './AppListView.css'

function itemText(item: React.ReactElement<AppListViewItemInternalProps>) {
  if (item.props.textValue) return item.props.textValue
  if (typeof item.props.title === 'string' || typeof item.props.title === 'number') {
    return String(item.props.title)
  }
  return item.props.value
}

export function AppListView({
  activationMode = 'selection',
  ariaLabel,
  children,
  className,
  defaultValue = [],
  density = 'standard',
  onItemInvoke,
  onValueChange,
  selectionMode = 'none',
  style,
  typeahead = true,
  value,
  virtualization = false,
}: AppListViewProps) {
  const [selected, setSelected] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  })
  const [active, setActive] = useState<string | null>(null)
  const selectionAnchor = useRef<string | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const selectionName = useId()
  const items = useMemo(
    () => Children.toArray(children).filter(
      (child): child is React.ReactElement<AppListViewItemInternalProps> => (
        isValidElement(child) && child.type === AppListViewItem
      ),
    ),
    [children],
  )
  const isSelectionList = selectionMode !== 'none'
  const isInvokeList = activationMode === 'invoke'
  const isFocusable = useCallback(
    (item: React.ReactElement<AppListViewItemInternalProps>) => (
      !item.props.disabled && item.props.interactive !== false && isInvokeList
    ),
    [isInvokeList],
  )
  const enabled = useMemo(
    () => items.filter(isFocusable).map((item) => item.props.value),
    [isFocusable, items],
  )
  const selectable = useMemo(
    () => items.filter((item) => !item.props.disabled && item.props.interactive !== false).map((item) => item.props.value),
    [items],
  )
  const activeValue = active && enabled.includes(active) ? active : enabled[0] ?? null
  const virtualOptions = typeof virtualization === 'object' ? virtualization : {}
  const virtualized = Boolean(virtualization)
  const itemHeight = virtualOptions.itemHeight ?? (density === 'compact' ? 36 : 48)
  const viewportHeight = virtualOptions.viewportHeight ?? itemHeight * 10
  // TanStack Virtual intentionally exposes mutable virtualizer helpers.
  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: items.length,
    enabled: virtualized,
    estimateSize: () => itemHeight,
    getScrollElement: () => rootRef.current,
    initialRect: { height: viewportHeight, width: 0 },
    overscan: virtualOptions.overscan ?? 5,
  })

  const focusValue = useCallback((target: string) => {
    const index = items.findIndex((item) => item.props.value === target)
    if (virtualized && index >= 0) virtualizer.scrollToIndex(index, { align: 'auto' })
    setActive(target)
    const focus = () => Array.from(
      rootRef.current?.querySelectorAll<HTMLElement>('[data-value]') ?? [],
    ).find((node) => node.dataset.value === target)?.focus()
    focus()
    if (virtualized) requestAnimationFrame(focus)
  }, [items, virtualized, virtualizer])

  const typeaheadItems = useMemo(() => items.map((item) => ({
    disabled: item.props.disabled || item.props.interactive === false,
    key: item.props.value,
    text: itemText(item),
  })), [items])
  const matchTypeahead = useCollectionTypeahead(typeaheadItems, focusValue)

  const select = (itemValue: string, event?: { shiftKey?: boolean }) => {
    if (!isSelectionList) return
    if (selectionMode === 'multiple' && event?.shiftKey && selectionAnchor.current) {
      const start = selectable.indexOf(selectionAnchor.current)
      const end = selectable.indexOf(itemValue)
      if (start >= 0 && end >= 0) {
        const [from, to] = start < end ? [start, end] : [end, start]
        const next = new Set(selected)
        selectable.slice(from, to + 1).forEach((entry) => next.add(entry))
        setSelected(selectable.filter((entry) => next.has(entry)))
        return
      }
    }
    selectionAnchor.current = itemValue
    const next = selectionMode === 'single'
      ? [itemValue]
      : selected.includes(itemValue)
        ? selected.filter((entry) => entry !== itemValue)
        : [...selected, itemValue]
    setSelected(next)
  }
  const invoke = (itemValue: string) => onItemInvoke?.(itemValue)
  const click = (itemValue: string) => {
    const item = items.find((entry) => entry.props.value === itemValue)
    if (!item || !isFocusable(item)) return
    setActive(itemValue)
    invoke(itemValue)
  }
  const keyDown = (itemValue: string, event: React.KeyboardEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget || enabled.length === 0) return
    const current = enabled.indexOf(itemValue)
    let next = current
    if (event.key === 'ArrowDown') next = (current + 1) % enabled.length
    else if (event.key === 'ArrowUp') next = (current - 1 + enabled.length) % enabled.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = enabled.length - 1
    else if (event.key === ' ') {
      if (isInvokeList) { event.preventDefault(); invoke(itemValue) }
      return
    } else if (event.key === 'Enter') {
      if (isInvokeList) { event.preventDefault(); invoke(itemValue) }
      return
    } else return
    event.preventDefault()
    focusValue(enabled[next])
  }
  const onTypeaheadKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!typeahead || event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return
    const currentKey = (event.target as HTMLElement).closest<HTMLElement>('[data-value]')?.dataset.value
    if (matchTypeahead(event.key, currentKey)) event.preventDefault()
  }

  const renderItem = (
    item: React.ReactElement<AppListViewItemInternalProps>,
    virtualStyle?: CSSProperties,
  ) => {
    const focusable = isFocusable(item)
    const itemRole = item.props.interactive === false ? 'listitem' : isInvokeList ? 'button' : 'listitem'
    const itemSelectionMode = isSelectionList && item.props.interactive !== false ? selectionMode : 'none'
    return cloneElement(item, {
      focusable,
      itemRole,
      onItemClick: click,
      onItemKeyDown: keyDown,
      onItemSelect: select,
      selected: selected.includes(item.props.value),
      selectionMode: itemSelectionMode,
      selectionName,
      style: virtualStyle ? { ...item.props.style, ...virtualStyle } : item.props.style,
      tabIndex: focusable && item.props.value === activeValue ? 0 : -1,
    })
  }

  const rootStyle: CSSProperties = virtualized
    ? { ...style, maxHeight: viewportHeight, overflow: 'auto' }
    : style ?? {}
  return (
    <div
      aria-label={ariaLabel}
      className={['app-list-view', `app-list-view--${density}`, virtualized && 'app-list-view--virtual', className].filter(Boolean).join(' ')}
      onKeyDownCapture={onTypeaheadKeyDown}
      ref={rootRef}
      role="list"
      style={rootStyle}
    >
      {virtualized ? (
        <div className="app-list-view__virtual-canvas" role="presentation" style={{ height: virtualizer.getTotalSize() }}>
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const item = items[virtualItem.index]
            return item ? renderItem(item, {
              height: virtualItem.size,
              left: 0,
              position: 'absolute',
              top: 0,
              transform: `translateY(${virtualItem.start}px)`,
              width: '100%',
            }) : null
          })}
        </div>
      ) : items.map((item) => renderItem(item))}
    </div>
  )
}
