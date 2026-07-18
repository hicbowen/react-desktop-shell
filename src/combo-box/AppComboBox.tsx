import {
  forwardRef,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { KeyboardEvent, PointerEvent as ReactPointerEvent } from 'react'
import { useAppFieldContext } from '../field/AppFieldContext'
import { useAppLocale } from '../localization/useAppLocale'
import type { AppComboBoxProps } from './types'
import './AppComboBox.css'

export const AppComboBox = forwardRef<HTMLInputElement, AppComboBoxProps>(
  function AppComboBox(
    {
      'aria-describedby': ariaDescribedBy,
      'aria-invalid': ariaInvalid,
      allowCustomValue = true,
      className,
      clearable = false,
      defaultOpen = false,
      defaultValue = '',
      disabled,
      id,
      invalid,
      onBlur,
      onFocus,
      onKeyDown,
      onOpenChange,
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
    const generatedId = useId()
    const inputId = id ?? field?.controlId ?? `app-combo-box-${generatedId}`
    const listboxId = `${inputId}-listbox`
    const localRef = useRef<HTMLInputElement>(null)
    const rootRef = useRef<HTMLSpanElement>(null)
    const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue)
    const [draft, setDraft] = useState(value ?? defaultValue)
    const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
    const [activeIndex, setActiveIndex] = useState(-1)
    const isControlled = value !== undefined
    const isOpenControlled = open !== undefined
    const committedValue = isControlled ? value : uncontrolledValue
    const resolvedOpen = isOpenControlled ? open : uncontrolledOpen
    const resolvedDisabled = disabled ?? field?.disabled ?? false
    const resolvedInvalid = ariaInvalid ?? invalid ?? field?.invalid
    const resolvedRequired = required ?? field?.required

    const filteredOptions = useMemo(() => {
      const query = draft.trim().toLocaleLowerCase()
      if (!query) return options
      return options.filter((option) => {
        const label = typeof option.label === 'string' || typeof option.label === 'number'
          ? String(option.label)
          : option.value
        return `${label} ${option.value}`.toLocaleLowerCase().includes(query)
      })
    }, [draft, options])

    useEffect(() => {
      if (isControlled) setDraft(value)
    }, [isControlled, value])

    useEffect(() => {
      if (!resolvedOpen) setActiveIndex(-1)
    }, [resolvedOpen])

    useEffect(() => {
      if (!resolvedOpen) return
      const close = (event: PointerEvent) => {
        if (!rootRef.current?.contains(event.target as Node)) requestOpen(false)
      }
      document.addEventListener('pointerdown', close)
      return () => document.removeEventListener('pointerdown', close)
    })

    const setInputRef = (node: HTMLInputElement | null) => {
      localRef.current = node
      if (typeof forwardedRef === 'function') forwardedRef(node)
      else if (forwardedRef) forwardedRef.current = node
    }
    const requestOpen = (next: boolean) => {
      if (!isOpenControlled) setUncontrolledOpen(next)
      onOpenChange?.(next)
    }
    const commit = (next: string) => {
      setDraft(next)
      if (!isControlled) setUncontrolledValue(next)
      onValueChange?.(next)
    }
    const choose = (index: number) => {
      const option = filteredOptions[index]
      if (!option || option.disabled) return
      commit(option.value)
      requestOpen(false)
      localRef.current?.focus()
    }
    const move = (direction: 1 | -1) => {
      if (!filteredOptions.length) return
      let next = activeIndex
      for (let count = 0; count < filteredOptions.length; count += 1) {
        next = (next + direction + filteredOptions.length) % filteredOptions.length
        if (!filteredOptions[next]?.disabled) {
          setActiveIndex(next)
          return
        }
      }
    }
    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(event)
      if (event.defaultPrevented) return
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault()
        if (!resolvedOpen) requestOpen(true)
        move(event.key === 'ArrowDown' ? 1 : -1)
      } else if (event.key === 'Home' && resolvedOpen) {
        event.preventDefault()
        const first = filteredOptions.findIndex((option) => !option.disabled)
        setActiveIndex(first)
      } else if (event.key === 'End' && resolvedOpen) {
        event.preventDefault()
        let last = -1
        filteredOptions.forEach((option, index) => { if (!option.disabled) last = index })
        setActiveIndex(last)
      } else if (event.key === 'Enter' && resolvedOpen && activeIndex >= 0) {
        event.preventDefault()
        choose(activeIndex)
      } else if (event.key === 'Escape' && resolvedOpen) {
        event.preventDefault()
        setDraft(committedValue)
        requestOpen(false)
      }
    }
    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      onBlur?.(event)
      if (!allowCustomValue && !options.some((option) => option.value === draft)) {
        setDraft(committedValue)
      }
    }
    const handleOptionPointerDown = (
      event: ReactPointerEvent<HTMLButtonElement>,
      index: number,
    ) => {
      event.preventDefault()
      choose(index)
    }
    const classes = [
      'app-combo-box',
      `app-combo-box--${size}`,
      resolvedInvalid ? 'app-combo-box--invalid' : '',
      resolvedDisabled ? 'app-combo-box--disabled' : '',
      className,
    ].filter(Boolean).join(' ')

    return (
      <span className={classes} ref={rootRef}>
        <input
          {...rest}
          aria-activedescendant={activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined}
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-describedby={ariaDescribedBy ?? field?.describedBy}
          aria-expanded={resolvedOpen}
          aria-invalid={resolvedInvalid || undefined}
          autoComplete="off"
          className="app-combo-box__input"
          disabled={resolvedDisabled}
          id={inputId}
          onBlur={handleBlur}
          onChange={(event) => {
            const next = event.target.value
            setDraft(next)
            if (allowCustomValue) {
              if (!isControlled) setUncontrolledValue(next)
              onValueChange?.(next)
            }
            requestOpen(true)
          }}
          onClick={() => requestOpen(true)}
          onFocus={(event) => { onFocus?.(event); requestOpen(true) }}
          onKeyDown={handleKeyDown}
          readOnly={readOnly}
          ref={setInputRef}
          required={resolvedRequired}
          role="combobox"
          value={draft}
        />
        {clearable && draft && !resolvedDisabled && !readOnly ? (
          <button
            aria-label={messages.textBox.clear}
            className="app-combo-box__clear"
            onClick={() => { commit(''); requestOpen(false); localRef.current?.focus() }}
            type="button"
          >
            <span aria-hidden="true">×</span>
          </button>
        ) : null}
        <span aria-hidden="true" className="app-combo-box__chevron">
          <svg focusable="false" viewBox="0 0 16 16"><path d="M4 6L8 10L12 6" /></svg>
        </span>
        {resolvedOpen && !resolvedDisabled && !readOnly ? (
          <span className="app-combo-box__listbox" id={listboxId} role="listbox">
            {filteredOptions.map((option, index) => (
              <button
                aria-selected={option.value === committedValue}
                className={`app-combo-box__option${index === activeIndex ? ' app-combo-box__option--active' : ''}`}
                disabled={option.disabled}
                id={`${listboxId}-${index}`}
                key={option.value}
                onPointerDown={(event) => handleOptionPointerDown(event, index)}
                role="option"
                type="button"
              >
                {option.label}
              </button>
            ))}
          </span>
        ) : null}
      </span>
    )
  },
)
