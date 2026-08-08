import { forwardRef, useState, type ChangeEvent, type KeyboardEvent } from 'react'
import { Eye16Regular } from '@fluentui/react-icons/svg/eye'
import { EyeOff16Regular } from '@fluentui/react-icons/svg/eye-off'
import { useAppFieldContext } from '../field/AppFieldContext'
import { useAppLocale } from '../localization/useAppLocale'
import { AppTooltip } from '../tooltip'
import type { AppPasswordBoxProps } from './types'
import '../text-input/AppTextInput.css'
import './AppPasswordBox.css'

function hasInputValue(value: unknown) {
  return value !== undefined && value !== null && String(value).length > 0
}

function PasswordRevealIcon({ revealed }: { revealed: boolean }) {
  const Icon = revealed ? Eye16Regular : EyeOff16Regular
  return <Icon aria-hidden="true" focusable="false" />
}

export const AppPasswordBox = forwardRef<HTMLInputElement, AppPasswordBoxProps>(function AppPasswordBox({
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  className,
  defaultValue,
  disabled,
  id,
  invalid,
  onChange,
  onKeyDown,
  onKeyUp,
  readOnly,
  required,
  revealable = true,
  revealMode = 'peek',
  size = 'standard',
  strength,
  value,
  ...props
}, ref) {
  const field = useAppFieldContext()
  const { messages } = useAppLocale()
  const [toggledRevealed, setToggledRevealed] = useState(false)
  const [peeking, setPeeking] = useState(false)
  const [internalHasValue, setInternalHasValue] = useState(() => hasInputValue(defaultValue))
  const [capsLock, setCapsLock] = useState(false)
  const resolvedDisabled = disabled ?? field?.disabled ?? false
  const resolvedInvalid = ariaInvalid ?? invalid ?? field?.invalid
  const resolvedRequired = required ?? field?.required
  const hasValue = value !== undefined ? hasInputValue(value) : internalHasValue
  const canReveal = hasValue && !resolvedDisabled && revealable
  const revealed = canReveal && (revealMode === 'peek' ? peeking : toggledRevealed)

  const inspectCaps = (event: KeyboardEvent<HTMLInputElement>) => {
    setCapsLock(event.getModifierState('CapsLock'))
  }
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextHasValue = event.currentTarget.value.length > 0
    setInternalHasValue(nextHasValue)
    if (!nextHasValue) {
      setPeeking(false)
      setToggledRevealed(false)
    }
    onChange?.(event)
  }
  const revealLabel = revealed ? messages.passwordBox.hide : messages.passwordBox.show

  return <span className={['app-password-box', className].filter(Boolean).join(' ')}>
    <span className={['app-text-box', `app-text-box--${size}`, resolvedInvalid ? 'app-text-box--invalid' : '', resolvedDisabled ? 'app-text-box--disabled' : ''].filter(Boolean).join(' ')}>
      <input
        {...props}
        aria-describedby={ariaDescribedBy ?? field?.describedBy}
        aria-invalid={resolvedInvalid || undefined}
        className="app-text-box__input"
        defaultValue={defaultValue}
        disabled={resolvedDisabled}
        id={id ?? field?.controlId}
        onChange={handleChange}
        onKeyDown={(event) => { inspectCaps(event); onKeyDown?.(event) }}
        onKeyUp={(event) => { inspectCaps(event); onKeyUp?.(event) }}
        readOnly={readOnly}
        ref={ref}
        required={resolvedRequired}
        type={revealed ? 'text' : 'password'}
        value={value}
      />
      {revealable && hasValue ? <AppTooltip content={revealLabel} disabled={resolvedDisabled} placement="top">
        <button
          aria-label={revealLabel}
          aria-pressed={revealed}
          className="app-password-box__reveal"
          disabled={resolvedDisabled}
          onBlur={() => {
            if (revealMode === 'peek') setPeeking(false)
          }}
          onClick={() => {
            if (revealMode === 'toggle') setToggledRevealed((current) => !current)
          }}
          onKeyDown={(event) => {
            if (revealMode === 'peek' && (event.key === 'Enter' || event.key === ' ')) {
              event.preventDefault()
              setPeeking(true)
            }
          }}
          onKeyUp={(event) => {
            if (revealMode === 'peek' && (event.key === 'Enter' || event.key === ' ')) {
              event.preventDefault()
              setPeeking(false)
            }
          }}
          onPointerCancel={() => {
            if (revealMode === 'peek') setPeeking(false)
          }}
          onPointerDown={(event) => {
            if (revealMode === 'peek') {
              event.preventDefault()
              setPeeking(true)
            }
          }}
          onPointerLeave={() => {
            if (revealMode === 'peek') setPeeking(false)
          }}
          onPointerUp={(event) => {
            if (revealMode === 'peek') {
              event.preventDefault()
              setPeeking(false)
            }
          }}
          type="button"
        >
          <PasswordRevealIcon revealed={revealed} />
        </button>
      </AppTooltip> : null}
    </span>
    {capsLock ? <span className="app-password-box__caps" role="status">{messages.passwordBox.capsLock}</span> : null}
    {strength ? <div className="app-password-box__strength">{strength}</div> : null}
  </span>
})
