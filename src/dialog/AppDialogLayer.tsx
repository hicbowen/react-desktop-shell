import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { CSSProperties } from 'react'
import type { AppDialogRegistration } from './AppDialogContext'
import './AppDialogLayer.css'

const EXIT_DURATION = 180
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
  '[contenteditable=""]',
].join(',')

export interface AppDialogLayerProps {
  dialogs: AppDialogRegistration[]
}

interface RenderedDialog {
  dialog: AppDialogRegistration
  exiting: boolean
}

export function AppDialogLayer({ dialogs }: AppDialogLayerProps) {
  const openKey = dialogs.map((dialog) => dialog.id).join('|')
  const latestDialogs = new Map(dialogs.map((dialog) => [dialog.id, dialog]))
  const [renderState, setRenderState] = useState<{
    openKey: string
    rendered: RenderedDialog[]
  }>({
    openKey,
    rendered: dialogs.map((dialog) => ({ dialog, exiting: false })),
  })

  if (renderState.openKey !== openKey) {
    const next = dialogs.map((dialog) => ({ dialog, exiting: false }))
    const exiting = renderState.rendered
      .filter(
        (entry) =>
          !entry.exiting &&
          !dialogs.some((dialog) => dialog.id === entry.dialog.id),
      )
      .map((entry) => ({
        dialog: entry.dialog,
        exiting: true,
      }))

    setRenderState({
      openKey,
      rendered: [...next, ...exiting],
    })
  } else if (
    renderState.rendered.some(
      (entry) =>
        !entry.exiting &&
        latestDialogs.get(entry.dialog.id) !== entry.dialog,
    )
  ) {
    setRenderState((current) => ({
      ...current,
      rendered: current.rendered.map((entry) => {
        if (entry.exiting) {
          return entry
        }

        const latestDialog = latestDialogs.get(entry.dialog.id)
        return latestDialog ? { ...entry, dialog: latestDialog } : entry
      }),
    }))
  }

  const renderedSnapshot =
    renderState.openKey === openKey
      ? renderState.rendered
      : dialogs.map((dialog) => ({ dialog, exiting: false }))
  const rendered = renderedSnapshot.map((entry) => {
    if (entry.exiting) {
      return entry
    }

    const latestDialog = latestDialogs.get(entry.dialog.id)

    return latestDialog ? { ...entry, dialog: latestDialog } : entry
  })

  if (rendered.length === 0) {
    return null
  }

  const topOpenId = dialogs.at(-1)?.id

  return (
    <div className="app-dialog-layer" aria-hidden={undefined}>
      {rendered.map((entry, index) => (
        <AppDialogSurface
          key={entry.dialog.id}
          dialog={entry.dialog}
          exiting={entry.exiting}
          top={entry.dialog.id === topOpenId}
          stackIndex={index}
          onExited={() => {
            setRenderState((current) => ({
              ...current,
              rendered: current.rendered.filter(
                (item) => item.dialog.id !== entry.dialog.id,
              ),
            }))
          }}
        />
      ))}
    </div>
  )
}

function AppDialogSurface({
  dialog,
  exiting,
  top,
  stackIndex,
  onExited,
}: {
  dialog: AppDialogRegistration
  exiting: boolean
  top: boolean
  stackIndex: number
  onExited: () => void
}) {
  const surfaceRef = useRef<HTMLDivElement | null>(null)
  const titleId = `${useId()}-title`
  const descriptionId = `${useId()}-description`
  const closeOnEscape = dialog.closeOnEscape ?? true
  const closeOnOverlayClick = dialog.closeOnOverlayClick ?? false
  const width =
    typeof dialog.width === 'number' ? `${dialog.width}px` : dialog.width

  const surfaceStyle = useMemo(
    () =>
      ({
        '--app-dialog-width': width ?? '460px',
      }) as CSSProperties,
    [width],
  )

  useEffect(() => {
    if (!exiting) {
      return
    }

    const timeout = window.setTimeout(onExited, EXIT_DURATION)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [exiting, onExited])

  useLayoutEffect(() => {
    if (!top || exiting) {
      return
    }

    const focusTarget =
      dialog.initialFocus?.current ??
      getTabbableElements(surfaceRef.current)[0] ??
      surfaceRef.current

    focusTarget?.focus({ preventScroll: true })

    return () => {
      const restore = dialog.restoreFocusElement

      if (restore && document.contains(restore)) {
        restore.focus({ preventScroll: true })
      }
    }
  }, [dialog, exiting, top])

  useEffect(() => {
    if (!top || exiting) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (closeOnEscape) {
          event.preventDefault()
          dialog.onOpenChange?.(false)
        }

        return
      }

      if (
        event.key === 'Enter' &&
        dialog.onDefaultAction &&
        !isTextEntryElement(document.activeElement)
      ) {
        event.preventDefault()
        dialog.onDefaultAction()
        return
      }

      if (event.key !== 'Tab') {
        return
      }

      const surface = surfaceRef.current

      if (!surface) {
        return
      }

      const tabbable = getTabbableElements(surface)

      if (tabbable.length === 0) {
        event.preventDefault()
        surface.focus({ preventScroll: true })
        return
      }

      const first = tabbable[0]
      const last = tabbable[tabbable.length - 1]
      const active = document.activeElement

      if (event.shiftKey) {
        if (active === first || !surface.contains(active)) {
          event.preventDefault()
          last.focus({ preventScroll: true })
        }

        return
      }

      if (active === last || !surface.contains(active)) {
        event.preventDefault()
        first.focus({ preventScroll: true })
      }
    }

    document.addEventListener('keydown', handleKeyDown, true)

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [closeOnEscape, dialog, exiting, top])

  return (
    <div
      className={[
        'app-dialog-overlay',
        exiting ? 'app-dialog-overlay--exit' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ zIndex: 1100 + stackIndex }}
      data-top-dialog={top ? 'true' : undefined}
      onMouseDown={(event) => {
        if (
          top &&
          closeOnOverlayClick &&
          event.target === event.currentTarget
        ) {
          dialog.onOpenChange?.(false)
        }
      }}
    >
      <div
        ref={surfaceRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={dialog.title ? titleId : undefined}
        aria-describedby={dialog.description ? descriptionId : undefined}
        tabIndex={-1}
        className={[
          'app-dialog',
          dialog.className ?? '',
          exiting ? 'app-dialog--exit' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        style={surfaceStyle}
      >
        {dialog.title || dialog.description ? (
          <header className="app-dialog__header">
            {dialog.title ? (
              <div className="app-dialog__title" id={titleId}>
                {dialog.title}
              </div>
            ) : null}
            {dialog.description ? (
              <div className="app-dialog__description" id={descriptionId}>
                {dialog.description}
              </div>
            ) : null}
          </header>
        ) : null}
        {dialog.children ? (
          <div className="app-dialog__content">{dialog.children}</div>
        ) : null}
        {dialog.actions ? (
          <footer className="app-dialog__actions">{dialog.actions}</footer>
        ) : null}
      </div>
    </div>
  )
}

function isTextEntryElement(element: Element | null) {
  if (!element) {
    return false
  }

  const tagName = element.tagName.toLowerCase()

  return (
    tagName === 'textarea' ||
    tagName === 'select' ||
    (tagName === 'input' &&
      !['button', 'checkbox', 'radio', 'reset', 'submit'].includes(
        (element as HTMLInputElement).type,
      )) ||
    (element instanceof HTMLElement && element.isContentEditable)
  )
}

function getTabbableElements(root: HTMLElement | null) {
  if (!root) {
    return []
  }

  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
    .filter((element) => {
      if (element.hasAttribute('disabled')) {
        return false
      }

      const ariaDisabled = element.getAttribute('aria-disabled') === 'true'
      const style = window.getComputedStyle(element)

      return (
        !ariaDisabled &&
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        element.offsetParent !== null
      )
    })
}
