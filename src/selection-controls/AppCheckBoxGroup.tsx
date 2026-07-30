import { useId, useState } from 'react'
import { AppCheckBox } from './AppCheckBox'
import type { AppCheckBoxGroupProps } from './types'

export function AppCheckBoxGroup({
  ariaLabel,
  className,
  defaultValue = [],
  description,
  disabled = false,
  form,
  label,
  name,
  onValueChange,
  options,
  orientation = 'vertical',
  required,
  style,
  value,
}: AppCheckBoxGroupProps) {
  const generatedId = useId()
  const [internalValue, setInternalValue] = useState<readonly string[]>(defaultValue)
  const selectedValues = value ?? internalValue
  const selected = new Set(selectedValues)
  const requiredOptionIndex = options.findIndex(
    (option) => !disabled && !option.disabled,
  )
  const labelId = label ? `check-box-group-label-${generatedId}` : undefined
  const descriptionId = description
    ? `check-box-group-description-${generatedId}`
    : undefined

  const toggle = (optionValue: string, checked: boolean) => {
    const nextValue = checked
      ? [...selectedValues, optionValue]
      : selectedValues.filter((item) => item !== optionValue)
    if (value === undefined) setInternalValue(nextValue)
    onValueChange?.(nextValue)
  }

  return (
    <div
      aria-disabled={disabled || undefined}
      aria-describedby={descriptionId}
      aria-label={ariaLabel}
      aria-labelledby={!ariaLabel ? labelId : undefined}
      className={[
        'app-check-box-group',
        `app-check-box-group--${orientation}`,
        disabled ? 'app-check-box-group--disabled' : '',
        className ?? '',
      ].filter(Boolean).join(' ')}
      role="group"
      style={style}
    >
      {label || description ? (
        <div className="app-check-box-group__heading">
          {label ? <span className="app-check-box-group__label" id={labelId}>{label}</span> : null}
          {description ? <span className="app-selection-description" id={descriptionId}>{description}</span> : null}
        </div>
      ) : null}
      <div className="app-check-box-group__options">
        {options.map((option, index) => {
          const optionDisabled = disabled || Boolean(option.disabled)
          return (
            <AppCheckBox
              checked={selected.has(option.value)}
              description={option.description}
              disabled={optionDisabled}
              form={form}
              key={option.value}
              label={option.label}
              name={name}
              onCheckedChange={(checked) => toggle(option.value, checked)}
              required={
                required &&
                selectedValues.length === 0 &&
                index === requiredOptionIndex
              }
              value={option.value}
            />
          )
        })}
      </div>
    </div>
  )
}
