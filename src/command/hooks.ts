import { useContext } from 'react'
import { AppCommandContext } from './AppCommandStore'

export function useAppCommands() {
  const value = useContext(AppCommandContext)
  if (!value) throw new Error('useAppCommands must be used inside AppCommandProvider')
  return value
}

export function useOptionalAppCommands() {
  return useContext(AppCommandContext)
}

export function useAppCommand(commandId: string) {
  return useAppCommands().get(commandId)
}

export function useAppCommandExecutor() {
  return useAppCommands().execute
}

export function useAppCommandState(commandId: string) {
  const commands = useAppCommands()
  return {
    command: commands.get(commandId),
    error: commands.getError(commandId),
    pending: commands.isPending(commandId),
  }
}
