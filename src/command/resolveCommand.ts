import type {
  AppCommandApi,
  AppCommandExecutionSource,
  AppCommandReference,
} from './types'

export function resolveAppCommand(
  reference: AppCommandReference,
  api: AppCommandApi | null,
) {
  return (
    reference.command ??
    (reference.commandId ? api?.get(reference.commandId) : undefined)
  )
}

export function executeAppCommandReference(
  reference: AppCommandReference,
  api: AppCommandApi | null,
  source: AppCommandExecutionSource,
) {
  if (reference.commandId && api) {
    return api.execute(reference.commandId, { source })
  }

  const command = resolveAppCommand(reference, api)
  if (!command || command.disabled || command.hidden) return false
  void command.execute({ commandId: command.id, source })
  return true
}
