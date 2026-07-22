// @vitest-environment jsdom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  AppCommandProvider,
  formatAppShortcut,
  useAppCommand,
  useAppCommands,
} from '.'
import type { AppCommand } from './types'

describe('AppCommandProvider', () => {
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

  const render = (commands: readonly AppCommand[], content: React.ReactNode) => {
    act(() => root.render(<AppCommandProvider commands={commands}>{content}</AppCommandProvider>))
  }

  it('executes an enabled command through the API', () => {
    const execute = vi.fn()

    function Trigger() {
      const commands = useAppCommands()
      return <button onClick={() => commands.execute('file.open', { source: 'toolbar' })}>Open</button>
    }

    render([{ id: 'file.open', label: 'Open', execute }], <Trigger />)
    act(() => container.querySelector('button')?.click())
    expect(execute).toHaveBeenCalledWith({ commandId: 'file.open', source: 'toolbar' })
  })

  it('does not execute disabled or hidden commands', () => {
    const execute = vi.fn()

    function Trigger() {
      const commands = useAppCommands()
      return <button onClick={() => {
        commands.execute('disabled')
        commands.execute('hidden')
      }}>Run</button>
    }

    render([
      { id: 'disabled', label: 'Disabled', disabled: true, execute },
      { id: 'hidden', label: 'Hidden', hidden: true, execute },
    ], <Trigger />)
    act(() => container.querySelector('button')?.click())
    expect(execute).not.toHaveBeenCalled()
  })

  it('executes matching keyboard shortcuts and prevents their default action', () => {
    const execute = vi.fn()
    render([{
      id: 'file.save',
      label: 'Save',
      shortcut: { ctrl: true, key: 's' },
      execute,
    }], <div />)

    const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ctrlKey: true, key: 's' })
    act(() => document.dispatchEvent(event))
    expect(event.defaultPrevented).toBe(true)
    expect(execute).toHaveBeenCalledWith(expect.objectContaining({ commandId: 'file.save', source: 'keyboard' }))
  })

  it('ignores shortcuts in editable controls by default', () => {
    const execute = vi.fn()
    render([{
      id: 'select.all',
      label: 'Select all',
      shortcut: { ctrl: true, key: 'a' },
      execute,
    }], <input />)

    const input = container.querySelector('input')!
    const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ctrlKey: true, key: 'a' })
    act(() => input.dispatchEvent(event))
    expect(execute).not.toHaveBeenCalled()
    expect(event.defaultPrevented).toBe(false)
  })

  it('lets a nested provider override commands while inheriting the rest', () => {
    const outer = vi.fn()
    const inner = vi.fn()

    function Probe() {
      const save = useAppCommand('save')
      const open = useAppCommand('open')
      return <span>{String(save?.execute === inner)}:{open?.id}</span>
    }

    act(() => root.render(
      <AppCommandProvider commands={[
        { id: 'save', label: 'Save', execute: outer },
        { id: 'open', label: 'Open', execute: outer },
      ]}>
        <AppCommandProvider commands={[{ id: 'save', label: 'Save as', execute: inner }]}>
          <Probe />
        </AppCommandProvider>
      </AppCommandProvider>,
    ))
    expect(container.textContent).toBe('true:open')
  })

  it('formats shortcut labels consistently', () => {
    expect(formatAppShortcut({ ctrl: true, shift: true, key: 'p' })).toBe('Ctrl+Shift+P')
  })
})
