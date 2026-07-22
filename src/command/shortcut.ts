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

export function formatAppShortcut(shortcut: AppShortcut) {
  const parts: string[] = []
  if (shortcut.ctrl) parts.push('Ctrl')
  if (shortcut.alt) parts.push('Alt')
  if (shortcut.shift) parts.push('Shift')
  if (shortcut.meta) parts.push('Meta')

  const key = shortcut.key.length === 1
    ? shortcut.key.toLocaleUpperCase()
    : shortcut.key
  parts.push(key)
  return parts.join('+')
}

export function isAppEditableTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return false
  if (target.closest('[contenteditable="true"]')) return true

  const control = target.closest('input, textarea, select')
  if (!(control instanceof HTMLInputElement)) return control !== null
  return !['button', 'checkbox', 'color', 'file', 'radio', 'range', 'reset', 'submit']
    .includes(control.type)
}
