import type { AppCommand, AppCommandExecutionContext } from './types'

export function executeAppCommand(
  command: AppCommand,
  context?: Omit<AppCommandExecutionContext, 'commandId'>,
) {
  if (command.disabled || command.hidden) return false
  void command.execute({ commandId: command.id, source: context?.source ?? 'api', ...context })
  return true
}
