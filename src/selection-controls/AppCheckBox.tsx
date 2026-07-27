import {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import type { AppCheckBoxProps } from './types'
import './AppSelectionControls.css'

const useBrowserLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect

export const AppCheckBox = forwardRef<HTMLInputElement, AppCheckBoxProps>(
  function AppCheckBox(
    {
      checked,
      defaultChecked = false,
      description,
      disabled = false,
      indeterminate = false,
      label,
      onCheckedChange,
      ...rest
    },
    forwardedRef,
  ) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [internal, setInternal] = useState(defaultChecked)
    const resolved = checked ?? internal
    const syncIndeterminate = () => {
      if (inputRef.current) {
        inputRef.current.indeterminate = indeterminate
      }
    }
    const setRef = (node: HTMLInputElement | null) => {
      inputRef.current = node
      if (typeof forwardedRef === 'function') forwardedRef(node)
      else if (forwardedRef) forwardedRef.current = node
    }

    useBrowserLayoutEffect(syncIndeterminate)

    return (
      <label
        className={`app-check-box${disabled ? ' app-check-box--disabled' : ''}`}
      >
        <input
          {...rest}
          aria-checked={indeterminate ? 'mixed' : resolved}
          checked={resolved}
          disabled={disabled}
          onChange={(event) => {
            const next = event.target.checked
            if (checked == null) setInternal(next)
            onCheckedChange?.(next)
            syncIndeterminate()
          }}
          ref={setRef}
          type="checkbox"
        />
        <span aria-hidden="true" className="app-check-box__box">
          {indeterminate ? (
            <span className="app-check-box__indeterminate" />
          ) : resolved ? (
            <svg
              className="app-check-box__check"
              focusable="false"
              viewBox="0 0 16 16"
            >
              <path d="M3.5 8.25L6.5 11L12.5 4.75" />
            </svg>
          ) : null}
        </span>
        {label || description ? (
          <span className="app-selection-label">
            <span>{label}</span>
            {description ? (
              <span className="app-selection-description">{description}</span>
            ) : null}
          </span>
        ) : null}
      </label>
    )
  },
)
