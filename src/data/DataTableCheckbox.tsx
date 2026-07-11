import { useEffect, useRef, type InputHTMLAttributes } from 'react'

interface DataTableCheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  indeterminate?: boolean
}

export function DataTableCheckbox({
  indeterminate = false,
  ...props
}: DataTableCheckboxProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate
    }
  }, [indeterminate])

  return (
    <input
      {...props}
      ref={inputRef}
      className={`app-data-table__checkbox ${props.className ?? ''}`.trim()}
      type="checkbox"
      onClick={(event) => {
        event.stopPropagation()
        props.onClick?.(event)
      }}
    />
  )
}
