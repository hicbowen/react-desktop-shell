import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import type { AppSelectorBarProps } from './types'
import './AppSelectorBar.css'

function firstAvailableKey(items: AppSelectorBarProps['items']) {
  return items.find((item) => !item.disabled)?.key
}

export function AppSelectorBar({
  items,
  value,
  defaultValue,
  onChange,
  size = 'medium',
  disabled = false,
  ariaLabel,
  className,
  style,
}: AppSelectorBarProps) {
  const isControlled = value !== undefined
  const buttonRefs = useRef(new Map<string, HTMLButtonElement>())
  const reconciliationRef = useRef<
    | {
        value: string | undefined
        fallback: string | undefined
      }
    | undefined
  >(undefined)
  const availableKeys = useMemo(
    () => items.filter((item) => !item.disabled).map((item) => item.key),
    [items],
  )
  const fallbackKey = availableKeys[0]
  const [internalValue, setInternalValue] = useState<string | undefined>(() => {
    const initialFallback = firstAvailableKey(items)
    return defaultValue &&
      items.some((item) => item.key === defaultValue && !item.disabled)
      ? defaultValue
      : initialFallback
  })
  const requestedValue = isControlled ? value : internalValue
  const selectedKey =
    requestedValue !== undefined && availableKeys.includes(requestedValue)
      ? requestedValue
      : fallbackKey

  if (!isControlled && internalValue !== selectedKey) {
    setInternalValue(selectedKey)
  }

  useEffect(() => {
    if (!isControlled || value === selectedKey || selectedKey === undefined) {
      reconciliationRef.current = undefined
      return
    }

    const previous = reconciliationRef.current
    if (previous?.value !== value || previous.fallback !== selectedKey) {
      reconciliationRef.current = { value, fallback: selectedKey }
      onChange?.(selectedKey)
    }
  }, [isControlled, onChange, selectedKey, value])

  const select = (key: string) => {
    if (disabled || !availableKeys.includes(key) || key === selectedKey) {
      return
    }

    if (!isControlled) {
      setInternalValue(key)
    }
    onChange?.(key)
  }

  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    itemKey: string,
  ) => {
    if (disabled) {
      return
    }

    let targetIndex: number | undefined
    const currentIndex = availableKeys.indexOf(itemKey)

    switch (event.key) {
      case 'ArrowLeft':
        targetIndex =
          (currentIndex - 1 + availableKeys.length) % availableKeys.length
        break
      case 'ArrowRight':
        targetIndex = (currentIndex + 1) % availableKeys.length
        break
      case 'Home':
        targetIndex = 0
        break
      case 'End':
        targetIndex = availableKeys.length - 1
        break
      default:
        return
    }

    const targetKey = availableKeys[targetIndex]
    if (!targetKey) {
      return
    }

    event.preventDefault()
    select(targetKey)
    buttonRefs.current.get(targetKey)?.focus()
  }

  const rootClassName = [
    'app-selector-bar',
    `app-selector-bar--${size}`,
    disabled ? 'app-selector-bar--disabled' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      aria-disabled={disabled || undefined}
      aria-label={ariaLabel}
      className={rootClassName}
      role="radiogroup"
      style={style}
    >
      {items.map((item) => {
        const itemDisabled = disabled || Boolean(item.disabled)
        const selected = item.key === selectedKey

        return (
          <button
            aria-checked={selected}
            aria-disabled={itemDisabled}
            aria-label={item.ariaLabel}
            className={`app-selector-bar__item${
              selected ? ' app-selector-bar__item--selected' : ''
            }`}
            disabled={itemDisabled}
            key={item.key}
            onClick={() => select(item.key)}
            onKeyDown={(event) => handleKeyDown(event, item.key)}
            ref={(node) => {
              if (node) {
                buttonRefs.current.set(item.key, node)
              } else {
                buttonRefs.current.delete(item.key)
              }
            }}
            role="radio"
            tabIndex={!itemDisabled && (selected || (!selectedKey && item.key === fallbackKey)) ? 0 : -1}
            type="button"
          >
            {item.icon !== undefined && item.icon !== null ? (
              <span aria-hidden="true" className="app-selector-bar__icon">
                {item.icon}
              </span>
            ) : null}
            {item.label !== undefined && item.label !== null ? (
              <span className="app-selector-bar__label">{item.label}</span>
            ) : null}
            <span aria-hidden="true" className="app-selector-bar__indicator" />
          </button>
        )
      })}
    </div>
  )
}
