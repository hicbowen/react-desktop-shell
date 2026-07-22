// @vitest-environment jsdom
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppLoadingOverlay } from './AppLoadingOverlay'
describe('AppLoadingOverlay', () => { let host: HTMLDivElement; let root: Root
  beforeEach(() => { host = document.createElement('div'); document.body.append(host); root = createRoot(host) })
  afterEach(() => { act(() => root.unmount()); host.remove() })
  it('configures delayed reveal without changing content layout', () => { act(() => root.render(<AppLoadingOverlay delay={200} loading><span>Content</span></AppLoadingOverlay>)); expect((host.querySelector('[role="status"]') as HTMLElement).style.getPropertyValue('--app-loading-overlay-delay')).toBe('200ms'); act(() => root.render(<AppLoadingOverlay delay={200} loading={false}><span>Content</span></AppLoadingOverlay>)); expect(host.querySelector('[role="status"]')).toBeNull() })
  it('requests cancellation', () => { const cancel = vi.fn(); act(() => root.render(<AppLoadingOverlay delay={0} loading onCancel={cancel}><span /></AppLoadingOverlay>)); act(() => host.querySelector('button')!.click()); expect(cancel).toHaveBeenCalled() })
})
