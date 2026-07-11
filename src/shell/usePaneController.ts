import { useCallback, useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import type { AppShellSidebarOptions, PaneDisplayMode } from './types'

const DEFAULT_SIDEBAR_EXPANDED_WIDTH = 316
const DEFAULT_SIDEBAR_COMPACT_WIDTH = 56
const DEFAULT_EXPANDED_BREAKPOINT = 1008
const DEFAULT_COMPACT_BREAKPOINT = 640

export type ResolvedPaneDisplayMode = Exclude<PaneDisplayMode, 'auto'>
export type NavigationPresentation = 'inline' | 'compact-flyout'

function resolvePaneDisplayMode(
  width: number,
  expandedBreakpoint: number,
  compactBreakpoint: number,
): ResolvedPaneDisplayMode {
  if (width >= expandedBreakpoint) {
    return 'expanded'
  }

  if (width >= compactBreakpoint) {
    return 'compact'
  }

  return 'minimal'
}

function displayModeFromCollapsed(collapsed: boolean): ResolvedPaneDisplayMode {
  return collapsed ? 'compact' : 'expanded'
}

export interface PaneController {
  displayMode: PaneDisplayMode
  resolvedDisplayMode: ResolvedPaneDisplayMode
  presentation: NavigationPresentation
  collapsed: boolean
  isMinimal: boolean
  isOpen: boolean
  isClosing: boolean
  suppressTransition: boolean
  collapsible: boolean
  expandedWidth: number
  compactWidth: number
  toggle(): void
  close(): void
  finishClosing(): void
}

export function usePaneController({
  sidebar,
  containerRef,
}: {
  sidebar: AppShellSidebarOptions | undefined
  containerRef: RefObject<HTMLDivElement | null>
}): PaneController {
  const displayModeControlled = sidebar?.displayMode !== undefined
  const collapsedControlled =
    !displayModeControlled && sidebar?.collapsed !== undefined
  const defaultDisplayMode =
    sidebar === undefined
      ? 'expanded'
      : (sidebar.defaultDisplayMode ??
        (sidebar.defaultCollapsed !== undefined
          ? displayModeFromCollapsed(sidebar.defaultCollapsed)
          : 'auto'))
  const [uncontrolledDisplayMode, setUncontrolledDisplayMode] =
    useState<PaneDisplayMode>(defaultDisplayMode)
  const [autoResolvedDisplayMode, setAutoResolvedDisplayMode] =
    useState<ResolvedPaneDisplayMode>('expanded')
  const previousAutoResolvedMode = useRef(autoResolvedDisplayMode)
  const paneTransitionTimeout = useRef<number | undefined>(undefined)
  const [suppressTransition, setSuppressTransition] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [autoPaneOverride, setAutoPaneOverride] =
    useState<Exclude<ResolvedPaneDisplayMode, 'minimal'> | null>(null)
  const paneOpenControlled = sidebar?.isPaneOpen !== undefined
  const [uncontrolledPaneOpen, setUncontrolledPaneOpen] = useState(
    sidebar?.defaultPaneOpen ?? false,
  )
  const collapsible = sidebar?.collapsible ?? sidebar !== undefined
  const displayMode = displayModeControlled
    ? (sidebar?.displayMode ?? 'expanded')
    : collapsedControlled
      ? displayModeFromCollapsed(Boolean(sidebar?.collapsed))
      : uncontrolledDisplayMode
  const baseResolvedDisplayMode =
    displayMode === 'auto' ? autoResolvedDisplayMode : displayMode
  const resolvedDisplayMode =
    displayMode === 'auto' &&
    baseResolvedDisplayMode !== 'minimal' &&
    autoPaneOverride
      ? autoPaneOverride
      : baseResolvedDisplayMode
  const presentation: NavigationPresentation =
    resolvedDisplayMode === 'compact' ? 'compact-flyout' : 'inline'
  const collapsed = presentation === 'compact-flyout'
  const isMinimal = resolvedDisplayMode === 'minimal'
  const isOpen = paneOpenControlled
    ? Boolean(sidebar?.isPaneOpen)
    : uncontrolledPaneOpen
  const expandedWidth =
    sidebar?.expandedWidth ?? DEFAULT_SIDEBAR_EXPANDED_WIDTH
  const compactWidth = sidebar?.compactWidth ?? DEFAULT_SIDEBAR_COMPACT_WIDTH
  const expandedBreakpoint =
    sidebar?.expandedBreakpoint ?? DEFAULT_EXPANDED_BREAKPOINT
  const compactBreakpoint =
    sidebar?.compactBreakpoint ?? DEFAULT_COMPACT_BREAKPOINT

  const setPaneOpen = useCallback(
    (open: boolean) => {
      if (!collapsible) {
        return
      }

      if (!paneOpenControlled) {
        setUncontrolledPaneOpen(open)
      }

      sidebar?.onPaneOpenChange?.(open)
    },
    [collapsible, paneOpenControlled, sidebar],
  )

  const setDisplayMode = useCallback(
    (nextDisplayMode: PaneDisplayMode) => {
      if (!collapsible) {
        return
      }

      if (displayMode === 'auto') {
        if (nextDisplayMode === 'expanded' || nextDisplayMode === 'compact') {
          setAutoPaneOverride(nextDisplayMode)
        }
        return
      }

      if (!displayModeControlled && !collapsedControlled) {
        setUncontrolledDisplayMode(nextDisplayMode)
      }

      sidebar?.onDisplayModeChange?.(nextDisplayMode)

      if (collapsedControlled || sidebar?.onCollapsedChange) {
        sidebar?.onCollapsedChange?.(nextDisplayMode === 'compact')
      }
    },
    [
      collapsedControlled,
      collapsible,
      displayMode,
      displayModeControlled,
      sidebar,
    ],
  )

  const close = useCallback(() => {
    setPaneOpen(false)

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsClosing(false)
      return
    }

    setIsClosing(true)
  }, [setPaneOpen])

  const toggle = useCallback(() => {
    if (isMinimal) {
      if (isOpen) {
        close()
      } else {
        setPaneOpen(true)
      }
      return
    }

    setDisplayMode(resolvedDisplayMode === 'expanded' ? 'compact' : 'expanded')
  }, [close, isMinimal, isOpen, resolvedDisplayMode, setDisplayMode, setPaneOpen])

  useEffect(() => {
    const root = containerRef.current

    if (
      !root ||
      typeof ResizeObserver === 'undefined' ||
      displayMode !== 'auto'
    ) {
      return
    }

    const updateAutoMode = (width: number) => {
      const nextMode = resolvePaneDisplayMode(
        width,
        expandedBreakpoint,
        compactBreakpoint,
      )
      const previousMode = previousAutoResolvedMode.current

      if (previousMode === nextMode) {
        return
      }

      if (previousMode === 'minimal' || nextMode === 'minimal') {
        window.clearTimeout(paneTransitionTimeout.current)
        setSuppressTransition(true)
        paneTransitionTimeout.current = window.setTimeout(() => {
          setSuppressTransition(false)
        }, 180)
      }

      previousAutoResolvedMode.current = nextMode
      setAutoResolvedDisplayMode(nextMode)
      setAutoPaneOverride(null)

      if (nextMode === 'minimal') {
        setPaneOpen(false)
      }
    }

    updateAutoMode(root.getBoundingClientRect().width)
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]

      if (entry) {
        updateAutoMode(entry.contentRect.width)
      }
    })

    observer.observe(root)
    return () => {
      observer.disconnect()
      window.clearTimeout(paneTransitionTimeout.current)
    }
  }, [compactBreakpoint, containerRef, displayMode, expandedBreakpoint, setPaneOpen])

  useEffect(() => {
    if (isMinimal) {
      return
    }

    const timeout = window.setTimeout(() => {
      setIsClosing(false)

      if (isOpen) {
        setPaneOpen(false)
      }
    }, 0)
    return () => window.clearTimeout(timeout)
  }, [isMinimal, isOpen, setPaneOpen])

  useEffect(() => {
    if (!isMinimal || !isOpen) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return
      }

      event.preventDefault()
      close()
    }

    document.addEventListener('keydown', handleKeyDown, true)
    return () => document.removeEventListener('keydown', handleKeyDown, true)
  }, [close, isMinimal, isOpen])

  return {
    displayMode,
    resolvedDisplayMode,
    presentation,
    collapsed,
    isMinimal,
    isOpen,
    isClosing,
    suppressTransition,
    collapsible,
    expandedWidth,
    compactWidth,
    toggle,
    close,
    finishClosing: () => setIsClosing(false),
  }
}
