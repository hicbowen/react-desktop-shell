import type { CSSProperties } from 'react'
import type { AppPopoverProps } from '../popover'

export interface AppColorPickerPanelProps {
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string | null) => void
  presets?: readonly string[]
  allowClear?: boolean
  disabled?: boolean
  className?: string
  style?: CSSProperties
}

export interface AppColorPickerProps extends AppColorPickerPanelProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  placement?: AppPopoverProps['placement']
  label?: string
}
