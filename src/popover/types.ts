import type { CSSProperties, ReactElement, ReactNode, RefObject } from 'react'; import type { AnchoredOverlayPlacement } from '../overlay/placement'
export interface AppPopoverProps { trigger: ReactElement; children: ReactNode; open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void; placement?: Extract<AnchoredOverlayPlacement, 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'right'>; offset?: number; closeOnEscape?: boolean; closeOnOutsideClick?: boolean; matchTriggerWidth?: boolean; ariaLabel?: string; initialFocusRef?: RefObject<HTMLElement | null>; className?: string; style?: CSSProperties }
export interface AppConfirmPopoverProps {
  trigger: ReactElement
  title: ReactNode
  description?: ReactNode
  confirmText?: ReactNode
  cancelText?: ReactNode
  confirmAppearance?: 'primary' | 'danger'
  onConfirm: () => void | Promise<void>
  onCancel?: () => void
  onConfirmError?: (error: unknown) => void
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  placement?: AppPopoverProps['placement']
  offset?: number
  className?: string
  style?: CSSProperties
}
