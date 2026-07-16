import type { OverlayDismissReason } from './useOverlayDismiss'

export type PickerCloseReason =
  | OverlayDismissReason
  | 'apply'
  | 'cancel'
  | 'trigger'
