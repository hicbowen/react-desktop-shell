// @vitest-environment jsdom

import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { AppTeachingTipPage } from './TeachingTipPage'

describe('AppTeachingTipPage', () => {
  const containers: HTMLDivElement[] = []

  afterEach(() => {
    containers.splice(0).forEach((container) => container.remove())
  })

  it('uses a labelled non-focusable group for the split-button anchor', () => {
    const container = document.createElement('div')
    containers.push(container)
    document.body.append(container)
    const root = createRoot(container)

    act(() => root.render(<AppTeachingTipPage />))
    const anchor = container.querySelector<HTMLElement>(
      '.demo-teaching-tip-anchor',
    )
    expect(anchor?.getAttribute('role')).toBe('group')
    expect(anchor?.getAttribute('aria-label')).toBe('Export options')
    expect(anchor?.hasAttribute('tabindex')).toBe(false)
    act(() => root.unmount())
  })
})
