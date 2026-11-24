import { useEffect, useRef, useState } from 'react'
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
}: AppCalendarMonthNavigationProps) {
  const {
    locale,
    messages: { datePicker: messages },
  } = useAppLocale()
  const { mode, year } = navigation
  const [yearPage, setYearPage] = useState(() =>
    Math.floor((year - earliestMonth.year) / YEARS_PER_PAGE),
  )
  const preferredOptionRef = useRef<HTMLButtonElement>(null)
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
    preferredOptionRef.current?.focus({ preventScroll: true })
  }, [mode, year])

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
                    ref={option === year ? preferredOptionRef : undefined}
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
                ref={month === focusedMonth ? preferredOptionRef : undefined}
                type="button"
              >
                {monthFormatter.format(date)}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
