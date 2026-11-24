# Component selection

Use this as a routing map, then check the installed declarations for exact
props. Domain suffixes below follow `react-desktop-shell`; `root` means the
package itself. This is a selection guide, not an exhaustive export list.

| Need                                               | Components / hooks                                                                                                | Entry         | Details                                             |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------- | --------------------------------------------------- |
| Full desktop frame and page                        | `AppShell`, `AppTitleBar`, `AppPage`, `AppSidePane`                                                               | `/core`       | [Composition](composition.md)                       |
| Services without the desktop frame                 | `AppProvider`, `useAppPlatform`                                                                                   | `/core`       | [Composition](composition.md)                       |
| Buttons, cards, identity, scroll area              | `AppButton`, `AppIconButton`, `AppCard`, `AppAvatar`, `AppScrollArea`                                             | `/core`       | Installed component reference                       |
| Shared actions and shortcuts                       | `AppCommandProvider`, `useAppCommands`, `useAppCommandState`                                                      | `/core`       | [Commands](navigation-actions.md)                   |
| Text or numeric input                              | `AppTextBox`, `AppTextArea`, `AppNumberBox`, `AppPasswordBox`                                                     | `/forms`      | [Forms](forms.md)                                   |
| Fixed single choice                                | `AppSelect`                                                                                                       | `/forms`      | Native selection; nullable value                    |
| Filterable single choice                           | `AppComboBox`                                                                                                     | `/forms`      | Typing filters; selecting commits an option         |
| Free text with suggestions                         | `AppAutoComplete`                                                                                                 | `/forms`      | Text need not match an option                       |
| Multiple or hierarchical choices                   | `AppMultiSelect`, `AppCheckBoxGroup`, `AppCascader`                                                               | `/forms`      | [Forms](forms.md)                                   |
| Boolean or short choices                           | `AppCheckBox`, `AppToggleSwitch`, `AppRadioGroup`, `AppSegmentedControl`                                          | `/forms`      | [Forms](forms.md)                                   |
| Form state and validation                          | `useAppForm`, `AppForm`, `AppFormField`, `AppFormList`, `AppFormErrorSummary`                                     | `/forms`      | [Forms](forms.md)                                   |
| Labels/layout for other form state                 | `AppField`, `AppFormLayout`, `AppValidationSummary`                                                               | `/forms`      | Does not require replacing an existing form library |
| Dates, ranges, and time                            | `AppDatePicker`, `AppDateRangePicker`, `AppCalendar`, `AppTimePicker`, `AppTimeRangePicker`                       | `/forms`      | Structured values; see [Forms](forms.md)            |
| Navigation and action menus                        | `AppRail`, `AppBreadcrumbBar`, `AppMenuBar`, `AppMenuFlyout`, `AppToolbar`, `AppDropDownButton`, `AppSplitButton` | `/navigation` | [Navigation](navigation-actions.md)                 |
| Tabs and tool panels                               | `AppTabView`, `AppResizablePaneGroup`, `AppDockWorkspace`                                                         | `/navigation` | [Navigation](navigation-actions.md)                 |
| Lists and trees                                    | `AppListView`, `AppListViewItem`, `AppTreeView`                                                                   | `/navigation` | [Collections](data.md)                              |
| Table and selection actions                        | `AppDataTable`, `AppDataView`, `AppSelectionBar`                                                                  | `/data`       | [Data](data.md); TanStack Table peer dependency     |
| Dialog, confirmation, toast                        | `AppDialog`, `useAppMessageBox`, `useAppToast`                                                                    | `/feedback`   | [Feedback](feedback.md)                             |
| Anchored or contextual content                     | `AppPopover`, `AppConfirmPopover`, `AppTooltip`, `AppHoverCard`, `useAppContextMenu`                              | `/feedback`   | [Feedback](feedback.md)                             |
| Empty, loading, progress, tasks                    | `AppEmptyState`, `AppSkeleton`, `AppLoadingOverlay`, `AppProgressBar`, `AppTaskCenter`, `AppNotificationCenter`   | `/feedback`   | Installed component reference                       |
| Conversation and prompt entry                      | `AppConversationThread`, `AppConversationViewport`, `AppAiComposer`, `AppQuickAsk`                                | `/ai`         | [Conversation](ai.md)                               |
| Markdown, tools, change review                     | `AppAiMarkdown`, `AppToolActivity`, `AppToolCallCard`, `AppToolCallGroup`, `AppChangeReviewCard`                  | `/ai`         | [Conversation](ai.md)                               |
| Command palette                                    | `AppCommandPalette`                                                                                               | root          | [Commands](navigation-actions.md)                   |
| Settings and property editing                      | `AppSettingsGroup`, `AppSettingsRow`, `AppPropertyGrid`                                                           | root          | Installed component reference                       |
| Standalone pagination, expanding content, carousel | `AppPagination`, `AppExpander`, `AppExpanderGroup`, `AppCarousel`                                                 | root          | Installed component reference                       |

For root-only components use the root stylesheet unless the installed release
documents a suitable domain style. Do not guess an entry point from a component
name: ListView and TreeView belong to `/navigation`, not `/data`.

## Combinations to prefer

- Settings: settings groups/rows with the appropriate input control; introduce
  `AppForm` when shared validation and submission state are needed.
- Data page: `AppDataView` slots for toolbar, selection bar, footer, and table.
- Workspace: `AppDockWorkspace` around an application-owned main surface,
  optionally an `AppTabView`.
- Shared action: one command definition referenced by toolbar and menu items;
  use its pending/error state when rendering a custom action control.
- Conversation: viewport around thread; Markdown in message `content`;
  composer as a sibling, with request state supplied by the application.

## Common substitutions that are incorrect

| Incorrect assumption                             | Actual contract                                                              |
| ------------------------------------------------ | ---------------------------------------------------------------------------- |
| Button `variant="primary"` or `size="small"`     | `appearance="primary"`, `size="compact"`                                     |
| Every input emits a value in `onChange`          | Text inputs emit DOM events; other controls have specific value callbacks    |
| Every component supports a global `density` prop | Per-component APIs differ; there is currently no Provider-level density prop |
| Tree uses `data` and `onSelect`                  | `items`, `selectedKeys`, `onSelectedKeysChange`                              |
| TabView takes a `tabs` prop                      | `items`, `value`, `onValueChange`, `onTabClose`                              |
| Table uses `dataSource` and a string `rowKey`    | `data`, TanStack `columns`, and a `getRowId` function                        |
| A composer automatically calls an AI service     | The application implements `onSubmit`, cancellation, and message updates     |
