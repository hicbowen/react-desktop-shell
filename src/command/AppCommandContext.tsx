import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
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

  const [pendingCommandIds, setPendingCommandIds] = useState<Set<string>>(
    () => new Set(),
  )
  const [commandErrors, setCommandErrors] = useState<Map<string, unknown>>(
    () => new Map(),
  )

  const clearError = useCallback((commandId: string) => {
    setCommandErrors((current) => {
      if (!current.has(commandId)) return current
      const next = new Map(current)
      next.delete(commandId)
      return next
    })
  }, [])

  const run = useCallback(
    (
      command: NonNullable<ReturnType<typeof get>>,
      context: Parameters<AppCommandApi['execute']>[1],
    ) => {
      clearError(command.id)
      let result: void | Promise<void>
      try {
        result = command.execute({
          commandId: command.id,
          source: context?.source ?? 'api',
          ...context,
        })
      } catch (error) {
        setCommandErrors((current) =>
          new Map(current).set(command.id, error),
        )
        return
      }

      if (!result || typeof result.then !== 'function') return
      setPendingCommandIds((current) => new Set(current).add(command.id))
      void result
        .catch((error) => {
          setCommandErrors((current) =>
            new Map(current).set(command.id, error),
          )
        })
        .finally(() => {
          setPendingCommandIds((current) => {
            const next = new Set(current)
            next.delete(command.id)
            return next
          })
        })
    },
    [clearError],
  )

  const execute = useCallback<AppCommandApi['execute']>(
    (commandId, context) => {
      const command = get(commandId)
      if (
        !command ||
        command.disabled ||
        command.hidden ||
        pendingCommandIds.has(commandId)
      ) {
        return false
      }
      run(command, context)
      return true
    },
    [get, pendingCommandIds, run],
  )

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
      execute(command.id, {
        nativeEvent: event,
        source: 'keyboard',
      })
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [commands, enableShortcuts, execute])

  const getShortcutConflicts = useCallback<AppCommandApi['getShortcutConflicts']>(
    (shortcut, excludeCommandId) =>
      mergedCommands.filter(
        (command) =>
          command.id !== excludeCommandId &&
          command.shortcut !== undefined &&
          command.shortcut.key.toLocaleLowerCase() ===
            shortcut.key.toLocaleLowerCase() &&
          Boolean(command.shortcut.alt) === Boolean(shortcut.alt) &&
          Boolean(command.shortcut.ctrl) === Boolean(shortcut.ctrl) &&
          Boolean(command.shortcut.meta) === Boolean(shortcut.meta) &&
          Boolean(command.shortcut.shift) === Boolean(shortcut.shift),
      ),
    [mergedCommands],
  )

  const value = useMemo<AppCommandApi>(
    () => ({
      clearError,
      commands: mergedCommands,
      execute,
      get,
      getError: (commandId) => commandErrors.get(commandId),
      getShortcutConflicts,
      isPending: (commandId) => pendingCommandIds.has(commandId),
    }),
    [
      clearError,
      commandErrors,
      execute,
      get,
      getShortcutConflicts,
      mergedCommands,
      pendingCommandIds,
    ],
  )

  return <AppCommandContext.Provider value={value}>{children}</AppCommandContext.Provider>
}
