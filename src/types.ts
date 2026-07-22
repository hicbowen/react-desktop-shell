import type { CSSProperties, ReactNode } from 'react'

export type { AppButtonAppearance, AppButtonProps, AppButtonSize, AppIconButtonProps } from './button/types'
export type { AppEmptyStateProps } from './empty-state/types'
export type { AppFieldProps } from './field/types'
export type { AppProgressBarProps, AppProgressRingProps, AppStatusBadgeProps } from './progress/types'
export type { AppTagAppearance, AppTagColor, AppTagProps } from './tag/types'
export type { AppCascaderOption, AppCascaderProps } from './cascader/types'
export type { AppSliderMark, AppSliderProps } from './slider/types'
export type { AppTextAreaProps, AppTextBoxProps } from './text-input/types'
export type { AppComboBoxOption, AppComboBoxProps } from './combo-box/types'
export type { AppAutoCompleteOption, AppAutoCompleteProps } from './auto-complete/types'
export type {
  AppCheckBoxProps,
  AppRadioGroupOption,
  AppRadioGroupProps,
  AppSegmentedControlOption,
  AppSegmentedControlProps,
  AppToggleSwitchProps,
} from './selection-controls/types'
export type { AppNumberBoxProps, AppSelectOption, AppSelectProps } from './number-select/types'
export type { AppListViewItemProps, AppListViewProps } from './list-view/types'
export type { AppExpanderProps } from './expander/types'
export type { AppPopoverProps } from './popover/types'
export type {
  AppDatePickerProps,
  AppDateRangePickerProps,
  AppDateRangeValue,
  AppDateValue,
} from './date-picker/types'
export type {
  AppTimePickerProps,
  AppTimeRangePickerProps,
  AppTimeRangeValue,
  AppTimeValue,
} from './time-picker/types'

export type {
  AppCardAppearance,
  AppCardFooterProps,
  AppCardGroupProps,
  AppCardHeaderProps,
  AppCardOrientation,
  AppCardPadding,
  AppCardProps,
} from './card'
export type {
  AppClipboardAdapter,
  AppContextMenuActionItem,
  AppContextMenuApi,
  AppContextMenuItem,
  AppContextMenuMode,
  AppContextMenuOpenOptions,
  AppContextMenuProps,
  AppContextMenuSeparatorItem,
  AppContextMenuSubmenuItem,
} from './context-menu/types'
export type {
  AppDialogProps,
  AppMessageBox,
  AppMessageBoxButton,
  AppMessageBoxConfirmOptions,
  AppMessageBoxOptions,
} from './dialog/types'
export type { AppInfoBarProps, AppInfoBarStatus } from './info-bar/types'
export type { AppFileDropOverlayProps } from './file-drop-overlay/types'
export type { FileDropRejectionReason } from './file-drop-overlay/fileAcceptance'
export type {
  AppMenuFlyoutEntry,
  AppMenuFlyoutItem,
  AppMenuFlyoutProps,
  AppMenuFlyoutSeparator,
} from './menu-flyout/types'
export type {
  AppSettingsGroupProps,
  AppSettingsRowProps,
} from './settings/types'
export type {
  AppRailProps,
  RailEntry,
  RailGroup,
  RailItem,
  RailLinkItem,
  RailSubmenu,
} from './navigation/types'
export type {
  AppSelectorBarItem,
  AppSelectorBarProps,
  AppSelectorPanelMountStrategy,
  AppSelectorPanelProps,
  AppSelectorPanelsProps,
} from './selector-bar'
export type {
  AppScrollAreaGutter,
  AppScrollAreaOrientation,
  AppScrollAreaProps,
  AppScrollAreaScrollbar,
} from './scroll-area'
export type {
  AppShellProps,
  AppShellSidebarOptions,
  AppTheme,
  PaneDisplayMode,
} from './shell/types'
export type { AppSplitButtonProps } from './split-button/types'
export type {
  AppTeachingTipAction,
  AppTeachingTipProps,
} from './teaching-tip/types'
export type {
  AppToast,
  AppToastAction,
  AppToastHostOptions,
  AppToastId,
  AppToastOptions,
  AppToastShortcutOptions,
  AppToastStatus,
  AppToastUpdateOptions,
} from './toast/types'
export type { AppToolbarAppearance, AppToolbarProps } from './toolbar/types'
export type { AppTooltipPlacement, AppTooltipProps } from './tooltip/types'

export type AppPageLayout = 'flow' | 'fill'

export interface AppPageProps {
  title?: ReactNode
  description?: ReactNode
  actions?: ReactNode
  children?: ReactNode
  sidePane?: ReactNode
  layout?: AppPageLayout
  animated?: boolean
  className?: string
  style?: CSSProperties
  contentClassName?: string
  contentStyle?: CSSProperties
}

export interface AppSidePaneProps {
  open: boolean
  title?: ReactNode
  children: ReactNode
  width?: number
  defaultWidth?: number
  minWidth?: number
  maxWidth?: number
  resizable?: boolean
  onWidthChange?: (width: number) => void
  onClose?: () => void
  footer?: ReactNode
  className?: string
  style?: CSSProperties
}

export interface AppTitleBarProps {
  title?: ReactNode
  icon?: ReactNode
  actions?: ReactNode
  onMinimize?: () => void
  maximized?: boolean
  onToggleMaximize?: () => void
  onClose?: () => void
  showMinimize?: boolean
  showMaximize?: boolean
  showClose?: boolean
  className?: string
  style?: CSSProperties
}
