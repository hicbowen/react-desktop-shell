// @vitest-environment jsdom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppFilePicker } from './AppFilePicker'

describe('AppFilePicker', () => {
  let container: HTMLDivElement
  let root: Root
  beforeEach(() => { container = document.createElement('div'); document.body.append(container); root = createRoot(container) })
  afterEach(() => { act(() => root.unmount()); container.remove() })

  it('uses a host adapter and lists selected files', async () => {
    const file = new File(['hello'], 'notes.txt', { type: 'text/plain' })
    const onFilesChange = vi.fn()
    const adapter = { pick: vi.fn().mockResolvedValue([file]) }
    act(() => root.render(<AppFilePicker adapter={adapter} onFilesChange={onFilesChange} />))
    await act(async () => container.querySelector<HTMLButtonElement>('button')!.click())
    expect(onFilesChange).toHaveBeenCalledWith([file])
    expect(container.textContent).toContain('notes.txt')
  })

  it('reports files above the size limit', async () => {
    const file = new File(['large'], 'large.txt', { type: 'text/plain' })
    const onReject = vi.fn()
    act(() => root.render(<AppFilePicker adapter={{ pick: async () => [file] }} maxFileSize={2} onReject={onReject} />))
    await act(async () => container.querySelector<HTMLButtonElement>('button')!.click())
    expect(onReject).toHaveBeenCalledWith([file], 'size')
  })
})
