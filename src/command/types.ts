import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from 'react'

export interface AppShortcut {
  key: string
  alt?: boolean
  ctrl?: boolean
  meta?: boolean
  shift?: boolean
}

export type AppCommandExecutionSource =
  | 'api'
  | 'keyboard'
  | 'menu'
  | 'palette'
  | 'toolbar'
  | 'unknown'

export interface AppCommandExecutionContext {
  commandId: string
  source: AppCommandExecutionSource
  nativeEvent?: Event | ReactKeyboardEvent
}

export interface AppCommand {
  id: string
  label: ReactNode
  description?: ReactNode
  icon?: ReactNode
  shortcut?: AppShortcut
  disabled?: boolean
  hidden?: boolean
  checked?: boolean
  allowInEditable?: boolean
  execute: (context: AppCommandExecutionContext) => void | Promise<void>
}

export interface AppCommandProviderProps {
  children?: ReactNode
  commands: readonly AppCommand[]
  enableShortcuts?: boolean
}

export interface AppCommandApi {
  commands: readonly AppCommand[]
  execute: (
    commandId: string,
    context?: Omit<AppCommandExecutionContext, 'commandId'>,
  ) => boolean
  get: (commandId: string) => AppCommand | undefined
}
