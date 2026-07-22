import { useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { AppButton } from '../button'
import { useAppLocale } from '../localization/useAppLocale'
import { isFileAccepted } from '../file-drop-overlay/fileAcceptance'
import type { AppFilePickerProps, AppFilePickerRejectionReason } from './types'
import './AppFilePicker.css'

function FileIcon() { return <svg aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M7 3.75h6l4 4V20.25H7z" /><path d="M13 3.75v4h4" /></svg> }

export function AppFilePicker({ files, defaultFiles = [], onFilesChange, onReject, accept, multiple = false, maxFileSize, disabled = false, allowDrop = true, adapter, className, style }: AppFilePickerProps) {
  const { messages } = useAppLocale()
  const text = messages.filePicker
  const controlled = files !== undefined
  const [internalFiles, setInternalFiles] = useState<File[]>(() => [...defaultFiles])
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const currentFiles = files ?? internalFiles

  const commit = (next: File[]) => { if (!controlled) setInternalFiles(next); onFilesChange?.(next) }
  const validate = (next: File[]): AppFilePickerRejectionReason | null => {
    if (!multiple && next.length > 1) return 'multiple'
    if (next.some((file) => !isFileAccepted(file, accept ? [...accept] : undefined))) return 'type'
    if (maxFileSize !== undefined && next.some((file) => file.size > maxFileSize)) return 'size'
    return null
  }
  const receive = (next: File[]) => {
    const reason = validate(next)
    if (reason) onReject?.(next, reason)
    else if (next.length) commit(multiple ? next : next.slice(0, 1))
  }
  const open = async () => {
    if (disabled) return
    if (adapter) receive([...await adapter.pick({ accept, multiple })])
    else inputRef.current?.click()
  }
  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    receive(Array.from(event.currentTarget.files ?? []))
    event.currentTarget.value = ''
  }
  const handleDrop = (event: DragEvent) => {
    if (!allowDrop || disabled) return
    event.preventDefault()
    setDragging(false)
    receive(Array.from(event.dataTransfer.files ?? []))
  }

  return <div className={['app-file-picker', dragging ? 'app-file-picker--dragging' : '', disabled ? 'app-file-picker--disabled' : '', className].filter(Boolean).join(' ')} style={style}>
    <input accept={accept?.join(',')} aria-hidden="true" className="app-file-picker__input" disabled={disabled} multiple={multiple} onChange={handleInput} ref={inputRef} tabIndex={-1} type="file" />
    <div className="app-file-picker__drop-zone" onDragEnter={(event) => { if (allowDrop && !disabled) { event.preventDefault(); setDragging(true) } }} onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false) }} onDragOver={(event) => { if (allowDrop && !disabled) event.preventDefault() }} onDrop={handleDrop}>
      <FileIcon /><div><strong>{multiple ? text.chooseFiles : text.chooseFile}</strong>{allowDrop ? <span>{text.dropHint}</span> : null}</div><AppButton disabled={disabled} onClick={open} size="compact">{text.browse}</AppButton>
    </div>
    {currentFiles.length ? <ul aria-label={text.selectedFiles} className="app-file-picker__files">{currentFiles.map((file, index) => <li key={`${file.name}-${file.size}-${index}`}><span><FileIcon />{file.name}</span><button aria-label={text.remove(file.name)} disabled={disabled} onClick={() => commit(currentFiles.filter((_, candidate) => candidate !== index) as File[])} type="button">×</button></li>)}</ul> : null}
  </div>
}
