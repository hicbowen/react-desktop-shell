// @vitest-environment jsdom

import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { describe, expect, it } from 'vitest'
import { AppDivider, AppSeparator } from './AppDivider'

describe('AppDivider', () => {
  it('renders semantic horizontal and vertical separators', () => {
    const host = document.createElement('div')
    const root = createRoot(host)
    act(() => root.render(<><AppDivider>Details</AppDivider><AppSeparator orientation="vertical" /></>))
    const separators = host.querySelectorAll('[role="separator"]')
    expect(separators[0].getAttribute('aria-orientation')).toBe('horizontal')
    expect(separators[0].textContent).toBe('Details')
    expect(separators[1].getAttribute('aria-orientation')).toBe('vertical')
    expect(separators[1].textContent).toBe('')
    act(() => root.unmount())
  })
})
