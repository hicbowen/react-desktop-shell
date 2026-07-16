import { forwardRef, useState } from 'react'; import type { KeyboardEvent } from 'react'; import type { AppToggleSwitchProps } from './types'; import './AppSelectionControls.css'
export const AppToggleSwitch = forwardRef<HTMLInputElement, AppToggleSwitchProps>(function AppToggleSwitch({ checked, defaultChecked = false, description, disabled = false, label, labelPosition = 'end', onCheckedChange, onKeyDown, size = 'standard', ...rest }, ref) {
  const [internal, setInternal] = useState(defaultChecked); const resolved = checked ?? internal
  const change = (next: boolean) => { if (checked == null) setInternal(next); onCheckedChange?.(next) }
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => { onKeyDown?.(event); if (!event.defaultPrevented && event.key === 'Enter' && !disabled) { event.preventDefault(); change(!resolved) } }
  const control = <span className="app-toggle-switch__control"><input {...rest} aria-checked={resolved} checked={resolved} disabled={disabled} onChange={(event) => change(event.target.checked)} onKeyDown={handleKeyDown} ref={ref} role="switch" type="checkbox" /><span aria-hidden="true" className="app-toggle-switch__track"><span className="app-toggle-switch__thumb" /></span></span>
  const text = label || description ? <span className="app-selection-label"><span>{label}</span>{description ? <span className="app-selection-description">{description}</span> : null}</span> : null
  return <label className={`app-toggle-switch app-toggle-switch--${size} app-toggle-switch--label-${labelPosition}${disabled ? ' app-toggle-switch--disabled' : ''}`}>{labelPosition === 'start' ? text : control}{labelPosition === 'start' ? control : text}</label>
})
