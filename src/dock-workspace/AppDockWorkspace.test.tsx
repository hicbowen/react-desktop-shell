// @vitest-environment jsdom
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { describe, expect, it } from 'vitest'
import { AppDockWorkspace } from './AppDockWorkspace'

describe('AppDockWorkspace', () => {
  it('minimizes, restores, resizes, and persists an uncontrolled layout', () => {
    const host = document.createElement('div')
    const root = createRoot(host)
    const values = new Map<string, string>()
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => { values.set(key, value) },
    }
    act(() => root.render(
      <AppDockWorkspace
        panels={[
          { key: 'files', title: 'Files', content: <div>File tree</div>, position: 'left' },
          { key: 'output', title: 'Output', content: <div>Build output</div>, position: 'bottom' },
        ]}
        persistenceKey="workspace"
        storage={storage}
      >
        <div>Editor</div>
      </AppDockWorkspace>,
    ))
    const leftSeparator = host.querySelector<HTMLElement>('[role="separator"][data-position="left"]')!
    act(() => leftSeparator.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight' })))
    expect(leftSeparator.getAttribute('aria-valuenow')).toBe('292')

    act(() => host.querySelector<HTMLButtonElement>('[aria-label="Minimize panel"]')?.click())
    expect(host.textContent).not.toContain('File tree')
    expect(host.textContent).toContain('Files')
    act(() => host.querySelector<HTMLButtonElement>('[aria-label="Restore files"]')?.click())
    expect(host.textContent).toContain('File tree')
    expect(JSON.parse(values.get('workspace')!).version).toBe(1)
    act(() => root.unmount())
  })
})
