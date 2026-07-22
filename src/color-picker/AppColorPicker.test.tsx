// @vitest-environment jsdom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppColorPickerPanel } from './AppColorPicker'
import { hexToHsv, hsvToHex, normalizeHexColor } from './colorMath'

describe('color math', () => {
  it('normalizes short and long hex colors', () => { expect(normalizeHexColor('#0af')).toBe('#00AAFF'); expect(normalizeHexColor('bad color')).toBeNull() })
  it('round trips primary colors', () => { expect(hsvToHex(hexToHsv('#0078D4'))).toBe('#0078D4') })
})

describe('AppColorPickerPanel', () => {
  let container: HTMLDivElement
  let root: Root
  beforeEach(() => { container = document.createElement('div'); document.body.append(container); root = createRoot(container) })
  afterEach(() => { act(() => root.unmount()); container.remove() })

  it('selects a normalized preset', () => {
    const onValueChange = vi.fn()
    act(() => root.render(<AppColorPickerPanel onValueChange={onValueChange} presets={['#f00']} />))
    act(() => container.querySelector<HTMLButtonElement>('[aria-label="#FF0000"]')!.click())
    expect(onValueChange).toHaveBeenCalledWith('#FF0000')
  })

  it('supports keyboard saturation changes', () => {
    const onValueChange = vi.fn()
    act(() => root.render(<AppColorPickerPanel onValueChange={onValueChange} value="#808080" />))
    act(() => container.querySelector<HTMLElement>('[role="slider"]')!.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight' })))
    expect(onValueChange).toHaveBeenCalled()
  })

  it('keeps hue stable while saturation and brightness change', () => {
    act(() => root.render(<AppColorPickerPanel defaultValue="#1A1C75" />))
    const surface = container.querySelector<HTMLElement>('[role="slider"]')!
    const initialHue = surface.style.getPropertyValue('--app-color-picker-hue')
    act(() => {
      for (let index = 0; index < 12; index += 1) {
        surface.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowLeft' }))
      }
    })
    expect(surface.style.getPropertyValue('--app-color-picker-hue')).toBe(initialHue)
  })
})
