import { useCallback, useEffect, useRef } from 'react'

export interface TypeaheadItem {
  key: string
  text: string
  disabled?: boolean
}

export function findTypeaheadMatch(
  items: readonly TypeaheadItem[],
  query: string,
  currentKey?: string,
) {
  const normalizedQuery = query.trim().toLocaleLowerCase()
  if (!normalizedQuery || items.length === 0) return undefined
  const currentIndex = items.findIndex((item) => item.key === currentKey)
  const startIndex = currentIndex < 0 ? 0 : currentIndex + 1

  for (let offset = 0; offset < items.length; offset += 1) {
    const item = items[(startIndex + offset) % items.length]
    if (!item.disabled && item.text.toLocaleLowerCase().startsWith(normalizedQuery)) {
      return item.key
    }
  }
  return undefined
}

export function useCollectionTypeahead(
  items: readonly TypeaheadItem[],
  onMatch: (key: string) => void,
  timeout = 500,
) {
  const queryRef = useRef('')
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }, [])

  return useCallback((key: string, currentKey?: string) => {
    if (key.length !== 1 || key.trim().length === 0) return false
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    queryRef.current += key
    const match = findTypeaheadMatch(items, queryRef.current, currentKey)
      ?? findTypeaheadMatch(items, key, currentKey)
    if (match) onMatch(match)
    timeoutRef.current = setTimeout(() => { queryRef.current = '' }, timeout)
    return Boolean(match)
  }, [items, onMatch, timeout])
}
