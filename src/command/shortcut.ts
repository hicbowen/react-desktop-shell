import type { AppShortcut } from './types'

const modifierKeys = new Set(['Alt', 'Control', 'Meta', 'Shift'])

export function matchesAppShortcut(
  event: Pick<KeyboardEvent, 'altKey' | 'ctrlKey' | 'key' | 'metaKey' | 'shiftKey'>,
  shortcut: AppShortcut,
) {
  if (modifierKeys.has(event.key)) return false

  return (
    event.key.toLocaleLowerCase() === shortcut.key.toLocaleLowerCase() &&
    event.altKey === Boolean(shortcut.alt) &&
    event.ctrlKey === Boolean(shortcut.ctrl) &&
    event.metaKey === Boolean(shortcut.meta) &&
    event.shiftKey === Boolean(shortcut.shift)
  )
}

export function formatAppShortcut(
  shortcut: AppShortcut,
  platform = typeof navigator === 'undefined' ? '' : navigator.platform,
) {
  const isMac = platform.toLocaleLowerCase().includes('mac')
  const parts: string[] = []
  if (shortcut.ctrl) parts.push(isMac ? '⌃' : 'Ctrl')
  if (shortcut.alt) parts.push(isMac ? '⌥' : 'Alt')
  if (shortcut.shift) parts.push(isMac ? '⇧' : 'Shift')
  if (shortcut.meta) parts.push(isMac ? '⌘' : 'Meta')

  const key = shortcut.key.length === 1
    ? shortcut.key.toLocaleUpperCase()
    : shortcut.key
  parts.push(key)
  return parts.join(isMac ? '' : '+')
}

export function isAppEditableTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return false
  if (target.closest('[contenteditable="true"]')) return true

  const control = target.closest('input, textarea, select')
  if (!(control instanceof HTMLInputElement)) return control !== null
  return !['button', 'checkbox', 'color', 'file', 'radio', 'range', 'reset', 'submit']
    .includes(control.type)
}
