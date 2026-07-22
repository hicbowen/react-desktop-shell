import {
  useId,
  useEffect,
  useRef,
  useLayoutEffect,
  useState,
  type DragEvent,
  type KeyboardEvent,
} from 'react'
import { useAppLocale } from '../localization/useAppLocale'
import type { AppTabViewItem, AppTabViewProps } from './types'
import './AppTabView.css'

function CloseIcon() {
  return <svg aria-hidden="true" viewBox="0 0 12 12"><path d="m2.25 2.25 7.5 7.5m0-7.5-7.5 7.5" /></svg>
}

function AddIcon() {
  return <svg aria-hidden="true" viewBox="0 0 12 12"><path d="M6 1.5v9M1.5 6h9" /></svg>
}

function getAvailableItem(items: readonly AppTabViewItem[], key?: string) {
  return items.find((item) => item.key === key && !item.disabled)
    ?? items.find((item) => !item.disabled)
}

export function AppTabView({
  addTabLabel,
  ariaLabel,
  className,
  closeTabLabel,
  defaultValue,
  items,
  mountStrategy = 'unmount',
  onAddTab,
  onTabClose,
  onTabContextMenu,
  onTabReorder,
  onValueChange,
  style,
  value,
}: AppTabViewProps) {
  const { messages } = useAppLocale()
  const text = messages.tabView
  const generatedId = useId().replace(/:/g, '')
  const controlled = value !== undefined
  const [internalValue, setInternalValue] = useState(
    () => getAvailableItem(items, defaultValue)?.key,
  )
  const selectedKey = getAvailableItem(items, controlled ? value : internalValue)?.key
  const selectedRef = useRef<HTMLButtonElement>(null)
  const tabsRef = useRef<HTMLDivElement>(null)
  const dragIndex = useRef<number | null>(null)
  const previousItemCount = useRef(items.length)

  useEffect(() => {
    const tabs = tabsRef.current
    if (!tabs) return
    const scrollTabs = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return
      const maxScrollLeft = tabs.scrollWidth - tabs.clientWidth
      if (maxScrollLeft <= 0) return
      const nextScrollLeft = Math.min(
        maxScrollLeft,
        Math.max(0, tabs.scrollLeft + event.deltaY),
      )
      if (nextScrollLeft === tabs.scrollLeft) return
      event.preventDefault()
      tabs.scrollLeft = nextScrollLeft
    }
    tabs.addEventListener('wheel', scrollTabs, { passive: false })
    return () => tabs.removeEventListener('wheel', scrollTabs)
  }, [])

  useLayoutEffect(() => {
    const itemWasAdded = items.length > previousItemCount.current
    previousItemCount.current = items.length
    if (itemWasAdded && tabsRef.current) {
      tabsRef.current.scrollLeft = tabsRef.current.scrollWidth
    }
  }, [items.length])

  const select = (key: string, focus = false) => {
    const item = items.find((candidate) => candidate.key === key)
    if (!item || item.disabled || key === selectedKey) return
    if (!controlled) setInternalValue(key)
    onValueChange?.(key)
    if (focus) requestAnimationFrame(() => selectedRef.current?.focus())
  }

  const moveSelection = (event: KeyboardEvent, currentIndex: number) => {
    const available = items
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => !item.disabled)
    const position = available.findIndex(({ index }) => index === currentIndex)
    let next = position
    if (event.key === 'ArrowRight') next = (position + 1) % available.length
    else if (event.key === 'ArrowLeft') next = (position - 1 + available.length) % available.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = available.length - 1
    else return
    event.preventDefault()
    const target = available[next]
    if (target) select(target.item.key, true)
  }

  const onDragStart = (event: DragEvent, index: number, item: AppTabViewItem) => {
    if (!onTabReorder || item.pinned) {
      event.preventDefault()
      return
    }
    dragIndex.current = index
    event.dataTransfer.effectAllowed = 'move'
  }

  const onDrop = (event: DragEvent, index: number, item: AppTabViewItem) => {
    event.preventDefault()
    const from = dragIndex.current
    dragIndex.current = null
    if (from === null || from === index || item.pinned) return
    onTabReorder?.(from, index)
  }

  const classes = ['app-tab-view', className].filter(Boolean).join(' ')

  return <div className={classes} style={style}>
    <div aria-label={ariaLabel ?? text.label} className="app-tab-view__strip" role="tablist">
      <div className="app-tab-view__tabs" ref={tabsRef}>
        {items.map((item, index) => {
          const selected = item.key === selectedKey
          const tabId = `${generatedId}-tab-${index}`
          const panelId = `${generatedId}-panel-${index}`
          const closeable = item.closeable !== false && !item.pinned && Boolean(onTabClose)
          return <div
            className={`app-tab-view__tab-shell${selected ? ' app-tab-view__tab-shell--selected' : ''}${item.pinned ? ' app-tab-view__tab-shell--pinned' : ''}`}
            draggable={Boolean(onTabReorder) && !item.pinned}
            key={item.key}
            onContextMenu={(event) => onTabContextMenu?.(item, event)}
            onDragEnd={() => { dragIndex.current = null }}
            onDragOver={(event) => { if (onTabReorder && !item.pinned) event.preventDefault() }}
            onDragStart={(event) => onDragStart(event, index, item)}
            onDrop={(event) => onDrop(event, index, item)}
          >
            <button
              aria-controls={panelId}
              aria-selected={selected}
              className="app-tab-view__tab"
              disabled={item.disabled}
              id={tabId}
              onClick={() => select(item.key)}
              onKeyDown={(event) => moveSelection(event, index)}
              ref={selected ? selectedRef : undefined}
              role="tab"
              tabIndex={selected ? 0 : -1}
              type="button"
            >
              {item.icon ? <span className="app-tab-view__icon">{item.icon}</span> : null}
              <span className="app-tab-view__label">{item.label}</span>
              {item.dirty ? <span aria-label={text.unsaved} className="app-tab-view__dirty" /> : null}
            </button>
            {closeable ? <button
              aria-label={closeTabLabel?.(item) ?? `${messages.common.close} ${typeof item.label === 'string' ? item.label : ''}`.trim()}
              className="app-tab-view__close"
              onClick={(event) => { event.stopPropagation(); onTabClose?.(item.key) }}
              tabIndex={selected ? 0 : -1}
              type="button"
            ><CloseIcon /></button> : null}
          </div>
        })}
        {onAddTab ? <button aria-label={addTabLabel ?? text.newTab} className="app-tab-view__add" onClick={onAddTab} type="button"><AddIcon /></button> : null}
      </div>
    </div>
    <div className="app-tab-view__panels">
      {items.map((item, index) => {
        const selected = item.key === selectedKey
        if (mountStrategy === 'unmount' && !selected) return null
        return <div
          aria-labelledby={`${generatedId}-tab-${index}`}
          className="app-tab-view__panel"
          hidden={!selected}
          id={`${generatedId}-panel-${index}`}
          key={item.key}
          role="tabpanel"
          tabIndex={0}
        >{item.content}</div>
      })}
    </div>
  </div>
}
