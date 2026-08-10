// @vitest-environment jsdom
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DemoI18nContext, demoMessages } from '../../i18n/DemoI18nContext'
import { AppSelectorBarPage } from './NavigationPages'

describe('AppSelectorBarPage', () => {
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

  it('switches panel lifecycle strategies in one shared preview', () => {
    act(() => root.render(
      <DemoI18nContext.Provider value={{ locale: 'en-US', messages: demoMessages['en-US'] }}>
        <AppSelectorBarPage />
      </DemoI18nContext.Provider>,
    ))

    const titles = Array.from(container.querySelectorAll('.demo-section h2')).map((heading) => heading.textContent)
    expect(titles).toEqual(['Text', 'Icon and text', 'Disabled item', 'Icons', 'Task view', 'Panel lifecycle', 'Panel animation'])

    const lifecycleSection = container.querySelectorAll('.demo-section')[5]!
    const control = lifecycleSection.querySelector('[role="radiogroup"]')!
    const panels = lifecycleSection.querySelector('.app-selector-panels')!
    expect(panels.getAttribute('data-motion')).toBe('none')
    expect(lifecycleSection.querySelectorAll('.app-selector-panel')).toHaveLength(1)

    act(() => control.querySelectorAll<HTMLInputElement>('input')[1]?.click())

    expect(panels.getAttribute('data-motion')).toBe('none')
    expect(lifecycleSection.querySelectorAll('.app-selector-panel')).toHaveLength(2)

    const animationSection = container.querySelectorAll('.demo-section')[6]!
    const animationControl = animationSection.querySelector('[role="radiogroup"]')!
    const animationPanels = animationSection.querySelector('.app-selector-panels')!
    expect(animationPanels.getAttribute('data-motion')).toBe('entrance')

    act(() => animationControl.querySelectorAll<HTMLInputElement>('input')[2]?.click())

    expect(animationPanels.getAttribute('data-motion')).toBe('directional')
  })
})
