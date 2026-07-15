function normalizedAcceptRules(accept: string[] | undefined) {
  return (accept ?? [])
    .map((rule) => rule.trim().toLowerCase())
    .filter(Boolean)
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

    if (rule.endsWith('/*')) {
      return mimeType.startsWith(`${rule.slice(0, -1)}`)
    }

    return mimeType === rule
  })
}

export function filterAcceptedFiles(files: File[], accept?: string[]) {
  return files.filter((file) => isFileAccepted(file, accept))
}
