import { useRef, useState, type KeyboardEvent } from 'react'
import { AppTag } from '../tag'
import { useAppLocale } from '../localization/useAppLocale'
import type { AppMultiSelectProps } from './types'
import './AppMultiSelect.css'

export function AppMultiSelect({ options, value, defaultValue = [], onValueChange, maxSelected, searchable = true, placeholder, disabled = false, readOnly = false, invalid = false, className, style }: AppMultiSelectProps) {
  const { messages } = useAppLocale()
  const text = messages.multiSelect
  const controlled = value !== undefined
  const [internal, setInternal] = useState<string[]>(() => [...defaultValue])
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const selected = value ? [...value] : internal
  const available = options.filter((option) => !selected.includes(option.value) && `${typeof option.label === 'string' ? option.label : option.value} ${option.value}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))
  const commit = (next: string[]) => { if (!controlled) setInternal(next); onValueChange?.(next) }
  const choose = (option = available[active]) => {
    if (!option || option.disabled || (maxSelected !== undefined && selected.length >= maxSelected)) return
    commit([...selected, option.value]); setQuery(''); setActive(0); setOpen(true)
  }
  const remove = (item: string) => { if (!readOnly && !disabled) commit(selected.filter((value) => value !== item)) }
  const keyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); setOpen(true); setActive((current) => Math.max(0, Math.min(available.length - 1, current + (event.key === 'ArrowDown' ? 1 : -1)))) }
    else if (event.key === 'Enter' && open) { event.preventDefault(); choose() }
    else if (event.key === 'Backspace' && !query && selected.length) remove(selected.at(-1)!)
    else if (event.key === 'Escape') setOpen(false)
  }
  return <div className={['app-multi-select', invalid ? 'app-multi-select--invalid' : '', disabled ? 'app-multi-select--disabled' : '', className].filter(Boolean).join(' ')} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false) }} ref={rootRef} style={style}>
    <div className="app-multi-select__control" onClick={() => { if (!disabled && !readOnly) setOpen(true) }}>
      {selected.map((item) => { const option = options.find((candidate) => candidate.value === item); return <AppTag disabled={disabled || readOnly} dismissLabel={text.remove(typeof option?.label === 'string' ? option.label : item)} key={item} onDismiss={disabled || readOnly ? undefined : () => remove(item)} size="small">{option?.label ?? item}</AppTag> })}
      {searchable ? <input aria-label={text.label} disabled={disabled} onChange={(event) => { setQuery(event.currentTarget.value); setOpen(true); setActive(0) }} onFocus={() => setOpen(true)} onKeyDown={keyDown} placeholder={selected.length ? undefined : placeholder ?? text.placeholder} readOnly={readOnly} role="combobox" value={query} /> : selected.length === 0 ? <span className="app-multi-select__placeholder">{placeholder ?? text.placeholder}</span> : null}
      <span aria-hidden="true" className="app-multi-select__chevron">⌄</span>
    </div>
    {open && !disabled && !readOnly ? <div className="app-multi-select__list" role="listbox" aria-multiselectable="true">{available.length ? available.map((option, index) => <button aria-selected="false" className={index === active ? 'app-multi-select__option--active' : ''} disabled={option.disabled || (maxSelected !== undefined && selected.length >= maxSelected)} key={option.value} onMouseDown={(event) => event.preventDefault()} onClick={() => choose(option)} role="option" type="button">{option.label}</button>) : <span className="app-multi-select__empty">{text.empty}</span>}</div> : null}
  </div>
}

export const AppTagPicker = AppMultiSelect
