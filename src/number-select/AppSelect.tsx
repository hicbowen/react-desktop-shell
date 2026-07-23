import { forwardRef, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { useAppFieldContext } from '../field/AppFieldContext'
import { useAppLocale } from '../localization/useAppLocale'
import type { AppSelectProps } from './types'
import './AppNumberSelect.css'

export const AppSelect = forwardRef<HTMLSelectElement, AppSelectProps>(
  function AppSelect(
    {
      'aria-describedby': ariaDescribedBy,
      'aria-invalid': ariaInvalid,
      className,
      clearable = false,
      defaultValue,
      disabled,
      id,
      invalid,
      onChange,
      onValueChange,
      options,
      placeholder,
      required,
      size = 'standard',
      value,
      ...rest
    },
    forwardedRef,
  ) {
    const field = useAppFieldContext()
    const { messages } = useAppLocale()
    const resolvedDisabled = disabled ?? field?.disabled ?? false
    const resolvedInvalid = ariaInvalid ?? invalid ?? field?.invalid
    const resolvedRequired = required ?? field?.required
    const selectRef = useRef<HTMLSelectElement>(null)
    const [internalValue, setInternalValue] = useState<string | null>(() =>
      defaultValue !== undefined
        ? defaultValue
        : placeholder !== undefined
          ? null
          : options.find((option) => !option.disabled)?.value ?? null,
    )
    const displayedValue = value === undefined ? internalValue : value
    const hasEmptyOption =
      displayedValue == null || placeholder !== undefined || clearable
    const canClear =
      clearable &&
      displayedValue != null &&
      !resolvedDisabled &&
      !resolvedRequired

    const setRef = (node: HTMLSelectElement | null) => {
      selectRef.current = node
      if (typeof forwardedRef === 'function') forwardedRef(node)
      else if (forwardedRef) forwardedRef.current = node
    }

    const change = (event: ChangeEvent<HTMLSelectElement>) => {
      const nextValue = event.target.value === '' ? null : event.target.value
      if (value === undefined) setInternalValue(nextValue)
      onChange?.(event)
      onValueChange?.(nextValue)
    }

    const clear = () => {
      if (value === undefined) setInternalValue(null)
      onValueChange?.(null)
      selectRef.current?.focus()
    }

    return (
      <span
        className={[
          'app-select',
          `app-select--${size}`,
          resolvedInvalid ? 'app-select--invalid' : '',
          className ?? '',
        ].filter(Boolean).join(' ')}
      >
        <select
          {...rest}
          aria-describedby={ariaDescribedBy ?? field?.describedBy}
          aria-invalid={resolvedInvalid || undefined}
          disabled={resolvedDisabled}
          id={id ?? field?.controlId}
          onChange={change}
          ref={setRef}
          required={resolvedRequired}
          value={displayedValue ?? ''}
        >
          {hasEmptyOption ? (
            <option disabled={!clearable} hidden={placeholder === undefined} value="">
              {placeholder ?? ''}
            </option>
          ) : null}
          {options.map((option) => (
            <option
              disabled={option.disabled}
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>
        {canClear ? (
          <button
            aria-label={messages.select.clear}
            className="app-select__clear"
            onClick={clear}
            type="button"
          >
            <span aria-hidden="true">×</span>
          </button>
        ) : (
          <span aria-hidden="true" className="app-select__chevron">
            <svg focusable="false" viewBox="0 0 16 16">
              <path d="M4 6L8 10L12 6" />
            </svg>
          </span>
        )}
      </span>
    )
  },
)
