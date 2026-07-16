import { Children, cloneElement, isValidElement, useMemo, useState } from 'react'
import type { AppListViewItemInternalProps, AppListViewProps } from './types'
import { AppListViewItem } from './AppListViewItem'
import './AppListView.css'

const interactiveSelector = 'button,a,input,select,textarea,[role="button"],[role="link"],[data-list-action]'

export function AppListView({ activationMode = 'selection', ariaLabel, children, className, defaultValue = [], density = 'standard', onItemInvoke, onValueChange, selectionMode = 'none', style, value }: AppListViewProps) {
  const controlled = value !== undefined
  const [internal, setInternal] = useState(defaultValue)
  const selected = controlled ? value : internal
  const [active, setActive] = useState<string | null>(null)
  const items = useMemo(() => Children.toArray(children).filter((child): child is React.ReactElement<AppListViewItemInternalProps> => isValidElement(child) && child.type === AppListViewItem), [children])
  const isSelectionList = selectionMode !== 'none'
  const isInvokeList = activationMode === 'invoke'
  const isFocusable = (item: React.ReactElement<AppListViewItemInternalProps>) => !item.props.disabled && item.props.interactive !== false && (isSelectionList || isInvokeList)
  const enabled = items.filter(isFocusable).map((item) => item.props.value)
  const activeValue = active && enabled.includes(active) ? active : enabled[0] ?? null

  const select = (itemValue: string) => {
    if (!isSelectionList) return
    const next = selectionMode === 'single' ? [itemValue] : selected.includes(itemValue) ? selected.filter((entry) => entry !== itemValue) : [...selected, itemValue]
    if (!controlled) setInternal(next)
    onValueChange?.(next)
  }
  const invoke = (itemValue: string) => onItemInvoke?.(itemValue)
  const click = (itemValue: string, event: React.MouseEvent<HTMLDivElement>) => {
    if ((event.target as Element).closest(interactiveSelector) && event.target !== event.currentTarget) return
    const item = items.find((entry) => entry.props.value === itemValue)
    if (!item || !isFocusable(item)) return
    setActive(itemValue)
    if (isInvokeList) invoke(itemValue)
    else select(itemValue)
  }
  const keyDown = (itemValue: string, event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget || enabled.length === 0) return
    const current = enabled.indexOf(itemValue)
    let next = current
    if (event.key === 'ArrowDown') next = (current + 1) % enabled.length
    else if (event.key === 'ArrowUp') next = (current - 1 + enabled.length) % enabled.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = enabled.length - 1
    else if (event.key === ' ') {
      if (isInvokeList) { event.preventDefault(); invoke(itemValue) }
      else if (isSelectionList) { event.preventDefault(); select(itemValue) }
      return
    } else if (event.key === 'Enter') {
      if (isInvokeList) { event.preventDefault(); invoke(itemValue) }
      return
    } else return
    event.preventDefault()
    const target = enabled[next]
    setActive(target)
    Array.from(event.currentTarget.parentElement?.querySelectorAll<HTMLElement>('[data-value]') ?? []).find((node) => node.dataset.value === target)?.focus()
  }

  return <div aria-label={ariaLabel} aria-multiselectable={isSelectionList && selectionMode === 'multiple' || undefined} className={['app-list-view', `app-list-view--${density}`, className].filter(Boolean).join(' ')} role={isSelectionList ? 'listbox' : 'list'} style={style}>{items.map((item) => {
    const focusable = isFocusable(item)
    const itemRole = item.props.interactive === false ? 'listitem' : isSelectionList ? 'option' : isInvokeList ? 'button' : 'listitem'
    return cloneElement(item, { focusable, itemRole, onItemClick: click, onItemKeyDown: keyDown, selected: selected.includes(item.props.value), selectionMode, tabIndex: focusable && item.props.value === activeValue ? 0 : -1 })
  })}</div>
}
