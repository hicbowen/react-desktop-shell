/* eslint-disable react-refresh/only-export-components */
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type {
  AppToast,
  AppToastAction,
  AppToastHostOptions,
  AppToastId,
  AppToastOptions,
  AppToastStatus,
  AppToastUpdateOptions,
} from './types'
import { useAppLocale } from '../localization/useAppLocale'
import './AppToastHost.css'

const DEFAULT_DURATION = 4000
const DEFAULT_MAX_VISIBLE = 4
const EXIT_DURATION = 180

type ToastPhase = 'visible' | 'waiting' | 'exiting'
type PauseReason = 'hover' | 'window-blur'

interface ToastRecord {
  id: AppToastId
  title: ReactNode
  message?: ReactNode
  status: AppToastStatus
  icon?: ReactNode
  duration: number
  closable: boolean
  action?: AppToastAction
  phase: ToastPhase
  order: number
  timerVersion: number
}

interface TimerState {
  timeout: number | null
  startedAt: number | null
  remaining: number
  duration: number
  version: number
  pauseReasons: Set<PauseReason>
}

export function useToastStore(options: AppToastHostOptions | undefined) {
  const maxVisible = options?.maxVisible ?? DEFAULT_MAX_VISIBLE
  const [toasts, setToasts] = useState<ToastRecord[]>([])
  const timersRef = useRef(new Map<AppToastId, TimerState>())
  const nextIdRef = useRef(0)
  const nextOrderRef = useRef(0)

  const requestDismiss = useCallback((id: AppToastId) => {
    setToasts((current) =>
      current.map((toast) =>
        toast.id === id && toast.phase !== 'exiting'
          ? { ...toast, phase: 'exiting' as ToastPhase }
          : toast,
      ),
    )
  }, [])

  const clearTimer = useCallback((id: AppToastId) => {
    const timer = timersRef.current.get(id)

    if (!timer) {
      return
    }

    if (timer.timeout !== null) {
      window.clearTimeout(timer.timeout)
    }

    timersRef.current.delete(id)
  }, [])

  const promoteWaiting = useCallback(
    (items: ToastRecord[]) => {
      let visibleCount = items.filter((toast) => toast.phase === 'visible').length

      return items.map((toast) => {
        if (toast.phase !== 'waiting' || visibleCount >= maxVisible) {
          return toast
        }

        visibleCount += 1
        return {
          ...toast,
          phase: 'visible' as ToastPhase,
          timerVersion: toast.timerVersion + 1,
        }
      })
    },
    [maxVisible],
  )

  const removeToast = useCallback(
    (id: AppToastId) => {
      clearTimer(id)
      setToasts((current) => promoteWaiting(current.filter((toast) => toast.id !== id)))
    },
    [clearTimer, promoteWaiting],
  )

  const scheduleTimer = useCallback(
    (toast: ToastRecord, timer: TimerState) => {
      if (timer.timeout !== null) {
        window.clearTimeout(timer.timeout)
        timer.timeout = null
      }

      if (toast.duration <= 0 || timer.pauseReasons.size > 0) {
        timer.startedAt = null
        return
      }

      timer.startedAt = Date.now()
      timer.timeout = window.setTimeout(() => {
        requestDismiss(toast.id)
      }, timer.remaining)
    },
    [requestDismiss],
  )

  const pauseTimer = useCallback((id: AppToastId, reason: PauseReason) => {
    const timer = timersRef.current.get(id)

    if (!timer) {
      return
    }

    if (timer.timeout !== null && timer.startedAt !== null) {
      window.clearTimeout(timer.timeout)
      timer.timeout = null
      timer.remaining = Math.max(0, timer.remaining - (Date.now() - timer.startedAt))
      timer.startedAt = null
    }

    timer.pauseReasons.add(reason)
  }, [])

  const resumeTimer = useCallback(
    (id: AppToastId, reason: PauseReason) => {
      const timer = timersRef.current.get(id)

      if (!timer) {
        return
      }

      timer.pauseReasons.delete(reason)

      if (timer.pauseReasons.size > 0 || timer.duration <= 0) {
        return
      }

      const toast = toasts.find((item) => item.id === id)

      if (!toast || toast.phase !== 'visible') {
        return
      }

      scheduleTimer(toast, timer)
    },
    [scheduleTimer, toasts],
  )

  useEffect(() => {
    for (const toast of toasts) {
      if (toast.phase !== 'visible') {
        continue
      }

      const existing = timersRef.current.get(toast.id)
      const timerVersionChanged =
        !existing || existing.version !== toast.timerVersion
      let timer: TimerState

      if (timerVersionChanged) {
        timer = {
          timeout: null,
          startedAt: null,
          remaining: toast.duration,
          duration: toast.duration,
          version: toast.timerVersion,
          pauseReasons: existing?.pauseReasons ?? new Set<PauseReason>(),
        }
      } else {
        timer = existing
      }

      if (timerVersionChanged && existing && existing.timeout !== null) {
        window.clearTimeout(existing.timeout)
      }

      timer.duration = toast.duration
      timersRef.current.set(toast.id, timer)

      if (timerVersionChanged || timer.timeout === null) {
        scheduleTimer(toast, timer)
      }
    }

    for (const [id, timer] of timersRef.current) {
      if (!toasts.some((toast) => toast.id === id && toast.phase === 'visible')) {
        if (timer.timeout !== null) {
          window.clearTimeout(timer.timeout)
        }
        timersRef.current.delete(id)
      }
    }
  }, [scheduleTimer, toasts])

  useEffect(() => {
    const handleBlur = () => {
      for (const toast of toasts) {
        if (toast.phase === 'visible') {
          pauseTimer(toast.id, 'window-blur')
        }
      }
    }

    const handleFocus = () => {
      for (const toast of toasts) {
        if (toast.phase === 'visible') {
          resumeTimer(toast.id, 'window-blur')
        }
      }
    }

    window.addEventListener('blur', handleBlur)
    window.addEventListener('focus', handleFocus)

    return () => {
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('focus', handleFocus)
    }
  }, [pauseTimer, resumeTimer, toasts])

  useEffect(
    () => () => {
      for (const timer of timersRef.current.values()) {
        if (timer.timeout !== null) {
          window.clearTimeout(timer.timeout)
        }
      }

      timersRef.current.clear()
    },
    [],
  )

  const toast = useMemo<AppToast>(() => {
    const normalize = (input: AppToastOptions) => {
      const status = input.status ?? 'default'

      return {
        ...input,
        status,
        duration:
          input.duration ?? (status === 'loading' ? 0 : DEFAULT_DURATION),
        closable: input.closable ?? true,
      }
    }

    const show = (options: AppToastOptions) => {
      const normalized = normalize(options)
      const id = normalized.id ?? `app-toast-${nextIdRef.current + 1}`

      nextIdRef.current += normalized.id ? 0 : 1

      setToasts((current) => {
        const existing = current.find((item) => item.id === id)

        if (existing) {
          return current.map((item) =>
            item.id === id
              ? {
                  ...item,
                  title: normalized.title,
                  message: normalized.message,
                  status: normalized.status,
                  icon: normalized.icon,
                  duration: normalized.duration,
                  closable: normalized.closable,
                  action: normalized.action,
                  timerVersion: item.timerVersion + 1,
                }
              : item,
          )
        }

        const visibleCount = current.filter(
          (item) => item.phase === 'visible',
        ).length

        return [
          ...current,
          {
            id,
            title: normalized.title,
            message: normalized.message,
            status: normalized.status,
            icon: normalized.icon,
            duration: normalized.duration,
            closable: normalized.closable,
            action: normalized.action,
            phase: visibleCount < maxVisible ? 'visible' : 'waiting',
            order: nextOrderRef.current++,
            timerVersion: 0,
          },
        ]
      })

      return id
    }

    const shortcut = (
      status: AppToastStatus,
      title: ReactNode,
      options?: Omit<AppToastOptions, 'title' | 'status'>,
    ) => show({ ...options, title, status })

    return {
      show,
      update(id, options: AppToastUpdateOptions) {
        setToasts((current) =>
          current.map((item) => {
            if (item.id !== id) {
              return item
            }

            const nextStatus = options.status ?? item.status
            const hasDuration = Object.prototype.hasOwnProperty.call(
              options,
              'duration',
            )

            return {
              ...item,
              ...options,
              status: nextStatus,
              duration: hasDuration
                ? (options.duration ?? (nextStatus === 'loading' ? 0 : DEFAULT_DURATION))
                : item.duration,
              timerVersion: hasDuration ? item.timerVersion + 1 : item.timerVersion,
            }
          }),
        )
      },
      dismiss(id) {
        requestDismiss(id)
      },
      dismissAll() {
        setToasts((current) =>
          current
            .filter((item) => item.phase !== 'waiting')
            .map((item) => ({ ...item, phase: 'exiting' as ToastPhase })),
        )
      },
      success(title, options) {
        return shortcut('success', title, options)
      },
      error(title, options) {
        return shortcut('error', title, options)
      },
      warning(title, options) {
        return shortcut('warning', title, options)
      },
      info(title, options) {
        return shortcut('info', title, options)
      },
    }
  }, [maxVisible, requestDismiss])

  return {
    toast,
    toasts,
    pauseTimer,
    resumeTimer,
    removeToast,
  }
}

export interface AppToastHostProps {
  toasts: ToastRecord[]
  interactive: boolean
  onDismiss: (id: AppToastId) => void
  onExited: (id: AppToastId) => void
  onPause: (id: AppToastId) => void
  onResume: (id: AppToastId) => void
}

export function AppToastHost({
  toasts,
  interactive,
  onDismiss,
  onExited,
  onPause,
  onResume,
}: AppToastHostProps) {
  const { messages } = useAppLocale()
  const visibleToasts = toasts
    .filter((toast) => toast.phase === 'visible' || toast.phase === 'exiting')
    .sort((a, b) => a.order - b.order)

  if (visibleToasts.length === 0) {
    return null
  }

  return (
    <div className="app-toast-host" aria-live="polite" aria-relevant="additions">
      {visibleToasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          dismissLabel={messages.common.dismiss}
          interactive={interactive}
          onDismiss={onDismiss}
          onExited={onExited}
          onPause={onPause}
          onResume={onResume}
        />
      ))}
    </div>
  )
}

function ToastItem({
  toast,
  dismissLabel,
  interactive,
  onDismiss,
  onExited,
  onPause,
  onResume,
}: {
  toast: ToastRecord
  dismissLabel: string
  interactive: boolean
  onDismiss: (id: AppToastId) => void
  onExited: (id: AppToastId) => void
  onPause: (id: AppToastId) => void
  onResume: (id: AppToastId) => void
}) {
  useEffect(() => {
    if (toast.phase !== 'exiting') {
      return
    }

    const timeout = window.setTimeout(() => onExited(toast.id), EXIT_DURATION)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [onExited, toast.id, toast.phase])

  const icon = toast.icon ?? getDefaultIcon(toast.status)
  const role = toast.status === 'error' || toast.status === 'warning' ? 'alert' : 'status'

  return (
    <div
      className={[
        'app-toast',
        `app-toast--${toast.status}`,
        icon ? '' : 'app-toast--without-icon',
        toast.phase === 'exiting' ? 'app-toast--exit' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      role={role}
      onMouseEnter={() => onPause(toast.id)}
      onMouseLeave={() => onResume(toast.id)}
    >
      {icon ? <div className="app-toast__icon">{icon}</div> : null}
      <div className="app-toast__content">
        <div className="app-toast__title">{toast.title}</div>
        {toast.message ? (
          <div className="app-toast__message">{toast.message}</div>
        ) : null}
      </div>
      {toast.action ? (
        <button
          className="app-toast__action"
          type="button"
          tabIndex={interactive ? 0 : -1}
          onMouseDown={(event) => {
            if (!interactive) {
              event.preventDefault()
            }
          }}
          onClick={toast.action.onClick}
        >
          {toast.action.label}
        </button>
      ) : null}
      {toast.closable ? (
        <button
          className="app-toast__close"
          type="button"
          aria-label={dismissLabel}
          tabIndex={interactive ? 0 : -1}
          onMouseDown={(event) => {
            if (!interactive) {
              event.preventDefault()
            }
          }}
          onClick={() => onDismiss(toast.id)}
        >
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path
              d="M4.22 4.22a.75.75 0 0 1 1.06 0L8 6.94l2.72-2.72a.75.75 0 1 1 1.06 1.06L9.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L8 9.06l-2.72 2.72a.75.75 0 0 1-1.06-1.06L6.94 8 4.22 5.28a.75.75 0 0 1 0-1.06Z"
              fill="currentColor"
            />
          </svg>
        </button>
      ) : null}
    </div>
  )
}

function getDefaultIcon(status: AppToastStatus) {
  if (status === 'default') {
    return null
  }

  if (status === 'loading') {
    return (
      <svg className="app-toast__spinner" viewBox="0 0 16 16" aria-hidden="true">
        <circle cx="8" cy="8" r="6" />
      </svg>
    )
  }

  if (status === 'success') {
    return (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path
          d="M13.28 4.22a.75.75 0 0 1 0 1.06l-6.25 6.25a.75.75 0 0 1-1.06 0L2.72 8.28a.75.75 0 1 1 1.06-1.06L6.5 9.94l5.72-5.72a.75.75 0 0 1 1.06 0Z"
          fill="currentColor"
        />
      </svg>
    )
  }

  if (status === 'error') {
    return (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path
          d="M8 1.75a6.25 6.25 0 1 0 0 12.5 6.25 6.25 0 0 0 0-12.5Zm2.28 7.47a.75.75 0 1 1-1.06 1.06L8 9.06l-1.22 1.22a.75.75 0 1 1-1.06-1.06L6.94 8 5.72 6.78a.75.75 0 0 1 1.06-1.06L8 6.94l1.22-1.22a.75.75 0 1 1 1.06 1.06L9.06 8l1.22 1.22Z"
          fill="currentColor"
        />
      </svg>
    )
  }

  if (status === 'warning') {
    return (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path
          d="M7.15 2.37a.98.98 0 0 1 1.7 0l6.03 10.44a.98.98 0 0 1-.85 1.47H1.97a.98.98 0 0 1-.85-1.47L7.15 2.37ZM8 5a.75.75 0 0 0-.75.75v3a.75.75 0 0 0 1.5 0v-3A.75.75 0 0 0 8 5Zm0 6.75a.88.88 0 1 0 0-1.75.88.88 0 0 0 0 1.75Z"
          fill="currentColor"
        />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M8 1.75a6.25 6.25 0 1 0 0 12.5 6.25 6.25 0 0 0 0-12.5Zm0 10.5a.75.75 0 0 1-.75-.75V7.75a.75.75 0 0 1 1.5 0v3.75a.75.75 0 0 1-.75.75ZM8 6.25A.88.88 0 1 1 8 4.5a.88.88 0 0 1 0 1.75Z"
        fill="currentColor"
      />
    </svg>
  )
}
