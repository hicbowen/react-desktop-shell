import { useCallback, useMemo, useRef, useState } from 'react'
import type { AppLocaleMessages } from '../localization/types'
import type {
  AppDialogRegistration,
  AppDialogRegistry,
} from './AppDialogContext'
import {
  renderMessageBoxActions,
  renderMessageBoxContent,
  useMessageBoxQueue,
  type MessageBoxRequest,
} from './AppMessageBoxHost'

export function useDialogController(
  locale: Pick<AppLocaleMessages['common'], 'confirm' | 'cancel'>,
  onModalOpen: () => void,
) {
  const dialogRegistryRef = useRef(new Map<string, AppDialogRegistration>())
  const [dialogs, setDialogs] = useState<AppDialogRegistration[]>([])
  const [messageBoxRequest, setMessageBoxRequest] = useState<{
    id: number
    options: MessageBoxRequest['options']
    restoreFocusElement: HTMLElement | null
  } | null>(null)
  const syncDialogs = useCallback(() => {
    setDialogs(Array.from(dialogRegistryRef.current.values()))
  }, [])
  const registry = useMemo<AppDialogRegistry>(
    () => ({
      register(dialog) {
        dialogRegistryRef.current.set(dialog.id, dialog)
        onModalOpen()
        syncDialogs()
      },
      unregister(id) {
        dialogRegistryRef.current.delete(id)
        syncDialogs()
      },
    }),
    [onModalOpen, syncDialogs],
  )
  const registerMessageBox = useCallback(
    (request: MessageBoxRequest | null) => {
      if (request) {
        onModalOpen()
      }

      setMessageBoxRequest(
        request
          ? {
              id: request.id,
              options: request.options,
              restoreFocusElement: request.restoreFocusElement,
            }
          : null,
      )
    },
    [onModalOpen],
  )
  const { messageBox, completeCurrent } = useMessageBoxQueue(
    locale,
    registerMessageBox,
  )
  const renderedDialogs = useMemo<AppDialogRegistration[]>(
    () => [
      ...dialogs,
      ...(messageBoxRequest
        ? [
            {
              id: `app-message-box-${messageBoxRequest.id}`,
              open: true,
              title: undefined,
              children: renderMessageBoxContent(messageBoxRequest.options),
              actions: renderMessageBoxActions(
                messageBoxRequest.options.buttons,
                completeCurrent,
              ),
              width: 420,
              closeOnEscape: messageBoxRequest.options.closeOnEscape ?? true,
              closeOnOverlayClick: false,
              onOpenChange: (open: boolean) => {
                if (!open) {
                  completeCurrent(messageBoxRequest.options.cancelButton)
                }
              },
              onDefaultAction: () => {
                const defaultButton = messageBoxRequest.options.defaultButton
                const button = messageBoxRequest.options.buttons.find(
                  (item) => item.key === defaultButton,
                )

                if (button && !button.disabled) {
                  completeCurrent(button.key)
                }
              },
              restoreFocusElement: messageBoxRequest.restoreFocusElement,
            },
          ]
        : []),
    ],
    [completeCurrent, dialogs, messageBoxRequest],
  )

  return {
    registry,
    messageBox,
    dialogs: renderedDialogs,
    hasModalDialog: renderedDialogs.length > 0,
  }
}
