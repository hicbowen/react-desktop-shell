import { useEffect, useMemo, useRef, type KeyboardEvent, type PointerEvent } from 'react'
import { useControllableState } from '../collection/useControllableState'
import { useAppLocale } from '../localization/useAppLocale'
import type { AppDockLayoutState, AppDockPanel, AppDockPosition, AppDockWorkspaceProps } from './types'
import './AppDockWorkspace.css'

const positions: AppDockPosition[] = ['left', 'right', 'bottom']
const defaultSizes: Record<AppDockPosition, number> = { left: 280, right: 280, bottom: 220 }

function normalizeLayout(
  layout: Partial<AppDockLayoutState> | undefined,
  panels: readonly AppDockPanel[],
): AppDockLayoutState {
  const panelKeys = new Set(panels.map((panel) => panel.key))
  const minimizedPanelKeys = Array.from(new Set(layout?.minimizedPanelKeys ?? []))
    .filter((key) => panelKeys.has(key))
  return {
    sizes: { ...layout?.sizes },
    activePanelKeys: { ...layout?.activePanelKeys },
    minimizedPanelKeys,
  }
}

function readPersistedLayout(
  key: string | undefined,
  storage: AppDockWorkspaceProps['storage'],
  fallback: Partial<AppDockLayoutState> | undefined,
  panels: readonly AppDockPanel[],
) {
  if (!key || !storage) return normalizeLayout(fallback, panels)
  try {
    const value = storage.getItem(key)
    if (!value) return normalizeLayout(fallback, panels)
    const parsed = JSON.parse(value) as { version?: number; layout?: Partial<AppDockLayoutState> }
    return parsed.version === 1
      ? normalizeLayout({ ...fallback, ...parsed.layout }, panels)
      : normalizeLayout(fallback, panels)
  } catch {
    return normalizeLayout(fallback, panels)
  }
}

function getDefaultStorage() {
  if (typeof window === 'undefined') return undefined
  try { return window.localStorage } catch { return undefined }
}

export function AppDockWorkspace({
  ariaLabel,
  children,
  className,
  defaultLayout,
  layout,
  onLayoutChange,
  panels,
  persistenceKey,
  storage = getDefaultStorage(),
  style,
}: AppDockWorkspaceProps) {
  const { messages } = useAppLocale()
  const rootRef = useRef<HTMLDivElement>(null)
  const initialLayout = readPersistedLayout(persistenceKey, storage, defaultLayout, panels)
  const [currentLayout, setCurrentLayout] = useControllableState({
    value: layout,
    defaultValue: initialLayout,
    onChange: onLayoutChange,
  })
  const minimized = useMemo(
    () => new Set(currentLayout.minimizedPanelKeys),
    [currentLayout.minimizedPanelKeys],
  )
  const visibleByPosition = useMemo(() => new Map(positions.map((position) => [
    position,
    panels.filter((panel) => panel.position === position && !minimized.has(panel.key)),
  ])), [minimized, panels])

  useEffect(() => {
    if (!persistenceKey || !storage) return
    try { storage.setItem(persistenceKey, JSON.stringify({ version: 1, layout: currentLayout })) } catch { /* Storage may be unavailable or full. */ }
  }, [currentLayout, persistenceKey, storage])

  const update = (patch: Partial<AppDockLayoutState>) => setCurrentLayout({
    ...currentLayout,
    ...patch,
    sizes: patch.sizes ?? currentLayout.sizes,
    activePanelKeys: patch.activePanelKeys ?? currentLayout.activePanelKeys,
    minimizedPanelKeys: patch.minimizedPanelKeys ?? currentLayout.minimizedPanelKeys,
  })
  const activePanel = (position: AppDockPosition) => {
    const visible = visibleByPosition.get(position) ?? []
    return visible.find((panel) => panel.key === currentLayout.activePanelKeys[position]) ?? visible[0]
  }
  const selectPanel = (position: AppDockPosition, key: string) => update({
    activePanelKeys: { ...currentLayout.activePanelKeys, [position]: key },
  })
  const minimizePanel = (panel: AppDockPanel) => {
    if (panel.minimizable === false) return
    update({ minimizedPanelKeys: [...currentLayout.minimizedPanelKeys, panel.key] })
  }
  const restorePanel = (panel: AppDockPanel) => update({
    activePanelKeys: { ...currentLayout.activePanelKeys, [panel.position]: panel.key },
    minimizedPanelKeys: currentLayout.minimizedPanelKeys.filter((key) => key !== panel.key),
  })
  const sizeFor = (position: AppDockPosition) => {
    const panel = activePanel(position)
    const value = currentLayout.sizes[position] ?? panel?.defaultSize ?? defaultSizes[position]
    return Math.min(panel?.maxSize ?? 720, Math.max(panel?.minSize ?? 140, value))
  }
  const setSize = (position: AppDockPosition, size: number) => {
    const panel = activePanel(position)
    const bounded = Math.min(panel?.maxSize ?? 720, Math.max(panel?.minSize ?? 140, Math.round(size)))
    update({ sizes: { ...currentLayout.sizes, [position]: bounded } })
  }
  const resizeBy = (position: AppDockPosition, delta: number) => setSize(position, sizeFor(position) + delta)
  const startResize = (position: AppDockPosition, event: PointerEvent<HTMLDivElement>) => {
    const rect = rootRef.current?.getBoundingClientRect()
    if (!rect) return
    event.currentTarget.setPointerCapture(event.pointerId)
    const move = (next: globalThis.PointerEvent) => {
      const size = position === 'left'
        ? next.clientX - rect.left
        : position === 'right'
          ? rect.right - next.clientX
          : rect.bottom - next.clientY
      setSize(position, size)
    }
    const end = () => {
      document.removeEventListener('pointermove', move)
      document.removeEventListener('pointerup', end)
    }
    document.addEventListener('pointermove', move)
    document.addEventListener('pointerup', end)
  }
  const resizeWithKeyboard = (position: AppDockPosition, event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 48 : 12
    let delta = 0
    if (position === 'left') {
      if (event.key === 'ArrowLeft') delta = -step
      else if (event.key === 'ArrowRight') delta = step
    } else if (position === 'right') {
      if (event.key === 'ArrowLeft') delta = step
      else if (event.key === 'ArrowRight') delta = -step
    } else {
      if (event.key === 'ArrowUp') delta = step
      else if (event.key === 'ArrowDown') delta = -step
    }
    if (delta) { event.preventDefault(); resizeBy(position, delta) }
  }
  const renderDock = (position: AppDockPosition) => {
    const visible = visibleByPosition.get(position) ?? []
    const panel = activePanel(position)
    if (!panel) return null
    return (
      <section aria-label={typeof panel.title === 'string' ? panel.title : undefined} className="app-dock-workspace__dock" data-position={position}>
        <header className="app-dock-workspace__dock-header">
          <div aria-label={messages.dockWorkspace.panels} className="app-dock-workspace__tabs" role="tablist">
            {visible.map((item) => (
              <button aria-selected={item.key === panel.key} className="app-dock-workspace__tab" key={item.key} onClick={() => selectPanel(position, item.key)} role="tab" tabIndex={item.key === panel.key ? 0 : -1} type="button">
                {item.icon ? <span className="app-dock-workspace__icon">{item.icon}</span> : null}
                <span>{item.title}</span>
              </button>
            ))}
          </div>
          {panel.minimizable !== false ? <button aria-label={messages.dockWorkspace.minimize} className="app-dock-workspace__minimize" onClick={() => minimizePanel(panel)} type="button"><span aria-hidden="true">−</span></button> : null}
        </header>
        <div className="app-dock-workspace__dock-content">{panel.content}</div>
      </section>
    )
  }

  const leftOpen = (visibleByPosition.get('left')?.length ?? 0) > 0
  const rightOpen = (visibleByPosition.get('right')?.length ?? 0) > 0
  const bottomOpen = (visibleByPosition.get('bottom')?.length ?? 0) > 0
  const minimizedPanels = currentLayout.minimizedPanelKeys
    .map((key) => panels.find((panel) => panel.key === key))
    .filter((panel): panel is AppDockPanel => Boolean(panel))
  const layoutStyle = {
    ...style,
    gridTemplateColumns: `${leftOpen ? sizeFor('left') : 0}px ${leftOpen ? 4 : 0}px minmax(0, 1fr) ${rightOpen ? 4 : 0}px ${rightOpen ? sizeFor('right') : 0}px`,
    gridTemplateRows: `minmax(0, 1fr) ${bottomOpen ? 4 : 0}px ${bottomOpen ? sizeFor('bottom') : 0}px ${minimizedPanels.length ? 34 : 0}px`,
  }
  const separator = (position: AppDockPosition) => {
    const panel = activePanel(position)
    if (!panel) return null
    return <div
      aria-label={messages.dockWorkspace.resize}
      aria-orientation={position === 'bottom' ? 'horizontal' : 'vertical'}
      aria-valuemax={panel.maxSize ?? 720}
      aria-valuemin={panel.minSize ?? 140}
      aria-valuenow={sizeFor(position)}
      className="app-dock-workspace__separator"
      data-position={position}
      onKeyDown={(event) => resizeWithKeyboard(position, event)}
      onPointerDown={(event) => startResize(position, event)}
      role="separator"
      tabIndex={0}
    />
  }

  return (
    <div aria-label={ariaLabel ?? messages.dockWorkspace.label} className={['app-dock-workspace', className].filter(Boolean).join(' ')} ref={rootRef} role="group" style={layoutStyle}>
      {renderDock('left')}
      {separator('left')}
      <div className="app-dock-workspace__main">{children}</div>
      {separator('right')}
      {renderDock('right')}
      {separator('bottom')}
      {renderDock('bottom')}
      {minimizedPanels.length ? (
        <div aria-label={messages.dockWorkspace.minimized} className="app-dock-workspace__tray" role="toolbar">
          {minimizedPanels.map((panel) => <button aria-label={messages.dockWorkspace.restore(panel.key)} className="app-dock-workspace__restore" key={panel.key} onClick={() => restorePanel(panel)} type="button">{panel.icon ? <span className="app-dock-workspace__icon">{panel.icon}</span> : null}<span>{panel.title}</span></button>)}
        </div>
      ) : null}
    </div>
  )
}
