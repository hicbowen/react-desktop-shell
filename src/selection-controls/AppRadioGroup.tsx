import { useId, useState } from 'react'
import type { AppRadioGroupProps } from './types'
import './AppSelectionControls.css'

export function AppRadioGroup({
  ariaLabel,
  className,
  defaultValue,
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
}: AppRadioGroupProps) {
  const generatedId = useId()
  const [internalValue, setInternalValue] = useState(defaultValue)
  const selectedValue = value ?? internalValue
  const groupName = name ?? `radio-group-${generatedId}`
  const labelId = label ? `radio-group-label-${generatedId}` : undefined
  const descriptionId = description ? `radio-group-description-${generatedId}` : undefined

  const select = (nextValue: string) => {
    if (value === undefined) setInternalValue(nextValue)
    onValueChange?.(nextValue)
  }

  return (
    <div
      aria-disabled={disabled || undefined}
      aria-describedby={descriptionId}
      aria-label={ariaLabel}
      aria-labelledby={!ariaLabel ? labelId : undefined}
      aria-orientation={orientation}
      className={[
        'app-radio-group',
        `app-radio-group--${orientation}`,
        disabled ? 'app-radio-group--disabled' : '',
        className ?? '',
      ].filter(Boolean).join(' ')}
      role="radiogroup"
      style={style}
    >
      {label || description ? (
        <div className="app-radio-group__heading">
          {label ? <span className="app-radio-group__label" id={labelId}>{label}</span> : null}
          {description ? <span className="app-selection-description" id={descriptionId}>{description}</span> : null}
        </div>
      ) : null}
      <div className="app-radio-group__options">
        {options.map((option) => {
          const optionDisabled = disabled || Boolean(option.disabled)
          return (
            <label
              className={`app-radio-group__option${optionDisabled ? ' app-radio-group__option--disabled' : ''}`}
              key={option.value}
            >
              <input
                checked={selectedValue === option.value}
                disabled={optionDisabled}
                form={form}
                name={groupName}
                onChange={() => select(option.value)}
                required={required}
                type="radio"
                value={option.value}
              />
              <span aria-hidden="true" className="app-radio-group__indicator" />
              <span className="app-selection-label">
                <span>{option.label}</span>
                {option.description ? <span className="app-selection-description">{option.description}</span> : null}
              </span>
            </label>
          )
        })}
      </div>
    </div>
  )
}
