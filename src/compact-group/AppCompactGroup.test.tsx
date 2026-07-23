// @vitest-environment jsdom
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppButton } from '../button'
import { AppNumberBox } from '../number-select'
import { AppCompactGroup, AppControlAddon } from './AppCompactGroup'

describe('AppCompactGroup', () => {
  let host: HTMLDivElement
  let root: ReturnType<typeof createRoot>

  beforeEach(() => {
    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)
  })

  afterEach(() => {
    act(() => root.unmount())
    host.remove()
  })

  it('groups controls without taking over their behavior', () => {
    const first = vi.fn()
    const second = vi.fn()
    act(() => root.render(
      <AppCompactGroup aria-label="History actions">
        <AppButton onClick={first}>Back</AppButton>
        <AppButton onClick={second}>Forward</AppButton>
      </AppCompactGroup>,
    ))

    const group = host.querySelector('.app-compact-group')
    const buttons = host.querySelectorAll('button')
    expect(group?.getAttribute('role')).toBe('group')
    expect(group?.getAttribute('aria-label')).toBe('History actions')
    expect(buttons[0]?.classList).toContain('app-compact-group__control')
    expect(buttons[1]?.classList).toContain('app-compact-group__control')
    act(() => buttons[0]?.click())
    expect(first).toHaveBeenCalledOnce()
    expect(second).not.toHaveBeenCalled()
  })

  it('combines addons and form controls', () => {
    act(() => root.render(
      <AppCompactGroup fullWidth>
        <AppControlAddon>Last</AppControlAddon>
        <AppNumberBox defaultValue={10} name="count" />
        <AppControlAddon>times</AppControlAddon>
      </AppCompactGroup>,
    ))

    const group = host.querySelector('.app-compact-group')
    const addons = host.querySelectorAll('.app-control-addon')
    const numberBox = host.querySelector('.app-number-box')
    const input = host.querySelector<HTMLInputElement>('input')
    expect(group?.classList).toContain('app-compact-group--full-width')
    expect(addons).toHaveLength(2)
    expect(numberBox?.classList).toContain('app-compact-group__control')
    expect(input?.name).toBe('count')
    expect(input?.value).toBe('10')
  })

  it('supports vertical composition and child class names', () => {
    act(() => root.render(
      <AppCompactGroup className="custom-group" direction="vertical">
        <AppButton className="custom-button">One</AppButton>
        <AppButton>Two</AppButton>
      </AppCompactGroup>,
    ))

    expect(host.querySelector('.app-compact-group')?.classList).toContain(
      'app-compact-group--vertical',
    )
    const firstButton = host.querySelector('button')
    expect(firstButton?.classList).toContain('custom-button')
    expect(firstButton?.classList).toContain('app-compact-group__control')
  })
})
