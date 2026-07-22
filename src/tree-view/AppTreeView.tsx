import { useMemo, useRef, useState, type CSSProperties, type DragEvent, type KeyboardEvent } from 'react'
import { useAppLocale } from '../localization/useAppLocale'
import type { AppTreeItem, AppTreeViewProps } from './types'
import './AppTreeView.css'

interface FlatItem { item: AppTreeItem; level: number; parentKey?: string }

function flatten(items: readonly AppTreeItem[], expanded: Set<string>, level = 1, parentKey?: string): FlatItem[] {
  return items.flatMap((item) => [
    { item, level, parentKey },
    ...(expanded.has(item.key) && item.children ? flatten(item.children, expanded, level + 1, item.key) : []),
  ])
}

function Chevron({ expanded, loading }: { expanded: boolean; loading?: boolean }) {
  return <svg aria-hidden="true" className={loading ? 'app-tree-view__chevron app-tree-view__chevron--loading' : 'app-tree-view__chevron'} viewBox="0 0 12 12"><path d={expanded ? 'm2.5 4 3.5 3.5L9.5 4' : 'm4 2.5 3.5 3.5L4 9.5'} /></svg>
}

export function AppTreeView({
  ariaLabel, className, defaultExpandedKeys = [], defaultSelectedKeys = [],
  expandedKeys, items, onExpandedKeysChange, onItemDrop, onItemInvoke, onLoadChildren,
  onSelectedKeysChange, selectedKeys, selectionMode = 'single', style,
}: AppTreeViewProps) {
  const { messages } = useAppLocale()
  const text = messages.treeView
  const [internalExpanded, setInternalExpanded] = useState(defaultExpandedKeys)
  const [internalSelected, setInternalSelected] = useState(defaultSelectedKeys)
  const [focusedKey, setFocusedKey] = useState<string | undefined>(undefined)
  const expanded = useMemo(() => new Set(expandedKeys ?? internalExpanded), [expandedKeys, internalExpanded])
  const selected = useMemo(() => new Set(selectedKeys ?? internalSelected), [internalSelected, selectedKeys])
  const flat = useMemo(() => flatten(items, expanded), [expanded, items])
  const refs = useRef(new Map<string, HTMLDivElement>())
  const draggedKey = useRef<string | undefined>(undefined)

  const updateExpanded = (next: string[]) => {
    if (expandedKeys === undefined) setInternalExpanded(next)
    onExpandedKeysChange?.(next)
  }
  const updateSelected = (next: string[]) => {
    if (selectedKeys === undefined) setInternalSelected(next)
    onSelectedKeysChange?.(next)
  }
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
  const choose = (item: AppTreeItem, event?: { ctrlKey?: boolean; metaKey?: boolean }) => {
    if (item.disabled || selectionMode === 'none') return
    if (selectionMode === 'multiple' && (event?.ctrlKey || event?.metaKey)) {
      const next = new Set(selected)
      if (next.has(item.key)) next.delete(item.key); else next.add(item.key)
      updateSelected([...next])
    } else updateSelected([item.key])
  }
  const focusAt = (index: number) => {
    const target = flat[index]
    if (!target) return
    setFocusedKey(target.item.key)
    refs.current.get(target.item.key)?.focus()
  }
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>, index: number, entry: FlatItem) => {
    if (event.key === 'ArrowDown') { event.preventDefault(); focusAt(Math.min(index + 1, flat.length - 1)) }
    else if (event.key === 'ArrowUp') { event.preventDefault(); focusAt(Math.max(index - 1, 0)) }
    else if (event.key === 'Home') { event.preventDefault(); focusAt(0) }
    else if (event.key === 'End') { event.preventDefault(); focusAt(flat.length - 1) }
    else if (event.key === 'ArrowRight') { event.preventDefault(); if (!expanded.has(entry.item.key)) toggleExpanded(entry.item); else focusAt(index + 1) }
    else if (event.key === 'ArrowLeft') { event.preventDefault(); if (expanded.has(entry.item.key)) toggleExpanded(entry.item); else if (entry.parentKey) refs.current.get(entry.parentKey)?.focus() }
    else if (event.key === 'Enter') { event.preventDefault(); onItemInvoke?.(entry.item) }
    else if (event.key === ' ') { event.preventDefault(); choose(entry.item, event) }
  }
  const drop = (event: DragEvent, targetKey: string) => {
    event.preventDefault()
    if (draggedKey.current && draggedKey.current !== targetKey) onItemDrop?.({ sourceKey: draggedKey.current, targetKey, position: 'inside' })
    draggedKey.current = undefined
  }

  return <div aria-label={ariaLabel ?? text.label} aria-multiselectable={selectionMode === 'multiple' || undefined} className={['app-tree-view', className].filter(Boolean).join(' ')} role="tree" style={style}>
    {flat.map((entry, index) => {
      const { item, level } = entry
      const expandable = Boolean(item.hasChildren || item.children?.length)
      const isExpanded = expanded.has(item.key)
      const isSelected = selected.has(item.key)
      return <div
        aria-disabled={item.disabled || undefined} aria-expanded={expandable ? isExpanded : undefined}
        aria-level={level} aria-selected={selectionMode === 'none' ? undefined : isSelected}
        className={`app-tree-view__item${isSelected ? ' app-tree-view__item--selected' : ''}`}
        draggable={Boolean(onItemDrop) && !item.disabled} key={item.key}
        onClick={(event) => choose(item, event)} onDoubleClick={() => onItemInvoke?.(item)}
        onDragEnd={() => { draggedKey.current = undefined }} onDragOver={(event) => { if (onItemDrop) event.preventDefault() }}
        onDragStart={() => { draggedKey.current = item.key }} onDrop={(event) => drop(event, item.key)}
        onFocus={() => setFocusedKey(item.key)} onKeyDown={(event) => onKeyDown(event, index, entry)}
        ref={(node) => { if (node) refs.current.set(item.key, node); else refs.current.delete(item.key) }}
        role="treeitem" style={{ '--app-tree-level': level } as CSSProperties}
        tabIndex={(focusedKey ? focusedKey === item.key : index === 0) ? 0 : -1}
      >
        <button aria-label={isExpanded ? text.collapse : text.expand} className="app-tree-view__expand" disabled={!expandable || item.disabled} onClick={(event) => { event.stopPropagation(); toggleExpanded(item) }} tabIndex={-1} type="button">{expandable ? <Chevron expanded={isExpanded} loading={item.loading} /> : null}</button>
        {item.icon ? <span className="app-tree-view__icon">{item.icon}</span> : null}
        <span className="app-tree-view__label">{item.label}</span>
      </div>
    })}
  </div>
}
