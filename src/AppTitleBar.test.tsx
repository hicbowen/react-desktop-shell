import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { AppTitleBar } from './AppTitleBar'

describe('AppTitleBar', () => {
  it('renders centered content between the leading and trailing regions', () => {
    const markup = renderToStaticMarkup(
      <AppTitleBar
        actions={<button type="button">Action</button>}
        center={<button type="button">Workspace</button>}
        title="Document"
      />,
    )

    const leftIndex = markup.indexOf('app-title-bar__left')
    const centerIndex = markup.indexOf('app-title-bar__center')
    const rightIndex = markup.indexOf('app-title-bar__right')

    expect(leftIndex).toBeGreaterThanOrEqual(0)
    expect(centerIndex).toBeGreaterThan(leftIndex)
    expect(rightIndex).toBeGreaterThan(centerIndex)
    expect(markup).toContain('Workspace')
  })

  it('uses custom leading content instead of its own title and icon', () => {
    const markup = renderToStaticMarkup(
      <AppTitleBar
        icon={<span>Fallback icon</span>}
        leading={<div data-leading>App identity</div>}
        title="Fallback title"
      />,
    )

    expect(markup).toContain('app-title-bar__left--slot')
    expect(markup).toContain('data-leading="true"')
    expect(markup).toContain('App identity')
    expect(markup).not.toContain('Fallback icon')
    expect(markup).not.toContain('Fallback title')
  })
})
