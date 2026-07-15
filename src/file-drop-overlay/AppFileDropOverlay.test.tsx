// @vitest-environment jsdom

import { act, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppFileDropOverlay } from './AppFileDropOverlay'

function fileItem(type: string): DataTransferItem {
  return {
    getAsFile: () => null,
    kind: 'file',
    type,
  } as DataTransferItem
}

function createDragEvent(
  type: string,
  {
    files = [],
    items = [],
    types = ['Files'],
  }: {
    files?: File[]
    items?: DataTransferItem[]
    types?: string[]
  } = {},
) {
  const event = new Event(type, {
    bubbles: true,
    cancelable: true,
  }) as DragEvent
  const dataTransfer = {
    dropEffect: 'none',
    files,
    items,
    types,
  } as unknown as DataTransfer
  Object.defineProperty(event, 'dataTransfer', { value: dataTransfer })
  return { dataTransfer, event }
}

describe('AppFileDropOverlay', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
      .IS_REACT_ACT_ENVIRONMENT = true
    container = document.createElement('div')
    container.style.position = 'relative'
    document.body.append(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
    vi.restoreAllMocks()
  })

  const render = (node: ReactNode) => act(() => root.render(node))
  const overlay = () =>
    container.querySelector<HTMLElement>('.app-file-drop__overlay')
  const dropRoot = () => container.querySelector<HTMLElement>('.app-file-drop')!
  const dispatch = (target: HTMLElement, event: Event) => {
    let notCancelled = true
    act(() => {
      notCancelled = target.dispatchEvent(event)
    })
    return notCancelled
  }
  const renderDrop = (
    props: Partial<React.ComponentProps<typeof AppFileDropOverlay>> = {},
  ) =>
    render(
      <AppFileDropOverlay onFiles={() => undefined} {...props}>
        <div data-testid="content">Content</div>
      </AppFileDropOverlay>,
    )

  it('ignores non-file drags without preventing them', () => {
    renderDrop()
    const drag = createDragEvent('dragenter', {
      items: [{ kind: 'string', type: 'text/plain' } as DataTransferItem],
      types: ['text/plain'],
    })
    expect(dispatch(dropRoot(), drag.event)).toBe(true)
    expect(overlay()).toBeNull()
  })

  it('prevents file dragenter and accepts matching MIME previews', () => {
    renderDrop({ accept: ['image/*'] })
    const drag = createDragEvent('dragenter', {
      files: [],
      items: [fileItem('image/png')],
    })
    expect(dispatch(dropRoot(), drag.event)).toBe(false)
    expect(dropRoot().classList.contains('app-file-drop--accept')).toBe(true)
    expect(overlay()?.getAttribute('aria-live')).toBe('polite')
  })

  it('rejects a clearly incompatible MIME preview', () => {
    renderDrop({ accept: ['image/*'] })
    dispatch(
      dropRoot(),
      createDragEvent('dragenter', { items: [fileItem('application/pdf')] })
        .event,
    )
    expect(dropRoot().classList.contains('app-file-drop--reject')).toBe(true)
    expect(overlay()?.getAttribute('aria-live')).toBe('assertive')
    expect(overlay()?.textContent).toContain('These files are not supported')
  })

  it('uses pending when extension or MIME information cannot be inspected', () => {
    renderDrop({ accept: ['.csv'] })
    dispatch(
      dropRoot(),
      createDragEvent('dragenter', { items: [fileItem('text/csv')] }).event,
    )
    expect(dropRoot().classList.contains('app-file-drop--pending')).toBe(true)

    dispatch(dropRoot(), createDragEvent('dragleave', { types: [] }).event)
    renderDrop({ accept: ['image/*'] })
    dispatch(
      dropRoot(),
      createDragEvent('dragenter', { items: [fileItem('')] }).event,
    )
    expect(dropRoot().classList.contains('app-file-drop--pending')).toBe(true)
  })

  it('rejects multiple file items in single-file mode', () => {
    renderDrop({ multiple: false })
    dispatch(
      dropRoot(),
      createDragEvent('dragenter', {
        items: [fileItem('text/csv'), fileItem('text/csv')],
      }).event,
    )
    expect(dropRoot().classList.contains('app-file-drop--reject')).toBe(true)
  })

  it('uses depth counting and dragleave does not depend on transfer types', () => {
    renderDrop()
    const child = container.querySelector<HTMLElement>('[data-testid="content"]')!
    dispatch(child, createDragEvent('dragenter', { items: [fileItem('')] }).event)
    dispatch(child, createDragEvent('dragenter', { items: [fileItem('')] }).event)
    dispatch(child, createDragEvent('dragleave', { types: [] }).event)
    expect(overlay()).not.toBeNull()
    dispatch(child, createDragEvent('dragleave', { types: [] }).event)
    expect(overlay()).toBeNull()
  })

  it('uses copy for pending dragover and prevents its default', () => {
    renderDrop({ accept: ['.csv'] })
    dispatch(
      dropRoot(),
      createDragEvent('dragenter', { items: [fileItem('text/csv')] }).event,
    )
    const over = createDragEvent('dragover', {
      items: [fileItem('text/csv')],
    })
    expect(dispatch(dropRoot(), over.event)).toBe(false)
    expect(over.dataTransfer.dropEffect).toBe('copy')
  })

  it('accepts a valid pending drop and does not reject it', () => {
    const onFiles = vi.fn()
    const onReject = vi.fn()
    renderDrop({ accept: ['.csv'], onFiles, onReject })
    dispatch(
      dropRoot(),
      createDragEvent('dragenter', { items: [fileItem('text/csv')] }).event,
    )
    const file = new File(['a'], 'REPORT.CSV', { type: 'text/plain' })
    const dropped = createDragEvent('drop', { files: [file] })
    expect(dispatch(dropRoot(), dropped.event)).toBe(false)
    expect(onFiles).toHaveBeenCalledWith([file])
    expect(onReject).not.toHaveBeenCalled()
    expect(overlay()).toBeNull()
  })

  it('rejects an invalid pending drop with a type reason', () => {
    const onFiles = vi.fn()
    const onReject = vi.fn()
    renderDrop({ accept: ['.csv'], onFiles, onReject })
    dispatch(
      dropRoot(),
      createDragEvent('dragenter', { items: [fileItem('')] }).event,
    )
    const file = new File(['a'], 'notes.txt', { type: 'text/plain' })
    dispatch(dropRoot(), createDragEvent('drop', { files: [file] }).event)
    expect(onReject).toHaveBeenCalledWith([file], 'type')
    expect(onFiles).not.toHaveBeenCalled()
    expect(overlay()).toBeNull()
  })

  it('rejects multiple dropped files with a multiple reason', () => {
    const onFiles = vi.fn()
    const onReject = vi.fn()
    renderDrop({ multiple: false, onFiles, onReject })
    const files = [new File(['a'], 'one.csv'), new File(['b'], 'two.csv')]
    dispatch(dropRoot(), createDragEvent('drop', { files }).event)
    expect(onReject).toHaveBeenCalledWith(files, 'multiple')
    expect(onFiles).not.toHaveBeenCalled()
  })

  it('clears active state when disabled changes', () => {
    renderDrop({ disabled: false })
    dispatch(
      dropRoot(),
      createDragEvent('dragenter', { items: [fileItem('text/csv')] }).event,
    )
    expect(overlay()).not.toBeNull()
    renderDrop({ disabled: true })
    expect(overlay()).toBeNull()
  })

  it('does not respond or prevent defaults while disabled', () => {
    const onFiles = vi.fn()
    renderDrop({ disabled: true, onFiles })
    const over = createDragEvent('dragover', { items: [fileItem('text/csv')] })
    expect(dispatch(dropRoot(), over.event)).toBe(true)
    expect(onFiles).not.toHaveBeenCalled()
  })

  it('keeps children and forwards style to the root wrapper', () => {
    renderDrop({ style: { height: '240px', width: '75%' } })
    expect(container.querySelector('[data-testid="content"]')?.textContent).toBe(
      'Content',
    )
    expect(dropRoot().style.height).toBe('240px')
    expect(dropRoot().style.width).toBe('75%')
  })

  it('listens on the positioned parent when rendered without children', () => {
    const onFiles = vi.fn()
    render(<AppFileDropOverlay onFiles={onFiles} />)
    dispatch(
      container,
      createDragEvent('dragenter', { items: [fileItem('text/csv')] }).event,
    )
    expect(overlay()).not.toBeNull()
    const file = new File(['a'], 'one.csv')
    dispatch(container, createDragEvent('drop', { files: [file] }).event)
    expect(onFiles).toHaveBeenCalledWith([file])
  })

  it('removes every local drag listener on unmount', () => {
    const removeListener = vi.spyOn(container, 'removeEventListener')
    render(<AppFileDropOverlay onFiles={() => undefined} />)
    act(() => root.unmount())
    root = createRoot(container)

    for (const type of ['dragenter', 'dragover', 'dragleave', 'drop']) {
      expect(removeListener).toHaveBeenCalledWith(type, expect.any(Function))
    }
  })
})
