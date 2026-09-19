import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { AppButton } from '../button'
import {
  executeAppCommandReference,
  resolveAppCommand,
  useOptionalAppCommands,
} from '../command'
import { AppMenuFlyout } from '../menu-flyout'
import { useAppLocale } from '../localization/useAppLocale'
import type { AppToolbarProps } from './types'
import './AppToolbar.css'

export function AppToolbar({ appearance = 'surface', start, status, end, children, actions, overflowLabel, className }: AppToolbarProps) {
  const { messages } = useAppLocale()
  const commandApi = useOptionalAppCommands()
  const resolvedActions = useMemo(() => actions?.flatMap((action, index) => {
    const command = resolveAppCommand(action, commandApi)
    if (command?.hidden) return []
    return [{
      ...action,
      key: action.key ?? action.commandId ?? command?.id ?? `action-${index}`,
      label: action.label ?? command?.label ?? action.key ?? action.commandId,
      icon: action.icon ?? command?.icon,
      disabled: Boolean(action.disabled) || Boolean(command?.disabled) || Boolean(action.commandId && commandApi?.isPending(action.commandId)),
      run: () => {
        executeAppCommandReference(action, commandApi, 'toolbar')
        action.onClick?.()
      },
    }]
  }), [actions, commandApi])
  const rootRef = useRef<HTMLDivElement>(null)
  const startRef = useRef<HTMLDivElement>(null)
  const statusRef = useRef<HTMLDivElement>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const measureRefs = useRef<Array<HTMLSpanElement | null>>([])
  const [visibleCount, setVisibleCount] = useState(resolvedActions?.length ?? 0)
  const hasActions = Boolean(resolvedActions?.length)

  useLayoutEffect(() => {
    if (!hasActions || !resolvedActions) return
    const root = rootRef.current
    if (!root) return
    const measure = () => {
      const rootWidth = root.clientWidth
      const reserved = (startRef.current?.scrollWidth ?? 0) + (statusRef.current?.scrollWidth ?? 0) + (endRef.current?.scrollWidth ?? 0) + 64
      const available = Math.max(0, rootWidth - reserved)
      const widths = resolvedActions.map((_, index) => measureRefs.current[index]?.offsetWidth ?? 0)
      const total = widths.reduce((sum, width) => sum + width + 8, 0)
      if (total <= available) { setVisibleCount(resolvedActions.length); return }
      let used = 36
      let count = 0
      for (const width of widths) {
        if (used + width + 8 > available) break
        used += width + 8
        count += 1
      }
      setVisibleCount(count)
    }
    const schedule = () => requestAnimationFrame(measure)
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(schedule)
    observer?.observe(root)
    const frame = schedule()
    return () => { observer?.disconnect(); cancelAnimationFrame(frame) }
  }, [hasActions, resolvedActions])

  const hiddenActions = resolvedActions?.slice(visibleCount) ?? []
  const classes = ['app-toolbar', `app-toolbar--${appearance}`, hasActions ? 'app-toolbar--overflow' : '', className].filter(Boolean).join(' ')
  const hasChildren = children !== undefined && children !== null

  return <div className={classes} ref={rootRef}>
    {hasChildren ? children : <>
      {start !== undefined && start !== null ? <div className="app-toolbar__start" ref={startRef}>{start}</div> : null}
      {(status !== undefined && status !== null) || (end !== undefined && end !== null) || hasActions ? <div className="app-toolbar__trailing">
        {status !== undefined && status !== null ? <div className="app-toolbar__status" ref={statusRef}>{status}</div> : null}
        {end !== undefined && end !== null ? <div className="app-toolbar__end" ref={endRef}>{end}</div> : null}
        {hasActions ? <div className="app-toolbar__actions">{resolvedActions!.slice(0, visibleCount).map((action) => <AppButton appearance={action.appearance} disabled={action.disabled} icon={action.icon} key={action.key} onClick={action.run} size={action.size}>{action.label}</AppButton>)}{hiddenActions.length ? <AppMenuFlyout ariaLabel={overflowLabel ?? messages.toolbar.moreActions} items={hiddenActions.map((action) => ({ key: action.key, label: action.label, icon: action.icon, disabled: action.disabled, danger: action.danger }))} onSelect={(key) => resolvedActions!.find((action) => action.key === key)?.run()} placement="bottom-end"><button aria-label={overflowLabel ?? messages.toolbar.moreActions} className="app-toolbar__overflow" type="button">•••</button></AppMenuFlyout> : null}</div> : null}
      </div> : null}
      {hasActions ? <div aria-hidden="true" className="app-toolbar__measure">{resolvedActions!.map((action, index) => <span key={action.key} ref={(node) => { measureRefs.current[index] = node }}><AppButton icon={action.icon} size={action.size}>{action.label}</AppButton></span>)}</div> : null}
    </>}
  </div>
}
