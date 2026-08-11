// @vitest-environment jsdom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppWizard } from './AppWizard'
import type { AppWizardStep } from './types'

const steps: AppWizardStep[] = [
  { key: 'start', title: 'Start', description: 'Start here', content: 'First content' },
  { key: 'details', title: 'Details', content: 'Second content' },
  { key: 'review', title: 'Review', content: 'Final content' },
]

describe('AppWizard', () => {
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

  const render = (
    props: Partial<React.ComponentProps<typeof AppWizard>> = {},
  ) => {
    act(() => root.render(<AppWizard onComplete={vi.fn()} steps={steps} {...props} />))
  }

  const currentStep = () => container.querySelector('[aria-current="step"]')
  const button = (...labels: string[]) => Array.from(
    container.querySelectorAll<HTMLButtonElement>('button'),
  ).find((node) => labels.includes(node.textContent?.trim() ?? ''))!

  it('renders the first step by default', () => {
    render()

    expect(currentStep()?.textContent).toContain('Start')
    expect(container.querySelector('h2')?.textContent).toBe('Start')
    expect(container.textContent).toContain('First content')
  })

  it('uses AppScrollArea for the desktop step list', () => {
    render()

    const scrollArea = container.querySelector('.app-wizard__steps-scroll')
    expect(scrollArea?.classList).toContain('app-scroll-area')
    expect(scrollArea?.getAttribute('data-orientation')).toBe('vertical')
    expect(scrollArea?.querySelector('.app-wizard__step-list')).toBeTruthy()
  })

  it('scrolls the active step only when it leaves the visible area', () => {
    const scrollBy = vi.fn()
    const originalScrollBy = HTMLElement.prototype.scrollBy
    Object.defineProperty(HTMLElement.prototype, 'scrollBy', {
      configurable: true,
      value: scrollBy,
    })

    try {
      render()

      const viewport = container.querySelector<HTMLElement>(
        '.app-wizard__steps-scroll .app-scroll-area__viewport',
      )!
      const secondStep = container.querySelectorAll<HTMLLIElement>(
        '.app-wizard__step',
      )[1]
      vi.spyOn(viewport, 'getBoundingClientRect').mockReturnValue({
        bottom: 100,
        height: 100,
        top: 0,
      } as DOMRect)
      vi.spyOn(secondStep, 'getBoundingClientRect').mockReturnValue({
        bottom: 120,
        height: 40,
        top: 80,
      } as DOMRect)

      expect(scrollBy).not.toHaveBeenCalled()
      act(() => button('Next', '下一步').click())

      expect(scrollBy).toHaveBeenCalledWith({
        behavior: 'smooth',
        top: 28,
      })
    } finally {
      Object.defineProperty(HTMLElement.prototype, 'scrollBy', {
        configurable: true,
        value: originalScrollBy,
      })
    }
  })

  it('moves through steps and back in uncontrolled mode', () => {
    render()

    act(() => button('Next', '下一步').click())
    expect(currentStep()?.textContent).toContain('Details')

    act(() => button('Back', '上一步').click())
    expect(currentStep()?.textContent).toContain('Start')
  })

  it('reports changes without changing a controlled value', () => {
    const onValueChange = vi.fn()
    render({ onValueChange, value: 'start' })

    act(() => button('Next', '下一步').click())

    expect(onValueChange).toHaveBeenCalledWith('details')
    expect(currentStep()?.textContent).toContain('Start')
  })

  it('allows the current step to stop the next transition', async () => {
    const onNext = vi.fn(() => false)
    render({ onNext })

    await act(async () => {
      button('Next', '下一步').click()
    })

    expect(onNext).toHaveBeenCalledWith(steps[0])
    expect(currentStep()?.textContent).toContain('Start')
  })

  it('waits for an asynchronous next guard', async () => {
    let resolve: (value: boolean) => void = () => undefined
    const onNext = vi.fn(() => new Promise<boolean>((next) => { resolve = next }))
    render({ onNext })

    act(() => button('Next', '下一步').click())
    expect(button('Next', '下一步').disabled).toBe(true)

    await act(async () => {
      resolve(true)
      await Promise.resolve()
    })

    expect(currentStep()?.textContent).toContain('Details')
  })

  it('shows the complete action on the final step', () => {
    const onComplete = vi.fn()
    render({ defaultValue: 'review', onComplete })

    expect(button('Finish', '完成')).toBeTruthy()
    act(() => button('Finish', '完成').click())
    expect(onComplete).toHaveBeenCalledOnce()
  })

  it('only renders cancel when a cancel handler is provided', () => {
    render()
    expect(button('Cancel', '取消')).toBeUndefined()

    const onCancel = vi.fn()
    render({ onCancel })
    act(() => button('Cancel', '取消').click())
    expect(onCancel).toHaveBeenCalledOnce()
  })
})
