import { useEffect, useId, useRef, useState } from 'react'
import { ChevronLeft16Regular } from '@fluentui/react-icons/svg/chevron-left'
import { ChevronRight16Regular } from '@fluentui/react-icons/svg/chevron-right'
import { useAppLocale } from '../localization/useAppLocale'
import { appDateToLocalDate } from './dateMath'
import type { AppDateValue } from './types'

export type CalendarMonthNavigation = { mode: 'year' | 'month'; year: number }

interface AppCalendarMonthNavigationProps {
  id: string
  navigation: CalendarMonthNavigation
  displayedMonth: AppDateValue
  earliestMonth: AppDateValue
  latestMonth: AppDateValue
  onChooseYear: (year: number) => void
  onChooseMonth: (month: AppDateValue) => void
  onBack: () => void
}

const YEARS_PER_PAGE = 12

export function AppCalendarMonthNavigation({
  id,
  navigation,
  displayedMonth,
  earliestMonth,
  latestMonth,
  onChooseYear,
  onChooseMonth,
  onBack,
}: AppCalendarMonthNavigationProps) {
  const {
    locale,
    messages: { datePicker: messages },
  } = useAppLocale()
  const { mode, year } = navigation
  const [yearInput, setYearInput] = useState(String(year))
  const [invalidYear, setInvalidYear] = useState(false)
  const [yearPage, setYearPage] = useState(() =>
    Math.floor((year - earliestMonth.year) / YEARS_PER_PAGE),
  )
  const inputRef = useRef<HTMLInputElement>(null)
  const monthRef = useRef<HTMLButtonElement>(null)
  const errorId = useId()
  const lastPage = Math.floor((latestMonth.year - earliestMonth.year) / YEARS_PER_PAGE)
  const currentPage = Math.min(yearPage, lastPage)
  const firstYear = earliestMonth.year + currentPage * YEARS_PER_PAGE
  const yearFormatter = new Intl.NumberFormat(locale, { useGrouping: false })
  const monthFormatter = new Intl.DateTimeFormat(locale, {
    calendar: 'gregory',
    month: 'short',
  })
  const fullMonthFormatter = new Intl.DateTimeFormat(locale, {
    calendar: 'gregory',
    month: 'long',
  })
  const minMonth = year === earliestMonth.year ? earliestMonth.month : 1
  const maxMonth = year === latestMonth.year ? latestMonth.month : 12
  const focusedMonth = Math.max(minMonth, Math.min(displayedMonth.month, maxMonth))

  useEffect(() => {
    if (mode === 'year') {
      inputRef.current?.focus({ preventScroll: true })
      inputRef.current?.select()
    } else {
      monthRef.current?.focus({ preventScroll: true })
    }
  }, [mode, year])

  const submitYear = () => {
    const input = yearInput.trim().normalize('NFKC')
    const nextYear = Number(input)
    if (
      !/^\d{1,4}$/.test(input) ||
      nextYear < earliestMonth.year ||
      nextYear > latestMonth.year
    ) {
      setInvalidYear(true)
      inputRef.current?.focus({ preventScroll: true })
      return
    }
    onChooseYear(nextYear)
  }

  return (
    <div
      aria-label={
        mode === 'year'
          ? messages.chooseYear
          : `${messages.chooseMonth} · ${yearFormatter.format(year)}`
      }
      className="app-calendar__chooser"
      id={id}
      role="group"
    >
      {mode === 'year' ? (
        <>
          <div className="app-calendar__year-entry">
            <input
              aria-describedby={invalidYear ? errorId : undefined}
              aria-invalid={invalidYear || undefined}
              aria-label={messages.chooseYear}
              className="app-calendar__year-input app-input-frame"
              inputMode="numeric"
              onChange={(event) => {
                setYearInput(event.target.value)
                setInvalidYear(false)
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
                  event.preventDefault()
                  submitYear()
                }
              }}
              ref={inputRef}
              type="text"
              value={yearInput}
            />
            <button className="app-calendar__option" onClick={submitYear} type="button">
              {messages.goToYear}
            </button>
          </div>
          {invalidYear && (
            <div className="app-calendar__year-error" id={errorId} role="alert">
              {messages.invalidYear(
                yearFormatter.format(earliestMonth.year),
                yearFormatter.format(latestMonth.year),
              )}
            </div>
          )}
          <div className="app-calendar__year-pages">
            <button
              aria-label={messages.previousYears}
              className="app-calendar__nav"
              disabled={currentPage === 0}
              onClick={() => setYearPage(currentPage - 1)}
              type="button"
            >
              <ChevronLeft16Regular aria-hidden="true" />
            </button>
            <div className="app-calendar__choices">
              {Array.from(
                { length: Math.min(YEARS_PER_PAGE, latestMonth.year - firstYear + 1) },
                (_, index) => {
                  const option = firstYear + index
                  return (
                    <button
                      aria-current={option === year ? 'date' : undefined}
                      className="app-calendar__option"
                      key={option}
                      onClick={() => onChooseYear(option)}
                      type="button"
                    >
                      {yearFormatter.format(option)}
                    </button>
                  )
                },
              )}
            </div>
            <button
              aria-label={messages.nextYears}
              className="app-calendar__nav"
              disabled={currentPage === lastPage}
              onClick={() => setYearPage(currentPage + 1)}
              type="button"
            >
              <ChevronRight16Regular aria-hidden="true" />
            </button>
          </div>
        </>
      ) : (
        <div className="app-calendar__choices">
          {Array.from({ length: 12 }, (_, index) => {
            const month = index + 1
            const value = { year, month, day: 1 }
            const date = appDateToLocalDate(value)
            return (
              <button
                aria-current={
                  year === displayedMonth.year && month === displayedMonth.month
                    ? 'date'
                    : undefined
                }
                aria-label={fullMonthFormatter.format(date)}
                className="app-calendar__option"
                disabled={month < minMonth || month > maxMonth}
                key={month}
                onClick={() => onChooseMonth(value)}
                ref={month === focusedMonth ? monthRef : undefined}
                type="button"
              >
                {monthFormatter.format(date)}
              </button>
            )
          })}
        </div>
      )}
      <button
        className="app-calendar__option app-calendar__back"
        onClick={onBack}
        type="button"
      >
        {messages.backToCalendar}
      </button>
    </div>
  )
}
