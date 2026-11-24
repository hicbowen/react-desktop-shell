# Feedback and overlay services

Use `/feedback` with `core/style.css` and `feedback/style.css`. These recipes
run below an existing `AppShell` or `AppProvider`, which supplies overlay and
service contexts. Do not import or manually mount internal overlay hosts.

## Choose the surface

| Need                                     | API                                       |
| ---------------------------------------- | ----------------------------------------- |
| Transient result notification            | `useAppToast()`                           |
| Persistent inline status                 | `AppInfoBar`                              |
| Promise-based yes/no decision            | `useAppMessageBox().confirm(options)`     |
| Decision returning a custom button key   | `useAppMessageBox().show(options)`        |
| Custom modal content or form             | `AppDialog`                               |
| Small confirmation anchored to a trigger | `AppConfirmPopover`                       |
| Anchored interactive content             | `AppPopover`                              |
| Brief label/help                         | `AppTooltip`                              |
| Rich hover preview                       | `AppHoverCard`                            |
| Right-click actions                      | `AppContextMenu` or `useAppContextMenu()` |

## Confirmation and async feedback

Adapted from `example/src/pages/feedback/FeedbackPages.tsx`. Here the callback
performs the application operation; the UI reports success only after it
resolves and handles failure separately.

```tsx
import { useState } from 'react'
import { AppButton } from 'react-desktop-shell/core'
import { useAppMessageBox, useAppToast } from 'react-desktop-shell/feedback'
import 'react-desktop-shell/core/style.css'
import 'react-desktop-shell/feedback/style.css'

export function DeleteAction({ remove }: { remove: () => Promise<void> }) {
  const messageBox = useAppMessageBox()
  const toast = useAppToast()
  const [pending, setPending] = useState(false)
  const run = async () => {
    if (pending) return
    setPending(true)
    try {
      const confirmed = await messageBox.confirm({
        title: 'Delete selected item?',
        message: 'This cannot be undone.',
        confirmText: 'Delete',
        danger: true,
      })
      if (!confirmed) return
      await remove()
      toast.success('Deleted')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Delete failed')
    } finally {
      setPending(false)
    }
  }
  return (
    <AppButton appearance="danger" disabled={pending} onClick={() => void run()}>
      Delete
    </AppButton>
  )
}
```

Use confirmations according to the consuming application's requirements.
This example demonstrates the API, not a requirement to confirm every action.

## Dialog and context-menu details

- `AppDialog` uses `open` / `onOpenChange`, `title`, `description`, `actions`,
  and `children`. `initialFocus` accepts an element ref. Keep the controlled
  `open` value synchronized and leave Escape/focus handling to the component.
- A form's submit action must belong to its form. If a dialog's `actions`
  slot sits outside `AppForm`, use a button that calls `form.submit()` or
  place the submit button inside the form; do not assume DOM form ownership
  across slots or portals.
- `messageBox.show` resolves a button key or `undefined`; `confirm` resolves
  a boolean. These are different return contracts.
- `contextMenu.open` receives `items`, `x`, `y`, and optionally `trigger`.
  Items use `key`, `label`, and `onClick`; separators use
  `{ type: 'separator' }`. Call `event.preventDefault()` when replacing a
  native context menu in an explicit row/tab handler. See the table and tab
  examples for integration points.
- Anchored surfaces have component-specific trigger/children contracts.
  Read their declarations instead of assuming Radix-style `asChild` or
  another library's trigger API. Preserve a focusable trigger with its ref
  and event behavior.
- Toasts are created through the hook; do not invent an `AppToast` JSX
  component. `toast.show` accepts options and returns an ID for updates or
  dismissal; `duration: 0` keeps a notification until dismissed.
