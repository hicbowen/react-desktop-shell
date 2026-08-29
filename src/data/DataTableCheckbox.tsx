import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type InputHTMLAttributes,
} from 'react'
import { CheckBoxIndicator } from '../selection-controls/CheckBoxIndicator'
import '../selection-controls/AppSelectionControls.css'

interface DataTableCheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  indeterminate?: boolean
  animateIndicator?: boolean
}

const useBrowserLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect

export function DataTableCheckbox({
  animateIndicator = true,
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
  const visualState = indeterminate
    ? 'mixed'
    : resolvedChecked
      ? 'checked'
      : 'unchecked'

  useBrowserLayoutEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate
    }
  }, [indeterminate])

  return (
    <label
      className={[
        'app-check-box',
        'app-data-table__checkbox-control',
        !animateIndicator
          ? 'app-data-table__checkbox-control--static-indicator'
          : '',
        props.disabled ? 'app-check-box--disabled' : '',
      ].filter(Boolean).join(' ')}
      data-state={visualState}
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
        animated={animateIndicator}
        checked={resolvedChecked}
        indeterminate={indeterminate}
      />
    </label>
  )
}
