import type { AppCommand } from '../command'
export interface AppCommandPaletteProps { commands: readonly AppCommand[]; open: boolean; onOpenChange: (open: boolean) => void; placeholder?: string; ariaLabel?: string; emptyText?: string; maxResults?: number }
