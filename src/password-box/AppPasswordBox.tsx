import { forwardRef, useState, type KeyboardEvent } from 'react'
import { useAppFieldContext } from '../field/AppFieldContext'
import { useAppLocale } from '../localization/useAppLocale'
import type { AppPasswordBoxProps } from './types'
import '../text-input/AppTextInput.css'
import './AppPasswordBox.css'

export const AppPasswordBox = forwardRef<HTMLInputElement, AppPasswordBoxProps>(function AppPasswordBox({ 'aria-describedby': ariaDescribedBy, 'aria-invalid': ariaInvalid, className, disabled, id, invalid, onKeyDown, onKeyUp, readOnly, required, revealable = true, size = 'standard', strength, ...props }, ref) {
  const field = useAppFieldContext(); const { messages } = useAppLocale(); const [revealed, setRevealed] = useState(false); const [capsLock, setCapsLock] = useState(false)
  const resolvedDisabled = disabled ?? field?.disabled ?? false; const resolvedInvalid = ariaInvalid ?? invalid ?? field?.invalid; const resolvedRequired = required ?? field?.required
  const inspectCaps = (event: KeyboardEvent<HTMLInputElement>) => setCapsLock(event.getModifierState('CapsLock'))
  return <span className={['app-password-box', className].filter(Boolean).join(' ')}><span className={['app-text-box', `app-text-box--${size}`, resolvedInvalid ? 'app-text-box--invalid' : '', resolvedDisabled ? 'app-text-box--disabled' : ''].filter(Boolean).join(' ')}><input {...props} aria-describedby={ariaDescribedBy ?? field?.describedBy} aria-invalid={resolvedInvalid || undefined} className="app-text-box__input" disabled={resolvedDisabled} id={id ?? field?.controlId} onKeyDown={(event) => { inspectCaps(event); onKeyDown?.(event) }} onKeyUp={(event) => { inspectCaps(event); onKeyUp?.(event) }} readOnly={readOnly} ref={ref} required={resolvedRequired} type={revealed ? 'text' : 'password'} />{revealable ? <button aria-label={revealed ? messages.passwordBox.hide : messages.passwordBox.show} aria-pressed={revealed} className="app-password-box__reveal" disabled={resolvedDisabled} onClick={() => setRevealed((current) => !current)} type="button"><span aria-hidden="true">{revealed ? '◉' : '◎'}</span></button> : null}</span>{capsLock ? <span className="app-password-box__caps" role="status">{messages.passwordBox.capsLock}</span> : null}{strength ? <div className="app-password-box__strength">{strength}</div> : null}</span>
})
