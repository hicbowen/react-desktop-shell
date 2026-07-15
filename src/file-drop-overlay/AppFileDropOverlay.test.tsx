// @vitest-environment jsdom

import { act, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppFileDropOverlay } from './AppFileDropOverlay'

function createDragEvent(
  type: string,
  files: File[] = [],
  types: string[] = ['Files'],
) {
  const event = new Event(type, {
    bubbles: true,
    cancelable: true,
  }) as DragEvent
  const dataTransfer = {
    dropEffect: 'none',
    files,
    items: [],
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

  it('ignores non-file drags', () => {
    renderDrop()
    dispatch(dropRoot(), createDragEvent('dragenter', [], ['text/plain']).event)
    expect(overlay()).toBeNull()
  })

  it('shows the accepting overlay for file drags', () => {
    renderDrop()
    const file = new File(['a'], 'data.csv')
    dispatch(dropRoot(), createDragEvent('dragenter', [file]).event)
    expect(overlay()).not.toBeNull()
    expect(dropRoot().classList.contains('app-file-drop--accept')).toBe(true)
    expect(overlay()?.getAttribute('aria-live')).toBe('polite')
  })

  it('uses depth counting so nested enter and leave events do not flicker', () => {
    renderDrop()
    const child = container.querySelector<HTMLElement>('[data-testid="content"]')!
    const file = new File(['a'], 'data.csv')
    dispatch(child, createDragEvent('dragenter', [file]).event)
    dispatch(child, createDragEvent('dragenter', [file]).event)
    dispatch(child, createDragEvent('dragleave', [file]).event)
    expect(overlay()).not.toBeNull()
    dispatch(child, createDragEvent('dragleave', [file]).event)
    expect(overlay()).toBeNull()
  })

  it('prevents dragover and drop defaults, then returns files and hides', () => {
    const onFiles = vi.fn()
    renderDrop({ onFiles })
    const file = new File(['a'], 'data.csv')
    dispatch(dropRoot(), createDragEvent('dragenter', [file]).event)
    const over = createDragEvent('dragover', [file])
    expect(dispatch(dropRoot(), over.event)).toBe(false)
    expect(over.dataTransfer.dropEffect).toBe('copy')
    const dropped = createDragEvent('drop', [file])
    expect(dispatch(dropRoot(), dropped.event)).toBe(false)
    expect(onFiles).toHaveBeenCalledWith([file])
    expect(overlay()).toBeNull()
  })

  it('shows reject state for unsupported files and rejects the whole batch', () => {
    const onFiles = vi.fn()
    renderDrop({ accept: ['.csv'], onFiles })
    const files = [
      new File(['a'], 'data.csv'),
      new File(['a'], 'notes.txt'),
    ]
    dispatch(dropRoot(), createDragEvent('dragenter', files).event)
    expect(dropRoot().classList.contains('app-file-drop--reject')).toBe(true)
    expect(overlay()?.getAttribute('aria-live')).toBe('assertive')
    expect(overlay()?.textContent).toContain('不支持这些文件')

    const over = createDragEvent('dragover', files)
    dispatch(dropRoot(), over.event)
    expect(over.dataTransfer.dropEffect).toBe('none')
    dispatch(dropRoot(), createDragEvent('drop', files).event)
    expect(onFiles).not.toHaveBeenCalled()
    expect(overlay()).toBeNull()
  })

  it('rejects multiple files when multiple is false', () => {
    const onFiles = vi.fn()
    renderDrop({ multiple: false, onFiles })
    const files = [new File(['a'], 'one.csv'), new File(['b'], 'two.csv')]
    dispatch(dropRoot(), createDragEvent('dragenter', files).event)
    expect(dropRoot().classList.contains('app-file-drop--reject')).toBe(true)
    dispatch(dropRoot(), createDragEvent('drop', files).event)
    expect(onFiles).not.toHaveBeenCalled()
  })

  it('returns one file in single-file mode', () => {
    const onFiles = vi.fn()
    renderDrop({ multiple: false, onFiles })
    const file = new File(['a'], 'one.csv')
    dispatch(dropRoot(), createDragEvent('drop', [file]).event)
    expect(onFiles).toHaveBeenCalledWith([file])
  })

  it('does not respond or prevent defaults while disabled', () => {
    const onFiles = vi.fn()
    renderDrop({ disabled: true, onFiles })
    const file = new File(['a'], 'one.csv')
    dispatch(dropRoot(), createDragEvent('dragenter', [file]).event)
    const over = createDragEvent('dragover', [file])
    expect(dispatch(dropRoot(), over.event)).toBe(true)
    const dropped = createDragEvent('drop', [file])
    expect(dispatch(dropRoot(), dropped.event)).toBe(true)
    expect(overlay()).toBeNull()
    expect(onFiles).not.toHaveBeenCalled()
  })

  it('keeps wrapped children rendered', () => {
    renderDrop()
    expect(container.querySelector('[data-testid="content"]')?.textContent).toBe(
      'Content',
    )
  })

  it('listens on the positioned parent when rendered without children', () => {
    const onFiles = vi.fn()
    render(<AppFileDropOverlay onFiles={onFiles} />)
    expect(dropRoot().classList.contains('app-file-drop--standalone')).toBe(true)
    const file = new File(['a'], 'one.csv')
    dispatch(container, createDragEvent('dragenter', [file]).event)
    expect(overlay()).not.toBeNull()
    dispatch(container, createDragEvent('drop', [file]).event)
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
