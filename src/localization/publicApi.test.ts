import { describe, expect, it } from 'vitest'
import type {
  AppDatePickerProps,
  AppDateRangePickerProps,
  AppShellProps,
  AppStatusBadgeProps,
  AppTimePickerProps,
} from '../index'

const supportedShellProps: AppShellProps[] = [
  { locale: 'system' },
  { locale: 'zh-CN' },
  { locale: 'en-US' },
]

const removedDateLocale: AppDatePickerProps = {
  // @ts-expect-error Locale is configured only through AppShell.
  locale: 'zh-CN',
}

const removedDateLocaleText: AppDatePickerProps = {
  // @ts-expect-error Built-in messages are not overridden per component.
  localeText: { placeholder: 'Date' },
}

const removedTimeHourCycle: AppTimePickerProps = {
  // @ts-expect-error Hour cycle follows the resolved AppShell locale.
  hourCycle: 24,
}

const removedRangePlaceholder: AppDateRangePickerProps = {
  // @ts-expect-error Range placeholders follow the resolved AppShell locale.
  startPlaceholder: 'Start date',
}

const removedStatusLabel: AppStatusBadgeProps = {
  children: 'Ready',
  // @ts-expect-error Built-in status names follow the resolved AppShell locale.
  statusLabel: 'Success',
}

describe('public localization API', () => {
  it('accepts only the supported AppShell locale values', () => {
    expect(supportedShellProps.map(({ locale }) => locale)).toEqual([
      'system',
      'zh-CN',
      'en-US',
    ])
    expect([
      removedDateLocale,
      removedDateLocaleText,
      removedTimeHourCycle,
      removedRangePlaceholder,
      removedStatusLabel,
    ]).toHaveLength(5)
  })
})
