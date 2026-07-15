function normalizedAcceptRules(accept: string[] | undefined) {
  return (accept ?? [])
    .map((rule) => rule.trim().toLowerCase())
    .filter(Boolean)
}

export type FileDropRejectionReason = 'type' | 'multiple'

export interface FileDragPreview {
  state: 'pending' | 'accept' | 'reject'
  reason?: FileDropRejectionReason
}

export interface FileDropValidation {
  accepted: boolean
  files: File[]
  reason?: FileDropRejectionReason
}

function isMimeAccepted(mimeType: string, rule: string) {
  return rule.endsWith('/*')
    ? mimeType.startsWith(rule.slice(0, -1))
    : mimeType === rule
}

export function isFileAccepted(file: File, accept?: string[]) {
  const rules = normalizedAcceptRules(accept)

  if (rules.length === 0) {
    return true
  }

  const fileName = file.name.toLowerCase()
  const mimeType = file.type.toLowerCase()

  return rules.some((rule) => {
    if (rule.startsWith('.')) {
      return fileName.endsWith(rule)
    }

    return isMimeAccepted(mimeType, rule)
  })
}

export function filterAcceptedFiles(files: File[], accept?: string[]) {
  return files.filter((file) => isFileAccepted(file, accept))
}

export function previewFileDrag(
  dataTransfer: DataTransfer,
  accept: string[] | undefined,
  multiple: boolean,
): FileDragPreview {
  const fileItems = Array.from(dataTransfer.items ?? []).filter(
    (item) => item.kind === 'file',
  )

  if (!multiple && fileItems.length > 1) {
    return { state: 'reject', reason: 'multiple' }
  }

  const rules = normalizedAcceptRules(accept)

  if (rules.length === 0) {
    return { state: 'accept' }
  }

  if (rules.some((rule) => rule.startsWith('.'))) {
    return { state: 'pending' }
  }

  const itemTypes = fileItems.map((item) => item.type.trim().toLowerCase())

  if (fileItems.length === 0 || itemTypes.some((type) => type === '')) {
    return { state: 'pending' }
  }

  return itemTypes.every((type) =>
    rules.some((rule) => isMimeAccepted(type, rule)),
  )
    ? { state: 'accept' }
    : { state: 'reject', reason: 'type' }
}

export function validateDroppedFiles(
  files: File[],
  accept: string[] | undefined,
  multiple: boolean,
): FileDropValidation {
  if (!multiple && files.length > 1) {
    return { accepted: false, files, reason: 'multiple' }
  }

  if (filterAcceptedFiles(files, accept).length !== files.length) {
    return { accepted: false, files, reason: 'type' }
  }

  return { accepted: true, files }
}
