import { useState, type KeyboardEvent } from 'react'
import { ChevronLeft16Regular } from '@fluentui/react-icons/svg/chevron-left'
import { ChevronRight16Regular } from '@fluentui/react-icons/svg/chevron-right'
import { AppIconButton } from '../button/AppIconButton'
import { useAppLocale } from '../localization/useAppLocale'
import type { AppCarouselProps, AppCarouselSlide } from './types'
import './AppCarousel.css'

function resolveKey(
  slides: readonly AppCarouselSlide[],
  key: string | undefined,
) {
  return slides.find((slide) => slide.key === key)?.key ?? slides[0]?.key
}

export function AppCarousel({
  ariaLabel,
  className,
  defaultValue,
  onValueChange,
  slides,
  style,
  value,
}: AppCarouselProps) {
  const { messages } = useAppLocale()
  const text = messages.carousel
  const controlled = value !== undefined
  const [internalValue, setInternalValue] = useState<string | undefined>(() =>
    resolveKey(slides, defaultValue),
  )
  const currentKey = resolveKey(slides, controlled ? value : internalValue)

  if (currentKey === undefined) {
    return null
  }

  const currentIndex = slides.findIndex((slide) => slide.key === currentKey)
  const currentSlide = slides[currentIndex]

  if (!currentSlide || currentIndex < 0) {
    return null
  }

  const selectIndex = (nextIndex: number) => {
    const nextSlide = slides[nextIndex]
    if (!nextSlide) return

    if (!controlled) {
      setInternalValue(nextSlide.key)
    }
    onValueChange?.(nextSlide.key)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget) return

    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      selectIndex(currentIndex - 1)
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      selectIndex(currentIndex + 1)
    }
  }

  const classNames = ['app-carousel', className].filter(Boolean).join(' ')
  const position = text.position(currentIndex + 1, slides.length)
  const hasNavigation = slides.length > 1
  const hasVisual = currentSlide.visual !== undefined && currentSlide.visual !== null

  return (
    <section
      aria-label={ariaLabel ?? text.label}
      className={classNames}
      onKeyDown={handleKeyDown}
      style={style}
      tabIndex={0}
    >
      <div
        aria-label={position}
        className={[
          'app-carousel__slide',
          hasVisual ? 'app-carousel__slide--with-visual' : 'app-carousel__slide--text-only',
        ].join(' ')}
        data-key={currentSlide.key}
        role="group"
      >
        <div className="app-carousel__copy">
          {currentSlide.eyebrow ? (
            <div className="app-carousel__eyebrow">{currentSlide.eyebrow}</div>
          ) : null}
          <h2 className="app-carousel__title">{currentSlide.title}</h2>
          {currentSlide.description ? (
            <p className="app-carousel__description">{currentSlide.description}</p>
          ) : null}
          {currentSlide.action ? (
            <div className="app-carousel__action">{currentSlide.action}</div>
          ) : null}
        </div>

        {hasVisual ? (
          <div aria-hidden="true" className="app-carousel__visual">
            {currentSlide.visual}
          </div>
        ) : null}
      </div>

      {hasNavigation ? (
        <div className="app-carousel__controls">
          <div aria-label={text.label} className="app-carousel__indicators" role="group">
            <span aria-live="polite" className="app-carousel__position">
              {position}
            </span>
            <div className="app-carousel__dots">
              {slides.map((slide, index) => {
                const active = index === currentIndex

                return (
                  <button
                    aria-current={active ? 'true' : undefined}
                    aria-label={text.position(index + 1, slides.length)}
                    className={[
                      'app-carousel__dot',
                      active ? 'app-carousel__dot--active' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    key={slide.key}
                    onClick={() => selectIndex(index)}
                    type="button"
                  />
                )
              })}
            </div>
          </div>
          <div className="app-carousel__actions">
            <AppIconButton
              ariaLabel={text.previous}
              appearance="standard"
              disabled={currentIndex === 0}
              icon={<ChevronLeft16Regular aria-hidden="true" focusable="false" />}
              onClick={() => selectIndex(currentIndex - 1)}
              size="compact"
            />
            <AppIconButton
              ariaLabel={text.next}
              appearance="standard"
              disabled={currentIndex === slides.length - 1}
              icon={<ChevronRight16Regular aria-hidden="true" focusable="false" />}
              onClick={() => selectIndex(currentIndex + 1)}
              size="compact"
            />
          </div>
        </div>
      ) : null}
    </section>
  )
}
