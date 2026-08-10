// @vitest-environment jsdom
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DemoI18nContext, demoMessages } from '../../i18n/DemoI18nContext'
import { AppScrollAreaPage } from './ScrollAreaPage'

describe('AppScrollAreaPage', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
  })

  it('combines direction modes while keeping comparison and scenario sections separate', () => {
    act(() => root.render(
      <DemoI18nContext.Provider value={{ locale: 'en-US', messages: demoMessages['en-US'] }}>
        <AppScrollAreaPage />
      </DemoI18nContext.Provider>,
    ))

    const titles = Array.from(container.querySelectorAll('.demo-section h2')).map((heading) => heading.textContent)
    expect(titles).toEqual(['Orientation', 'Scrollbar modes', 'Gutter stability', 'Theme-aware surface', 'Inside a Card', 'Settings detail pane'])

    const directionSection = container.querySelector('.demo-section')!
    const control = directionSection.querySelector('[role="radiogroup"]')!
    expect(directionSection.querySelector('.app-scroll-area')?.getAttribute('data-orientation')).toBe('vertical')

    act(() => control.querySelectorAll<HTMLInputElement>('input')[2]?.click())

    expect(directionSection.querySelector('.app-scroll-area')?.getAttribute('data-orientation')).toBe('both')
  })
})
