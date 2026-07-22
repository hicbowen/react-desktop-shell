import {
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { useAppLocale } from '../localization/useAppLocale'
import type { AppInlineEditHandle, AppInlineEditProps } from './types'
import './AppInlineEdit.css'

function selectInput(input: HTMLInputElement, selection: NonNullable<AppInlineEditProps['selection']>) {
  if (selection === 'preserve') return
  if (selection === 'end') {
    input.setSelectionRange(input.value.length, input.value.length)
    return
  }
  if (selection === 'basename') {
    const dot = input.value.lastIndexOf('.')
    input.setSelectionRange(0, dot > 0 ? dot : input.value.length)
    return
  }
  input.select()
}

export const AppInlineEdit = forwardRef<AppInlineEditHandle, AppInlineEditProps>(function AppInlineEdit({
  ariaLabel,
  className,
  commitOnBlur = true,
  defaultEditing = false,
  defaultValue = '',
  disabled = false,
  editing,
  onCommit,
  onCommitError,
  onEditingChange,
  onValueChange,
  placeholder,
  readOnly = false,
  renderValue,
  required = false,
  selection = 'all',
  showActions = false,
  style,
  validate,
  value,
}: AppInlineEditProps, ref) {
  const { messages } = useAppLocale()
  const valueControlled = value !== undefined
  const editingControlled = editing !== undefined
  const [internalValue, setInternalValue] = useState(defaultValue)
  const [internalEditing, setInternalEditing] = useState(defaultEditing)
  const [draft, setDraft] = useState(value ?? defaultValue)
  const [error, setError] = useState<ReactNode | null>(null)
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const viewRef = useRef<HTMLButtonElement>(null)
  const rootRef = useRef<HTMLSpanElement>(null)
  const composingRef = useRef(false)
  const resolvedValue = valueControlled ? value : internalValue
  const resolvedEditing = editingControlled ? editing : internalEditing

  const setEditing = (next: boolean) => {
    if (!editingControlled) setInternalEditing(next)
    onEditingChange?.(next)
  }

  const startEditing = () => {
    if (disabled || readOnly || saving) return
    setDraft(resolvedValue)
    setError(null)
    setEditing(true)
  }

  const cancel = () => {
    setDraft(resolvedValue)
    setError(null)
    setEditing(false)
    requestAnimationFrame(() => viewRef.current?.focus({ preventScroll: true }))
  }

  const commit = async () => {
    if (!resolvedEditing || saving) return false
    if (required && draft.length === 0) {
      setError(messages.inlineEdit.required)
      return false
    }
    setSaving(true)
    try {
      const validationError = await validate?.(draft)
      if (validationError) {
        setError(validationError)
        return false
      }
      await onCommit?.(draft, resolvedValue)
      if (!valueControlled) setInternalValue(draft)
      onValueChange?.(draft)
      setError(null)
      setEditing(false)
      requestAnimationFrame(() => viewRef.current?.focus({ preventScroll: true }))
      return true
    } catch (commitError) {
      setError(messages.inlineEdit.saveFailed)
      onCommitError?.(commitError)
      return false
    } finally {
      setSaving(false)
    }
  }

  useLayoutEffect(() => {
    if (!resolvedEditing) return
    const input = inputRef.current
    if (!input) return
    input.focus({ preventScroll: true })
    selectInput(input, selection)
  }, [resolvedEditing, selection])

  useImperativeHandle(ref, () => ({
    get input() { return inputRef.current },
    focus: () => (resolvedEditing ? inputRef.current : viewRef.current)?.focus(),
    startEditing,
    cancel,
    commit,
  }))

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      cancel()
    } else if (event.key === 'Enter' && !composingRef.current) {
      event.preventDefault()
      void commit()
    }
  }

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    if (!commitOnBlur || rootRef.current?.contains(event.relatedTarget)) return
    void commit()
  }

  return (
    <span className={['app-inline-edit', resolvedEditing ? 'app-inline-edit--editing' : '', error ? 'app-inline-edit--invalid' : '', disabled ? 'app-inline-edit--disabled' : '', className].filter(Boolean).join(' ')} ref={rootRef} style={style}>
      {resolvedEditing ? (
        <>
          <span className="app-inline-edit__editor">
            <input
              aria-busy={saving || undefined}
              aria-invalid={Boolean(error) || undefined}
              aria-label={ariaLabel ?? messages.inlineEdit.edit}
              disabled={disabled || saving}
              onBlur={handleBlur}
              onChange={(event) => { setDraft(event.target.value); setError(null) }}
              onCompositionEnd={() => { composingRef.current = false }}
              onCompositionStart={() => { composingRef.current = true }}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              ref={inputRef}
              required={required}
              value={draft}
            />
            {showActions ? <span className="app-inline-edit__actions"><button aria-label={messages.inlineEdit.save} disabled={saving} onClick={() => void commit()} type="button">✓</button><button aria-label={messages.inlineEdit.cancel} disabled={saving} onClick={cancel} type="button">×</button></span> : null}
          </span>
          {error ? <span className="app-inline-edit__error" role="alert">{error}</span> : null}
        </>
      ) : (
        <button
          aria-label={ariaLabel}
          className="app-inline-edit__view"
          disabled={disabled}
          onDoubleClick={startEditing}
          onKeyDown={(event) => {
            if (event.key === 'F2' || event.key === 'Enter') {
              event.preventDefault()
              startEditing()
            }
          }}
          ref={viewRef}
          type="button"
        >
          {renderValue ? renderValue(resolvedValue) : resolvedValue || placeholder}
        </button>
      )}
    </span>
  )
})
