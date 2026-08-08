import { forwardRef, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import { useAppFieldContext } from '../field/AppFieldContext'
import { AppTooltip } from '../tooltip'
import type { AppSliderProps } from './types'
import './AppSlider.css'

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export const AppSlider = forwardRef<HTMLInputElement, AppSliderProps>(function AppSlider({
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  'aria-label': ariaLabel,
  className,
  defaultValue,
  disabled,
  formatValue = (current) => current,
  id,
  invalid,
  marks = [],
  max = 100,
  min = 0,
  name,
  onValueChange,
  orientation = 'horizontal',
  required,
  showValue = false,
  showTooltip = true,
  size = 'standard',
  step = 1,
  style,
  tooltipDelay = 250,
  value,
  ...rest
}, ref) {
  const field = useAppFieldContext()
  const safeMax = max > min ? max : min + 1
  const initialValue = clamp(defaultValue ?? min, min, safeMax)
  const [internalValue, setInternalValue] = useState(initialValue)
  const currentValue = clamp(value ?? internalValue, min, safeMax)
  const percent = ((currentValue - min) / (safeMax - min)) * 100
  const resolvedDisabled = disabled ?? field?.disabled ?? false
  const resolvedInvalid = ariaInvalid ?? invalid ?? field?.invalid
  const resolvedRequired = required ?? field?.required
  const valueContent = formatValue(currentValue)
  const valueText = typeof valueContent === 'string' || typeof valueContent === 'number' ? String(valueContent) : undefined
  const tooltipPlacement = orientation === 'vertical' ? 'left' : 'top'
  const thumbRef = useRef<HTMLSpanElement>(null)
  const [isThumbHovered, setIsThumbHovered] = useState(false)
  const [isThumbPressed, setIsThumbPressed] = useState(false)
  const isPointerOverThumb = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType === 'touch') return false
    const rect = thumbRef.current?.getBoundingClientRect()
    return Boolean(
      rect &&
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom,
    )
  }
  const updateThumbHover = (event: ReactPointerEvent<HTMLElement>) => {
    setIsThumbHovered(isPointerOverThumb(event))
  }
  const handlePointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    const overThumb = isPointerOverThumb(event)
    setIsThumbHovered(overThumb)
    setIsThumbPressed(overThumb)
  }
  const classes = ['app-slider', `app-slider--${orientation}`, `app-slider--${size}`, resolvedInvalid ? 'app-slider--invalid' : '', resolvedDisabled ? 'app-slider--disabled' : '', className].filter(Boolean).join(' ')
  const sliderStyle = { ...style, '--app-slider-percent': `${percent}%` } as CSSProperties
  const thumbClasses = ['app-slider__thumb', isThumbHovered ? 'app-slider__thumb--hovered' : '', isThumbPressed ? 'app-slider__thumb--pressed' : ''].filter(Boolean).join(' ')

  return <span className={classes} style={sliderStyle}>
    <span
      className="app-slider__control"
      onPointerCancel={() => setIsThumbPressed(false)}
      onPointerDown={handlePointerDown}
      onPointerEnter={updateThumbHover}
      onPointerLeave={() => {
        setIsThumbHovered(false)
        setIsThumbPressed(false)
      }}
      onPointerMove={updateThumbHover}
      onPointerUp={() => setIsThumbPressed(false)}
    >
      <AppTooltip
        className="app-slider__tooltip"
        content={valueContent}
        delay={tooltipDelay}
        disabled={!showTooltip || resolvedDisabled}
        anchorRef={thumbRef}
        positionDependencies={[currentValue]}
        placement={tooltipPlacement}
      >
        <input
          {...rest}
          aria-describedby={ariaDescribedBy ?? field?.describedBy}
          aria-invalid={resolvedInvalid || undefined}
          aria-label={ariaLabel}
          aria-orientation={orientation}
          aria-valuetext={valueText}
          className="app-slider__input"
          disabled={resolvedDisabled}
          id={id ?? field?.controlId}
          max={safeMax}
          min={min}
          name={name}
          onChange={(event) => {
            const next = event.currentTarget.valueAsNumber
            if (Number.isNaN(next)) return
            if (value === undefined) setInternalValue(next)
            onValueChange?.(next)
          }}
          ref={ref}
          required={resolvedRequired}
          step={step}
          type="range"
          value={currentValue}
        />
      </AppTooltip>
      <span aria-hidden="true" className="app-slider__thumb-layer">
        <span ref={thumbRef} className={thumbClasses} />
      </span>
      {marks.length ? <span aria-hidden="true" className="app-slider__marks">
        {marks.filter((mark) => mark.value >= min && mark.value <= safeMax).map((mark) => {
          const markPercent = ((mark.value - min) / (safeMax - min)) * 100
          return <span className="app-slider__mark" key={mark.value} style={{ '--app-slider-mark-position': `${markPercent}%` } as CSSProperties}>
            <span className="app-slider__tick" />
            {mark.label != null ? <span className="app-slider__mark-label">{mark.label}</span> : null}
          </span>
        })}
      </span> : null}
    </span>
    {showValue ? <output className="app-slider__value" htmlFor={id ?? field?.controlId}>{valueContent}</output> : null}
  </span>
})
