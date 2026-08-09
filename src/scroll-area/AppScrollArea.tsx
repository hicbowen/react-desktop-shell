import { forwardRef, useImperativeHandle, useRef } from 'react'
import { AppScrollbar } from './AppScrollbar'
import type { AppScrollAreaProps } from './types'
import { useAppScrollController } from './useAppScrollController'
import './AppScrollArea.css'

export const AppScrollArea = forwardRef<HTMLDivElement, AppScrollAreaProps>(
  function AppScrollArea(
    {
      orientation = 'vertical',
      scrollbar = 'auto',
      gutter = 'auto',
      className,
      children,
      style,
      ...rest
    },
    ref,
  ) {
    const viewportRef = useRef<HTMLDivElement>(null)
    const verticalTrackRef = useRef<HTMLDivElement>(null)
    const verticalThumbRef = useRef<HTMLDivElement>(null)
    const horizontalTrackRef = useRef<HTMLDivElement>(null)
    const horizontalThumbRef = useRef<HTMLDivElement>(null)
    useImperativeHandle(ref, () => viewportRef.current!, [])

    const {
      draggingAxis,
      endThumbDrag,
      onArrowPointerDown,
      onArrowPointerEnd,
      onThumbPointerDown,
      onThumbPointerMove,
      onTrackPointerDown,
      overflow,
    } = useAppScrollController({
      horizontalThumbRef,
      horizontalTrackRef,
      orientation,
      verticalThumbRef,
      verticalTrackRef,
      viewportRef,
    })
    const classNames = [
      'app-scroll-area',
      `app-scroll-area--${orientation}`,
      `app-scroll-area--scrollbar-${scrollbar}`,
      `app-scroll-area--gutter-${gutter}`,
    ]

    if (className) {
      classNames.push(className)
    }

    const allowsVertical = orientation !== 'horizontal'
    const allowsHorizontal = orientation !== 'vertical'
    const verticalVisible =
      scrollbar !== 'hidden' &&
      allowsVertical &&
      (scrollbar === 'always' || overflow.vertical)
    const horizontalVisible =
      scrollbar !== 'hidden' &&
      allowsHorizontal &&
      (scrollbar === 'always' || overflow.horizontal)

    return (
      <div
        className={classNames.join(' ')}
        data-gutter={gutter}
        data-orientation={orientation}
        data-overflow-x={overflow.horizontal ? 'true' : 'false'}
        data-overflow-y={overflow.vertical ? 'true' : 'false'}
        data-scrollbar={scrollbar}
        style={style}
      >
        <div {...rest} className="app-scroll-area__viewport" ref={viewportRef}>
          {children}
        </div>
        {scrollbar !== 'hidden' && allowsVertical ? (
          <AppScrollbar
            axis="vertical"
            crossAxisVisible={horizontalVisible}
            disabled={!overflow.vertical}
            dragging={draggingAxis === 'vertical'}
            onArrowPointerDown={onArrowPointerDown}
            onArrowPointerEnd={onArrowPointerEnd}
            onThumbPointerDown={onThumbPointerDown}
            onThumbPointerEnd={endThumbDrag}
            onThumbPointerMove={onThumbPointerMove}
            onTrackPointerDown={onTrackPointerDown}
            thumbRef={verticalThumbRef}
            trackRef={verticalTrackRef}
            visible={verticalVisible}
          />
        ) : null}
        {scrollbar !== 'hidden' && allowsHorizontal ? (
          <AppScrollbar
            axis="horizontal"
            crossAxisVisible={verticalVisible}
            disabled={!overflow.horizontal}
            dragging={draggingAxis === 'horizontal'}
            onArrowPointerDown={onArrowPointerDown}
            onArrowPointerEnd={onArrowPointerEnd}
            onThumbPointerDown={onThumbPointerDown}
            onThumbPointerEnd={endThumbDrag}
            onThumbPointerMove={onThumbPointerMove}
            onTrackPointerDown={onTrackPointerDown}
            thumbRef={horizontalThumbRef}
            trackRef={horizontalTrackRef}
            visible={horizontalVisible}
          />
        ) : null}
        {verticalVisible && horizontalVisible ? (
          <div aria-hidden="true" className="app-scroll-area__corner" />
        ) : null}
      </div>
    )
  },
)
