import {
  forwardRef,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { KeyboardEvent, PointerEvent as ReactPointerEvent } from 'react'
import { ChevronDown16Regular } from '@fluentui/react-icons/svg/chevron-down'
import { useAppFieldContext } from '../field/AppFieldContext'
import { useAppLocale } from '../localization/useAppLocale'
import { AppAnchoredPopup } from '../overlay/AppAnchoredPopup'
import type { AppComboBoxProps } from './types'
import './AppComboBox.css'

function getOptionDisplay(
  option: AppComboBoxProps['options'][number] | undefined,
) {
  if (!option) return ''
  return typeof option.label === 'string' || typeof option.label === 'number'
    ? String(option.label)
    : option.value
}

function getValueDisplay(options: AppComboBoxProps['options'], value: string) {
  return getOptionDisplay(options.find((option) => option.value === value))
}

export const AppComboBox = forwardRef<HTMLInputElement, AppComboBoxProps>(
  function AppComboBox(
    {
      'aria-describedby': ariaDescribedBy,
      'aria-invalid': ariaInvalid,
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
    const [draft, setDraft] = useState(() =>
      getValueDisplay(options, value ?? defaultValue),
    )
    const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
    const [activeIndex, setActiveIndex] = useState(-1)
    const isControlled = value !== undefined
    const isOpenControlled = open !== undefined
    const committedValue = isControlled ? value : uncontrolledValue
    const committedDisplay = useMemo(
      () => getValueDisplay(options, committedValue),
      [committedValue, options],
    )
    const previousCommitRef = useRef({
      display: committedDisplay,
      value: committedValue,
    })
    const resolvedOpen = isOpenControlled ? open : uncontrolledOpen
    const resolvedDisabled = disabled ?? field?.disabled ?? false
    const resolvedInvalid = ariaInvalid ?? invalid ?? field?.invalid
    const resolvedRequired = required ?? field?.required

    const filteredOptions = useMemo(() => {
      const query = draft === committedDisplay
        ? ''
        : draft.trim().toLocaleLowerCase()
      if (!query) return options
      return options.filter((option) => {
        const label = getOptionDisplay(option)
        return `${label} ${option.value}`.toLocaleLowerCase().includes(query)
      })
    }, [committedDisplay, draft, options])

    useEffect(() => {
      const previous = previousCommitRef.current
      const valueChanged = previous.value !== committedValue
      previousCommitRef.current = {
        display: committedDisplay,
        value: committedValue,
      }
      setDraft((current) =>
        valueChanged || current === previous.display
          ? committedDisplay
          : current,
      )
    }, [committedDisplay, committedValue])

    useEffect(() => {
      if (!resolvedOpen) setActiveIndex(-1)
    }, [resolvedOpen])

    const setInputRef = (node: HTMLInputElement | null) => {
      localRef.current = node
      if (typeof forwardedRef === 'function') forwardedRef(node)
      else if (forwardedRef) forwardedRef.current = node
    }
    const requestOpen = (next: boolean) => {
      if (!isOpenControlled) setUncontrolledOpen(next)
      onOpenChange?.(next)
    }
    const commit = (next: string, display = getValueDisplay(options, next)) => {
      setDraft(display)
      if (!isControlled) setUncontrolledValue(next)
      onValueChange?.(next)
    }
    const choose = (index: number) => {
      const option = filteredOptions[index]
      if (!option || option.disabled) return
      commit(option.value, getOptionDisplay(option))
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
        setDraft(committedDisplay)
        requestOpen(false)
      }
    }
    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      onBlur?.(event)
      setDraft(committedDisplay)
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
            setDraft(event.target.value)
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
          <ChevronDown16Regular aria-hidden="true" focusable="false" />
        </span>
        <AppAnchoredPopup className="app-combo-box__listbox" dependencies={[filteredOptions.length]} id={listboxId} onDismiss={() => requestOpen(false)} open={resolvedOpen && !resolvedDisabled && !readOnly} role="listbox" triggerRef={rootRef}>
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
        </AppAnchoredPopup>
      </span>
    )
  },
)
