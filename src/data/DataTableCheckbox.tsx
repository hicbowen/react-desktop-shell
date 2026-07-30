import {
  useEffect,
  useRef,
  useState,
  type InputHTMLAttributes,
} from 'react'
import { CheckBoxIndicator } from '../selection-controls/CheckBoxIndicator'
import '../selection-controls/AppSelectionControls.css'

interface DataTableCheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  indeterminate?: boolean
}

export function DataTableCheckbox({
  checked,
  className,
  defaultChecked = false,
  indeterminate = false,
  onChange,
  onClick,
  ...props
}: DataTableCheckboxProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [internalChecked, setInternalChecked] = useState(defaultChecked)
  const resolvedChecked = checked ?? internalChecked

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate
    }
  }, [indeterminate])

  return (
    <label
      className={[
        'app-check-box',
        'app-data-table__checkbox-control',
        props.disabled ? 'app-check-box--disabled' : '',
      ].filter(Boolean).join(' ')}
      onClick={(event) => event.stopPropagation()}
    >
      <input
        {...props}
        aria-checked={indeterminate ? 'mixed' : resolvedChecked}
        checked={resolvedChecked}
        className={`app-data-table__checkbox ${className ?? ''}`.trim()}
        onChange={(event) => {
          if (checked === undefined) setInternalChecked(event.target.checked)
          onChange?.(event)
        }}
        onClick={(event) => {
          event.stopPropagation()
          onClick?.(event)
        }}
        ref={inputRef}
        type="checkbox"
      />
      <CheckBoxIndicator
        checked={resolvedChecked}
        indeterminate={indeterminate}
      />
    </label>
  )
}
