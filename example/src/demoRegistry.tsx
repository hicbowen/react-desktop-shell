import type { ComponentType, ReactNode } from 'react'
import { Bell, Boxes, CircleHelp, Columns3, CreditCard, Info, LayoutDashboard, LayoutPanelTop, Lightbulb, ListChecks, Menu, MessageSquare, MousePointerClick, Navigation, PanelRight, Rows3, ScrollText, Settings, SlidersHorizontal, Table2, UploadCloud, Wrench, SquareMousePointer, Clock3 } from 'lucide-react'
import type { RailEntry, RailItem } from '../../src'
import { OverviewPage } from './pages/OverviewPage'
import { AppPagePage, AppShellPage, AppSidePanePage, AppTitleBarPage } from './pages/shell/ShellPages'
import { AppRailPage, AppSelectorBarPage, NavigationModesPage } from './pages/navigation/NavigationPages'
import { AppDialogPage, AppInfoBarPage, AppToastPage, MessageBoxPage } from './pages/feedback/FeedbackPages'
import { AppToolbarPage, ContextMenuPage } from './pages/actions/ActionPages'
import { AppDataTablePage, AppSelectionBarPage } from './pages/data/DataPages'
import { AppSettingsGroupPage, AppSettingsRowPage, ThemeControlsPage } from './pages/settings/SettingsPages'
import { AntdThemePage } from './pages/integrations/AntdThemePage'
import { AppCardPage } from './pages/content/CardPages'
import { FieldEmptyStatePage } from './pages/content/FieldEmptyStatePage'
import { ListViewPage } from './pages/content/ListViewPage'
import { ExpanderPage } from './pages/content/ExpanderPage'
import { AppScrollAreaPage } from './pages/content/ScrollAreaPage'
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

export type DemoPageDefinition = { key: string; group: string; label: string; description: string; icon: ReactNode; component: ComponentType; layout?: 'default' | 'fill' }

export const demoPages: DemoPageDefinition[] = [
  { key: 'overview', group: 'Overview', label: 'Overview', description: 'Browse the library by component category and exported name.', icon: <LayoutDashboard size={16} />, component: OverviewPage },
  { key: 'app-shell', group: 'Shell & Layout', label: 'AppShell', description: 'The root frame for desktop-style application chrome and overlays.', icon: <Boxes size={16} />, component: AppShellPage },
  { key: 'app-title-bar', group: 'Shell & Layout', label: 'AppTitleBar', description: 'Window title, actions, and native window controls.', icon: <LayoutPanelTop size={16} />, component: AppTitleBarPage },
  { key: 'app-page', group: 'Shell & Layout', label: 'AppPage', description: 'Consistent page headers, content, actions, and side panes.', icon: <Columns3 size={16} />, component: AppPagePage },
  { key: 'app-side-pane', group: 'Shell & Layout', label: 'AppSidePane', description: 'Dismissible and optionally resizable secondary content.', icon: <PanelRight size={16} />, component: AppSidePanePage },
  { key: 'app-rail', group: 'Navigation', label: 'AppRail', description: 'Grouped navigation items, submenus, badges, and footer links.', icon: <Navigation size={16} />, component: AppRailPage },
  { key: 'app-selector-bar', group: 'Navigation', label: 'AppSelectorBar', description: 'Switch between a few mutually exclusive views within the current page.', icon: <Rows3 size={16} />, component: AppSelectorBarPage },
  { key: 'navigation-modes', group: 'Navigation', label: 'Navigation Modes', description: 'Expanded, compact, minimal, and responsive rail behavior.', icon: <Menu size={16} />, component: NavigationModesPage },
  { key: 'app-card', group: 'Content', label: 'AppCard', description: 'Fluent content surfaces, composition, interaction states, and continuous groups.', icon: <CreditCard size={16} />, component: AppCardPage },
  { key: 'app-scroll-area', group: 'Content', label: 'AppScrollArea', description: 'Native scrolling with Fluent overflow, scrollbar, and gutter styling.', icon: <ScrollText size={16} />, component: AppScrollAreaPage },
  { key: 'field-empty-state', group: 'Content', label: 'Field & Empty State', description: 'Accessible field structure and compact or regular empty content.', icon: <Rows3 size={16} />, component: FieldEmptyStatePage },
  { key: 'list-view', group: 'Content', label: 'List View', description: 'Desktop information lists with selection, invocation, and keyboard navigation.', icon: <ListChecks size={16} />, component: ListViewPage },
  { key: 'expander', group: 'Content', label: 'Expander', description: 'Collapsible settings, release notes, and low-frequency details.', icon: <Columns3 size={16} />, component: ExpanderPage },
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
  { key: 'buttons', group: 'Actions', label: 'Buttons', description: 'Desktop command buttons, icon buttons, states, and composition.', icon: <SquareMousePointer size={16} />, component: ButtonsPage },
  { key: 'app-menu-flyout', group: 'Actions', label: 'AppMenuFlyout', description: 'Anchored one-level command menus with keyboard navigation.', icon: <ListChecks size={16} />, component: AppMenuFlyoutPage },
  { key: 'app-split-button', group: 'Actions', label: 'AppSplitButton', description: 'A default command paired with alternate menu actions.', icon: <Columns3 size={16} />, component: AppSplitButtonPage },
  { key: 'context-menu', group: 'Actions', label: 'Context Menu', description: 'Nested contextual commands and native text actions.', icon: <MousePointerClick size={16} />, component: ContextMenuPage },
  { key: 'text-inputs', group: 'Forms', label: 'Text Inputs', description: 'Text boxes and text areas with icons, clear, validation, and counting.', icon: <Rows3 size={16} />, component: TextInputsPage },
  { key: 'selection-controls', group: 'Forms', label: 'Selection Controls', description: 'Native check boxes and accessible toggle switches.', icon: <ListChecks size={16} />, component: SelectionControlsPage },
  { key: 'number-select', group: 'Forms', label: 'Number & Select', description: 'Stepped numeric input and reliable native option selection.', icon: <SlidersHorizontal size={16} />, component: NumberSelectPage },
  { key: 'app-data-table', group: 'Data', label: 'AppDataTable', description: 'A complete data surface with page actions, selection actions, built-in controls, sorting, sizing, and fill layouts.', icon: <Table2 size={16} />, component: AppDataTablePage, layout: 'fill' },
  { key: 'app-selection-bar', group: 'Data', label: 'AppSelectionBar', description: 'Actions and clear behavior for selected data rows.', icon: <Rows3 size={16} />, component: AppSelectionBarPage },
  { key: 'app-settings-group', group: 'Settings', label: 'AppSettingsGroup', description: 'Headings and containers for related preference rows.', icon: <Settings size={16} />, component: AppSettingsGroupPage },
  { key: 'app-settings-row', group: 'Settings', label: 'AppSettingsRow', description: 'Aligned preference labels, descriptions, controls, and states.', icon: <Settings size={16} />, component: AppSettingsRowPage },
  { key: 'theme-controls', group: 'Settings', label: 'Theme Controls', description: 'Live system, light, and dark application themes.', icon: <SlidersHorizontal size={16} />, component: ThemeControlsPage },
  { key: 'antd-theme', group: 'Integrations', label: 'Ant Design Theme', description: 'Theme tokens shared between the shell and Ant Design controls.', icon: <Boxes size={16} />, component: AntdThemePage },
]

export const railItems: RailEntry[] = demoPages.flatMap((page, index) => {
  const previous = demoPages[index - 1]
  const group = page.group !== previous?.group && page.group !== 'Overview' ? [{ type: 'group' as const, label: page.group }] : []
  const item = page.key === 'app-settings-group' ? [] : [{ key: page.key, label: page.label, icon: page.icon }]
  return [...group, ...item]
})

export const railFooterItems: RailItem[] = [
  { key: 'app-settings-group', label: 'Settings', icon: <Settings size={16} /> },
]
