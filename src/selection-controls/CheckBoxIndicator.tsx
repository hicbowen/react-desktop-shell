import './AppSelectionControls.css'

interface CheckBoxIndicatorProps {
  checked: boolean
  indeterminate?: boolean
}

export function CheckMark() {
  return (
    <svg
      className="app-check-box__check"
      focusable="false"
      viewBox="0 0 16 16"
    >
      <path d="M3.5 8.25L6.5 11L12.5 4.75" />
    </svg>
  )
}

export function CheckBoxIndicator({
  checked,
  indeterminate = false,
}: CheckBoxIndicatorProps) {
  return (
    <span aria-hidden="true" className="app-check-box__box">
      {indeterminate ? (
        <span className="app-check-box__indeterminate" />
      ) : checked ? (
        <CheckMark />
      ) : null}
    </span>
  )
}
