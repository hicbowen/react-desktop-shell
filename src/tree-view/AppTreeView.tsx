import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type DragEvent,
  type KeyboardEvent,
} from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { ChevronDown16Regular } from '@fluentui/react-icons/svg/chevron-down'
import { ChevronRight16Regular } from '@fluentui/react-icons/svg/chevron-right'
import { useCollectionTypeahead } from '../collection/typeahead'
import { useControllableState } from '../collection/useControllableState'
import { useAppLocale } from '../localization/useAppLocale'
import type { AppTreeDropInfo, AppTreeItem, AppTreeViewProps } from './types'
import './AppTreeView.css'

interface FlatItem { item: AppTreeItem; level: number; parentKey?: string }

function flatten(items: readonly AppTreeItem[], expanded: Set<string>, level = 1, parentKey?: string): FlatItem[] {
  return items.flatMap((item) => [
    { item, level, parentKey },
    ...(expanded.has(item.key) && item.children ? flatten(item.children, expanded, level + 1, item.key) : []),
  ])
}

function itemText(item: AppTreeItem) {
  if (item.textValue) return item.textValue
  if (typeof item.label === 'string' || typeof item.label === 'number') return String(item.label)
  return item.key
}

function dropPosition(event: DragEvent<HTMLDivElement>): AppTreeDropInfo['position'] {
  const rect = event.currentTarget.getBoundingClientRect()
  const ratio = rect.height ? (event.clientY - rect.top) / rect.height : 0.5
  if (ratio < 0.25) return 'before'
  if (ratio > 0.75) return 'after'
  return 'inside'
}

function Chevron({ expanded, loading }: { expanded: boolean; loading?: boolean }) {
  const Icon = expanded ? ChevronDown16Regular : ChevronRight16Regular
  return <Icon aria-hidden="true" className={loading ? 'app-tree-view__chevron app-tree-view__chevron--loading' : 'app-tree-view__chevron'} focusable="false" />
}

export function AppTreeView({
  ariaLabel,
  className,
  defaultExpandedKeys = [],
  defaultSelectedKeys = [],
  expandedKeys,
  items,
  onExpandedKeysChange,
  onItemDrop,
  onItemInvoke,
  onLoadChildren,
  onSelectedKeysChange,
  selectedKeys,
  selectionMode = 'single',
  style,
  typeahead = true,
  virtualization = false,
}: AppTreeViewProps) {
  const { messages } = useAppLocale()
  const text = messages.treeView
  const [expandedValue, updateExpanded] = useControllableState<string[]>({
    value: expandedKeys ? [...expandedKeys] : undefined,
    defaultValue: [...defaultExpandedKeys],
    onChange: onExpandedKeysChange,
  })
  const [selectedValue, updateSelected] = useControllableState<string[]>({
    value: selectedKeys ? [...selectedKeys] : undefined,
    defaultValue: [...defaultSelectedKeys],
    onChange: onSelectedKeysChange,
  })
  const [focusedKey, setFocusedKey] = useState<string | undefined>(undefined)
  const [dropTarget, setDropTarget] = useState<{ key: string; position: AppTreeDropInfo['position'] } | null>(null)
  const selectionAnchor = useRef<string | undefined>(undefined)
  const rootRef = useRef<HTMLDivElement>(null)
  const expanded = useMemo(() => new Set(expandedValue), [expandedValue])
  const selected = useMemo(() => new Set(selectedValue), [selectedValue])
  const flat = useMemo(() => flatten(items, expanded), [expanded, items])
  const refs = useRef(new Map<string, HTMLDivElement>())
  const draggedKey = useRef<string | undefined>(undefined)
  const virtualOptions = typeof virtualization === 'object' ? virtualization : {}
  const virtualized = Boolean(virtualization)
  const rowHeight = virtualOptions.rowHeight ?? 30
  const viewportHeight = virtualOptions.viewportHeight ?? rowHeight * 12
  // TanStack Virtual intentionally exposes mutable virtualizer helpers.
  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: flat.length,
    enabled: virtualized,
    estimateSize: () => rowHeight,
    getScrollElement: () => rootRef.current,
    initialRect: { height: viewportHeight, width: 0 },
    overscan: virtualOptions.overscan ?? 6,
  })

  const toggleExpanded = (item: AppTreeItem) => {
    if (!item.hasChildren && !item.children?.length) return
    const next = new Set(expanded)
    if (next.has(item.key)) next.delete(item.key)
    else {
      next.add(item.key)
      if (!item.children?.length && item.hasChildren) void onLoadChildren?.(item)
    }
    updateExpanded([...next])
  }
  const choose = (item: AppTreeItem, event?: { ctrlKey?: boolean; metaKey?: boolean; shiftKey?: boolean }) => {
    if (item.disabled || selectionMode === 'none') return
    if (selectionMode === 'multiple' && event?.shiftKey && selectionAnchor.current) {
      const enabled = flat.filter((entry) => !entry.item.disabled).map((entry) => entry.item.key)
      const start = enabled.indexOf(selectionAnchor.current)
      const end = enabled.indexOf(item.key)
      if (start >= 0 && end >= 0) {
        const [from, to] = start < end ? [start, end] : [end, start]
        const next = event.ctrlKey || event.metaKey ? new Set(selected) : new Set<string>()
        enabled.slice(from, to + 1).forEach((key) => next.add(key))
        updateSelected(enabled.filter((key) => next.has(key)))
        return
      }
    }
    selectionAnchor.current = item.key
    if (selectionMode === 'multiple' && (event?.ctrlKey || event?.metaKey)) {
      const next = new Set(selected)
      if (next.has(item.key)) next.delete(item.key)
      else next.add(item.key)
      updateSelected([...next])
    } else updateSelected([item.key])
  }
  const focusKey = useCallback((key: string) => {
    const index = flat.findIndex((entry) => entry.item.key === key)
    if (virtualized && index >= 0) virtualizer.scrollToIndex(index, { align: 'auto' })
    setFocusedKey(key)
    const focus = () => refs.current.get(key)?.focus()
    focus()
    if (virtualized) requestAnimationFrame(focus)
  }, [flat, virtualized, virtualizer])
  const focusAt = (index: number) => {
    const target = flat[index]
    if (target) focusKey(target.item.key)
  }
  const typeaheadItems = useMemo(() => flat.map(({ item }) => ({
    disabled: item.disabled,
    key: item.key,
    text: itemText(item),
  })), [flat])
  const matchTypeahead = useCollectionTypeahead(typeaheadItems, focusKey)
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>, index: number, entry: FlatItem) => {
    if (event.key === 'ArrowDown') { event.preventDefault(); focusAt(Math.min(index + 1, flat.length - 1)) }
    else if (event.key === 'ArrowUp') { event.preventDefault(); focusAt(Math.max(index - 1, 0)) }
    else if (event.key === 'Home') { event.preventDefault(); focusAt(0) }
    else if (event.key === 'End') { event.preventDefault(); focusAt(flat.length - 1) }
    else if (event.key === 'ArrowRight') { event.preventDefault(); if (!expanded.has(entry.item.key)) toggleExpanded(entry.item); else focusAt(index + 1) }
    else if (event.key === 'ArrowLeft') { event.preventDefault(); if (expanded.has(entry.item.key)) toggleExpanded(entry.item); else if (entry.parentKey) focusKey(entry.parentKey) }
    else if (event.key === 'Enter') { event.preventDefault(); onItemInvoke?.(entry.item) }
    else if (event.key === ' ') { event.preventDefault(); choose(entry.item, event) }
    else if (typeahead && !event.ctrlKey && !event.metaKey && !event.altKey && matchTypeahead(event.key, entry.item.key)) event.preventDefault()
  }
  const drop = (event: DragEvent<HTMLDivElement>, targetKey: string) => {
    event.preventDefault()
    const position = dropPosition(event)
    if (draggedKey.current && draggedKey.current !== targetKey) {
      onItemDrop?.({ sourceKey: draggedKey.current, targetKey, position })
    }
    draggedKey.current = undefined
    setDropTarget(null)
  }
  const dragOver = (event: DragEvent<HTMLDivElement>, targetKey: string) => {
    if (!onItemDrop || draggedKey.current === targetKey) return
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    setDropTarget({ key: targetKey, position: dropPosition(event) })
  }

  const renderItem = (entry: FlatItem, index: number, virtualStyle?: CSSProperties) => {
    const { item, level } = entry
    const expandable = Boolean(item.hasChildren || item.children?.length)
    const isExpanded = expanded.has(item.key)
    const isSelected = selected.has(item.key)
    const itemStyle = {
      '--app-tree-level': level,
      ...virtualStyle,
    } as CSSProperties
    return (
      <div
        aria-disabled={item.disabled || undefined}
        aria-expanded={expandable ? isExpanded : undefined}
        aria-level={level}
        aria-selected={selectionMode === 'none' ? undefined : isSelected}
        className={`app-tree-view__item${isSelected ? ' app-tree-view__item--selected' : ''}`}
        data-drop-position={dropTarget?.key === item.key ? dropTarget.position : undefined}
        draggable={Boolean(onItemDrop) && !item.disabled}
        key={item.key}
        onClick={(event) => choose(item, event)}
        onDoubleClick={() => onItemInvoke?.(item)}
        onDragEnd={() => { draggedKey.current = undefined; setDropTarget(null) }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node)) setDropTarget(null)
        }}
        onDragOver={(event) => dragOver(event, item.key)}
        onDragStart={(event) => { draggedKey.current = item.key; event.dataTransfer.effectAllowed = 'move' }}
        onDrop={(event) => drop(event, item.key)}
        onFocus={() => setFocusedKey(item.key)}
        onKeyDown={(event) => onKeyDown(event, index, entry)}
        ref={(node) => { if (node) refs.current.set(item.key, node); else refs.current.delete(item.key) }}
        role="treeitem"
        style={itemStyle}
        tabIndex={(focusedKey ? focusedKey === item.key : index === 0) ? 0 : -1}
      >
        <button aria-label={isExpanded ? text.collapse : text.expand} className="app-tree-view__expand" disabled={!expandable || item.disabled} onClick={(event) => { event.stopPropagation(); toggleExpanded(item) }} tabIndex={-1} type="button">{expandable ? <Chevron expanded={isExpanded} loading={item.loading} /> : null}</button>
        {item.icon ? <span className="app-tree-view__icon">{item.icon}</span> : null}
        <span className="app-tree-view__label">{item.label}</span>
      </div>
    )
  }

  const rootStyle: CSSProperties = virtualized
    ? { ...style, maxHeight: viewportHeight, overflow: 'auto' }
    : style ?? {}
  return (
    <div
      aria-label={ariaLabel ?? text.label}
      aria-multiselectable={selectionMode === 'multiple' || undefined}
      className={['app-tree-view', virtualized && 'app-tree-view--virtual', className].filter(Boolean).join(' ')}
      ref={rootRef}
      role="tree"
      style={rootStyle}
    >
      {virtualized ? (
        <div className="app-tree-view__virtual-canvas" role="presentation" style={{ height: virtualizer.getTotalSize() }}>
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const entry = flat[virtualRow.index]
            return entry ? renderItem(entry, virtualRow.index, {
              height: virtualRow.size,
              left: 0,
              position: 'absolute',
              top: 0,
              transform: `translateY(${virtualRow.start}px)`,
              width: '100%',
            }) : null
          })}
        </div>
      ) : flat.map((entry, index) => renderItem(entry, index))}
    </div>
  )
}
