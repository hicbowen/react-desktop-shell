import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import type { AppSegmentedControlProps } from './types'
import './AppSelectionControls.css'

const useBrowserLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

export function AppSegmentedControl<T extends string | number = string>({
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
}: AppSegmentedControlProps<T>) {
  const generatedName = useId()
  const controlRef = useRef<HTMLDivElement>(null)
  const indicatorRef = useRef<HTMLSpanElement>(null)
  const optionRefs = useRef(new Map<T, HTMLLabelElement>())
  const [internalValue, setInternalValue] = useState(defaultValue)
  const selectedValue = value ?? internalValue
  const groupName = name ?? generatedName

  useBrowserLayoutEffect(() => {
    const control = controlRef.current
    const indicator = indicatorRef.current
    const activeOption = selectedValue === undefined ? undefined : optionRefs.current.get(selectedValue)
    if (!control || !indicator || !activeOption) {
      if (indicator) indicator.style.opacity = '0'
      return
    }

    const updateIndicator = () => {
      indicator.style.opacity = '1'
      indicator.style.transform = `translateX(${activeOption.offsetLeft}px)`
      indicator.style.width = `${activeOption.offsetWidth}px`
    }

    updateIndicator()
    const resizeObserver = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(updateIndicator)
    resizeObserver?.observe(control)
    resizeObserver?.observe(activeOption)
    window.addEventListener('resize', updateIndicator)
    return () => {
      resizeObserver?.disconnect()
      window.removeEventListener('resize', updateIndicator)
    }
  }, [fullWidth, options, selectedValue, size])

  const select = (nextValue: T) => {
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
      ref={controlRef}
    >
      <span aria-hidden="true" className="app-segmented-control__indicator" ref={indicatorRef} />
      {options.map((option) => {
        const optionDisabled = disabled || Boolean(option.disabled)
        return (
          <label
            className={`app-segmented-control__option${optionDisabled ? ' app-segmented-control__option--disabled' : ''}`}
            key={option.value}
            ref={(element) => {
              if (element) optionRefs.current.set(option.value, element)
              else optionRefs.current.delete(option.value)
            }}
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
              value={String(option.value)}
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
