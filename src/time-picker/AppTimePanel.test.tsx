// @vitest-environment jsdom

import { act, useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppTimePanel } from './AppTimePanel'
import type { AppTimeValue } from './types'

function Harness({
  initial = { hour: 9, minute: 30 },
  step = 5,
  hourCycle = 24,
  minValue,
  maxValue,
  readOnly = false,
  autoFocus = false,
  onChange,
}: {
  initial?: AppTimeValue
  step?: number
  hourCycle?: 12 | 24
  minValue?: AppTimeValue
  maxValue?: AppTimeValue
  readOnly?: boolean
  autoFocus?: boolean
  onChange?: (value: AppTimeValue) => void
}) {
  const [value, setValue] = useState(initial)
  return (
    <AppTimePanel
      autoFocus={autoFocus}
      hourCycle={hourCycle}
      hourLabel="Hour"
      locale="en-US"
      maxValue={maxValue}
      minValue={minValue}
      minuteLabel="Minute"
      minuteStep={step}
      onValueChange={(next) => {
        setValue(next)
        onChange?.(next)
      }}
      readOnly={readOnly}
      value={value}
    />
  )
}

describe('AppTimePanel', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
      .IS_REACT_ACT_ENVIRONMENT = true
    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: vi.fn(),
    })
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
    vi.restoreAllMocks()
  })

  const render = (node: React.ReactNode) =>
    act(() => root.render(node))
  const lists = () =>
    container.querySelectorAll<HTMLElement>('[role="listbox"]')
  const options = (column: number) =>
    lists()[column]!.querySelectorAll<HTMLButtonElement>('[role="option"]')
  const selected = (column: number) =>
    lists()[column]!.querySelector<HTMLButtonElement>(
      '[aria-selected="true"]',
    )!
  const keyDown = (column: number, key: string) =>
    act(() =>
      selected(column).dispatchEvent(
        new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          key,
        }),
      ),
    )

  it('renders 24 hours and minuteStep options with one tab stop per column', () => {
    render(<Harness step={5} />)
    expect(options(0)).toHaveLength(24)
    expect(options(1)).toHaveLength(12)
    expect(selected(0).textContent).toBe('09')
    expect(selected(1).textContent).toBe('30')
    expect(container.querySelectorAll('[tabindex="0"]')).toHaveLength(2)
  })

  it('formats 12-hour labels while retaining 24-hour values', () => {
    render(<Harness hourCycle={12} initial={{ hour: 18, minute: 30 }} />)
    expect(selected(0).textContent).toBe('6 PM')
  })

  it('disables hours and minutes outside min/max combinations', () => {
    render(
      <Harness
        initial={{ hour: 9, minute: 30 }}
        maxValue={{ hour: 10, minute: 15 }}
        minValue={{ hour: 9, minute: 30 }}
      />,
    )
    expect(options(0)[8]?.disabled).toBe(true)
    expect(options(0)[11]?.disabled).toBe(true)
    expect(options(1)[5]?.disabled).toBe(true)
    expect(options(1)[6]?.disabled).toBe(false)

    act(() => options(0)[10]!.click())
    expect(selected(0).textContent).toBe('10')
    expect(options(1)[3]?.disabled).toBe(false)
    expect(options(1)[4]?.disabled).toBe(true)
  })

  it('selects options by click and keyboard navigation', () => {
    const change = vi.fn()
    render(<Harness onChange={change} />)
    act(() => options(0)[10]!.click())
    expect(change).toHaveBeenLastCalledWith({ hour: 10, minute: 30 })
    keyDown(1, 'ArrowDown')
    expect(change).toHaveBeenLastCalledWith({ hour: 10, minute: 35 })
    keyDown(1, 'Home')
    expect(change).toHaveBeenLastCalledWith({ hour: 10, minute: 0 })
    keyDown(1, 'End')
    expect(change).toHaveBeenLastCalledWith({ hour: 10, minute: 55 })
  })

  it('moves focus between columns with Left and Right', async () => {
    render(<Harness />)
    act(() => selected(0).focus())
    keyDown(0, 'ArrowRight')
    await act(async () => Promise.resolve())
    expect(document.activeElement).toBe(selected(1))
    keyDown(1, 'ArrowLeft')
    await act(async () => Promise.resolve())
    expect(document.activeElement).toBe(selected(0))
  })

  it('focuses the selected hour only when autoFocus is enabled', () => {
    render(<Harness />)
    expect(document.activeElement).not.toBe(selected(0))

    render(<Harness autoFocus />)
    expect(document.activeElement).toBe(selected(0))
  })

  it('normalizes off-step values without changing read-only values', () => {
    const change = vi.fn()
    render(
      <Harness
        initial={{ hour: 9, minute: 28 }}
        onChange={change}
        step={5}
      />,
    )
    expect(change).toHaveBeenCalledWith({ hour: 9, minute: 30 })

    change.mockClear()
    render(
      <Harness
        initial={{ hour: 9, minute: 28 }}
        key="readonly"
        onChange={change}
        readOnly
        step={5}
      />,
    )
    act(() => options(0)[10]!.click())
    expect(change).not.toHaveBeenCalled()
  })
})
