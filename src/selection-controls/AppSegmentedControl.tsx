import { useId, useState } from 'react'
import type { AppSegmentedControlProps } from './types'
import './AppSelectionControls.css'

export function AppSegmentedControl({
  ariaLabel,
  className,
  defaultValue,
  disabled = false,
  form,
  fullWidth = false,
  name,
  onValueChange,
  options,
  required,
  size = 'standard',
  style,
  value,
}: AppSegmentedControlProps) {
  const generatedName = useId()
  const [internalValue, setInternalValue] = useState(defaultValue)
  const selectedValue = value ?? internalValue
  const groupName = name ?? generatedName

  const select = (nextValue: string) => {
    if (value === undefined) setInternalValue(nextValue)
    onValueChange?.(nextValue)
  }

  return (
    <div
      aria-disabled={disabled || undefined}
      aria-label={ariaLabel}
      aria-orientation="horizontal"
      className={[
        'app-segmented-control',
        `app-segmented-control--${size}`,
        fullWidth ? 'app-segmented-control--full-width' : '',
        disabled ? 'app-segmented-control--disabled' : '',
        className ?? '',
      ].filter(Boolean).join(' ')}
      role="radiogroup"
      style={style}
    >
      {options.map((option) => {
        const optionDisabled = disabled || Boolean(option.disabled)
        return (
          <label
            className={`app-segmented-control__option${optionDisabled ? ' app-segmented-control__option--disabled' : ''}`}
            key={option.value}
          >
            <input
              aria-label={option.ariaLabel}
              checked={selectedValue === option.value}
              disabled={optionDisabled}
              form={form}
              name={groupName}
              onChange={() => select(option.value)}
              required={required}
              type="radio"
              value={option.value}
            />
            <span className="app-segmented-control__content">
              {option.icon ? <span aria-hidden="true" className="app-segmented-control__icon">{option.icon}</span> : null}
              <span className="app-segmented-control__label">{option.label}</span>
            </span>
          </label>
        )
      })}
    </div>
  )
}
