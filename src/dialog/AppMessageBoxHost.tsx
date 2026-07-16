import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type {
  AppMessageBox,
  AppMessageBoxButton,
  AppMessageBoxConfirmOptions,
  AppMessageBoxOptions,
} from './types'
import type { AppLocaleMessages } from '../localization/types'

export interface MessageBoxRequest {
  id: number
  options: AppMessageBoxOptions
  restoreFocusElement: HTMLElement | null
  resolve: (value: string | undefined) => void
}

export function useMessageBoxQueue(
  locale: Pick<AppLocaleMessages['common'], 'confirm' | 'cancel'>,
  registerDialog: (dialog: MessageBoxRequest | null) => void,
) {
  const queueRef = useRef<MessageBoxRequest[]>([])
  const currentRef = useRef<MessageBoxRequest | null>(null)
  const idRef = useRef(0)
  const [, forceUpdate] = useState(0)

  const flushNext = useCallback(() => {
    if (currentRef.current) {
      registerDialog(currentRef.current)
      return
    }

    const next = queueRef.current.shift() ?? null
    currentRef.current = next
    registerDialog(next)
  }, [registerDialog])

  const completeCurrent = useCallback(
    (value: string | undefined) => {
      const current = currentRef.current

      if (!current) {
        return
      }

      currentRef.current = null
      current.resolve(value)
      forceUpdate((count) => count + 1)
      window.queueMicrotask(flushNext)
    },
    [flushNext],
  )

  const messageBox = useMemo<AppMessageBox>(
    () => {
      const show = (options: AppMessageBoxOptions) => {
        return new Promise<string | undefined>((resolve) => {
          queueRef.current.push({
            id: idRef.current + 1,
            options,
            restoreFocusElement:
              document.activeElement instanceof HTMLElement
                ? document.activeElement
                : null,
            resolve,
          })
          idRef.current += 1
          flushNext()
        })
      }

      return {
        show,
        confirm(options: AppMessageBoxConfirmOptions) {
          return show({
            title: options.title,
            message: options.message,
            icon: options.icon,
            buttons: [
              {
                key: 'cancel',
                label: options.cancelText ?? locale.cancel,
              },
              {
                key: 'confirm',
                label: options.confirmText ?? locale.confirm,
                primary: true,
                danger: options.danger,
              },
            ],
            defaultButton: 'confirm',
            cancelButton: 'cancel',
          }).then((result) => result === 'confirm')
        },
      }
    },
    [flushNext, locale],
  )

  useEffect(
    () => () => {
      currentRef.current?.resolve(undefined)
      currentRef.current = null

      for (const request of queueRef.current) {
        request.resolve(undefined)
      }

      queueRef.current = []
    },
    [],
  )

  return {
    messageBox,
    completeCurrent,
  }
}

export function renderMessageBoxContent(options: AppMessageBoxOptions) {
  return (
    <div
      className={[
        'app-message-box',
        options.icon ? 'app-message-box--with-icon' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {options.icon ? (
        <div className="app-message-box__icon">{options.icon}</div>
      ) : null}
      {options.title ? (
        <div className="app-message-box__title">{options.title}</div>
      ) : null}
      {options.message ? (
        <div className="app-message-box__message">{options.message}</div>
      ) : null}
    </div>
  )
}

export function renderMessageBoxActions(
  buttons: AppMessageBoxButton[],
  onClick: (key: string) => void,
) {
  return buttons.map((button) => (
    <button
      className={[
        'app-dialog__button',
        button.primary ? 'app-dialog__button--primary' : '',
        button.danger ? 'app-dialog__button--danger' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      disabled={button.disabled}
      key={button.key}
      type="button"
      onClick={() => onClick(button.key)}
    >
      {button.label}
    </button>
  ))
}
