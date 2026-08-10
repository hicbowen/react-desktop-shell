// @vitest-environment jsdom
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { AppSettingsRow } from './AppSettingsRow'

describe('AppSettingsRow', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
  })

  it('can reserve an icon column for rows without an icon', () => {
    act(() => {
      root.render(
        <>
          <AppSettingsRow reserveIconSpace title="Without icon" />
          <AppSettingsRow icon={<span />} reserveIconSpace title="With icon" />
        </>,
      )
    })

    const rows = container.querySelectorAll('.app-settings-row')

    expect(rows[0]?.classList.contains('app-settings-row--icon-space')).toBe(true)
    expect(rows[0]?.querySelector('.app-settings-row__icon--placeholder')).not.toBeNull()
    expect(rows[1]?.querySelector('.app-settings-row__icon--placeholder')).toBeNull()
  })

  it('does not reserve an icon column by default', () => {
    act(() => root.render(<AppSettingsRow title="Without icon" />))

    expect(container.querySelector('.app-settings-row__icon')).toBeNull()
  })
})
