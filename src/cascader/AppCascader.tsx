import { forwardRef, useId, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react'
import { useAppFieldContext } from '../field/AppFieldContext'
import { useAppLocale } from '../localization/useAppLocale'
import { AppAnchoredPopup } from '../overlay/AppAnchoredPopup'
import type { AppCascaderOption, AppCascaderProps } from './types'
import './AppCascader.css'

function resolvePath(options: AppCascaderOption[], values: string[]) {
  const path: AppCascaderOption[] = []
  let level = options
  for (const value of values) {
    const option = level.find((entry) => entry.value === value)
    if (!option) break
    path.push(option)
    level = option.children ?? []
  }
  return path
}

export const AppCascader = forwardRef<HTMLButtonElement, AppCascaderProps>(function AppCascader({
  'aria-describedby': ariaDescribedBy,
  'aria-label': ariaLabel,
  className,
  clearable = false,
  defaultOpen = false,
  defaultValue = [],
  disabled,
  displayRender,
  emptyContent,
  id,
  invalid,
  name,
  onOpenChange,
  onValueChange,
  open,
  options,
  placeholder,
  required,
  separator = ' / ',
  size = 'standard',
  style,
  value,
}, forwardedRef) {
  const field = useAppFieldContext()
  const { messages } = useAppLocale()
  const generatedId = useId()
  const controlId = id ?? field?.controlId ?? `app-cascader-${generatedId}`
  const treeId = `${controlId}-tree`
  const rootRef = useRef<HTMLSpanElement>(null)
  const [internalValue, setInternalValue] = useState(defaultValue)
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const [activePath, setActivePath] = useState<string[]>(defaultValue)
  const [activeLevel, setActiveLevel] = useState(Math.max(0, defaultValue.length - 1))
  const controlled = value !== undefined
  const openControlled = open !== undefined
  const selectedValues = controlled ? value : internalValue
  const visible = openControlled ? open : internalOpen
  const resolvedDisabled = disabled ?? field?.disabled ?? false
  const resolvedInvalid = invalid ?? field?.invalid
  const resolvedRequired = required ?? field?.required
  const selectedOptions = useMemo(() => resolvePath(options, selectedValues), [options, selectedValues])
  const resolvedPlaceholder = placeholder ?? messages.cascader.placeholder
  const resolvedEmptyContent = emptyContent ?? messages.cascader.empty

  const columns = useMemo(() => {
    const result: AppCascaderOption[][] = [options]
    let level = options
    for (const pathValue of activePath) {
      const option = level.find((entry) => entry.value === pathValue)
      if (!option?.children?.length) break
      level = option.children
      result.push(level)
    }
    return result
  }, [activePath, options])

  const requestOpen = (next: boolean) => {
    if (!openControlled) setInternalOpen(next)
    onOpenChange?.(next)
    if (next) {
      setActivePath(selectedValues)
      setActiveLevel(Math.max(0, selectedValues.length - 1))
    }
  }
  const commit = (values: string[]) => {
    const path = resolvePath(options, values)
    if (!controlled) setInternalValue(values)
    onValueChange?.(values, path)
    requestOpen(false)
  }
  const setOptionAtLevel = (level: number, option: AppCascaderOption) => {
    const next = [...activePath.slice(0, level), option.value]
    setActivePath(next)
    setActiveLevel(level)
    if (!option.children?.length) commit(next)
  }
  const move = (direction: 1 | -1) => {
    const levelOptions = columns[activeLevel] ?? []
    if (!levelOptions.length) return
    const currentValue = activePath[activeLevel]
    let index = levelOptions.findIndex((option) => option.value === currentValue)
    if (index < 0) index = direction === 1 ? -1 : 0
    for (let count = 0; count < levelOptions.length; count += 1) {
      index = (index + direction + levelOptions.length) % levelOptions.length
      const option = levelOptions[index]
      if (option && !option.disabled) {
        setActivePath([...activePath.slice(0, activeLevel), option.value])
        return
      }
    }
  }
  const enterChild = () => {
    const option = columns[activeLevel]?.find((entry) => entry.value === activePath[activeLevel])
    const first = option?.children?.find((entry) => !entry.disabled)
    if (!first) return false
    setActivePath([...activePath.slice(0, activeLevel + 1), first.value])
    setActiveLevel(activeLevel + 1)
    return true
  }
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!visible && ['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
      event.preventDefault()
      requestOpen(true)
      return
    }
    if (!visible) return
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      move(event.key === 'ArrowDown' ? 1 : -1)
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      enterChild()
    } else if (event.key === 'ArrowLeft' && activeLevel > 0) {
      event.preventDefault()
      setActiveLevel(activeLevel - 1)
      setActivePath(activePath.slice(0, activeLevel))
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (!enterChild()) commit(activePath.slice(0, activeLevel + 1))
    } else if (event.key === 'Escape') {
      event.preventDefault()
      requestOpen(false)
    }
  }

  const display = selectedOptions.length
    ? displayRender?.(selectedOptions.map((option) => option.label), selectedOptions)
      ?? selectedOptions.map((option, index) => <span key={`${option.value}-${index}`}>{index ? separator : null}{option.label}</span>)
    : null
  const activeDescendant = activePath[activeLevel] == null ? undefined : `${treeId}-${activeLevel}-${activePath[activeLevel]}`
  const classes = ['app-cascader', `app-cascader--${size}`, resolvedInvalid ? 'app-cascader--invalid' : '', resolvedDisabled ? 'app-cascader--disabled' : '', className].filter(Boolean).join(' ')

  return <span className={classes} ref={rootRef} style={style}>
    <button
      aria-activedescendant={visible ? activeDescendant : undefined}
      aria-controls={visible ? treeId : undefined}
      aria-describedby={ariaDescribedBy ?? field?.describedBy}
      aria-expanded={visible}
      aria-haspopup="tree"
      aria-invalid={resolvedInvalid || undefined}
      aria-label={ariaLabel}
      className="app-cascader__trigger"
      disabled={resolvedDisabled}
      id={controlId}
      onClick={() => requestOpen(!visible)}
      onKeyDown={handleKeyDown}
      ref={forwardedRef}
      type="button"
    >
      <span className={display ? 'app-cascader__value' : 'app-cascader__placeholder'}>{display ?? resolvedPlaceholder}</span>
    </button>
    {name ? <input name={name} required={resolvedRequired} type="hidden" value={selectedValues.join('/')} /> : null}
    {clearable && selectedValues.length && !resolvedDisabled ? <button aria-label={messages.cascader.clear} className="app-cascader__clear" onClick={(event) => { event.stopPropagation(); commit([]) }} type="button"><span aria-hidden="true">×</span></button> : null}
    <span aria-hidden="true" className="app-cascader__chevron"><svg focusable="false" viewBox="0 0 16 16"><path d="M4 6L8 10L12 6" /></svg></span>
    <AppAnchoredPopup className="app-cascader__popup" dependencies={[columns.length]} id={treeId} matchTriggerWidth={false} maxHeight={300} onDismiss={() => requestOpen(false)} open={visible && !resolvedDisabled} role="tree" triggerRef={rootRef}>
      {options.length ? columns.map((column, level) => <span className="app-cascader__column" key={level} role="group">
        {column.map((option) => {
          const active = activePath[level] === option.value
          const selected = selectedValues[level] === option.value
          return <button
            aria-expanded={option.children?.length ? active : undefined}
            aria-level={level + 1}
            aria-selected={selected}
            className={`app-cascader__option${active ? ' app-cascader__option--active' : ''}`}
            disabled={option.disabled}
            id={`${treeId}-${level}-${option.value}`}
            key={option.value}
            onPointerDown={(event: ReactPointerEvent<HTMLButtonElement>) => { event.preventDefault(); setOptionAtLevel(level, option) }}
            role="treeitem"
            type="button"
          ><span>{option.label}</span>{option.children?.length ? <svg aria-hidden="true" focusable="false" viewBox="0 0 16 16"><path d="M6 4L10 8L6 12" /></svg> : null}</button>
        })}
      </span>) : <span className="app-cascader__empty">{resolvedEmptyContent}</span>}
    </AppAnchoredPopup>
  </span>
})
