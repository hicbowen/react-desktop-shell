import type { PointerEvent as ReactPointerEvent, RefObject } from 'react'
import type { AppScrollAxis } from './useAppScrollController'

interface AppScrollbarProps {
  axis: AppScrollAxis
  crossAxisVisible: boolean
  disabled: boolean
  dragging: boolean
  onArrowPointerDown: (
    axis: AppScrollAxis,
    direction: -1 | 1,
    event: ReactPointerEvent<HTMLDivElement>,
  ) => void
  onArrowPointerEnd: (event: ReactPointerEvent<HTMLDivElement>) => void
  onThumbPointerDown: (
    axis: AppScrollAxis,
    event: ReactPointerEvent<HTMLDivElement>,
  ) => void
  onThumbPointerEnd: (event: ReactPointerEvent<HTMLDivElement>) => void
  onThumbPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void
  onTrackPointerDown: (
    axis: AppScrollAxis,
    event: ReactPointerEvent<HTMLDivElement>,
  ) => void
  thumbRef: RefObject<HTMLDivElement | null>
  trackRef: RefObject<HTMLDivElement | null>
  visible: boolean
}

export function AppScrollbar({
  axis,
  crossAxisVisible,
  disabled,
  dragging,
  onArrowPointerDown,
  onArrowPointerEnd,
  onThumbPointerDown,
  onThumbPointerEnd,
  onThumbPointerMove,
  onTrackPointerDown,
  thumbRef,
  trackRef,
  visible,
}: AppScrollbarProps) {
  return (
    <div
      aria-hidden="true"
      className={`app-scroll-area__scrollbar app-scroll-area__scrollbar--${axis}`}
      data-cross-axis={crossAxisVisible ? 'true' : 'false'}
      data-disabled={disabled ? 'true' : 'false'}
      data-dragging={dragging ? 'true' : 'false'}
      data-visible={visible ? 'true' : 'false'}
    >
      <div className="app-scroll-area__rail">
        <div
          className="app-scroll-area__arrow app-scroll-area__arrow--decrement"
          onLostPointerCapture={onArrowPointerEnd}
          onPointerCancel={onArrowPointerEnd}
          onPointerDown={(event) => onArrowPointerDown(axis, -1, event)}
          onPointerUp={onArrowPointerEnd}
        >
          <svg focusable="false" viewBox="0 0 12 12">
            <path d="M3.25 7 6 4.25 8.75 7" />
          </svg>
        </div>
        <div
          className="app-scroll-area__track"
          onPointerDown={(event) => onTrackPointerDown(axis, event)}
          ref={trackRef}
        >
          <div
            className="app-scroll-area__thumb"
            onLostPointerCapture={onThumbPointerEnd}
            onPointerCancel={onThumbPointerEnd}
            onPointerDown={(event) => onThumbPointerDown(axis, event)}
            onPointerMove={onThumbPointerMove}
            onPointerUp={onThumbPointerEnd}
            ref={thumbRef}
          />
        </div>
        <div
          className="app-scroll-area__arrow app-scroll-area__arrow--increment"
          onLostPointerCapture={onArrowPointerEnd}
          onPointerCancel={onArrowPointerEnd}
          onPointerDown={(event) => onArrowPointerDown(axis, 1, event)}
          onPointerUp={onArrowPointerEnd}
        >
          <svg focusable="false" viewBox="0 0 12 12">
            <path d="M3.25 7 6 4.25 8.75 7" />
          </svg>
        </div>
      </div>
    </div>
  )
}
