import type { ComponentType, ReactNode } from 'react'
import { Bell, Boxes, CalendarDays, CalendarRange, CircleHelp, Clock, Columns3, CreditCard, Info, LayoutDashboard, LayoutPanelTop, Lightbulb, ListChecks, Menu, MessageSquare, MousePointerClick, Navigation, PanelRight, Rows3, ScrollText, Settings, SlidersHorizontal, Table2, Tags, Timer, UploadCloud, Wrench, SquareMousePointer, Clock3 } from 'lucide-react'
import type { RailEntry, RailItem } from '../../src'
import { OverviewPage } from './pages/OverviewPage'
import { AppPagePage, AppShellPage, AppSidePanePage, AppTitleBarPage } from './pages/shell/ShellPages'
import { AppResizablePanePage } from './pages/shell/ResizablePanePage'
import { AppRailPage, AppSelectorBarPage, NavigationModesPage } from './pages/navigation/NavigationPages'
import { AppTabViewPage } from './pages/navigation/TabViewPage'
import { AppBreadcrumbBarPage } from './pages/navigation/BreadcrumbBarPage'
import { AppDialogPage, AppInfoBarPage, AppToastPage, MessageBoxPage } from './pages/feedback/FeedbackPages'
import { AppCommandPage, AppToolbarPage, ContextMenuPage } from './pages/actions/ActionPages'
import { AppMenuBarPage } from './pages/actions/MenuBarPage'
import { AppCommandPalettePage } from './pages/actions/CommandPalettePage'
import { AppShortcutRecorderPage } from './pages/actions/ShortcutRecorderPage'
import { AppToggleButtonPage } from './pages/actions/ToggleButtonPage'
import { AppDataTablePage, AppSelectionBarPage } from './pages/data/DataPages'
import { AppPaginationPage } from './pages/data/PaginationPage'
import { SettingsPage } from './pages/settings/SettingsPages'
import { AppCardPage } from './pages/content/CardPages'
import { AppEmptyStatePage } from './pages/content/AppEmptyStatePage'
import { AppFieldPage } from './pages/content/AppFieldPage'
import { ListViewPage } from './pages/content/ListViewPage'
import { ExpanderPage } from './pages/content/ExpanderPage'
import { TagPage } from './pages/content/TagPage'
import { AppScrollAreaPage } from './pages/content/ScrollAreaPage'
import { AppTreeViewPage } from './pages/content/TreeViewPage'
import { AppStatusBarPage } from './pages/content/StatusBarPage'
import { AppSkeletonPage } from './pages/content/SkeletonPage'
import { AppPropertyGridPage } from './pages/content/PropertyGridPage'
import { AppTooltipPage } from './pages/feedback/TooltipPage'
import { AppMenuFlyoutPage } from './pages/actions/MenuFlyoutPage'
import { AppSplitButtonPage } from './pages/actions/SplitButtonPage'
import { ButtonsPage } from './pages/actions/ButtonsPage'
import { AppTeachingTipPage } from './pages/feedback/TeachingTipPage'
import { AppFileDropOverlayPage } from './pages/feedback/FileDropOverlayPage'
import { AppProgressPage } from './pages/content/AppProgressPage'
import { AppStatusBadgePage } from './pages/content/AppStatusBadgePage'
import { AppLoadingOverlayPage } from './pages/feedback/LoadingOverlayPage'
import { AppTaskCenterPage } from './pages/feedback/TaskCenterPage'
import { PopoverPage } from './pages/feedback/PopoverPage'
import { AppTextAreaPage } from './pages/forms/AppTextAreaPage'
import { AppTextBoxPage } from './pages/forms/AppTextBoxPage'
import { AppCompactGroupPage } from './pages/forms/AppCompactGroupPage'
import { AppSearchBoxPage } from './pages/forms/SearchBoxPage'
import { AppColorPickerPage } from './pages/forms/ColorPickerPage'
import { AppFilePickerPage } from './pages/forms/FilePickerPage'
import { AppMultiSelectPage } from './pages/forms/MultiSelectPage'
import { AppPasswordBoxPage } from './pages/forms/PasswordBoxPage'
import { AppRangeSliderPage } from './pages/forms/RangeSliderPage'
import { AppFormLayoutPage } from './pages/forms/FormLayoutPage'
import { AppCheckBoxPage } from './pages/forms/AppCheckBoxPage'
import { AppRadioGroupPage } from './pages/forms/AppRadioGroupPage'
import { AppSegmentedControlPage } from './pages/forms/AppSegmentedControlPage'
import { AppToggleSwitchPage } from './pages/forms/AppToggleSwitchPage'
import { AppNumberBoxPage } from './pages/forms/AppNumberBoxPage'
import { AppSelectPage } from './pages/forms/AppSelectPage'
import { AutoCompletePage } from './pages/forms/AutoCompletePage'
import { CascaderPage } from './pages/forms/CascaderPage'
import { SliderPage } from './pages/forms/SliderPage'
import { DatePickerPage } from './pages/forms/DatePickerPage'
import { AppCalendarPage } from './pages/forms/CalendarPage'
import { DateRangePickerPage } from './pages/forms/DateRangePickerPage'
import { TimePickerPage } from './pages/forms/TimePickerPage'
import { TimeRangePickerPage } from './pages/forms/TimeRangePickerPage'
import { AppDividerPage } from './pages/content/DividerPage'
import { AppLinkPage } from './pages/content/LinkPage'
import { AppAvatarPersonaPage } from './pages/content/AvatarPersonaPage'
import { AppCopyableTextPage } from './pages/content/CopyableTextPage'
import { AppDropDownButtonPage } from './pages/actions/DropDownButtonPage'
import { AppInlineEditPage } from './pages/forms/InlineEditPage'
import { AppNotificationCenterPage } from './pages/feedback/NotificationCenterPage'
import { AppConfirmPopoverPage } from './pages/feedback/ConfirmPopoverPage'
import type { ResolvedAppLocale } from '../../src/localization/types'
import { zhCNRegistry } from './i18n/registry.zh-CN'

export type DemoCategoryKey = 'getting-started' | 'shell' | 'navigation' | 'actions' | 'input' | 'data' | 'content' | 'feedback' | 'settings'
export type DemoStatus = 'stable' | 'preview'
export type DemoPageDefinition = { key: string; category: DemoCategoryKey; categoryLabel: string; subgroup: string; apiNames: string[]; status: DemoStatus; subgroupLabel: string; label: string; description: string; icon: ReactNode; component: ComponentType; layout?: 'default' | 'fill'; related?: string[] }
type DemoPageSource = Omit<DemoPageDefinition, 'category' | 'categoryLabel' | 'subgroup' | 'apiNames' | 'status' | 'subgroupLabel'>

const demoPageSources = [
  { key: 'overview', label: 'Overview', description: 'Browse the library by component category and exported name.', icon: <LayoutDashboard size={16} />, component: OverviewPage },
  { key: 'app-shell', label: 'AppShell', description: 'The root frame for desktop-style application chrome and overlays.', icon: <Boxes size={16} />, component: AppShellPage },
  { key: 'app-title-bar', label: 'AppTitleBar', description: 'Window title, actions, and native window controls.', icon: <LayoutPanelTop size={16} />, component: AppTitleBarPage },
  { key: 'app-page', label: 'AppPage', description: 'Consistent page headers, content, actions, and side panes.', icon: <Columns3 size={16} />, component: AppPagePage },
  { key: 'app-side-pane', label: 'AppSidePane', description: 'Dismissible and optionally resizable secondary content.', icon: <PanelRight size={16} />, component: AppSidePanePage },
  { key: 'resizable-panes', label: 'AppResizablePaneGroup', description: 'Pointer and keyboard resizable two-pane workspaces.', icon: <PanelRight size={16} />, component: AppResizablePanePage },
  { key: 'app-rail', label: 'AppRail', description: 'Grouped navigation items, submenus, badges, and footer links.', icon: <Navigation size={16} />, component: AppRailPage },
  { key: 'app-selector-bar', label: 'AppSelectorBar', description: 'Switch between a few mutually exclusive views within the current page.', icon: <Rows3 size={16} />, component: AppSelectorBarPage },
  { key: 'app-tab-view', label: 'AppTabView', description: 'Closable, reorderable document tabs with explicit panel lifecycle.', icon: <Columns3 size={16} />, component: AppTabViewPage },
  { key: 'breadcrumb-bar', label: 'AppBreadcrumbBar', description: 'Compact resource paths with collapsed ancestor navigation.', icon: <Navigation size={16} />, component: AppBreadcrumbBarPage },
  { key: 'navigation-modes', label: 'Navigation Modes', description: 'Expanded, compact, minimal, and responsive rail behavior.', icon: <Menu size={16} />, component: NavigationModesPage },
  { key: 'app-card', label: 'AppCard', description: 'Fluent content surfaces, composition, interaction states, and continuous groups.', icon: <CreditCard size={16} />, component: AppCardPage },
  { key: 'app-divider', label: 'AppDivider', description: 'Horizontal and vertical separators with optional labels and inset alignment.', icon: <Rows3 size={16} />, component: AppDividerPage },
  { key: 'app-link', label: 'AppLink', description: 'Native application links with disabled, subtle, and external appearances.', icon: <Navigation size={16} />, component: AppLinkPage },
  { key: 'app-avatar-persona', label: 'AppAvatar / AppPersona', description: 'Identity, initials, imagery, presence, and descriptive person information.', icon: <CircleHelp size={16} />, component: AppAvatarPersonaPage },
  { key: 'app-copyable-text', label: 'AppCopyableText', description: 'Copy identifiers and paths with localized success feedback.', icon: <Rows3 size={16} />, component: AppCopyableTextPage },
  { key: 'app-scroll-area', label: 'AppScrollArea', description: 'Native scrolling with Fluent overflow, scrollbar, and gutter styling.', icon: <ScrollText size={16} />, component: AppScrollAreaPage },
  { key: 'app-field', label: 'AppField', description: 'Accessible labels, descriptions, requirements, errors, and field layouts.', icon: <Rows3 size={16} />, component: AppFieldPage },
  { key: 'app-empty-state', label: 'AppEmptyState', description: 'Compact and regular empty content with optional guidance and actions.', icon: <Rows3 size={16} />, component: AppEmptyStatePage },
  { key: 'list-view', label: 'List View', description: 'Desktop information lists with selection, invocation, and keyboard navigation.', icon: <ListChecks size={16} />, component: ListViewPage },
  { key: 'tree-view', label: 'AppTreeView', description: 'Hierarchical resources with selection, lazy expansion, keyboard navigation, and drag requests.', icon: <ListChecks size={16} />, component: AppTreeViewPage },
  { key: 'status-bar', label: 'AppStatusBar', description: 'Compact persistent workspace status and contextual actions.', icon: <Rows3 size={16} />, component: AppStatusBarPage },
  { key: 'property-grid', label: 'AppPropertyGrid', description: 'Grouped dense property editing with reset and adjustable label width.', icon: <SlidersHorizontal size={16} />, component: AppPropertyGridPage },
  { key: 'expander', label: 'Expander', description: 'Collapsible settings, release notes, and low-frequency details.', icon: <Columns3 size={16} />, component: ExpanderPage },
  { key: 'app-tag', label: 'AppTag', description: 'Colored labels for categories, attributes, and removable values.', icon: <Tags size={16} />, component: TagPage },
  { key: 'app-skeleton', label: 'AppSkeleton', description: 'Accessible animated placeholders for loading content structures.', icon: <Rows3 size={16} />, component: AppSkeletonPage },
  { key: 'app-info-bar', label: 'AppInfoBar', description: 'Inline informational, success, warning, and error states.', icon: <Info size={16} />, component: AppInfoBarPage },
  { key: 'app-progress', label: 'Progress', description: 'Indeterminate and determinate progress rings and bars.', icon: <Clock3 size={16} />, component: AppProgressPage },
  { key: 'app-status-badge', label: 'AppStatusBadge', description: 'Compact semantic status labels with several appearances and markers.', icon: <Clock3 size={16} />, component: AppStatusBadgePage },
  { key: 'loading-overlay', label: 'AppLoadingOverlay', description: 'Delayed local loading feedback that preserves content layout.', icon: <Clock3 size={16} />, component: AppLoadingOverlayPage },
  { key: 'task-center', label: 'AppTaskCenter', description: 'Host-neutral background task status, progress, and action requests.', icon: <Clock3 size={16} />, component: AppTaskCenterPage },
  { key: 'popover', label: 'Popover', description: 'Portal-based non-modal supporting content with anchored placement.', icon: <MessageSquare size={16} />, component: PopoverPage },
  { key: 'app-confirm-popover', label: 'AppConfirmPopover', description: 'Anchored confirmation for small, local actions with async handling.', icon: <MessageSquare size={16} />, component: AppConfirmPopoverPage },
  { key: 'app-tooltip', label: 'AppTooltip', description: 'Non-interactive descriptions for hover and keyboard focus.', icon: <CircleHelp size={16} />, component: AppTooltipPage },
  { key: 'app-teaching-tip', label: 'AppTeachingTip', description: 'Controlled anchored guidance with title, content, and actions.', icon: <Lightbulb size={16} />, component: AppTeachingTipPage },
  { key: 'app-file-drop-overlay', label: 'AppFileDropOverlay', description: 'Accepting and rejecting overlays for local file drags.', icon: <UploadCloud size={16} />, component: AppFileDropOverlayPage },
  { key: 'app-toast', label: 'AppToast', description: 'Transient notifications, actions, duration, and dismissal.', icon: <Bell size={16} />, component: AppToastPage },
  { key: 'notification-center', label: 'AppNotificationCenter', description: 'Persistent notification history with unread state, commands, and dismissal.', icon: <Bell size={16} />, component: AppNotificationCenterPage },
  { key: 'app-dialog', label: 'AppDialog', description: 'Modal content with controlled state and custom actions.', icon: <MessageSquare size={16} />, component: AppDialogPage },
  { key: 'message-box', label: 'Message Box', description: 'Promise-based confirmation and decision dialogs.', icon: <MessageSquare size={16} />, component: MessageBoxPage },
  { key: 'app-toolbar', label: 'AppToolbar', description: 'Start, status, and end regions for page-level actions.', icon: <Wrench size={16} />, component: AppToolbarPage },
  { key: 'app-command', label: 'AppCommand', description: 'Shared command definitions, execution state, and keyboard accelerators.', icon: <Wrench size={16} />, component: AppCommandPage },
  { key: 'menu-bar', label: 'AppMenuBar', description: 'Traditional application menus backed by platform-neutral commands.', icon: <Menu size={16} />, component: AppMenuBarPage },
  { key: 'command-palette', label: 'AppCommandPalette', description: 'Keyboard-first fuzzy command discovery and execution.', icon: <Wrench size={16} />, component: AppCommandPalettePage },
  { key: 'shortcut-recorder', label: 'AppShortcutRecorder', description: 'Capture and validate shortcuts compatible with application commands.', icon: <Wrench size={16} />, component: AppShortcutRecorderPage },
  { key: 'toggle-button', label: 'AppToggleButton', description: 'Persistent command states and single or multiple toggle groups.', icon: <SquareMousePointer size={16} />, component: AppToggleButtonPage },
  { key: 'buttons', label: 'Buttons', description: 'Desktop command buttons, icon buttons, states, and composition.', icon: <SquareMousePointer size={16} />, component: ButtonsPage },
  { key: 'app-menu-flyout', label: 'AppMenuFlyout', description: 'Anchored one-level command menus with keyboard navigation.', icon: <ListChecks size={16} />, component: AppMenuFlyoutPage },
  { key: 'app-split-button', label: 'AppSplitButton', description: 'A default command paired with alternate menu actions.', icon: <Columns3 size={16} />, component: AppSplitButtonPage },
  { key: 'app-dropdown-button', label: 'AppDropDownButton', description: 'A menu-only command button without an implied default action.', icon: <Columns3 size={16} />, component: AppDropDownButtonPage },
  { key: 'context-menu', label: 'Context Menu', description: 'Nested contextual commands and native text actions.', icon: <MousePointerClick size={16} />, component: ContextMenuPage },
  { key: 'app-text-box', label: 'AppTextBox', description: 'Single-line text input with icons, clearing, loading, and validation states.', icon: <Rows3 size={16} />, component: AppTextBoxPage },
  { key: 'app-compact-group', label: 'AppCompactGroup', description: 'Join independent controls, buttons, and addons into one compact surface.', icon: <Columns3 size={16} />, component: AppCompactGroupPage },
  { key: 'app-inline-edit', label: 'AppInlineEdit', description: 'Desktop-style inline renaming with keyboard commands, selection, and validation.', icon: <Rows3 size={16} />, component: AppInlineEditPage },
  { key: 'app-text-area', label: 'AppTextArea', description: 'Multi-line text input with resizing, automatic growth, and character counting.', icon: <Rows3 size={16} />, component: AppTextAreaPage },
  { key: 'search-box', label: 'AppSearchBox', description: 'Search input with explicit submission, clearing, and optional debouncing.', icon: <Rows3 size={16} />, component: AppSearchBoxPage },
  { key: 'color-picker', label: 'AppColorPicker', description: 'Popup and inline color selection with HSV, hex, and preset controls.', icon: <SlidersHorizontal size={16} />, component: AppColorPickerPage },
  { key: 'file-picker', label: 'AppFilePicker', description: 'File browsing and local drop selection with validation and host adapters.', icon: <UploadCloud size={16} />, component: AppFilePickerPage },
  { key: 'multi-select', label: 'AppMultiSelect', description: 'Searchable multiple selection represented with removable tags.', icon: <Tags size={16} />, component: AppMultiSelectPage },
  { key: 'password-box', label: 'AppPasswordBox', description: 'Password entry with reveal, Caps Lock, and strength feedback.', icon: <Rows3 size={16} />, component: AppPasswordBoxPage },
  { key: 'range-slider', label: 'AppRangeSlider', description: 'Two-thumb range selection with distance constraints.', icon: <SlidersHorizontal size={16} />, component: AppRangeSliderPage },
  { key: 'form-layout', label: 'AppFormLayout', description: 'Responsive field alignment and linked validation summaries.', icon: <Rows3 size={16} />, component: AppFormLayoutPage },
  { key: 'app-check-box', label: 'AppCheckBox', description: 'Binary, indeterminate, and grouped choices with controlled state.', icon: <ListChecks size={16} />, component: AppCheckBoxPage },
  { key: 'app-radio-group', label: 'AppRadioGroup', description: 'Choose one value from a described set of mutually exclusive options.', icon: <ListChecks size={16} />, component: AppRadioGroupPage },
  { key: 'app-segmented-control', label: 'AppSegmentedControl', description: 'Switch quickly between a small set of adjacent views or modes.', icon: <ListChecks size={16} />, component: AppSegmentedControlPage },
  { key: 'app-toggle-switch', label: 'AppToggleSwitch', description: 'Turn persistent settings on or off with optional supporting descriptions.', icon: <ListChecks size={16} />, component: AppToggleSwitchPage },
  { key: 'app-number-box', label: 'AppNumberBox', description: 'Stepped numeric entry with bounds, precision, and controlled validation.', icon: <SlidersHorizontal size={16} />, component: AppNumberBoxPage },
  { key: 'app-select', label: 'AppSelect', description: 'Reliable native single-option selection with validation and disabled states.', icon: <SlidersHorizontal size={16} />, component: AppSelectPage },
  { key: 'auto-complete', label: 'AppAutoComplete', description: 'Free text input with filtered suggestions and keyboard navigation.', icon: <SlidersHorizontal size={16} />, component: AutoCompletePage },
  { key: 'cascader', label: 'AppCascader', description: 'Choose a leaf value from a hierarchy shown in successive columns.', icon: <Columns3 size={16} />, component: CascaderPage },
  { key: 'slider', label: 'AppSlider', description: 'Adjust a relative numeric value along a styled range track.', icon: <SlidersHorizontal size={16} />, component: SliderPage },
  { key: 'date-picker', label: 'Date Picker', description: 'Timezone-free calendar dates with constraints, forms, and dialog overlays.', icon: <CalendarDays size={16} />, component: DatePickerPage },
  { key: 'calendar', label: 'AppCalendar', description: 'Standalone accessible calendar selection with controlled or internal state.', icon: <CalendarDays size={16} />, component: AppCalendarPage },
  { key: 'date-range-picker', label: 'Date Range Picker', description: 'Pending range selection with Apply, duration limits, and two-month views.', icon: <CalendarRange size={16} />, component: DateRangePickerPage },
  { key: 'time-picker', label: 'Time Picker', description: 'Same-day times with steps, limits, 12-hour display, and confirmed Apply.', icon: <Clock size={16} />, component: TimePickerPage },
  { key: 'time-range-picker', label: 'Time Range Picker', description: 'Start and end time editing with duration validation and no overnight ranges.', icon: <Timer size={16} />, component: TimeRangePickerPage },
  { key: 'app-data-table', label: 'AppDataTable', description: 'A complete data surface with page actions, selection actions, built-in controls, sorting, sizing, and fill layouts.', icon: <Table2 size={16} />, component: AppDataTablePage, layout: 'fill' },
  { key: 'app-selection-bar', label: 'AppSelectionBar', description: 'Actions and clear behavior for selected data rows.', icon: <Rows3 size={16} />, component: AppSelectionBarPage },
  { key: 'app-pagination', label: 'AppPagination', description: 'Standalone paging controls for tables, lists, and result collections.', icon: <Rows3 size={16} />, component: AppPaginationPage },
  { key: 'settings', label: 'Settings', description: 'Application appearance, language, preferences, and information.', icon: <Settings size={16} />, component: SettingsPage },
] satisfies DemoPageSource[]

type DemoPageKey = (typeof demoPageSources)[number]['key']
type DemoTaxonomy = Pick<DemoPageDefinition, 'category' | 'subgroup' | 'apiNames' | 'status' | 'related'>

const taxonomy: Record<DemoPageKey, DemoTaxonomy> = {
  overview: { category: 'getting-started', subgroup: 'overview', apiNames: [], status: 'stable' },
  'app-shell': { category: 'shell', subgroup: 'window', apiNames: ['AppShell'], status: 'stable', related: ['app-title-bar', 'app-page'] },
  'app-title-bar': { category: 'shell', subgroup: 'window', apiNames: ['AppTitleBar'], status: 'stable', related: ['app-shell'] },
  'app-page': { category: 'shell', subgroup: 'page', apiNames: ['AppPage'], status: 'stable', related: ['app-side-pane'] },
  'app-side-pane': { category: 'shell', subgroup: 'page', apiNames: ['AppSidePane'], status: 'stable', related: ['app-page', 'resizable-panes'] },
  'resizable-panes': { category: 'shell', subgroup: 'layout', apiNames: ['AppResizablePaneGroup'], status: 'stable', related: ['app-side-pane'] },
  'app-scroll-area': { category: 'shell', subgroup: 'layout', apiNames: ['AppScrollArea'], status: 'stable' },
  'status-bar': { category: 'shell', subgroup: 'window', apiNames: ['AppStatusBar', 'AppStatusBarItem'], status: 'stable' },
  'app-rail': { category: 'navigation', subgroup: 'application', apiNames: ['AppRail'], status: 'stable', related: ['navigation-modes'] },
  'navigation-modes': { category: 'navigation', subgroup: 'application', apiNames: ['AppRail'], status: 'stable', related: ['app-rail'] },
  'app-selector-bar': { category: 'navigation', subgroup: 'page', apiNames: ['AppSelectorBar', 'AppSelectorPanel', 'AppSelectorPanels'], status: 'stable' },
  'app-tab-view': { category: 'navigation', subgroup: 'page', apiNames: ['AppTabView'], status: 'stable' },
  'breadcrumb-bar': { category: 'navigation', subgroup: 'page', apiNames: ['AppBreadcrumbBar'], status: 'stable' },
  'app-pagination': { category: 'navigation', subgroup: 'collection', apiNames: ['AppPagination'], status: 'stable', related: ['app-data-table'] },
  buttons: { category: 'actions', subgroup: 'basic', apiNames: ['AppButton', 'AppIconButton'], status: 'stable' },
  'toggle-button': { category: 'actions', subgroup: 'basic', apiNames: ['AppToggleButton', 'AppToggleButtonGroup'], status: 'stable' },
  'app-split-button': { category: 'actions', subgroup: 'basic', apiNames: ['AppSplitButton'], status: 'stable' },
  'app-dropdown-button': { category: 'actions', subgroup: 'basic', apiNames: ['AppDropDownButton'], status: 'stable' },
  'app-toolbar': { category: 'actions', subgroup: 'commands', apiNames: ['AppToolbar'], status: 'stable' },
  'app-command': { category: 'actions', subgroup: 'commands', apiNames: ['AppCommandProvider'], status: 'stable' },
  'command-palette': { category: 'actions', subgroup: 'commands', apiNames: ['AppCommandPalette'], status: 'stable' },
  'shortcut-recorder': { category: 'actions', subgroup: 'commands', apiNames: ['AppShortcutRecorder'], status: 'stable' },
  'menu-bar': { category: 'actions', subgroup: 'menus', apiNames: ['AppMenuBar'], status: 'stable' },
  'app-menu-flyout': { category: 'actions', subgroup: 'menus', apiNames: ['AppMenuFlyout'], status: 'stable' },
  'context-menu': { category: 'actions', subgroup: 'menus', apiNames: ['AppContextMenu'], status: 'stable' },
  'app-text-box': { category: 'input', subgroup: 'text', apiNames: ['AppTextBox'], status: 'stable', related: ['app-text-area', 'search-box', 'password-box'] },
  'app-compact-group': { category: 'input', subgroup: 'text', apiNames: ['AppCompactGroup', 'AppControlAddon'], status: 'stable', related: ['app-text-box', 'app-number-box', 'app-select'] },
  'app-inline-edit': { category: 'input', subgroup: 'text', apiNames: ['AppInlineEdit'], status: 'stable', related: ['app-text-box'] },
  'app-text-area': { category: 'input', subgroup: 'text', apiNames: ['AppTextArea'], status: 'stable', related: ['app-text-box'] },
  'search-box': { category: 'input', subgroup: 'text', apiNames: ['AppSearchBox'], status: 'stable' },
  'password-box': { category: 'input', subgroup: 'text', apiNames: ['AppPasswordBox'], status: 'stable' },
  'auto-complete': { category: 'input', subgroup: 'text', apiNames: ['AppAutoComplete'], status: 'stable' },
  slider: { category: 'input', subgroup: 'numeric', apiNames: ['AppSlider'], status: 'stable' },
  'range-slider': { category: 'input', subgroup: 'numeric', apiNames: ['AppRangeSlider'], status: 'stable' },
  'app-number-box': { category: 'input', subgroup: 'numeric', apiNames: ['AppNumberBox'], status: 'stable', related: ['slider', 'range-slider'] },
  'app-select': { category: 'input', subgroup: 'selection', apiNames: ['AppSelect'], status: 'stable', related: ['multi-select', 'cascader'] },
  'app-check-box': { category: 'input', subgroup: 'selection', apiNames: ['AppCheckBox', 'AppCheckBoxGroup'], status: 'stable', related: ['app-radio-group', 'app-toggle-switch'] },
  'app-radio-group': { category: 'input', subgroup: 'selection', apiNames: ['AppRadioGroup'], status: 'stable', related: ['app-check-box', 'app-segmented-control'] },
  'app-segmented-control': { category: 'input', subgroup: 'selection', apiNames: ['AppSegmentedControl'], status: 'stable', related: ['app-radio-group', 'app-selector-bar'] },
  'app-toggle-switch': { category: 'input', subgroup: 'selection', apiNames: ['AppToggleSwitch'], status: 'stable', related: ['app-check-box'] },
  'multi-select': { category: 'input', subgroup: 'selection', apiNames: ['AppMultiSelect', 'AppTagPicker'], status: 'stable' },
  cascader: { category: 'input', subgroup: 'selection', apiNames: ['AppCascader'], status: 'stable' },
  calendar: { category: 'input', subgroup: 'date-time', apiNames: ['AppCalendar'], status: 'stable' },
  'date-picker': { category: 'input', subgroup: 'date-time', apiNames: ['AppDatePicker'], status: 'stable' },
  'date-range-picker': { category: 'input', subgroup: 'date-time', apiNames: ['AppDateRangePicker'], status: 'stable' },
  'time-picker': { category: 'input', subgroup: 'date-time', apiNames: ['AppTimePicker'], status: 'stable' },
  'time-range-picker': { category: 'input', subgroup: 'date-time', apiNames: ['AppTimeRangePicker'], status: 'stable' },
  'color-picker': { category: 'input', subgroup: 'specialized', apiNames: ['AppColorPicker', 'AppColorPickerPanel'], status: 'stable' },
  'file-picker': { category: 'input', subgroup: 'specialized', apiNames: ['AppFilePicker'], status: 'stable' },
  'list-view': { category: 'data', subgroup: 'collections', apiNames: ['AppListView', 'AppListViewItem'], status: 'stable' },
  'tree-view': { category: 'data', subgroup: 'collections', apiNames: ['AppTreeView'], status: 'stable' },
  'app-data-table': { category: 'data', subgroup: 'collections', apiNames: ['AppDataTable'], status: 'stable' },
  'app-selection-bar': { category: 'data', subgroup: 'operations', apiNames: ['AppSelectionBar'], status: 'stable' },
  'property-grid': { category: 'data', subgroup: 'properties', apiNames: ['AppPropertyGrid'], status: 'stable' },
  'app-card': { category: 'content', subgroup: 'containers', apiNames: ['AppCard', 'AppCardHeader', 'AppCardFooter', 'AppCardGroup'], status: 'stable' },
  'app-divider': { category: 'content', subgroup: 'structure', apiNames: ['AppDivider', 'AppSeparator'], status: 'stable' },
  'app-link': { category: 'content', subgroup: 'markers', apiNames: ['AppLink'], status: 'stable' },
  'app-avatar-persona': { category: 'content', subgroup: 'markers', apiNames: ['AppAvatar', 'AppPersona'], status: 'stable' },
  'app-copyable-text': { category: 'content', subgroup: 'structure', apiNames: ['AppCopyableText'], status: 'stable' },
  expander: { category: 'content', subgroup: 'containers', apiNames: ['AppExpander'], status: 'stable' },
  'app-tag': { category: 'content', subgroup: 'markers', apiNames: ['AppTag'], status: 'stable' },
  'app-skeleton': { category: 'content', subgroup: 'states', apiNames: ['AppSkeleton', 'AppSkeletonGroup'], status: 'stable' },
  'app-progress': { category: 'content', subgroup: 'states', apiNames: ['AppProgressBar', 'AppProgressRing'], status: 'stable', related: ['app-skeleton', 'loading-overlay'] },
  'app-status-badge': { category: 'content', subgroup: 'markers', apiNames: ['AppStatusBadge'], status: 'stable', related: ['app-tag', 'app-info-bar'] },
  'app-field': { category: 'content', subgroup: 'structure', apiNames: ['AppField'], status: 'stable', related: ['form-layout'] },
  'app-empty-state': { category: 'content', subgroup: 'states', apiNames: ['AppEmptyState'], status: 'stable', related: ['app-skeleton'] },
  'form-layout': { category: 'content', subgroup: 'structure', apiNames: ['AppFormLayout', 'AppValidationSummary'], status: 'stable' },
  'app-info-bar': { category: 'feedback', subgroup: 'status', apiNames: ['AppInfoBar'], status: 'stable' },
  'app-toast': { category: 'feedback', subgroup: 'status', apiNames: ['AppToast'], status: 'stable' },
  'notification-center': { category: 'feedback', subgroup: 'status', apiNames: ['AppNotificationCenter', 'AppNotificationIndicator'], status: 'stable' },
  'loading-overlay': { category: 'feedback', subgroup: 'status', apiNames: ['AppLoadingOverlay'], status: 'stable' },
  'task-center': { category: 'feedback', subgroup: 'status', apiNames: ['AppTaskCenter', 'AppTaskIndicator'], status: 'stable' },
  'app-tooltip': { category: 'feedback', subgroup: 'overlays', apiNames: ['AppTooltip'], status: 'stable' },
  popover: { category: 'feedback', subgroup: 'overlays', apiNames: ['AppPopover'], status: 'stable' },
  'app-confirm-popover': { category: 'feedback', subgroup: 'overlays', apiNames: ['AppConfirmPopover'], status: 'stable', related: ['popover', 'message-box', 'app-dialog'] },
  'app-teaching-tip': { category: 'feedback', subgroup: 'overlays', apiNames: ['AppTeachingTip'], status: 'stable' },
  'app-dialog': { category: 'feedback', subgroup: 'modal', apiNames: ['AppDialog'], status: 'stable' },
  'message-box': { category: 'feedback', subgroup: 'modal', apiNames: ['useAppMessageBox'], status: 'stable' },
  'app-file-drop-overlay': { category: 'feedback', subgroup: 'drag-drop', apiNames: ['AppFileDropOverlay'], status: 'stable' },
  settings: { category: 'settings', subgroup: 'settings', apiNames: ['AppSettingsGroup', 'AppSettingsRow'], status: 'stable' },
}

const categoryOrder: DemoCategoryKey[] = ['shell', 'navigation', 'actions', 'input', 'data', 'content', 'feedback']
const subgroupOrder: Partial<Record<DemoCategoryKey, string[]>> = {
  shell: ['window', 'page', 'layout'],
  navigation: ['application', 'page', 'collection'],
  actions: ['basic', 'commands', 'menus'],
  input: ['text', 'numeric', 'selection', 'date-time', 'specialized'],
  data: ['collections', 'operations', 'properties'],
  content: ['containers', 'markers', 'states', 'structure'],
  feedback: ['status', 'overlays', 'modal', 'drag-drop'],
}

const categoryLabels: Record<Exclude<DemoCategoryKey, 'getting-started' | 'settings'>, { en: string; zh: string }> = {
  shell: { en: 'Application frame', zh: '应用框架' },
  navigation: { en: 'Navigation', zh: '导航' },
  actions: { en: 'Commands & actions', zh: '命令与操作' },
  input: { en: 'Input & selection', zh: '输入与选择' },
  data: { en: 'Data & collections', zh: '数据与集合' },
  content: { en: 'Content display', zh: '内容展示' },
  feedback: { en: 'Feedback & overlays', zh: '反馈与浮层' },
}

const subgroupLabels: Record<string, { en: string; zh: string }> = {
  window: { en: 'Window structure', zh: '窗口结构' }, page: { en: 'Page structure', zh: '页面结构' }, layout: { en: 'Layout containers', zh: '布局容器' },
  application: { en: 'Application navigation', zh: '应用导航' }, collection: { en: 'Collection navigation', zh: '集合导航' },
  basic: { en: 'Basic actions', zh: '基础操作' }, commands: { en: 'Command system', zh: '命令系统' }, menus: { en: 'Menus', zh: '菜单' },
  text: { en: 'Text input', zh: '文本输入' }, numeric: { en: 'Numeric input', zh: '数值输入' }, selection: { en: 'Selection controls', zh: '选择控件' }, 'date-time': { en: 'Date & time', zh: '日期与时间' }, specialized: { en: 'Specialized input', zh: '专用输入' },
  collections: { en: 'Collection views', zh: '集合视图' }, operations: { en: 'Data operations', zh: '数据操作' }, properties: { en: 'Property editing', zh: '属性编辑' },
  containers: { en: 'Content containers', zh: '内容容器' }, markers: { en: 'Markers', zh: '标记' }, states: { en: 'Content states', zh: '内容状态' }, structure: { en: 'Content structure', zh: '内容结构' },
  status: { en: 'Status feedback', zh: '状态反馈' }, overlays: { en: 'Supporting overlays', zh: '辅助浮层' }, modal: { en: 'Modal interactions', zh: '模态交互' }, 'drag-drop': { en: 'Drag & drop', zh: '拖放反馈' },
  overview: { en: 'Overview', zh: '概览' }, settings: { en: 'Settings', zh: '设置' },
}

export const demoPages: DemoPageDefinition[] = demoPageSources.map((page) => {
  const metadata = taxonomy[page.key]
  return {
    ...page,
    ...metadata,
    categoryLabel: metadata.category === 'getting-started'
      ? 'Overview'
      : metadata.category === 'settings' ? 'Settings' : categoryLabels[metadata.category].en,
    subgroupLabel: subgroupLabels[metadata.subgroup]?.en ?? metadata.subgroup,
  }
})

export function getDemoPages(locale: ResolvedAppLocale): DemoPageDefinition[] {
  if (locale === 'en-US') return demoPages
  return demoPages.map((page) => ({
    ...page,
    categoryLabel: page.category === 'getting-started'
      ? '概览'
      : page.category === 'settings' ? '设置' : categoryLabels[page.category].zh,
    subgroupLabel: subgroupLabels[page.subgroup]?.zh ?? page.subgroupLabel,
    label: zhCNRegistry[page.key]?.label ?? page.label,
    description: zhCNRegistry[page.key]?.description ?? page.description,
  }))
}

export function getRailItems(pages: DemoPageDefinition[]): RailEntry[] {
  const overview = pages.find((page) => page.key === 'overview')
  const entries: RailEntry[] = overview ? [{ key: overview.key, label: overview.label, icon: overview.icon }] : []

  for (const category of categoryOrder) {
    const categoryPages = pages.filter((page) => page.category === category)
    if (!categoryPages.length) continue
    entries.push({ type: 'group', label: categoryPages[0]!.categoryLabel })
    for (const subgroup of subgroupOrder[category] ?? []) {
      const subgroupPages = categoryPages.filter((page) => page.subgroup === subgroup)
      entries.push({
        type: 'submenu',
        key: `group-${category}-${subgroup}`,
        label: subgroupPages[0]!.subgroupLabel,
        icon: subgroupPages[0]!.icon,
        children: subgroupPages.map((page) => ({ key: page.key, label: page.label, icon: page.icon })),
      })
    }
  }
  return entries
}

export function getRailFooterItems(pages: DemoPageDefinition[]): RailItem[] {
  const settings = pages.find((page) => page.key === 'settings')
  return [{ key: 'settings', label: settings?.label ?? 'Settings', icon: <Settings size={16} /> }]
}

export const railItems = getRailItems(demoPages)
export const railFooterItems = getRailFooterItems(demoPages)
