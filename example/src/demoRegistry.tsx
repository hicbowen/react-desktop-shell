import type { ComponentType, ReactNode } from 'react'
import { Bell, Boxes, CalendarDays, CalendarRange, CircleHelp, Clock, Columns3, CreditCard, Info, LayoutDashboard, LayoutPanelTop, Lightbulb, ListChecks, Menu, MessageSquare, MousePointerClick, Navigation, PanelRight, Rows3, ScrollText, Settings, SlidersHorizontal, Table2, Tags, Timer, UploadCloud, Wrench, SquareMousePointer, Clock3 } from 'lucide-react'
import type { RailEntry, RailItem } from '../../src'
import { OverviewPage } from './pages/OverviewPage'
import { AppPagePage, AppShellPage, AppSidePanePage, AppTitleBarPage } from './pages/shell/ShellPages'
import { AppRailPage, AppSelectorBarPage, NavigationModesPage } from './pages/navigation/NavigationPages'
import { AppTabViewPage } from './pages/navigation/TabViewPage'
import { AppDialogPage, AppInfoBarPage, AppToastPage, MessageBoxPage } from './pages/feedback/FeedbackPages'
import { AppCommandPage, AppToolbarPage, ContextMenuPage } from './pages/actions/ActionPages'
import { AppDataTablePage, AppSelectionBarPage } from './pages/data/DataPages'
import { SettingsPage } from './pages/settings/SettingsPages'
import { AppCardPage } from './pages/content/CardPages'
import { FieldEmptyStatePage } from './pages/content/FieldEmptyStatePage'
import { ListViewPage } from './pages/content/ListViewPage'
import { ExpanderPage } from './pages/content/ExpanderPage'
import { TagPage } from './pages/content/TagPage'
import { AppScrollAreaPage } from './pages/content/ScrollAreaPage'
import { AppTreeViewPage } from './pages/content/TreeViewPage'
import { AppStatusBarPage } from './pages/content/StatusBarPage'
import { AppTooltipPage } from './pages/feedback/TooltipPage'
import { AppMenuFlyoutPage } from './pages/actions/MenuFlyoutPage'
import { AppSplitButtonPage } from './pages/actions/SplitButtonPage'
import { ButtonsPage } from './pages/actions/ButtonsPage'
import { AppTeachingTipPage } from './pages/feedback/TeachingTipPage'
import { AppFileDropOverlayPage } from './pages/feedback/FileDropOverlayPage'
import { ProgressStatusPage } from './pages/feedback/ProgressStatusPage'
import { PopoverPage } from './pages/feedback/PopoverPage'
import { TextInputsPage } from './pages/forms/TextInputsPage'
import { SelectionControlsPage } from './pages/forms/SelectionControlsPage'
import { NumberSelectPage } from './pages/forms/NumberSelectPage'
import { AutoCompletePage } from './pages/forms/AutoCompletePage'
import { CascaderPage } from './pages/forms/CascaderPage'
import { SliderPage } from './pages/forms/SliderPage'
import { DatePickerPage } from './pages/forms/DatePickerPage'
import { DateRangePickerPage } from './pages/forms/DateRangePickerPage'
import { TimePickerPage } from './pages/forms/TimePickerPage'
import { TimeRangePickerPage } from './pages/forms/TimeRangePickerPage'

export type DemoPageDefinition = { key: string; group: string; label: string; description: string; icon: ReactNode; component: ComponentType; layout?: 'default' | 'fill' }

export const demoPages: DemoPageDefinition[] = [
  { key: 'overview', group: 'Overview', label: 'Overview', description: 'Browse the library by component category and exported name.', icon: <LayoutDashboard size={16} />, component: OverviewPage },
  { key: 'app-shell', group: 'Shell & Layout', label: 'AppShell', description: 'The root frame for desktop-style application chrome and overlays.', icon: <Boxes size={16} />, component: AppShellPage },
  { key: 'app-title-bar', group: 'Shell & Layout', label: 'AppTitleBar', description: 'Window title, actions, and native window controls.', icon: <LayoutPanelTop size={16} />, component: AppTitleBarPage },
  { key: 'app-page', group: 'Shell & Layout', label: 'AppPage', description: 'Consistent page headers, content, actions, and side panes.', icon: <Columns3 size={16} />, component: AppPagePage },
  { key: 'app-side-pane', group: 'Shell & Layout', label: 'AppSidePane', description: 'Dismissible and optionally resizable secondary content.', icon: <PanelRight size={16} />, component: AppSidePanePage },
  { key: 'app-rail', group: 'Navigation', label: 'AppRail', description: 'Grouped navigation items, submenus, badges, and footer links.', icon: <Navigation size={16} />, component: AppRailPage },
  { key: 'app-selector-bar', group: 'Navigation', label: 'AppSelectorBar', description: 'Switch between a few mutually exclusive views within the current page.', icon: <Rows3 size={16} />, component: AppSelectorBarPage },
  { key: 'app-tab-view', group: 'Navigation', label: 'AppTabView', description: 'Closable, reorderable document tabs with explicit panel lifecycle.', icon: <Columns3 size={16} />, component: AppTabViewPage },
  { key: 'navigation-modes', group: 'Navigation', label: 'Navigation Modes', description: 'Expanded, compact, minimal, and responsive rail behavior.', icon: <Menu size={16} />, component: NavigationModesPage },
  { key: 'app-card', group: 'Content', label: 'AppCard', description: 'Fluent content surfaces, composition, interaction states, and continuous groups.', icon: <CreditCard size={16} />, component: AppCardPage },
  { key: 'app-scroll-area', group: 'Content', label: 'AppScrollArea', description: 'Native scrolling with Fluent overflow, scrollbar, and gutter styling.', icon: <ScrollText size={16} />, component: AppScrollAreaPage },
  { key: 'field-empty-state', group: 'Content', label: 'Field & Empty State', description: 'Accessible field structure and compact or regular empty content.', icon: <Rows3 size={16} />, component: FieldEmptyStatePage },
  { key: 'list-view', group: 'Content', label: 'List View', description: 'Desktop information lists with selection, invocation, and keyboard navigation.', icon: <ListChecks size={16} />, component: ListViewPage },
  { key: 'tree-view', group: 'Content', label: 'AppTreeView', description: 'Hierarchical resources with selection, lazy expansion, keyboard navigation, and drag requests.', icon: <ListChecks size={16} />, component: AppTreeViewPage },
  { key: 'status-bar', group: 'Content', label: 'AppStatusBar', description: 'Compact persistent workspace status and contextual actions.', icon: <Rows3 size={16} />, component: AppStatusBarPage },
  { key: 'expander', group: 'Content', label: 'Expander', description: 'Collapsible settings, release notes, and low-frequency details.', icon: <Columns3 size={16} />, component: ExpanderPage },
  { key: 'app-tag', group: 'Content', label: 'AppTag', description: 'Colored labels for categories, attributes, and removable values.', icon: <Tags size={16} />, component: TagPage },
  { key: 'app-info-bar', group: 'Feedback', label: 'AppInfoBar', description: 'Inline informational, success, warning, and error states.', icon: <Info size={16} />, component: AppInfoBarPage },
  { key: 'progress-status', group: 'Feedback', label: 'Progress & Status', description: 'Indeterminate and determinate progress with semantic status badges.', icon: <Clock3 size={16} />, component: ProgressStatusPage },
  { key: 'popover', group: 'Feedback', label: 'Popover', description: 'Portal-based non-modal supporting content with anchored placement.', icon: <MessageSquare size={16} />, component: PopoverPage },
  { key: 'app-tooltip', group: 'Feedback', label: 'AppTooltip', description: 'Non-interactive descriptions for hover and keyboard focus.', icon: <CircleHelp size={16} />, component: AppTooltipPage },
  { key: 'app-teaching-tip', group: 'Feedback', label: 'AppTeachingTip', description: 'Controlled anchored guidance with title, content, and actions.', icon: <Lightbulb size={16} />, component: AppTeachingTipPage },
  { key: 'app-file-drop-overlay', group: 'Feedback', label: 'AppFileDropOverlay', description: 'Accepting and rejecting overlays for local file drags.', icon: <UploadCloud size={16} />, component: AppFileDropOverlayPage },
  { key: 'app-toast', group: 'Feedback', label: 'AppToast', description: 'Transient notifications, actions, duration, and dismissal.', icon: <Bell size={16} />, component: AppToastPage },
  { key: 'app-dialog', group: 'Feedback', label: 'AppDialog', description: 'Modal content with controlled state and custom actions.', icon: <MessageSquare size={16} />, component: AppDialogPage },
  { key: 'message-box', group: 'Feedback', label: 'Message Box', description: 'Promise-based confirmation and decision dialogs.', icon: <MessageSquare size={16} />, component: MessageBoxPage },
  { key: 'app-toolbar', group: 'Actions', label: 'AppToolbar', description: 'Start, status, and end regions for page-level actions.', icon: <Wrench size={16} />, component: AppToolbarPage },
  { key: 'app-command', group: 'Actions', label: 'AppCommand', description: 'Shared command definitions, execution state, and keyboard accelerators.', icon: <Wrench size={16} />, component: AppCommandPage },
  { key: 'buttons', group: 'Actions', label: 'Buttons', description: 'Desktop command buttons, icon buttons, states, and composition.', icon: <SquareMousePointer size={16} />, component: ButtonsPage },
  { key: 'app-menu-flyout', group: 'Actions', label: 'AppMenuFlyout', description: 'Anchored one-level command menus with keyboard navigation.', icon: <ListChecks size={16} />, component: AppMenuFlyoutPage },
  { key: 'app-split-button', group: 'Actions', label: 'AppSplitButton', description: 'A default command paired with alternate menu actions.', icon: <Columns3 size={16} />, component: AppSplitButtonPage },
  { key: 'context-menu', group: 'Actions', label: 'Context Menu', description: 'Nested contextual commands and native text actions.', icon: <MousePointerClick size={16} />, component: ContextMenuPage },
  { key: 'text-inputs', group: 'Forms', label: 'Text Inputs', description: 'Text boxes and text areas with icons, clear, validation, and counting.', icon: <Rows3 size={16} />, component: TextInputsPage },
  { key: 'selection-controls', group: 'Forms', label: 'Selection Controls', description: 'Native check boxes and accessible toggle switches.', icon: <ListChecks size={16} />, component: SelectionControlsPage },
  { key: 'number-select', group: 'Forms', label: 'Number & Select', description: 'Stepped numeric input and reliable native option selection.', icon: <SlidersHorizontal size={16} />, component: NumberSelectPage },
  { key: 'auto-complete', group: 'Forms', label: 'AppAutoComplete', description: 'Free text input with filtered suggestions and keyboard navigation.', icon: <SlidersHorizontal size={16} />, component: AutoCompletePage },
  { key: 'cascader', group: 'Forms', label: 'AppCascader', description: 'Choose a leaf value from a hierarchy shown in successive columns.', icon: <Columns3 size={16} />, component: CascaderPage },
  { key: 'slider', group: 'Forms', label: 'AppSlider', description: 'Adjust a relative numeric value along a styled range track.', icon: <SlidersHorizontal size={16} />, component: SliderPage },
  { key: 'date-picker', group: 'Forms', label: 'Date Picker', description: 'Timezone-free calendar dates with constraints, forms, and dialog overlays.', icon: <CalendarDays size={16} />, component: DatePickerPage },
  { key: 'date-range-picker', group: 'Forms', label: 'Date Range Picker', description: 'Pending range selection with Apply, duration limits, and two-month views.', icon: <CalendarRange size={16} />, component: DateRangePickerPage },
  { key: 'time-picker', group: 'Forms', label: 'Time Picker', description: 'Same-day times with steps, limits, 12-hour display, and confirmed Apply.', icon: <Clock size={16} />, component: TimePickerPage },
  { key: 'time-range-picker', group: 'Forms', label: 'Time Range Picker', description: 'Start and end time editing with duration validation and no overnight ranges.', icon: <Timer size={16} />, component: TimeRangePickerPage },
  { key: 'app-data-table', group: 'Data', label: 'AppDataTable', description: 'A complete data surface with page actions, selection actions, built-in controls, sorting, sizing, and fill layouts.', icon: <Table2 size={16} />, component: AppDataTablePage, layout: 'fill' },
  { key: 'app-selection-bar', group: 'Data', label: 'AppSelectionBar', description: 'Actions and clear behavior for selected data rows.', icon: <Rows3 size={16} />, component: AppSelectionBarPage },
  { key: 'settings', group: 'Settings', label: 'Settings', description: 'Application appearance, language, preferences, and information.', icon: <Settings size={16} />, component: SettingsPage },
]

const mainDemoPages = demoPages.filter((page) => page.key !== 'settings')

export const railItems: RailEntry[] = mainDemoPages.flatMap((page, index) => {
  const previous = mainDemoPages[index - 1]
  const group = page.group !== previous?.group && page.group !== 'Overview' ? [{ type: 'group' as const, label: page.group }] : []
  return [...group, { key: page.key, label: page.label, icon: page.icon }]
})

export const railFooterItems: RailItem[] = [
  { key: 'settings', label: 'Settings', icon: <Settings size={16} /> },
]
