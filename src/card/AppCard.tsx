import type { KeyboardEvent, MouseEvent } from 'react'
import type { AppCardProps } from './types'
import './AppCard.css'

const interactiveSelector = [
  'button',
  'a',
  'input',
  'select',
  'textarea',
  'label',
  'summary',
  '[role="button"]',
  '[role="link"]',
  '[role="checkbox"]',
  '[role="radio"]',
  '[role="switch"]',
  '[role="tab"]',
  '[contenteditable]:not([contenteditable="false"])',
].join(',')

function isFromNestedInteractiveElement(
  target: EventTarget | null,
  card: HTMLDivElement,
) {
  if (!(target instanceof Element)) {
    return false
  }

  const interactiveElement = target.closest(interactiveSelector)
  return Boolean(
    interactiveElement &&
      interactiveElement !== card &&
      card.contains(interactiveElement),
  )
}

export function AppCard({
  appearance = 'filled',
  orientation = 'vertical',
  padding = 'regular',
  interactive,
  selected = false,
  disabled = false,
  onClick,
  onKeyDown,
  className,
  children,
  ...rest
}: AppCardProps) {
  const isInteractive = interactive ?? Boolean(onClick)
  const classNames = [
    'app-card',
    `app-card--${appearance}`,
    `app-card--${orientation}`,
    `app-card--padding-${padding}`,
  ]

  if (isInteractive) {
    classNames.push('app-card--interactive')
  }
  if (selected) {
    classNames.push('app-card--selected')
  }
  if (disabled) {
    classNames.push('app-card--disabled')
  }
  if (className) {
    classNames.push(className)
  }

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    if (
      disabled ||
      isFromNestedInteractiveElement(event.target, event.currentTarget)
    ) {
      return
    }

    onClick?.(event)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event)
    if (
      event.defaultPrevented ||
      disabled ||
      !isInteractive ||
      !onClick ||
      event.repeat ||
      isFromNestedInteractiveElement(event.target, event.currentTarget)
    ) {
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      event.currentTarget.click()
    }
  }

  return (
    <div
      {...rest}
      aria-disabled={disabled || undefined}
      aria-pressed={isInteractive ? selected : undefined}
      className={classNames.join(' ')}
      data-appearance={appearance}
      data-disabled={disabled || undefined}
      data-orientation={orientation}
      data-padding={padding}
      data-selected={selected || undefined}
      onClick={onClick ? handleClick : undefined}
      onKeyDown={handleKeyDown}
      role={isInteractive ? 'button' : rest.role}
      tabIndex={isInteractive ? (disabled ? -1 : 0) : rest.tabIndex}
    >
      {children}
    </div>
  )
}
