import { useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import { useAppLocale } from '../localization/useAppLocale'
import { AppTooltip } from '../tooltip'
import type { AppRangeSliderProps, AppRangeSliderValue } from './types'
import './AppRangeSlider.css'

type RangeThumb = 'start' | 'end'

function normalize(
  value: AppRangeSliderValue,
  min: number,
  max: number,
  distance: number,
): [number, number] {
  const start = Math.min(max - distance, Math.max(min, value[0]))
  const end = Math.max(start + distance, Math.min(max, value[1]))
  return [start, end]
}

export function AppRangeSlider({
  value,
  defaultValue,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  minDistance = 0,
  disabled = false,
  startLabel,
  endLabel,
  showTooltip = true,
  tooltipDelay = 250,
  formatValue = (value) => value,
  className,
  style,
}: AppRangeSliderProps) {
  const { messages } = useAppLocale()
  const controlled = value !== undefined
  const [internal, setInternal] = useState<[number, number]>(() => normalize(defaultValue ?? [min, max], min, max, minDistance))
  const [hoveredThumb, setHoveredThumb] = useState<RangeThumb | null>(null)
  const [pressedThumb, setPressedThumb] = useState<RangeThumb | null>(null)
  const startThumbRef = useRef<HTMLSpanElement>(null)
  const endThumbRef = useRef<HTMLSpanElement>(null)
  const current = normalize(value ?? internal, min, max, minDistance)
  const span = Math.max(1, max - min)
  const startValueContent = formatValue(current[0])
  const endValueContent = formatValue(current[1])
  const valueText = (content: typeof startValueContent) => (
    typeof content === 'string' || typeof content === 'number' ? String(content) : undefined
  )

  const update = (next: AppRangeSliderValue) => {
    const normalized = normalize(next, min, max, minDistance)
    if (!controlled) setInternal(normalized)
    onValueChange?.(normalized)
  }

  const isPointerOverThumb = (event: ReactPointerEvent<HTMLElement>, thumb: RangeThumb) => {
    if (event.pointerType === 'touch') return false
    const rect = (thumb === 'start' ? startThumbRef : endThumbRef).current?.getBoundingClientRect()
    return Boolean(
      rect &&
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom,
    )
  }

  const getPointerThumb = (event: ReactPointerEvent<HTMLElement>): RangeThumb | null => {
    const candidates = (['start', 'end'] as const).filter((thumb) => isPointerOverThumb(event, thumb))
    if (candidates.length <= 1) return candidates[0] ?? null

    const distanceToCenter = (thumb: RangeThumb) => {
      const rect = (thumb === 'start' ? startThumbRef : endThumbRef).current?.getBoundingClientRect()
      return rect ? Math.abs(event.clientX - (rect.left + rect.width / 2)) : Number.POSITIVE_INFINITY
    }
    return candidates.sort((first, second) => distanceToCenter(first) - distanceToCenter(second))[0] ?? null
  }

  const updateThumbHover = (event: ReactPointerEvent<HTMLElement>) => {
    setHoveredThumb(getPointerThumb(event))
  }

  const handlePointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    const thumb = getPointerThumb(event)
    setHoveredThumb(thumb)
    setPressedThumb(thumb)
  }

  const classes = [
    'app-range-slider',
    disabled ? 'app-range-slider--disabled' : '',
    className,
  ].filter(Boolean).join(' ')
  const sliderStyle = {
    ...style,
    '--app-range-start': `${((current[0] - min) / span) * 100}%`,
    '--app-range-end': `${((current[1] - min) / span) * 100}%`,
  } as CSSProperties
  const thumbClasses = (thumb: RangeThumb) => [
    'app-range-slider__thumb',
    `app-range-slider__thumb--${thumb}`,
    hoveredThumb === thumb ? 'app-range-slider__thumb--hovered' : '',
    pressedThumb === thumb ? 'app-range-slider__thumb--pressed' : '',
  ].filter(Boolean).join(' ')
  const isTooltipDisabled = (thumb: RangeThumb) => (
    !showTooltip || disabled || (hoveredThumb !== null && hoveredThumb !== thumb)
  )

  return <div
    className={classes}
    style={sliderStyle}
    onPointerCancel={() => setPressedThumb(null)}
    onPointerDown={handlePointerDown}
    onPointerEnter={updateThumbHover}
    onPointerLeave={() => {
      setHoveredThumb(null)
      setPressedThumb(null)
    }}
    onPointerMove={updateThumbHover}
    onPointerUp={() => setPressedThumb(null)}
  >
    <div className="app-range-slider__track"><span className="app-range-slider__fill" /></div>
    <AppTooltip
      className="app-range-slider__tooltip"
      content={startValueContent}
      delay={tooltipDelay}
      disabled={isTooltipDisabled('start')}
      anchorRef={startThumbRef}
      positionDependencies={[current[0]]}
      placement="top"
    >
      <input
        aria-label={startLabel ?? messages.rangeSlider.start}
        aria-valuetext={valueText(startValueContent)}
        className="app-range-slider__input app-range-slider__input--start"
        disabled={disabled}
        max={max}
        min={min}
        onChange={(event) => update([Math.min(Number(event.currentTarget.value), current[1] - minDistance), current[1]])}
        step={step}
        type="range"
        value={current[0]}
      />
    </AppTooltip>
    <AppTooltip
      className="app-range-slider__tooltip"
      content={endValueContent}
      delay={tooltipDelay}
      disabled={isTooltipDisabled('end')}
      anchorRef={endThumbRef}
      positionDependencies={[current[1]]}
      placement="top"
    >
      <input
        aria-label={endLabel ?? messages.rangeSlider.end}
        aria-valuetext={valueText(endValueContent)}
        className="app-range-slider__input app-range-slider__input--end"
        disabled={disabled}
        max={max}
        min={min}
        onChange={(event) => update([current[0], Math.max(Number(event.currentTarget.value), current[0] + minDistance)])}
        step={step}
        type="range"
        value={current[1]}
      />
    </AppTooltip>
    <span aria-hidden="true" className="app-range-slider__thumb-layer">
      <span ref={startThumbRef} className={thumbClasses('start')} />
      <span ref={endThumbRef} className={thumbClasses('end')} />
    </span>
  </div>
}
