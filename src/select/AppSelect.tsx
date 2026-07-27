import { forwardRef, useRef, useState } from 'react'
import type { ChangeEvent, CSSProperties } from 'react'
import { useAppFieldContext } from '../field/AppFieldContext'
import { useAppLocale } from '../localization/useAppLocale'
import type { AppSelectProps } from './types'
import './AppSelect.css'

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
    const showPlaceholder =
      displayedValue == null && placeholder !== undefined
    const hasEmptyOption =
      displayedValue == null || placeholder !== undefined || clearable
    const selectedOptionIndex = Math.max(
      0,
      options.findIndex((option) => option.value === displayedValue),
    )
    const pickerEstimatedHeight = Math.min(320, options.length * 34 + 10)
    const pickerMaxSelectedOffset = Math.max(0, pickerEstimatedHeight - 44)
    const pickerVisibleSelectedOffset = Math.min(
      selectedOptionIndex * 34,
      pickerMaxSelectedOffset,
    )
    const selectStyle = {
      ...rest.style,
      '--app-select-selected-offset': `${selectedOptionIndex * 34}px`,
      '--app-select-picker-estimated-height': `${pickerEstimatedHeight}px`,
      '--app-select-picker-max-selected-offset': `${pickerMaxSelectedOffset}px`,
      '--app-select-picker-position-offset': `${pickerVisibleSelectedOffset}px`,
    } as CSSProperties
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

    const preparePickerPosition = () => {
      const select = selectRef.current
      if (!select) return
      const bounds = select.getBoundingClientRect()
      const viewportHeight =
        document.documentElement.clientHeight || window.innerHeight
      const pickerHeight = Math.min(
        pickerEstimatedHeight,
        Math.max(0, viewportHeight - 16),
      )
      const anchorCenter = bounds.top + bounds.height / 2
      const minimumOffset = Math.max(
        0,
        anchorCenter + pickerHeight - viewportHeight - 14,
      )
      const maximumOffset = Math.max(0, anchorCenter - 30)
      const positionOffset = Math.min(
        maximumOffset,
        Math.max(minimumOffset, pickerVisibleSelectedOffset),
      )
      select.style.setProperty(
        '--app-select-picker-position-offset',
        `${positionOffset}px`,
      )
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
          onKeyDown={(event) => {
            preparePickerPosition()
            rest.onKeyDown?.(event)
          }}
          onPointerDown={(event) => {
            preparePickerPosition()
            rest.onPointerDown?.(event)
          }}
          ref={setRef}
          required={resolvedRequired}
          style={selectStyle}
          value={displayedValue ?? ''}
        >
          {hasEmptyOption ? (
            <option aria-hidden="true" disabled hidden value="" />
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
        {showPlaceholder ? (
          <span aria-hidden="true" className="app-select__placeholder">
            {placeholder}
          </span>
        ) : null}
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
