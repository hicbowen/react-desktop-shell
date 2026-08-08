import { useEffect, useRef, useState } from 'react'
import { CloudArrowUp24Regular } from '@fluentui/react-icons/svg/cloud-arrow-up'
import {
  previewFileDrag,
  validateDroppedFiles,
} from './fileAcceptance'
import type { AppFileDropOverlayProps } from './types'
import { useAppLocale } from '../localization/useAppLocale'
import './AppFileDropOverlay.css'

type FileDropState = 'idle' | 'pending' | 'accept' | 'reject'

function hasFileType(dataTransfer: DataTransfer) {
  return Array.from(dataTransfer.types ?? []).includes('Files')
}

function hasFileItems(dataTransfer: DataTransfer) {
  return Array.from(dataTransfer.items ?? []).some(
    (item) => item.kind === 'file',
  )
}

function isFileDrag(dataTransfer: DataTransfer) {
  return hasFileType(dataTransfer) || hasFileItems(dataTransfer)
}

function filesFromTransfer(dataTransfer: DataTransfer) {
  const files = Array.from(dataTransfer.files ?? [])

  return files
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
  onReject,
  rejectDescription,
  rejectTitle,
  style,
  title,
}: AppFileDropOverlayProps) {
  const { messages } = useAppLocale()
  const resolvedTitle = title ?? messages.fileDrop.title
  const resolvedRejectTitle = rejectTitle ?? messages.fileDrop.rejectTitle
  const [state, setState] = useState<FileDropState>('idle')
  const rootRef = useRef<HTMLDivElement | null>(null)
  const dragDepthRef = useRef(0)
  const hasChildren = children !== undefined && children !== null

  useEffect(() => {
    if (disabled) {
      dragDepthRef.current = 0
      // eslint-disable-next-line react-hooks/set-state-in-effect -- disabling must synchronously clear transient drag UI.
      setState('idle')
    }
  }, [disabled])

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

      if (
        disabled ||
        !dataTransfer ||
        !isFileDrag(dataTransfer)
      ) {
        return
      }

      event.preventDefault()
      dragDepthRef.current += 1
      setState(previewFileDrag(dataTransfer, accept, multiple).state)
    }
    const handleDragOver = (event: DragEvent) => {
      const dataTransfer = event.dataTransfer

      if (disabled || !dataTransfer || !isFileDrag(dataTransfer)) {
        return
      }

      event.preventDefault()
      if (dragDepthRef.current === 0) {
        dragDepthRef.current = 1
      }
      const nextState = previewFileDrag(dataTransfer, accept, multiple).state
      setState(nextState)

      try {
        dataTransfer.dropEffect = nextState === 'reject' ? 'none' : 'copy'
      } catch {
        // Some WebViews expose dropEffect as read-only during synthetic drags.
      }
    }
    const handleDragLeave = () => {
      if (dragDepthRef.current === 0) {
        return
      }

      dragDepthRef.current -= 1

      if (dragDepthRef.current === 0) {
        setState('idle')
      }
    }
    const handleDrop = (event: DragEvent) => {
      const dataTransfer = event.dataTransfer

      if (disabled || !dataTransfer) {
        return
      }

      const files = filesFromTransfer(dataTransfer)
      if (!isFileDrag(dataTransfer) && files.length === 0) {
        return
      }

      event.preventDefault()
      const validation = validateDroppedFiles(files, accept, multiple)
      reset()

      if (validation.accepted) {
        if (validation.files.length > 0) {
          onFiles(validation.files)
        }
      } else if (validation.reason) {
        onReject?.(validation.files, validation.reason)
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
  }, [accept, disabled, hasChildren, multiple, onFiles, onReject])

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
    <div className={rootClassName} ref={rootRef} style={style}>
      {children}
      {active ? (
        <div
          aria-live={rejected ? 'assertive' : 'polite'}
          className="app-file-drop__overlay"
          role="status"
        >
          <div className="app-file-drop__panel">
            <div className="app-file-drop__icon">{icon ?? <CloudArrowUp24Regular aria-hidden="true" focusable="false" />}</div>
            <div className="app-file-drop__title">
              {rejected ? resolvedRejectTitle : resolvedTitle}
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
