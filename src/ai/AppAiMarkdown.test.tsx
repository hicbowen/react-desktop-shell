// @vitest-environment jsdom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppAiMarkdown } from './AppAiMarkdown'
import {
  highlightMarkdownCode,
  resolveMarkdownLanguage,
} from './markdownHighlight'

describe('AppAiMarkdown', () => {
  let host: HTMLDivElement
  let root: Root

  beforeEach(() => {
    ;(
      globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
    ).IS_REACT_ACT_ENVIRONMENT = true
    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)
  })

  afterEach(() => {
    act(() => root.unmount())
    host.remove()
  })

  const renderMarkdown = (
    props: Partial<React.ComponentProps<typeof AppAiMarkdown>> = {},
  ) => {
    act(() =>
      root.render(<AppAiMarkdown content="A plain response" {...props} />),
    )
  }

  it('renders GFM content and skips raw HTML', () => {
    renderMarkdown({
      content: [
        '# Summary',
        '',
        '- [x] Reviewed',
        '- [ ] Follow up',
        '',
        '| State | Owner |',
        '| --- | --- |',
        '| Ready | Host |',
        '',
        '<script>alert(1)</script>',
      ].join('\n'),
    })

    expect(host.querySelector('h1')?.textContent).toBe('Summary')
    expect(host.querySelectorAll('table tbody tr')).toHaveLength(1)
    expect(host.querySelectorAll('input[type="checkbox"]')).toHaveLength(2)
    expect(host.querySelector('script')).toBeNull()
    expect(host.textContent).not.toContain('alert(1)')
  })

  it('sanitizes unsafe links and opens http links in a new tab', () => {
    renderMarkdown({
      content: '[unsafe](javascript:alert(1)) [safe](https://example.com/docs)',
    })

    const links = host.querySelectorAll('a')
    expect(links).toHaveLength(2)
    expect(links[0]?.getAttribute('href')).not.toContain('javascript:')
    expect(links[1]?.getAttribute('target')).toBe('_blank')
    expect(links[1]?.getAttribute('rel')).toBe('noreferrer')
  })

  it('copies fenced code and reports the temporary copied state', async () => {
    const onCopyCode = vi.fn().mockResolvedValue(undefined)
    renderMarkdown({
      content: '```ts\nconst answer = 42\n```',
      onCopyCode,
    })

    const button = host.querySelector<HTMLButtonElement>(
      'button[aria-label="Copy code"]',
    )!
    await act(async () => button.click())

    expect(onCopyCode).toHaveBeenCalledWith('const answer = 42')
    expect(button.getAttribute('aria-label')).toBe('Code copied')
    expect(
      host.querySelector('.app-ai-markdown__code-header')?.textContent,
    ).toContain('ts')
  })

  it('highlights supported fenced code asynchronously', async () => {
    const highlighted = await highlightMarkdownCode(
      'const answer = 42',
      'typescript',
    )

    expect(highlighted).toContain('shiki')
    expect(highlighted).toContain('--app-ai-markdown-shiki-light:')

    renderMarkdown({
      content: '```ts\nconst answer = 42\n```',
    })

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 150))
    })

    expect(host.querySelector('.app-ai-markdown__highlighted-code .shiki'))
      .not.toBeNull()
    expect(host.querySelector('.app-ai-markdown__code-header')).not.toBeNull()
  })

  it.each([
    ['c#', 'csharp'],
    ['cs', 'csharp'],
    ['docker', 'dockerfile'],
    ['dockerfile', 'dockerfile'],
    ['gql', 'graphql'],
    ['graphql', 'graphql'],
    ['kt', 'kotlin'],
    ['kts', 'kotlin'],
    ['ps', 'powershell'],
    ['ps1', 'powershell'],
    ['pwsh', 'powershell'],
    ['rb', 'ruby'],
    ['rs', 'rust'],
  ])('resolves the %s language alias', (alias, language) => {
    expect(resolveMarkdownLanguage(alias)).toBe(language)
  })

  it('can disable syntax highlighting while keeping the plain code block', () => {
    renderMarkdown({
      content: '```ts\nconst answer = 42\n```',
      highlightCode: false,
    })

    expect(host.querySelector('.app-ai-markdown__highlighted-code')).toBeNull()
    expect(host.querySelector('pre')).not.toBeNull()
  })

  it('supports custom markdown elements and disabling code copy', () => {
    renderMarkdown({
      components: {
        h2: ({ children }) => <h2 data-testid="custom-heading">{children}</h2>,
      },
      content: '## Custom\n\n```\nplain\n```',
      copyCode: false,
    })

    expect(host.querySelector('[data-testid="custom-heading"]')).not.toBeNull()
    expect(host.querySelector('.app-ai-markdown__code-header')).toBeNull()
    expect(host.querySelector('pre')).not.toBeNull()
  })
})
