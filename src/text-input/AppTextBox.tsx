import { forwardRef, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import type { AppTextBoxProps } from './types'
import { useAppFieldContext } from '../field/AppFieldContext'
import './AppTextInput.css'

const clearableTypes = new Set(['text', 'search', 'email', 'url', 'tel'])
export const AppTextBox = forwardRef<HTMLInputElement, AppTextBoxProps>(function AppTextBox({ 'aria-describedby': ariaDescribedBy, 'aria-invalid': ariaInvalid, className, clearable = false, disabled, endIcon, id, invalid, loading = false, onChange, onClear, readOnly = false, required, size = 'standard', startIcon, type = 'text', value, defaultValue, ...rest }, forwardedRef) {
  const field = useAppFieldContext()
  const resolvedDisabled = disabled ?? field?.disabled ?? false
  const resolvedInvalid = ariaInvalid ?? invalid ?? field?.invalid
  const resolvedRequired = required ?? field?.required
  const localRef = useRef<HTMLInputElement>(null)
  const [currentValue, setCurrentValue] = useState(() => String(value ?? defaultValue ?? ''))
  const displayedValue = value == null ? currentValue : String(value)
  const canClear = clearable && clearableTypes.has(type) && displayedValue.length > 0 && !resolvedDisabled && !readOnly
  const setRef = (node: HTMLInputElement | null) => { localRef.current = node; if (typeof forwardedRef === 'function') forwardedRef(node); else if (forwardedRef) forwardedRef.current = node }
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => { setCurrentValue(event.target.value); onChange?.(event) }
  const clear = () => { const input = localRef.current; if (!input) return; const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set; setter?.call(input, ''); input.dispatchEvent(new Event('input', { bubbles: true })); setCurrentValue(''); onClear?.(); input.focus() }
  const classes = ['app-text-box', `app-text-box--${size}`, resolvedInvalid ? 'app-text-box--invalid' : '', resolvedDisabled ? 'app-text-box--disabled' : '', className].filter(Boolean).join(' ')
  return <span className={classes}>{startIcon ? <span aria-hidden="true" className="app-text-box__icon">{startIcon}</span> : null}<input {...rest} aria-describedby={ariaDescribedBy ?? field?.describedBy} aria-invalid={resolvedInvalid || undefined} className="app-text-box__input" defaultValue={value == null ? defaultValue : undefined} disabled={resolvedDisabled} id={id ?? field?.controlId} onChange={handleChange} readOnly={readOnly} ref={setRef} required={resolvedRequired} type={type} value={value} />{canClear ? <button aria-label="Clear input" className="app-text-box__clear" onClick={clear} type="button"><span aria-hidden="true">×</span></button> : null}{loading ? <span aria-label="Loading" className="app-text-box__loading" role="status" /> : endIcon ? <span aria-hidden="true" className="app-text-box__icon">{endIcon}</span> : null}</span>
})
