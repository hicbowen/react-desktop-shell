import { forwardRef, useLayoutEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import type { AppTextAreaProps } from './types'
import './AppTextInput.css'

export const AppTextArea = forwardRef<HTMLTextAreaElement, AppTextAreaProps>(function AppTextArea({ autoResize = false, className, defaultValue, invalid = false, maxRows, minRows = 2, onChange, resize = 'vertical', showCount = false, value, ...rest }, forwardedRef) {
  const localRef = useRef<HTMLTextAreaElement>(null); const [count, setCount] = useState(() => String(value ?? defaultValue ?? '').length)
  const setRef = (node: HTMLTextAreaElement | null) => { localRef.current = node; if (typeof forwardedRef === 'function') forwardedRef(node); else if (forwardedRef) forwardedRef.current = node }
  const resizeNow = () => { const node = localRef.current; if (!node || !autoResize) return; const computed = getComputedStyle(node); const lineHeight = Number.parseFloat(computed.lineHeight) || 20; const border = (Number.parseFloat(computed.borderTopWidth) || 0) + (Number.parseFloat(computed.borderBottomWidth) || 0); node.style.height = 'auto'; const min = lineHeight * minRows + border; const max = maxRows ? lineHeight * maxRows + border : Number.POSITIVE_INFINITY; node.style.height = `${Math.min(max, Math.max(min, node.scrollHeight))}px` }
  useLayoutEffect(resizeNow, [autoResize, maxRows, minRows, value])
  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => { setCount(event.target.value.length); resizeNow(); onChange?.(event) }
  const length = value == null ? count : String(value).length
  const classes = ['app-text-area', invalid ? 'app-text-area--invalid' : '', autoResize ? 'app-text-area--auto' : '', className].filter(Boolean).join(' ')
  return <span className={classes}><textarea {...rest} aria-invalid={invalid || undefined} className="app-text-area__control" defaultValue={value == null ? defaultValue : undefined} onChange={handleChange} ref={setRef} rows={minRows} style={{ resize: autoResize ? 'none' : resize, ...rest.style }} value={value} />{showCount ? <span aria-live="polite" className="app-text-area__count">{length}{rest.maxLength != null ? ` / ${rest.maxLength}` : ''}</span> : null}</span>
})
