import {
  forwardRef,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { useAppFieldContext } from '../field/AppFieldContext'
import { useAppLocale } from '../localization/useAppLocale'
import type { AppAutoCompleteOption, AppAutoCompleteProps } from './types'
import './AppAutoComplete.css'

export const AppAutoComplete = forwardRef<HTMLInputElement, AppAutoCompleteProps>(
  function AppAutoComplete(
    {
      'aria-describedby': ariaDescribedBy,
      'aria-invalid': ariaInvalid,
      className,
      clearable = false,
      defaultOpen = false,
      defaultValue = '',
      disabled,
      emptyContent,
      filterOption,
      id,
      invalid,
      loading = false,
      onBlur,
      onFocus,
      onKeyDown,
      onOpenChange,
      onOptionSelect,
      onValueChange,
      open,
      options,
      readOnly = false,
      required,
      size = 'standard',
      value,
      ...rest
    },
    forwardedRef,
  ) {
    const field = useAppFieldContext()
    const { messages } = useAppLocale()
    const text = messages.autoComplete
    const generatedId = useId()
    const inputId = id ?? field?.controlId ?? `app-auto-complete-${generatedId}`
    const listboxId = `${inputId}-listbox`
    const inputRef = useRef<HTMLInputElement>(null)
    const rootRef = useRef<HTMLSpanElement>(null)
    const [internalValue, setInternalValue] = useState(defaultValue)
    const [internalOpen, setInternalOpen] = useState(defaultOpen)
    const [activeIndex, setActiveIndex] = useState(-1)
    const controlled = value !== undefined
    const openControlled = open !== undefined
    const currentValue = controlled ? value : internalValue
    const visible = openControlled ? open : internalOpen
    const resolvedDisabled = disabled ?? field?.disabled ?? false
    const resolvedInvalid = ariaInvalid ?? invalid ?? field?.invalid
    const resolvedRequired = required ?? field?.required

    const suggestions = useMemo(() => {
      if (filterOption === false) return options
      const filter = filterOption ?? ((input: string, option: AppAutoCompleteOption) => {
        const text = typeof option.label === 'string' || typeof option.label === 'number'
          ? `${option.label} ${option.value}`
          : option.value
        return text.toLocaleLowerCase().includes(input.trim().toLocaleLowerCase())
      })
      return options.filter((option) => filter(currentValue, option))
    }, [currentValue, filterOption, options])

    const requestOpen = (next: boolean) => {
      if (!openControlled) setInternalOpen(next)
      onOpenChange?.(next)
    }
    const updateValue = (next: string) => {
      if (!controlled) setInternalValue(next)
      onValueChange?.(next)
    }
    const choose = (index: number) => {
      const option = suggestions[index]
      if (!option || option.disabled) return
      updateValue(option.value)
      onOptionSelect?.(option)
      requestOpen(false)
      inputRef.current?.focus()
    }
    const move = (direction: 1 | -1) => {
      if (!suggestions.length) return
      let next = activeIndex
      for (let count = 0; count < suggestions.length; count += 1) {
        next = (next + direction + suggestions.length) % suggestions.length
        if (!suggestions[next]?.disabled) {
          setActiveIndex(next)
          return
        }
      }
    }

    useEffect(() => {
      if (!visible) setActiveIndex(-1)
    }, [visible])

    useEffect(() => {
      if (!visible) return
      const close = (event: PointerEvent) => {
        if (!rootRef.current?.contains(event.target as Node)) requestOpen(false)
      }
      document.addEventListener('pointerdown', close, true)
      return () => document.removeEventListener('pointerdown', close, true)
    })

    const setRef = (node: HTMLInputElement | null) => {
      inputRef.current = node
      if (typeof forwardedRef === 'function') forwardedRef(node)
      else if (forwardedRef) forwardedRef.current = node
    }
    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(event)
      if (event.defaultPrevented) return
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault()
        if (!visible) requestOpen(true)
        move(event.key === 'ArrowDown' ? 1 : -1)
      } else if (event.key === 'Enter' && visible && activeIndex >= 0) {
        event.preventDefault()
        choose(activeIndex)
      } else if (event.key === 'Escape' && visible) {
        event.preventDefault()
        requestOpen(false)
      }
    }
    const handleBlur = (event: FocusEvent<HTMLInputElement>) => onBlur?.(event)
    const handleOptionPointerDown = (event: ReactPointerEvent<HTMLButtonElement>, index: number) => {
      event.preventDefault()
      choose(index)
    }
    const showPanel = visible && !resolvedDisabled && !readOnly
    const classes = [
      'app-auto-complete',
      `app-auto-complete--${size}`,
      resolvedInvalid ? 'app-auto-complete--invalid' : '',
      resolvedDisabled ? 'app-auto-complete--disabled' : '',
      className,
    ].filter(Boolean).join(' ')

    return <span className={classes} ref={rootRef}>
      <input
        {...rest}
        aria-activedescendant={activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined}
        aria-autocomplete="list"
        aria-controls={showPanel ? listboxId : undefined}
        aria-describedby={ariaDescribedBy ?? field?.describedBy}
        aria-expanded={showPanel}
        aria-invalid={resolvedInvalid || undefined}
        autoComplete="off"
        className="app-auto-complete__input"
        disabled={resolvedDisabled}
        id={inputId}
        onBlur={handleBlur}
        onChange={(event) => { updateValue(event.target.value); requestOpen(true) }}
        onFocus={(event) => { onFocus?.(event); requestOpen(true) }}
        onKeyDown={handleKeyDown}
        readOnly={readOnly}
        ref={setRef}
        required={resolvedRequired}
        role="combobox"
        value={currentValue}
      />
      {loading ? <span aria-label={text.loading} className="app-auto-complete__loading" role="status" /> : null}
      {clearable && currentValue && !resolvedDisabled && !readOnly && !loading ? <button aria-label={messages.textBox.clear} className="app-auto-complete__clear" onClick={() => { updateValue(''); requestOpen(false); inputRef.current?.focus() }} type="button"><span aria-hidden="true">×</span></button> : null}
      {showPanel ? <span className="app-auto-complete__listbox" id={listboxId} role="listbox">
        {loading ? <span className="app-auto-complete__status">{text.loading}</span> : suggestions.length ? suggestions.map((option, index) => <button
          aria-selected={index === activeIndex}
          className={`app-auto-complete__option${index === activeIndex ? ' app-auto-complete__option--active' : ''}`}
          disabled={option.disabled}
          id={`${listboxId}-${index}`}
          key={option.value}
          onPointerDown={(event) => handleOptionPointerDown(event, index)}
          role="option"
          type="button"
        >{option.label ?? option.value}</button>) : <span className="app-auto-complete__status">{emptyContent ?? text.empty}</span>}
      </span> : null}
    </span>
  },
)
