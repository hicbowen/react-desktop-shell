// @vitest-environment jsdom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppPromptSuggestions, type AppPromptSuggestion } from './AppPromptSuggestions'

describe('AppPromptSuggestions', () => {
  let host: HTMLDivElement
  let root: Root

  beforeEach(() => {
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)
  })

  afterEach(() => {
    act(() => root.unmount())
    host.remove()
  })

  const items: AppPromptSuggestion[] = [
    {
      id: 'summarize',
      label: 'Summarize this page',
      description: 'Get the key points.',
      prompt: 'Summarize this page',
    },
    {
      id: 'disabled',
      label: 'Unavailable action',
      prompt: 'Unavailable action',
      disabled: true,
    },
  ]

  it('renders an accessible suggestion list with labels and descriptions', () => {
    act(() =>
      root.render(<AppPromptSuggestions items={items} onSelect={() => undefined} />),
    )

    const list = host.querySelector('[role="list"]')
    expect(list?.getAttribute('aria-label')).toBe('Prompt suggestions')
    expect(host.querySelectorAll('[role="listitem"]')).toHaveLength(2)
    expect(host.textContent).toContain('Summarize this page')
    expect(host.textContent).toContain('Get the key points.')
    expect(host.querySelector<HTMLButtonElement>('[data-suggestion-id="disabled"]')?.disabled).toBe(true)
  })

  it('reports the selected item and ignores disabled suggestions', () => {
    const onSelect = vi.fn()
    act(() =>
      root.render(<AppPromptSuggestions items={items} onSelect={onSelect} />),
    )

    act(() =>
      host.querySelector<HTMLButtonElement>('[data-suggestion-id="summarize"]')?.click(),
    )
    act(() =>
      host.querySelector<HTMLButtonElement>('[data-suggestion-id="disabled"]')?.click(),
    )

    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith(items[0])
  })

  it('supports a custom label and a disabled group', () => {
    act(() =>
      root.render(
        <AppPromptSuggestions
          ariaLabel="Suggested prompts"
          disabled
          items={items}
          onSelect={() => undefined}
          size="compact"
        />,
      ),
    )

    expect(host.querySelector('[aria-label="Suggested prompts"]')).not.toBeNull()
    expect(host.querySelector('.app-prompt-suggestions--compact')).not.toBeNull()
    expect(host.querySelectorAll('button:disabled')).toHaveLength(2)
  })
})
