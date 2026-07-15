import { useEffect, useRef, useState } from 'react'
import { filterAcceptedFiles } from './fileAcceptance'
import type { AppFileDropOverlayProps } from './types'
import './AppFileDropOverlay.css'

type FileDropState = 'idle' | 'accept' | 'reject'

function UploadIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M11.3 4.3a1 1 0 0 1 1.4 0l4 4a1 1 0 0 1-1.4 1.4L13 7.41V15a1 1 0 1 1-2 0V7.41L8.7 9.7a1 1 0 0 1-1.4-1.4l4-4ZM5 14a1 1 0 0 1 1 1v3h12v-3a1 1 0 1 1 2 0v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3a1 1 0 0 1 1-1Z" />
    </svg>
  )
}

function hasFiles(dataTransfer: DataTransfer) {
  return Array.from(dataTransfer.types ?? []).includes('Files')
}

function filesFromTransfer(dataTransfer: DataTransfer) {
  const files = Array.from(dataTransfer.files ?? [])

  if (files.length > 0) {
    return files
  }

  return Array.from(dataTransfer.items ?? []).flatMap((item) => {
    const file = item.kind === 'file' ? item.getAsFile() : null
    return file ? [file] : []
  })
}

function batchState(
  files: File[],
  accept: string[] | undefined,
  multiple: boolean,
): Exclude<FileDropState, 'idle'> {
  if (!multiple && files.length > 1) {
    return 'reject'
  }

  if (
    files.length > 0 &&
    filterAcceptedFiles(files, accept).length !== files.length
  ) {
    return 'reject'
  }

  return 'accept'
}

export function AppFileDropOverlay({
  accept,
  children,
  className,
  description,
  disabled = false,
  icon,
  multiple = true,
  onFiles,
  rejectDescription,
  rejectTitle = '不支持这些文件',
  title = '松开鼠标以导入文件',
}: AppFileDropOverlayProps) {
  const [state, setState] = useState<FileDropState>('idle')
  const [previousDisabled, setPreviousDisabled] = useState(disabled)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const dragDepthRef = useRef(0)
  const hasChildren = children !== undefined && children !== null

  if (previousDisabled !== disabled) {
    setPreviousDisabled(disabled)

    if (disabled) {
      setState('idle')
    }
  }

  useEffect(() => {
    const root = rootRef.current
    const target = hasChildren ? root : root?.parentElement

    if (!target) {
      return
    }

    const reset = () => {
      dragDepthRef.current = 0
      setState('idle')
    }
    const handleDragEnter = (event: DragEvent) => {
      const dataTransfer = event.dataTransfer

      if (disabled || !dataTransfer || !hasFiles(dataTransfer)) {
        return
      }

      dragDepthRef.current += 1
      setState(batchState(filesFromTransfer(dataTransfer), accept, multiple))
    }
    const handleDragOver = (event: DragEvent) => {
      const dataTransfer = event.dataTransfer

      if (disabled || !dataTransfer || !hasFiles(dataTransfer)) {
        return
      }

      event.preventDefault()
      const nextState = batchState(
        filesFromTransfer(dataTransfer),
        accept,
        multiple,
      )
      setState(nextState)

      try {
        dataTransfer.dropEffect = nextState === 'accept' ? 'copy' : 'none'
      } catch {
        // Some WebViews expose dropEffect as read-only during synthetic drags.
      }
    }
    const handleDragLeave = (event: DragEvent) => {
      const dataTransfer = event.dataTransfer

      if (disabled || (dataTransfer && !hasFiles(dataTransfer))) {
        return
      }

      dragDepthRef.current = Math.max(0, dragDepthRef.current - 1)

      if (dragDepthRef.current === 0) {
        setState('idle')
      }
    }
    const handleDrop = (event: DragEvent) => {
      const dataTransfer = event.dataTransfer

      if (disabled || !dataTransfer || !hasFiles(dataTransfer)) {
        return
      }

      event.preventDefault()
      const files = filesFromTransfer(dataTransfer)
      const nextState = batchState(files, accept, multiple)
      reset()

      if (nextState === 'accept' && files.length > 0) {
        onFiles(multiple ? files : files.slice(0, 1))
      }
    }

    target.addEventListener('dragenter', handleDragEnter)
    target.addEventListener('dragover', handleDragOver)
    target.addEventListener('dragleave', handleDragLeave)
    target.addEventListener('drop', handleDrop)

    return () => {
      dragDepthRef.current = 0
      target.removeEventListener('dragenter', handleDragEnter)
      target.removeEventListener('dragover', handleDragOver)
      target.removeEventListener('dragleave', handleDragLeave)
      target.removeEventListener('drop', handleDrop)
    }
  }, [accept, disabled, hasChildren, multiple, onFiles])

  const active = state !== 'idle' && !disabled
  const rejected = state === 'reject'
  const rootClassName = [
    'app-file-drop',
    hasChildren ? '' : 'app-file-drop--standalone',
    active ? `app-file-drop--${state}` : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={rootClassName} ref={rootRef}>
      {children}
      {active ? (
        <div
          aria-live={rejected ? 'assertive' : 'polite'}
          className="app-file-drop__overlay"
          role="status"
        >
          <div className="app-file-drop__panel">
            <div className="app-file-drop__icon">{icon ?? <UploadIcon />}</div>
            <div className="app-file-drop__title">
              {rejected ? rejectTitle : title}
            </div>
            {(rejected ? rejectDescription : description) ? (
              <div className="app-file-drop__description">
                {rejected ? rejectDescription : description}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
