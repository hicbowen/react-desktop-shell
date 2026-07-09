import type {
  AppClipboardAdapter,
  AppContextMenuItem,
  AppContextMenuLocale,
} from './types'

export const defaultContextMenuLocale: AppContextMenuLocale = {
  undo: 'Undo',
  cut: 'Cut',
  copy: 'Copy',
  paste: 'Paste',
  delete: 'Delete',
  selectAll: 'Select all',
}

export const defaultClipboardAdapter: AppClipboardAdapter = {
  async readText() {
    if (!navigator.clipboard?.readText) {
      return ''
    }

    return navigator.clipboard.readText()
  },
  async writeText(text: string) {
    if (!navigator.clipboard?.writeText) {
      return
    }

    await navigator.clipboard.writeText(text)
  },
}

export type EditableElement =
  | HTMLInputElement
  | HTMLTextAreaElement
  | HTMLElement

export function getEditableElement(target: EventTarget | null) {
  if (!(target instanceof Element)) {
    return null
  }

  const element = target.closest('input, textarea, [contenteditable=""], [contenteditable="true"]')

  if (element instanceof HTMLInputElement && isEditableInput(element)) {
    return element
  }

  if (
    element instanceof HTMLTextAreaElement ||
    (element instanceof HTMLElement && element.isContentEditable)
  ) {
    return element
  }

  return null
}

export function hasEditableSelection(editable: EditableElement) {
  if (isTextInput(editable)) {
    return (editable.selectionStart ?? 0) !== (editable.selectionEnd ?? 0)
  }

  const selection = window.getSelection()

  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
    return false
  }

  return editable.contains(selection.getRangeAt(0).commonAncestorContainer)
}

export function createEditableMenuItems(
  editable: EditableElement,
  clipboard: AppClipboardAdapter,
  locale: AppContextMenuLocale,
): AppContextMenuItem[] {
  return [
    {
      key: 'undo',
      label: locale.undo,
      shortcut: shortcut('Z'),
      onClick: () => runSafely(() => undoEditable(editable)),
    },
    { type: 'separator' },
    {
      key: 'cut',
      label: locale.cut,
      shortcut: shortcut('X'),
      onClick: () => runSafely(() => cutEditable(editable, clipboard)),
    },
    {
      key: 'copy',
      label: locale.copy,
      shortcut: shortcut('C'),
      onClick: () => runSafely(() => copyEditable(editable, clipboard)),
    },
    {
      key: 'paste',
      label: locale.paste,
      shortcut: shortcut('V'),
      onClick: () => runSafely(() => pasteEditable(editable, clipboard)),
    },
    {
      key: 'delete',
      label: locale.delete,
      onClick: () => runSafely(() => deleteEditable(editable)),
    },
    { type: 'separator' },
    {
      key: 'select-all',
      label: locale.selectAll,
      shortcut: shortcut('A'),
      onClick: () => runSafely(() => selectAllEditable(editable)),
    },
  ]
}

export function createSelectionMenuItems(
  clipboard: AppClipboardAdapter,
  locale: AppContextMenuLocale,
): AppContextMenuItem[] {
  return [
    {
      key: 'copy-selection',
      label: locale.copy,
      shortcut: shortcut('C'),
      onClick: () =>
        runSafely(async () => {
          const selection = window.getSelection()?.toString() ?? ''
          if (selection) {
            await clipboard.writeText(selection)
          }
        }),
    },
  ]
}

function shortcut(key: string) {
  const platform = typeof navigator === 'undefined' ? '' : navigator.platform
  const modifier = platform.toLowerCase().includes('mac')
    ? '⌘'
    : 'Ctrl+'

  return `${modifier}${key}`
}

async function runSafely(action: () => void | Promise<void>) {
  try {
    await action()
  } catch {
    // Clipboard permissions vary across WebViews; menu actions should stay quiet.
  }
}

function isTextInput(
  editable: EditableElement,
): editable is HTMLInputElement | HTMLTextAreaElement {
  return (
    editable instanceof HTMLInputElement ||
    editable instanceof HTMLTextAreaElement
  )
}

function isEditableInput(input: HTMLInputElement) {
  return [
    '',
    'email',
    'number',
    'password',
    'search',
    'tel',
    'text',
    'url',
  ].includes(input.type)
}

function dispatchEditableInput(editable: EditableElement) {
  editable.dispatchEvent(new InputEvent('input', { bubbles: true }))
}

function updateInputSelection(
  input: HTMLInputElement | HTMLTextAreaElement,
  text: string,
) {
  const start = input.selectionStart ?? input.value.length
  const end = input.selectionEnd ?? start

  input.setRangeText(text, start, end, 'end')
  dispatchEditableInput(input)
}

function selectedInputText(input: HTMLInputElement | HTMLTextAreaElement) {
  const start = input.selectionStart ?? 0
  const end = input.selectionEnd ?? start

  return input.value.slice(start, end)
}

function getEditableSelectionRange(editable: HTMLElement) {
  const selection = window.getSelection()

  if (!selection || selection.rangeCount === 0) {
    return null
  }

  const range = selection.getRangeAt(0)

  if (!editable.contains(range.commonAncestorContainer)) {
    return null
  }

  return range
}

function insertContentEditableText(editable: HTMLElement, text: string) {
  const selection = window.getSelection()
  const range = getEditableSelectionRange(editable)

  if (!selection || !range) {
    editable.focus()
    editable.append(document.createTextNode(text))
    dispatchEditableInput(editable)
    return
  }

  range.deleteContents()
  const node = document.createTextNode(text)
  range.insertNode(node)
  range.setStartAfter(node)
  range.collapse(true)
  selection.removeAllRanges()
  selection.addRange(range)
  dispatchEditableInput(editable)
}

function undoEditable(editable: EditableElement) {
  editable.focus()
  const beforeInput = new InputEvent('beforeinput', {
    bubbles: true,
    cancelable: true,
    inputType: 'historyUndo',
  })

  editable.dispatchEvent(beforeInput)

  try {
    if (document.queryCommandSupported?.('undo')) {
      document.execCommand('undo')
    }
  } catch {
    // Some WebViews expose execCommand but reject undo outside trusted input.
  }
}

async function cutEditable(
  editable: EditableElement,
  clipboard: AppClipboardAdapter,
) {
  await copyEditable(editable, clipboard)
  deleteEditable(editable)
}

async function copyEditable(
  editable: EditableElement,
  clipboard: AppClipboardAdapter,
) {
  const text = isTextInput(editable)
    ? selectedInputText(editable)
    : (window.getSelection()?.toString() ?? '')

  if (text) {
    await clipboard.writeText(text)
  }
}

async function pasteEditable(
  editable: EditableElement,
  clipboard: AppClipboardAdapter,
) {
  const text = await clipboard.readText()

  if (!text) {
    return
  }

  editable.focus()

  if (isTextInput(editable)) {
    updateInputSelection(editable, text)
    return
  }

  insertContentEditableText(editable, text)
}

function deleteEditable(editable: EditableElement) {
  editable.focus()

  if (isTextInput(editable)) {
    updateInputSelection(editable, '')
    return
  }

  const range = getEditableSelectionRange(editable)
  range?.deleteContents()
  dispatchEditableInput(editable)
}

function selectAllEditable(editable: EditableElement) {
  editable.focus()

  if (isTextInput(editable)) {
    editable.setSelectionRange(0, editable.value.length)
    return
  }

  const range = document.createRange()
  range.selectNodeContents(editable)
  const selection = window.getSelection()
  selection?.removeAllRanges()
  selection?.addRange(range)
}
