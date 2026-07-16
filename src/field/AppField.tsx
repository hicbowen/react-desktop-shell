import { useId } from 'react'
import type { CSSProperties } from 'react'
import type { AppFieldProps } from './types'
import './AppField.css'

export function AppField({ children, className, description, disabled = false, error, htmlFor, label, labelWidth, orientation = 'vertical', required = false, style }: AppFieldProps) {
  const id = useId()
  const messageId = `${id}-message`
  const classes = ['app-field', `app-field--${orientation}`, disabled ? 'app-field--disabled' : '', error ? 'app-field--error' : '', className].filter(Boolean).join(' ')
  const mergedStyle = labelWidth == null ? style : { ...style, '--app-field-label-width': typeof labelWidth === 'number' ? `${labelWidth}px` : labelWidth } as CSSProperties
  const message = error ?? description
  return <div aria-describedby={message ? messageId : undefined} aria-disabled={disabled || undefined} aria-invalid={error ? true : undefined} className={classes} role="group" style={mergedStyle}>
    <div className="app-field__label-wrap"><label className="app-field__label" htmlFor={htmlFor}>{label}{required ? <span aria-label="required" className="app-field__required">required</span> : null}</label></div>
    <div className="app-field__body"><div className="app-field__control">{children}</div>{message ? <div className={error ? 'app-field__message app-field__message--error' : 'app-field__message'} id={messageId}>{message}</div> : null}</div>
  </div>
}
