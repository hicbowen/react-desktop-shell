import {
  useEffect,
  useRef,
  type KeyboardEvent,
} from 'react'
import { useAppLocale } from '../localization/useAppLocale'
import { formatAppTime } from './timeFormat'
import {
  compareAppTimes,
  hasAvailableTimeValue,
  isSameAppTime,
  normalizeTimeToStep,
  normalizeMinuteStep,
} from './timeMath'
import type { AppTimeValue } from './types'
import './AppTimePicker.css'

interface AppTimePanelProps {
  value: AppTimeValue
  onValueChange: (value: AppTimeValue) => void
  minValue?: AppTimeValue
  maxValue?: AppTimeValue
  minuteStep: number
  readOnly?: boolean
  autoFocus?: boolean
  onAvailabilityChange?: (hasAvailableValue: boolean) => void
}

type TimeColumn = 'hour' | 'minute'

function minuteOptions(step: number) {
  return Array.from({ length: 60 / step }, (_, index) => index * step)
}

function isAvailable(
  value: AppTimeValue,
  minValue?: AppTimeValue,
  maxValue?: AppTimeValue,
) {
  return !(
    (minValue && compareAppTimes(value, minValue) < 0) ||
    (maxValue && compareAppTimes(value, maxValue) > 0)
  )
}

function availableMinutes(
  hour: number,
  step: number,
  minValue?: AppTimeValue,
  maxValue?: AppTimeValue,
) {
  return minuteOptions(step).filter((minute) =>
    isAvailable({ hour, minute }, minValue, maxValue),
  )
}

function nearestMinute(minutes: number[], current: number) {
  return minutes.reduce((nearest, minute) =>
    Math.abs(minute - current) < Math.abs(nearest - current)
      ? minute
      : nearest,
  )
}

export function AppTimePanel({
  value,
  onValueChange,
  minValue,
  maxValue,
  minuteStep,
  readOnly = false,
  autoFocus = false,
  onAvailabilityChange,
}: AppTimePanelProps) {
  const { locale, messages, hourCycle } = useAppLocale()
  const step = normalizeMinuteStep(minuteStep)
  const hasAvailableValue = hasAvailableTimeValue(
    step,
    minValue,
    maxValue,
  )
  const normalized = hasAvailableValue
    ? normalizeTimeToStep(value, step, minValue, maxValue)
    : null
  const rootRef = useRef<HTMLDivElement | null>(null)
  const hourRefs = useRef<Array<HTMLButtonElement | null>>([])
  const minuteRefs = useRef<Array<HTMLButtonElement | null>>([])
  const hours = Array.from({ length: 24 }, (_, hour) => hour)
  const minutes = minuteOptions(step)
  const enabledHours = hours.filter(
    (hour) =>
      availableMinutes(hour, step, minValue, maxValue).length > 0,
  )
  const enabledMinutes = normalized
    ? availableMinutes(normalized.hour, step, minValue, maxValue)
    : []

  useEffect(() => {
    if (
      normalized &&
      !readOnly &&
      !isSameAppTime(value, normalized)
    ) {
      onValueChange(normalized)
    }
  }, [normalized, onValueChange, readOnly, value])

  useEffect(() => {
    rootRef.current
      ?.querySelectorAll<HTMLElement>('[aria-selected="true"]')
      .forEach((element) =>
        element.scrollIntoView?.({ block: 'nearest' }),
      )
  }, [normalized?.hour, normalized?.minute])

  useEffect(() => {
    onAvailabilityChange?.(hasAvailableValue)
  }, [hasAvailableValue, onAvailabilityChange])

  useEffect(() => {
    if (autoFocus && normalized) {
      hourRefs.current[normalized.hour]?.focus({ preventScroll: true })
    }
  }, [autoFocus, normalized])

  const focusValue = (column: TimeColumn, value: number) => {
    queueMicrotask(() => {
      if (column === 'hour') hourRefs.current[value]?.focus()
      else {
        const index = minutes.indexOf(value)
        minuteRefs.current[index]?.focus()
      }
    })
  }
  const selectHour = (hour: number) => {
    if (readOnly) return
    const nextMinutes = availableMinutes(
      hour,
      step,
      minValue,
      maxValue,
    )
    if (nextMinutes.length === 0) return
    const currentMinute = normalized?.minute ?? nextMinutes[0]!
    const minute = nextMinutes.includes(currentMinute)
      ? currentMinute
      : nearestMinute(nextMinutes, currentMinute)
    onValueChange({ hour, minute })
  }
  const selectMinute = (minute: number) => {
    if (
      readOnly ||
      !normalized ||
      !isAvailable({ hour: normalized.hour, minute }, minValue, maxValue)
    ) {
      return
    }
    onValueChange({ hour: normalized.hour, minute })
  }
  const move = (
    column: TimeColumn,
    current: number,
    key: string,
  ) => {
    const options = column === 'hour' ? enabledHours : enabledMinutes
    const index = options.indexOf(current)
    let nextIndex = index
    if (key === 'ArrowUp') nextIndex = Math.max(0, index - 1)
    else if (key === 'ArrowDown') {
      nextIndex = Math.min(options.length - 1, index + 1)
    } else if (key === 'Home') nextIndex = 0
    else if (key === 'End') nextIndex = options.length - 1
    else if (key === 'PageUp') nextIndex = Math.max(0, index - 4)
    else if (key === 'PageDown') {
      nextIndex = Math.min(options.length - 1, index + 4)
    } else return false

    const next = options[nextIndex]
    if (next == null) return true
    if (column === 'hour') selectHour(next)
    else selectMinute(next)
    focusValue(column, next)
    return true
  }
  const handleKeyDown = (
    column: TimeColumn,
    current: number,
    event: KeyboardEvent<HTMLButtonElement>,
  ) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault()
      const target = event.key === 'ArrowLeft' ? 'hour' : 'minute'
      focusValue(
        target,
        target === 'hour'
          ? normalized?.hour ?? 0
          : normalized?.minute ?? 0,
      )
      return
    }
    if (move(column, current, event.key)) event.preventDefault()
  }
  const hourText = (hour: number) =>
    hourCycle === 24
      ? String(hour).padStart(2, '0')
      : formatAppTime({ hour, minute: 0 }, locale, 12).replace(':00', '')

  return (
    <div className="app-time-panel" ref={rootRef}>
      {!hasAvailableValue ? (
        <div
          className="app-time-panel__empty"
          role="status"
        >
          {messages.timePicker.noAvailableTime}
        </div>
      ) : null}
      <div className="app-time-panel__column">
        <div className="app-time-panel__label">
          {messages.timePicker.hourLabel}
        </div>
        <div
          aria-label={messages.timePicker.hourLabel}
          className="app-time-panel__list app-scrollbar"
          role="listbox"
        >
          {hours.map((hour) => {
            const disabled = !enabledHours.includes(hour)
            const selected = hour === normalized?.hour
            return (
              <button
                aria-selected={selected}
                className="app-time-panel__option"
                disabled={disabled}
                key={hour}
                onClick={() => selectHour(hour)}
                onKeyDown={(event) =>
                  handleKeyDown('hour', hour, event)
                }
                ref={(node) => {
                  hourRefs.current[hour] = node
                }}
                role="option"
                tabIndex={selected && !disabled ? 0 : -1}
                type="button"
              >
                {hourText(hour)}
              </button>
            )
          })}
        </div>
      </div>
      <div className="app-time-panel__column">
        <div className="app-time-panel__label">
          {messages.timePicker.minuteLabel}
        </div>
        <div
          aria-label={messages.timePicker.minuteLabel}
          className="app-time-panel__list app-scrollbar"
          role="listbox"
        >
          {minutes.map((minute, index) => {
            const disabled = !enabledMinutes.includes(minute)
            const selected = minute === normalized?.minute
            return (
              <button
                aria-selected={selected}
                className="app-time-panel__option"
                disabled={disabled}
                key={minute}
                onClick={() => selectMinute(minute)}
                onKeyDown={(event) =>
                  handleKeyDown('minute', minute, event)
                }
                ref={(node) => {
                  minuteRefs.current[index] = node
                }}
                role="option"
                tabIndex={selected && !disabled ? 0 : -1}
                type="button"
              >
                {String(minute).padStart(2, '0')}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
