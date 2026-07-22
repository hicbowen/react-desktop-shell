import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from 'react'
import { AppCommandContext } from './AppCommandStore'
import { isAppEditableTarget, matchesAppShortcut } from './shortcut'
import type {
  AppCommandApi,
  AppCommandProviderProps,
} from './types'

export function AppCommandProvider({
  children,
  commands,
  enableShortcuts = true,
}: AppCommandProviderProps) {
  const parent = useContext(AppCommandContext)
  const mergedCommands = useMemo(() => {
    const merged = new Map(parent?.commands.map((command) => [command.id, command]))
    commands.forEach((command) => merged.set(command.id, command))
    return Array.from(merged.values())
  }, [commands, parent?.commands])

  const get = useCallback(
    (commandId: string) => mergedCommands.find((command) => command.id === commandId),
    [mergedCommands],
  )

  const execute = useCallback<AppCommandApi['execute']>((commandId, context) => {
    const command = get(commandId)
    if (!command || command.disabled || command.hidden) return false
    void command.execute({ commandId, source: context?.source ?? 'api', ...context })
    return true
  }, [get])

  useEffect(() => {
    if (!enableShortcuts) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.isComposing || event.repeat) return

      const command = [...commands].reverse().find((candidate) =>
        candidate.shortcut &&
        !candidate.disabled &&
        !candidate.hidden &&
        (candidate.allowInEditable || !isAppEditableTarget(event.target)) &&
        matchesAppShortcut(event, candidate.shortcut),
      )

      if (!command) return
      event.preventDefault()
      void command.execute({
        commandId: command.id,
        nativeEvent: event,
        source: 'keyboard',
      })
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [commands, enableShortcuts])

  const value = useMemo<AppCommandApi>(
    () => ({ commands: mergedCommands, execute, get }),
    [execute, get, mergedCommands],
  )

  return <AppCommandContext.Provider value={value}>{children}</AppCommandContext.Provider>
}
