import { useEffect, useState } from 'react'
import './AppSelectionControls.css'

interface CheckBoxIndicatorProps {
  animated?: boolean
  checked: boolean
  indeterminate?: boolean
}

interface CheckMarkProps {
  animated?: boolean
}

export function CheckMark({ animated = true }: CheckMarkProps = {}) {
  return (
    <svg
      className={[
        'app-check-box__check',
        animated ? 'app-check-box__check--animated' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      focusable="false"
      viewBox="0 0 16 16"
    >
      <path d="M3.5 8.25L6.5 11L12.5 4.75" />
    </svg>
  )
}

export function CheckBoxIndicator({
  animated = true,
  checked,
  indeterminate = false,
}: CheckBoxIndicatorProps) {
  const [previousState, setPreviousState] = useState(() => ({
    checked,
    indeterminate,
  }))
  const shouldAnimate =
    animated &&
    ((checked && !previousState.checked) ||
      (indeterminate && !previousState.indeterminate))

  useEffect(() => {
    if (
      previousState.checked === checked &&
      previousState.indeterminate === indeterminate
    ) {
      return
    }

    // This state drives a one-render animation class for a real visual transition.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreviousState({ checked, indeterminate })
  }, [checked, indeterminate, previousState])

  return (
    <span aria-hidden="true" className="app-check-box__box">
      {indeterminate ? (
        <span
          className={[
            'app-check-box__indeterminate',
            shouldAnimate ? 'app-check-box__indeterminate--animated' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        />
      ) : checked ? (
        <CheckMark animated={shouldAnimate} />
      ) : null}
    </span>
  )
}
