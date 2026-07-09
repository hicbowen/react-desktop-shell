import { useState } from 'react'
import {
  BookOpen,
  Clock,
  Copy,
  FileText,
  Folder,
  Home,
  Image,
  LayoutGrid,
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
  AppPage,
  AppRail,
  AppShell,
  AppSidePane,
  AppTitleBar,
  useAppMessageBox,
  useAppToast,
  type AppTheme,
} from '../../src'

const pages = {
  home: {
    title: 'Home',
    description: 'Review your workspace activity and launch common tasks.',
  },
  files: {
    title: 'Files',
    description: 'Browse recent documents and project resources.',
    actions: (
      <button className="example-page-action" type="button">
        New file
      </button>
    ),
  },
  students: {
    title: 'Students',
    description: 'Review learner records and classroom activity.',
  },
  classes: {
    title: 'Classes',
    description: 'Manage cohorts, schedules, and shared resources.',
  },
  tools: {
    title: 'Tools',
    description: 'Open desktop utilities and configure workflow helpers.',
  },
  settings: {
    title: 'Settings',
    description: 'Customize the desktop shell experience.',
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
      title: 'Importing students',
      message: '0 / 100',
      status: 'loading',
      duration: 0,
    })
    const steps = [20, 40, 60, 80, 100]

    steps.forEach((step, index) => {
      window.setTimeout(() => {
        if (step < 100) {
          toast.update(id, {
            message: `${step} / 100`,
          })
          return
        }

        toast.update(id, {
          title: 'Import complete',
          message: '100 students imported',
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
            toast.success('Import complete', {
              message: '100 students were imported successfully.',
            })
          }
        >
          With message
        </button>
        <button
          type="button"
          onClick={() =>
            toast.show({
              title: 'Student deleted',
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
      title="Edit class"
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
          <span>Class name</span>
          <input defaultValue="Product design cohort" />
        </label>
        <label>
          <span>Owner</span>
          <input defaultValue="Casey Chen" />
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

function renderPageContent(
  active: string,
  theme: AppTheme,
  setTheme: (theme: AppTheme) => void,
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

  if (active === 'tools') {
    return (
      <div className="example-tool-grid">
        {['Importer', 'Validator', 'Report builder', 'Backup'].map((tool) => (
          <button className="example-tool-tile" key={tool} type="button">
            <Wrench size={18} />
            <span>{tool}</span>
          </button>
        ))}
      </div>
    )
  }

  if (active === 'students' || active === 'classes') {
    return (
      <div className="example-tool-grid">
        {[
          active === 'students' ? 'Student roster' : 'Class roster',
          'Attendance',
          'Progress',
          'Notes',
        ].map((item) => (
          <button className="example-tool-tile" key={item} type="button">
            <BookOpen size={18} />
            <span>{item}</span>
          </button>
        ))}
      </div>
    )
  }

  if (active === 'settings') {
    return (
      <div className="example-settings-list">
        <label className="example-settings-row">
          <span className="example-settings-copy">
            <span>Theme</span>
            <small>Choose how the application shell looks.</small>
          </span>
          <select
            className="example-settings-select"
            value={theme}
            onChange={(event) => setTheme(event.target.value as AppTheme)}
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
        <label className="example-settings-row">
          <span className="example-settings-copy">
            <span>Launch on startup</span>
            <small>Open FlowGo automatically when you sign in.</small>
          </span>
          <input type="checkbox" />
        </label>
        <label className="example-settings-row">
          <span className="example-settings-copy">
            <span>Show compact navigation</span>
            <small>Reduce the navigation rail to icon-only mode.</small>
          </span>
          <input type="checkbox" />
        </label>
      </div>
    )
  }

  return (
    <div className="example-overview">
      <div className="example-stat">
        <span>Open tasks</span>
        <strong>12</strong>
      </div>
      <div className="example-stat">
        <span>Recent files</span>
        <strong>28</strong>
      </div>
      <div className="example-stat">
        <span>Next review</span>
        <strong>3 PM</strong>
      </div>
      <div className="example-activity">
        <Clock size={18} />
        <div>
          <strong>Daily summary is ready</strong>
          <span>Three files changed since your last session.</span>
        </div>
      </div>
      <ToastDemo />
      <SidePaneDemo
        open={sidePaneOpen}
        width={sidePaneWidth}
        onOpen={() => setSidePaneOpen(true)}
      />
      <DialogMessageBoxDemo />
    </div>
  )
}

export function ExampleApp() {
  const [active, setActive] = useState('home')
  const [maximized, setMaximized] = useState(false)
  const [theme, setTheme] = useState<AppTheme>('system')
  const [sidePaneOpen, setSidePaneOpen] = useState(false)
  const [sidePaneWidth, setSidePaneWidth] = useState(380)
  const currentPage = pages[active as keyof typeof pages]

  return (
    <AppShell
      contextMenu="app"
      messageBoxLocale={{
        confirm: '确定',
        cancel: '取消',
      }}
      theme={theme}
      titleBar={
        <AppTitleBar
          title="FlowGo"
          icon={<LayoutGrid size={22} />}
          actions={
            <button className="example-title-action" type="button">
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
              key: 'home',
              label: 'Home',
              icon: <Home size={16} />,
            },
            {
              type: 'group',
              label: 'Workspace',
            },
            {
              type: 'submenu',
              key: 'teaching',
              label: 'Teaching',
              icon: <BookOpen size={16} />,
              children: [
                {
                  key: 'students',
                  label: 'Students',
                },
                {
                  key: 'classes',
                  label: 'Classes',
                },
                {
                  key: 'tools',
                  label: 'Tools',
                  disabled: true,
                },
              ],
            },
            {
              key: 'files',
              label: 'Files',
              icon: <FileText size={16} />,
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
          active === 'home' ? (
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
          sidePaneOpen,
          sidePaneWidth,
          setSidePaneOpen,
        )}
      </AppPage>
    </AppShell>
  )
}
