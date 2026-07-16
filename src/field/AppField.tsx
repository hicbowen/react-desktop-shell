import { useId } from 'react'
import type { CSSProperties } from 'react'
import type { AppFieldProps } from './types'
import { AppFieldContext } from './AppFieldContext'
import './AppField.css'

export function AppField({ children, className, description, disabled = false, error, htmlFor, id, label, labelWidth, messageId, orientation = 'vertical', required = false, requiredIndicator = '*', requiredLabel = 'Required', style }: AppFieldProps) {
  const generatedId = useId()
  const controlId = htmlFor ?? id ?? `${generatedId}-control`
  const resolvedMessageId = messageId ?? `${generatedId}-message`
  const classes = ['app-field', `app-field--${orientation}`, disabled ? 'app-field--disabled' : '', error ? 'app-field--error' : '', className].filter(Boolean).join(' ')
  const mergedStyle = labelWidth == null ? style : { ...style, '--app-field-label-width': typeof labelWidth === 'number' ? `${labelWidth}px` : labelWidth } as CSSProperties
  const message = error ?? description
  return <div aria-disabled={disabled || undefined} className={classes} role="group" style={mergedStyle}>
    <div className="app-field__label-wrap"><label className="app-field__label" htmlFor={controlId}>{label}{required ? <><span aria-hidden="true" className="app-field__required">{requiredIndicator}</span><span className="app-field__sr">{requiredLabel}</span></> : null}</label></div>
    <div className="app-field__body"><AppFieldContext.Provider value={{ controlId, describedBy: message ? resolvedMessageId : undefined, disabled, invalid: Boolean(error), required }}><div className="app-field__control">{children}</div></AppFieldContext.Provider>{message ? <div className={error ? 'app-field__message app-field__message--error' : 'app-field__message'} id={resolvedMessageId} role={error ? 'alert' : undefined}>{message}</div> : null}</div>
  </div>
}
