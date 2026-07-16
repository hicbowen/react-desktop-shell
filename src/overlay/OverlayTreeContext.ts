import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
} from 'react'
import type { RefObject } from 'react'

interface OverlayEntry {
  element: HTMLElement
  parentId: string | null
}

const entries = new Map<string, OverlayEntry>()
const stack: string[] = []

export const OverlayParentContext = createContext<string | null>(null)

function registerOverlay(
  id: string,
  parentId: string | null,
  element: HTMLElement,
) {
  entries.set(id, { element, parentId })

  const existingIndex = stack.indexOf(id)
  if (existingIndex >= 0) {
    stack.splice(existingIndex, 1)
  }
  stack.push(id)

  return () => {
    entries.delete(id)
    const index = stack.indexOf(id)
    if (index >= 0) {
      stack.splice(index, 1)
    }
  }
}

function isDescendantOf(candidateId: string, ancestorId: string) {
  let currentId: string | null = candidateId
  const visited = new Set<string>()

  while (currentId && !visited.has(currentId)) {
    if (currentId === ancestorId) {
      return true
    }

    visited.add(currentId)
    currentId = entries.get(currentId)?.parentId ?? null
  }

  return false
}

function isInsideOverlayTree(overlayId: string, target: Node) {
  for (const [candidateId, entry] of entries) {
    if (
      isDescendantOf(candidateId, overlayId) &&
      entry.element.contains(target)
    ) {
      return true
    }
  }

  return false
}

function isTopOverlay(overlayId: string) {
  return stack.at(-1) === overlayId
}

export function useOverlayTree(
  open: boolean,
  overlayRef: RefObject<HTMLElement | null>,
) {
  const parentId = useContext(OverlayParentContext)
  const overlayId = useId()

  useEffect(() => {
    const element = overlayRef.current

    if (!open || !element) {
      return
    }

    return registerOverlay(overlayId, parentId, element)
  }, [open, overlayId, overlayRef, parentId])

  const isInsideBranch = useCallback(
    (target: Node) => isInsideOverlayTree(overlayId, target),
    [overlayId],
  )
  const isTopMost = useCallback(
    () => isTopOverlay(overlayId),
    [overlayId],
  )

  return {
    overlayId,
    isInsideBranch,
    isTopMost,
  }
}
