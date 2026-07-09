import { useState } from 'react'
import {
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
  AppTitleBar,
  useAppMessageBox,
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
              onClick={() => setProfileOpen(false)}
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

function renderPageContent(
  active: string,
  theme: AppTheme,
  setTheme: (theme: AppTheme) => void,
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
      <DialogMessageBoxDemo />
    </div>
  )
}

export function ExampleApp() {
  const [active, setActive] = useState('home')
  const [maximized, setMaximized] = useState(false)
  const [theme, setTheme] = useState<AppTheme>('system')
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
              key: 'files',
              label: 'Files',
              icon: <FileText size={16} />,
            },
            {
              key: 'tools',
              label: 'Tools',
              icon: <Wrench size={16} />,
              disabled: true,
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
      >
        {renderPageContent(active, theme, setTheme)}
      </AppPage>
    </AppShell>
  )
}
