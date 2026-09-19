import { useCallback, useState } from 'react'

interface ControllableStateOptions<T> {
  value: T | undefined
  defaultValue: T
  onChange?: (value: T) => void
}

/** Internal state helper shared by controlled and uncontrolled collection APIs. */
export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: ControllableStateOptions<T>) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue)
  const controlled = value !== undefined
  const currentValue = controlled ? value : uncontrolledValue

  const setValue = useCallback((nextValue: T) => {
    if (!controlled) setUncontrolledValue(nextValue)
    onChange?.(nextValue)
  }, [controlled, onChange])

  return [currentValue, setValue] as const
}
