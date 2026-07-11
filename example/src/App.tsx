import { useState } from 'react'
import {
  Activity,
  Boxes,
  Clock,
  Copy,
  FileText,
  Folder,
  Image,
  LayoutDashboard,
  Pencil,
  Plus,
  RefreshCw,
  Settings,
  Trash2,
  Wrench,
} from 'lucide-react'
import {
  AppDialog,
  AppContextMenu,
  AppInfoBar,
  AppPage,
  AppRail,
  AppSettingsGroup,
  AppSettingsRow,
  AppShell,
  AppSidePane,
  AppTitleBar,
  AppToolbar,
  useAppMessageBox,
  useAppToast,
  type PaneDisplayMode,
  type AppTheme,
} from '../../src'

const pages = {
  overview: {
    title: 'Overview',
    description: 'A neutral desktop workspace built with React Desktop Shell.',
  },
  projects: {
    title: 'Projects',
    description: 'Organize work in a responsive, desktop-style content area.',
  },
  files: {
    title: 'Files',
    description: 'Explore nested context menus and native text actions.',
    actions: (
      <button className="example-page-action" type="button">
        New file
      </button>
    ),
  },
  activity: {
    title: 'Activity',
    description: 'Present recent events and application status at a glance.',
  },
  feedback: {
    title: 'Feedback components',
    description: 'Compare inline info bars, toast notifications, and modal feedback.',
  },
  utilities: {
    title: 'Workspace utilities',
    description: 'Preview a resizable side pane and common action surfaces.',
  },
  settings: {
    title: 'Settings',
    description: 'Manage application appearance and behavior at runtime.',
  },
}

function renderFileIcon(tag: string, size = 16) {
  if (tag === 'Folder') {
    return <Folder size={size} />
  }

  if (tag === 'Image') {
    return <Image size={size} />
  }

  return <FileText size={size} />
}

function InfoBarDemo() {
  const messageBox = useAppMessageBox()
  const toast = useAppToast()
  const [infoVisible, setInfoVisible] = useState(true)
  const [successVisible, setSuccessVisible] = useState(true)
  const [errorVisible, setErrorVisible] = useState(true)

  const showDetails = (title: string, message: string) => {
    void messageBox.show({
      title,
      message,
      buttons: [{ key: 'close', label: 'Close', primary: true }],
      defaultButton: 'close',
      cancelButton: 'close',
    })
  }

  return (
    <div className="example-info-bar-demo">
      <div className="example-section-heading">
        <strong>Info bar</strong>
        <span>Persistent feedback inside the page layout</span>
      </div>

      <div className="example-info-bar-list">
        {infoVisible ? (
          <AppInfoBar
            status="info"
            title="Update available"
            message="Version v0.6.0 is ready. Review the changes before updating."
            action={
              <button
                className="example-info-bar-action"
                type="button"
                onClick={() =>
                  showDetails(
                    'Version v0.6.0',
                    'This simulated update includes the next set of desktop shell components.',
                  )
                }
              >
                View update
              </button>
            }
            dismissible
            onDismiss={() => setInfoVisible(false)}
          />
        ) : (
          <button
            className="example-info-bar-restore"
            type="button"
            onClick={() => setInfoVisible(true)}
          >
            Show InfoBar
          </button>
        )}

        {successVisible ? (
          <AppInfoBar
            status="success"
            title="Student data imported"
            message="32 students were imported successfully and 3 duplicate records were skipped."
            action={
              <button
                className="example-info-bar-action"
                type="button"
                onClick={() =>
                  showDetails(
                    'Import details',
                    '32 records were added. Three matching student records were left unchanged.',
                  )
                }
              >
                View details
              </button>
            }
            dismissible
            onDismiss={() => setSuccessVisible(false)}
          />
        ) : null}

        <AppInfoBar
          status="warning"
          title="Offline mode"
          message="Some cloud features are unavailable. Locally cached data is currently displayed."
          action={
            <button
              className="example-info-bar-action"
              type="button"
              onClick={() => toast.info('Reconnecting to cloud services…')}
            >
              Reconnect
            </button>
          }
        />

        {errorVisible ? (
          <AppInfoBar
            status="error"
            title="AI service connection failed"
            message="The AI service could not be reached. Check the network or service configuration."
            action={
              <button
                className="example-info-bar-action"
                type="button"
                onClick={() => toast.info('Retrying the AI service…')}
              >
                Retry
              </button>
            }
            dismissible
            onDismiss={() => setErrorVisible(false)}
          />
        ) : null}
      </div>
    </div>
  )
}

function DialogMessageBoxDemo() {
  const messageBox = useAppMessageBox()
  const toast = useAppToast()
  const [profileOpen, setProfileOpen] = useState(false)
  const [longOpen, setLongOpen] = useState(false)
  const [result, setResult] = useState('No result yet')

  const runConfirm = async () => {
    const confirmed = await messageBox.confirm({
      title: 'Delete item?',
      message: 'This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      danger: true,
    })

    setResult(`Confirm: ${confirmed ? 'delete' : 'cancel'}`)
  }

  const runShow = async () => {
    const value = await messageBox.show({
      title: 'Save changes?',
      message: 'The document has unsaved changes.',
      buttons: [
        { key: 'cancel', label: 'Cancel' },
        { key: 'discard', label: 'Discard', danger: true },
        { key: 'save', label: 'Save', primary: true },
      ],
      defaultButton: 'save',
      cancelButton: 'cancel',
    })

    setResult(`Result: ${value ?? 'undefined'}`)
  }

  const runQueue = () => {
    void Promise.all([
      messageBox.confirm({
        title: 'Queue step 1',
        message: 'First confirmation in the queue.',
      }),
      messageBox.confirm({
        title: 'Queue step 2',
        message: 'Second confirmation waits for the first.',
      }),
      messageBox.show({
        title: 'Queue step 3',
        message: 'The final message box opens last.',
        buttons: [
          { key: 'cancel', label: 'Cancel' },
          { key: 'done', label: 'Done', primary: true },
        ],
        defaultButton: 'done',
        cancelButton: 'cancel',
      }),
    ]).then(([first, second, third]) => {
      setResult(`Queue: ${String(first)}, ${String(second)}, ${third}`)
    })
  }

  return (
    <div className="example-dialog-demo">
      <div className="example-dialog-actions">
        <button type="button" onClick={() => setProfileOpen(true)}>
          Open dialog
        </button>
        <button type="button" onClick={() => setLongOpen(true)}>
          Open long dialog
        </button>
        <button type="button" onClick={runConfirm}>
          Confirm delete
        </button>
        <button type="button" onClick={runShow}>
          Save changes
        </button>
        <button type="button" onClick={runQueue}>
          Open message box queue
        </button>
      </div>
      <div className="example-dialog-result">{result}</div>

      <AppDialog
        open={profileOpen}
        onOpenChange={setProfileOpen}
        title="Edit profile"
        description="Update the information used in this workspace."
        actions={
          <>
            <button type="button" onClick={() => setProfileOpen(false)}>
              Cancel
            </button>
            <button
              className="example-primary-action"
              type="button"
              onClick={() => {
                toast.success('Saved successfully')
                setProfileOpen(false)
              }}
            >
              Save
            </button>
          </>
        }
      >
        <div className="example-dialog-form">
          <label>
            <span>Name</span>
            <input defaultValue="Casey Chen" />
          </label>
          <label>
            <span>Role</span>
            <select defaultValue="designer">
              <option value="designer">Designer</option>
              <option value="engineer">Engineer</option>
              <option value="manager">Manager</option>
            </select>
          </label>
          <label>
            <span>Notes</span>
            <textarea defaultValue="Right click works here too." rows={3} />
          </label>
        </div>
      </AppDialog>

      <AppDialog
        open={longOpen}
        onOpenChange={setLongOpen}
        title="Long content dialog"
        description="The header and actions stay fixed while the content scrolls."
        width={520}
        actions={
          <>
            <button type="button" onClick={() => setLongOpen(false)}>
              Cancel
            </button>
            <button
              className="example-primary-action"
              type="button"
              onClick={() => setLongOpen(false)}
            >
              Done
            </button>
          </>
        }
      >
        <div className="example-long-dialog-content">
          {Array.from({ length: 14 }).map((_, index) => (
            <p key={index}>
              Dialog content line {index + 1}. This area scrolls independently
              when the dialog becomes taller than the viewport.
            </p>
          ))}
        </div>
      </AppDialog>
    </div>
  )
}

function ToastDemo() {
  const toast = useAppToast()
  const [undoResult, setUndoResult] = useState('No toast action yet')
  const [networkOnline, setNetworkOnline] = useState(true)

  const showLoadingToast = () => {
    const id = toast.show({
      title: 'Syncing workspace',
      message: '0% complete',
      status: 'loading',
      duration: 0,
    })
    const steps = [20, 40, 60, 80, 100]

    steps.forEach((step, index) => {
      window.setTimeout(() => {
        if (step < 100) {
          toast.update(id, {
            message: `${step}% complete`,
          })
          return
        }

        toast.update(id, {
          title: 'Workspace synced',
          message: 'All changes are up to date.',
          status: 'success',
          duration: 3000,
        })
      }, (index + 1) * 500)
    })
  }

  const toggleNetworkStatus = () => {
    const nextOnline = !networkOnline

    setNetworkOnline(nextOnline)
    toast.show({
      id: 'network-status',
      title: nextOnline ? 'Network restored' : 'Network disconnected',
      status: nextOnline ? 'success' : 'error',
      duration: nextOnline ? 3000 : 0,
    })
  }

  return (
    <div className="example-toast-demo">
      <div className="example-section-heading">
        <strong>Toast</strong>
        <span>{undoResult}</span>
      </div>
      <div className="example-dialog-actions">
        <button
          type="button"
          onClick={() => toast.show({ title: 'Settings updated' })}
        >
          Show toast
        </button>
        <button type="button" onClick={() => toast.success('Saved successfully')}>
          Success
        </button>
        <button type="button" onClick={() => toast.error('Failed to save')}>
          Error
        </button>
        <button
          type="button"
          onClick={() => toast.warning('Network is unstable')}
        >
          Warning
        </button>
        <button type="button" onClick={() => toast.info('Sync started')}>
          Info
        </button>
        <button
          type="button"
          onClick={() =>
            toast.success('Files ready', {
              message: 'The selected files are ready to use.',
            })
          }
        >
          With message
        </button>
        <button
          type="button"
          onClick={() =>
            toast.show({
              title: 'Item moved to trash',
              action: {
                label: 'Undo',
                onClick: () => setUndoResult('Undo clicked'),
              },
            })
          }
        >
          With action
        </button>
        <button type="button" onClick={showLoadingToast}>
          Loading to success
        </button>
        <button type="button" onClick={toggleNetworkStatus}>
          Toggle network status
        </button>
        <button
          type="button"
          onClick={() => {
            Array.from({ length: 8 }).forEach((_, index) => {
              toast.info(`Queued toast ${index + 1}`, {
                message: 'Only four are visible at once.',
              })
            })
          }}
        >
          Show 8 toasts
        </button>
        <button
          type="button"
          onClick={() =>
            toast.info('Hover to pause this toast', {
              message: 'The remaining duration resumes on mouse leave.',
              duration: 8000,
            })
          }
        >
          Hover pause
        </button>
      </div>
    </div>
  )
}

function SidePaneDemo({
  open,
  width,
  onOpen,
}: {
  open: boolean
  width: number
  onOpen: () => void
}) {
  return (
    <div className="example-side-pane-demo">
      <div>
        <strong>Side pane</strong>
        <span>Current width: {Math.round(width)}px</span>
      </div>
      <button type="button" onClick={onOpen}>
        {open ? 'Side pane open' : 'Open side pane'}
      </button>
      <p>
        The pane docks to the right edge of the page, shrinks this workspace,
        and keeps its body scrolling independently.
      </p>
    </div>
  )
}

function ExampleSidePane({
  open,
  width,
  onWidthChange,
  onClose,
}: {
  open: boolean
  width: number
  onWidthChange: (width: number) => void
  onClose: () => void
}) {
  return (
    <AppSidePane
      open={open}
      title="Project details"
      width={width}
      minWidth={320}
      maxWidth={560}
      resizable
      onWidthChange={onWidthChange}
      onClose={onClose}
      footer={
        <div className="example-side-pane-footer">
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button
            className="example-primary-action"
            type="button"
            onClick={onClose}
          >
            Save
          </button>
        </div>
      }
    >
      <div className="example-side-pane-form">
        <label>
          <span>Project name</span>
          <input defaultValue="Desktop application" />
        </label>
        <label>
          <span>Owner</span>
          <input defaultValue="Workspace team" />
        </label>
        <label>
          <span>Status</span>
          <select defaultValue="active">
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="archived">Archived</option>
          </select>
        </label>
        <label>
          <span>Notes</span>
          <textarea
            rows={5}
            defaultValue="Use the resize edge to adjust the pane while keeping the main page usable."
          />
        </label>
        {Array.from({ length: 12 }).map((_, index) => (
          <label key={index}>
            <span>Property {index + 1}</span>
            <input defaultValue={`Value ${index + 1}`} />
          </label>
        ))}
      </div>
    </AppSidePane>
  )
}

function SettingsDemo({
  theme,
  setTheme,
  displayMode,
  setDisplayMode,
}: {
  theme: AppTheme
  setTheme: (theme: AppTheme) => void
  displayMode: PaneDisplayMode
  setDisplayMode: (displayMode: PaneDisplayMode) => void
}) {
  const toast = useAppToast()
  const [startAtLogin, setStartAtLogin] = useState(false)
  const [alwaysOnTop, setAlwaysOnTop] = useState(false)
  const [courseReminders, setCourseReminders] = useState(true)
  const [reminderTime, setReminderTime] = useState('10')

  return (
    <div className="example-settings-page">
      <AppSettingsGroup
        title="Appearance"
        description="Customize how the application looks."
      >
        <AppSettingsRow
          title="Theme"
          description="Choose light, dark, or system appearance."
          control={
            <select
              className="example-settings-select"
              aria-label="Theme"
              value={theme}
              onChange={(event) => setTheme(event.target.value as AppTheme)}
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          }
        />
        <AppSettingsRow
          title="Navigation mode"
          description="Choose how the navigation pane is presented."
          control={
            <select
              className="example-settings-select"
              aria-label="Navigation mode"
              value={displayMode}
              onChange={(event) =>
                setDisplayMode(event.target.value as PaneDisplayMode)
              }
            >
              <option value="auto">Auto</option>
              <option value="expanded">Expanded</option>
              <option value="compact">Compact</option>
              <option value="minimal">Minimal</option>
            </select>
          }
        />
      </AppSettingsGroup>

      <AppSettingsGroup
        title="Startup and window"
        description="Control how the desktop application behaves."
      >
        <AppSettingsRow
          title="Start at login"
          description="Launch the application after signing in."
          control={
            <input
              aria-label="Start at login"
              checked={startAtLogin}
              onChange={(event) => setStartAtLogin(event.target.checked)}
              type="checkbox"
            />
          }
        />
        <AppSettingsRow
          title="Always on top"
          description="Keep the window above other applications."
          control={
            <input
              aria-label="Always on top"
              checked={alwaysOnTop}
              onChange={(event) => setAlwaysOnTop(event.target.checked)}
              type="checkbox"
            />
          }
        />
      </AppSettingsGroup>

      <AppSettingsGroup
        title="Notifications"
        description="Configure course and application reminders."
      >
        <AppSettingsRow
          title="Course reminders"
          description="Notify before a scheduled course starts."
          control={
            <input
              aria-label="Course reminders"
              checked={courseReminders}
              onChange={(event) => setCourseReminders(event.target.checked)}
              type="checkbox"
            />
          }
        />
        <AppSettingsRow
          title="Reminder time"
          description="Choose how early the reminder appears."
          disabled={!courseReminders}
          control={
            <select
              className="example-settings-select"
              aria-label="Reminder time"
              disabled={!courseReminders}
              value={reminderTime}
              onChange={(event) => setReminderTime(event.target.value)}
            >
              <option value="5">5 minutes</option>
              <option value="10">10 minutes</option>
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
            </select>
          }
        />
      </AppSettingsGroup>

      <AppSettingsGroup
        title="About"
        description="Version and update information."
      >
        <AppSettingsRow
          title="Version"
          description="Current react-desktop-shell example version."
          control={<span className="example-settings-value">0.5.1</span>}
        />
        <AppSettingsRow
          title="Check for updates"
          description="Look for a newer application version."
          control={
            <button
              className="example-settings-button"
              type="button"
              onClick={() => toast.success('You are up to date')}
            >
              Check now
            </button>
          }
        />
      </AppSettingsGroup>
    </div>
  )
}

function renderPageContent(
  active: string,
  theme: AppTheme,
  setTheme: (theme: AppTheme) => void,
  displayMode: PaneDisplayMode,
  setDisplayMode: (displayMode: PaneDisplayMode) => void,
  sidePaneOpen: boolean,
  sidePaneWidth: number,
  setSidePaneOpen: (open: boolean) => void,
) {
  if (active === 'files') {
    return (
      <div className="example-context-demo">
        <AppContextMenu
          items={[
            {
              key: 'new',
              label: 'New item',
              icon: <Plus />,
              shortcut: 'Ctrl+N',
            },
            {
              key: 'paste',
              label: 'Paste',
              icon: <Copy />,
              disabled: true,
              shortcut: 'Ctrl+V',
            },
            { type: 'separator' },
            {
              key: 'refresh',
              label: 'Refresh',
              icon: <RefreshCw />,
            },
          ]}
        >
          <div className="example-file-list">
            {[
              ['Document.txt', 'Text document', 'Document'],
              ['Image.png', 'Portable network graphic', 'Image'],
              ['Project', 'Workspace folder', 'Folder'],
            ].map(([name, updated, tag]) => (
              <AppContextMenu
                key={name}
                items={[
                  {
                    key: 'open',
                    label: 'Open',
                    icon: renderFileIcon(tag),
                    shortcut: 'Enter',
                  },
                  {
                    key: 'open-with',
                    label: 'Open with',
                    icon: <Wrench />,
                    submenu: [
                      {
                        key: 'editor',
                        label: 'Editor',
                        icon: <FileText />,
                        submenu: [
                          {
                            key: 'vscode',
                            label: 'Visual Studio Code',
                          },
                          {
                            key: 'notepad',
                            label: 'Notepad',
                          },
                          {
                            key: 'advanced-editors',
                            label: 'Advanced',
                            submenu: [
                              {
                                key: 'compare',
                                label: 'Compare with saved copy',
                              },
                              {
                                key: 'open-readonly',
                                label: 'Open read-only',
                              },
                            ],
                          },
                        ],
                      },
                      {
                        key: 'preview',
                        label: 'Preview',
                        icon: <Image />,
                      },
                    ],
                  },
                  {
                    key: 'rename',
                    label: 'Rename',
                    icon: <Pencil />,
                    shortcut: 'F2',
                  },
                  { type: 'separator' },
                  {
                    key: 'copy',
                    label: 'Copy',
                    icon: <Copy />,
                    shortcut: 'Ctrl+C',
                  },
                  { type: 'separator' },
                  {
                    key: 'delete',
                    label: 'Delete',
                    icon: <Trash2 />,
                    danger: true,
                  },
                ]}
              >
                <div className="example-file-row">
                  <div className="example-file-icon">
                    {renderFileIcon(tag, 18)}
                  </div>
                  <div className="example-file-main">
                    <strong>{name}</strong>
                    <span>{updated}</span>
                  </div>
                  <span className="example-file-tag">{tag}</span>
                </div>
              </AppContextMenu>
            ))}
          </div>
        </AppContextMenu>
        <div className="example-context-fields">
          <label className="example-field">
            <span>Editable input</span>
            <input defaultValue="Right click to edit this text" />
          </label>
          <p className="example-selectable-copy">
            Select part of this paragraph, then right click the selected text to
            open the built-in copy menu. Custom item menus still win when they
            are closer to the target.
          </p>
        </div>
      </div>
    )
  }

  if (active === 'projects') {
    return (
      <>
        <AppToolbar
          start={
            <>
              <input
                className="example-toolbar-search"
                aria-label="Search projects"
                placeholder="Search projects"
                type="search"
              />
              <select
                className="example-toolbar-select"
                aria-label="Project status"
                defaultValue="all"
              >
                <option value="all">All projects</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </>
          }
          status={<span className="example-toolbar-status">4 projects</span>}
          end={
            <>
              <button className="example-toolbar-button" type="button">
                Import
              </button>
              <button className="example-page-action" type="button">
                New project
              </button>
            </>
          }
        />

        <div className="example-tool-grid">
          {[
            ['Desktop application', 'Updated a few minutes ago'],
            ['Component library', 'Updated yesterday'],
            ['Design resources', 'Updated last week'],
            ['Archive', '12 items'],
          ].map(([name, detail]) => (
            <button className="example-tool-tile" key={name} type="button">
              <Folder size={18} />
              <span>{name}</span>
              <small>{detail}</small>
            </button>
          ))}
        </div>
      </>
    )
  }

  if (active === 'activity') {
    return (
      <div className="example-activity-list">
        {[
          ['Project created', 'Desktop application', 'Just now'],
          ['Settings updated', 'Navigation changed to auto', '12 minutes ago'],
          ['Files synchronized', '8 files are up to date', 'Today, 10:24'],
          ['Workspace opened', 'Component library', 'Yesterday'],
        ].map(([title, detail, time]) => (
          <div className="example-activity-row" key={`${title}-${time}`}>
            <span className="example-activity-marker">
              <Activity size={15} />
            </span>
            <span className="example-activity-copy">
              <strong>{title}</strong>
              <small>{detail}</small>
            </span>
            <time>{time}</time>
          </div>
        ))}
      </div>
    )
  }

  if (active === 'feedback') {
    return (
      <div className="example-component-stack">
        <InfoBarDemo />
        <ToastDemo />
        <DialogMessageBoxDemo />
      </div>
    )
  }

  if (active === 'utilities') {
    return (
      <div className="example-component-stack">
        <SidePaneDemo
          open={sidePaneOpen}
          width={sidePaneWidth}
          onOpen={() => setSidePaneOpen(true)}
        />
        <div className="example-tool-grid">
          {['Command palette', 'Search', 'Quick actions', 'Shortcuts'].map(
            (tool) => (
              <button className="example-tool-tile" key={tool} type="button">
                <Wrench size={18} />
                <span>{tool}</span>
                <small>Example surface</small>
              </button>
            ),
          )}
        </div>
      </div>
    )
  }

  if (active === 'settings') {
    return (
      <SettingsDemo
        theme={theme}
        setTheme={setTheme}
        displayMode={displayMode}
        setDisplayMode={setDisplayMode}
      />
    )
  }

  return (
    <div className="example-overview">
      <section className="example-welcome">
        <div>
          <span className="example-eyebrow">REACT DESKTOP SHELL</span>
          <h2>A practical shell for desktop-style React applications</h2>
          <p>
            Resize the window, switch navigation modes, and explore the pages
            to see the components working together in a realistic layout.
          </p>
        </div>
      </section>
      <div className="example-stat">
        <span>Active projects</span>
        <strong>4</strong>
      </div>
      <div className="example-stat">
        <span>Recent files</span>
        <strong>18</strong>
      </div>
      <div className="example-stat">
        <span>Workspace status</span>
        <strong className="example-status-value">Ready</strong>
      </div>
      <div className="example-activity">
        <Clock size={18} />
        <div>
          <strong>Your workspace is ready</strong>
          <span>All changes are saved and components are available.</span>
        </div>
      </div>
    </div>
  )
}

export function ExampleApp() {
  const [active, setActive] = useState('overview')
  const [maximized, setMaximized] = useState(false)
  const [theme, setTheme] = useState<AppTheme>('system')
  const [displayMode, setDisplayMode] = useState<PaneDisplayMode>('auto')
  const [sidePaneOpen, setSidePaneOpen] = useState(false)
  const [sidePaneWidth, setSidePaneWidth] = useState(380)
  const currentPage = pages[active as keyof typeof pages]

  return (
    <AppShell
      contextMenu="app"
      title="React Desktop Shell"
      sidebar={{
        displayMode,
        onDisplayModeChange: setDisplayMode,
        expandedWidth: 316,
      }}
      theme={theme}
      titleBar={
        <AppTitleBar
          actions={
            <button
              aria-label="Open settings"
              className="example-title-action"
              type="button"
              onClick={() => setActive('settings')}
            >
              <Settings size={15} />
            </button>
          }
          onMinimize={() => undefined}
          maximized={maximized}
          onToggleMaximize={() => setMaximized((current) => !current)}
          onClose={() => undefined}
        />
      }
      rail={
        <AppRail
          value={active}
          onChange={setActive}
          items={[
            {
              key: 'overview',
              label: 'Overview',
              icon: <LayoutDashboard size={16} />,
            },
            {
              type: 'group',
              label: 'Workspace',
            },
            {
              key: 'projects',
              label: 'Projects',
              icon: <Folder size={16} />,
            },
            {
              key: 'files',
              label: 'Files',
              icon: <FileText size={16} />,
            },
            {
              key: 'activity',
              label: 'Activity',
              icon: <Activity size={16} />,
            },
            {
              type: 'group',
              label: 'Components',
            },
            {
              type: 'submenu',
              key: 'component-demos',
              label: 'Component demos',
              icon: <Boxes size={16} />,
              children: [
                { key: 'feedback', label: 'Feedback' },
                { key: 'utilities', label: 'Utilities' },
                {
                  key: 'more-components',
                  label: 'More coming soon',
                  disabled: true,
                },
              ],
            },
          ]}
          footerItems={[
            {
              key: 'settings',
              label: 'Settings',
              icon: <Settings size={16} />,
            },
          ]}
        />
      }
      contentClassName="example-content"
    >
      <AppPage
        key={active}
        title={currentPage.title}
        description={currentPage.description}
        actions={'actions' in currentPage ? currentPage.actions : undefined}
        sidePane={
          active === 'overview' || active === 'utilities' ? (
            <ExampleSidePane
              open={sidePaneOpen}
              width={sidePaneWidth}
              onWidthChange={setSidePaneWidth}
              onClose={() => setSidePaneOpen(false)}
            />
          ) : undefined
        }
      >
        {renderPageContent(
          active,
          theme,
          setTheme,
          displayMode,
          setDisplayMode,
          sidePaneOpen,
          sidePaneWidth,
          setSidePaneOpen,
        )}
      </AppPage>
    </AppShell>
  )
}
