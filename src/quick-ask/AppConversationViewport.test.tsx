// @vitest-environment jsdom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppConversationViewport } from './AppConversationViewport'

describe('AppConversationViewport', () => {
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

  const renderViewport = (
    children: string,
    props: Partial<React.ComponentProps<typeof AppConversationViewport>> = {},
  ) => {
    act(() =>
      root.render(
        <AppConversationViewport {...props}>{children}</AppConversationViewport>,
      ),
    )
    return document.body.querySelector<HTMLDivElement>(
      '.app-conversation-viewport__viewport',
    )!
  }

  const defineScrollMetrics = (
    viewport: HTMLDivElement,
    metrics: { clientHeight: number; scrollHeight: number; scrollTop: number },
  ) => {
    let scrollTop = metrics.scrollTop
    Object.defineProperties(viewport, {
      clientHeight: {
        configurable: true,
        get: () => metrics.clientHeight,
      },
      scrollHeight: {
        configurable: true,
        get: () => metrics.scrollHeight,
      },
      scrollTop: {
        configurable: true,
        get: () => scrollTop,
        set: (value: number) => {
          scrollTop = value
        },
      },
    })
    return () => scrollTop
  }

  it('follows new content, pauses while reading, and jumps to latest', () => {
    const viewport = renderViewport('First message')
    const metrics = { clientHeight: 100, scrollHeight: 400, scrollTop: 0 }
    const getScrollTop = defineScrollMetrics(viewport, metrics)

    renderViewport('Second message')
    expect(getScrollTop()).toBe(400)

    viewport.scrollTop = 100
    act(() => viewport.dispatchEvent(new Event('scroll')))
    metrics.scrollHeight = 600
    renderViewport('Third message')
    expect(getScrollTop()).toBe(100)
    expect(
      document.body.querySelector('button')?.textContent,
    ).toContain('Jump to latest')

    metrics.scrollHeight = 700
    act(() => document.body.querySelector('button')?.click())
    expect(getScrollTop()).toBe(700)
    expect(document.body.querySelector('button')).toBeNull()
  })

  it('loads earlier messages and preserves the reading offset', () => {
    const onLoadOlder = vi.fn()
    const viewport = renderViewport('Current messages', {
      hasMore: true,
      onLoadOlder,
    })
    const metrics = { clientHeight: 100, scrollHeight: 500, scrollTop: 120 }
    const getScrollTop = defineScrollMetrics(viewport, metrics)
    act(() => viewport.dispatchEvent(new Event('scroll')))

    const load = document.body.querySelector<HTMLButtonElement>(
      'button',
    )!
    expect(load.textContent).toContain('Load earlier messages')
    act(() => load.click())
    expect(onLoadOlder).toHaveBeenCalledOnce()

    act(() =>
      root.render(
        <AppConversationViewport
          hasMore
          loadingOlder
          onLoadOlder={onLoadOlder}
        >
          Older and current messages
        </AppConversationViewport>,
      ),
    )
    metrics.scrollHeight = 700
    act(() =>
      root.render(
        <AppConversationViewport hasMore onLoadOlder={onLoadOlder}>
          Older and current messages
        </AppConversationViewport>,
      ),
    )
    expect(getScrollTop()).toBe(320)
  })

  it('can leave scroll ownership entirely with the host', () => {
    const viewport = renderViewport('First message', { followOutput: false })
    const metrics = { clientHeight: 100, scrollHeight: 500, scrollTop: 20 }
    const getScrollTop = defineScrollMetrics(viewport, metrics)

    renderViewport('Second message', { followOutput: false })
    expect(getScrollTop()).toBe(20)
    expect(document.body.querySelector('button')).toBeNull()
  })
})
