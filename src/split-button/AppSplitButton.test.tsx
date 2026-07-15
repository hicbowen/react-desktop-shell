// @vitest-environment jsdom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppSplitButton } from './AppSplitButton'

const items = [
  { key: 'pdf', label: 'Export PDF' },
  { key: 'image', label: 'Export image' },
]

describe('AppSplitButton', () => {
  let container: HTMLDivElement
  let root: Root
  let frames: FrameRequestCallback[]

  beforeEach(() => {
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
      .IS_REACT_ACT_ENVIRONMENT = true
    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)
    frames = []
    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn((callback: FrameRequestCallback) => {
        frames.push(callback)
        return frames.length
      }),
    )
    vi.stubGlobal('cancelAnimationFrame', vi.fn())
    vi.stubGlobal('innerWidth', 800)
    vi.stubGlobal('innerHeight', 600)
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      bottom: 132,
      height: 32,
      left: 300,
      right: 332,
      top: 100,
      width: 32,
    } as DOMRect)
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  const renderSplitButton = (
    props: Partial<React.ComponentProps<typeof AppSplitButton>> = {},
  ) =>
    act(() =>
      root.render(
        <AppSplitButton label="Export" items={items} {...props} />,
      ),
    )
  const buttons = () =>
    container.querySelectorAll<HTMLButtonElement>('.app-split-button button')
  const primary = () => buttons()[0]!
  const menuTrigger = () => buttons()[1]!
  const menu = () => document.body.querySelector<HTMLElement>('[role="menu"]')
  const click = (element: HTMLElement) =>
    act(() => element.dispatchEvent(new MouseEvent('click', { bubbles: true })))
  const flushMeasurement = () => {
    const callbacks = frames.splice(0)
    act(() => callbacks.forEach((callback) => callback(0)))
  }

  it('runs the primary action from the left button', () => {
    const onClick = vi.fn()
    renderSplitButton({ onClick })
    click(primary())
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('opens the flyout from the right button and forwards placement', () => {
    renderSplitButton({ placement: 'top-start' })
    click(menuTrigger())
    expect(menu()).not.toBeNull()
    expect(menu()?.dataset.placement).toBe('top-start')
  })

  it('forwards menu selection and restores menu-trigger focus', () => {
    const onSelect = vi.fn()
    renderSplitButton({ onSelect })
    click(menuTrigger())
    flushMeasurement()
    const firstItem = menu()?.querySelector<HTMLButtonElement>('[role="menuitem"]')
    click(firstItem!)

    expect(onSelect).toHaveBeenCalledWith('pdf')
    expect(menu()).toBeNull()
    expect(document.activeElement).toBe(menuTrigger())
  })

  it('disables both actions when the whole control is disabled', () => {
    const onClick = vi.fn()
    renderSplitButton({ disabled: true, onClick })
    expect(primary().disabled).toBe(true)
    expect(menuTrigger().disabled).toBe(true)
    click(primary())
    click(menuTrigger())
    expect(onClick).not.toHaveBeenCalled()
    expect(menu()).toBeNull()
  })

  it('keeps the primary action available when only the menu is disabled', () => {
    const onClick = vi.fn()
    renderSplitButton({ menuDisabled: true, onClick })
    expect(primary().disabled).toBe(false)
    expect(menuTrigger().disabled).toBe(true)
    click(primary())
    click(menuTrigger())
    expect(onClick).toHaveBeenCalledOnce()
    expect(menu()).toBeNull()
  })

  it('uses the custom menu label on the trigger and menu', () => {
    renderSplitButton({ menuAriaLabel: 'Export formats' })
    expect(menuTrigger().getAttribute('aria-label')).toBe('Export formats')
    click(menuTrigger())
    expect(menu()?.getAttribute('aria-label')).toBe('Export formats')
  })

  it('renders an optional icon and keeps both buttons in the tab order', () => {
    renderSplitButton({ icon: <span data-testid="export-icon" /> })
    expect(primary().querySelector('[data-testid="export-icon"]')).not.toBeNull()
    expect(primary().tabIndex).toBe(0)
    expect(menuTrigger().tabIndex).toBe(0)

    act(() => primary().focus())
    expect(document.activeElement).toBe(primary())
    act(() => menuTrigger().focus())
    expect(document.activeElement).toBe(menuTrigger())
  })
})
