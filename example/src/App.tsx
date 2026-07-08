import { useState } from 'react'
import {
  Clock,
  FileText,
  Home,
  LayoutGrid,
  Settings,
  Wrench,
} from 'lucide-react'
import { AppPage, AppRail, AppShell, AppTitleBar, type AppTheme } from '../../src'

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

function renderPageContent(
  active: string,
  theme: AppTheme,
  setTheme: (theme: AppTheme) => void,
) {
  if (active === 'files') {
    return (
      <div className="example-file-list">
        {[
          ['Course roadmap.pdf', 'Updated 12 minutes ago', 'Planning'],
          ['Student progress.xlsx', 'Updated today', 'Reports'],
          ['Workshop notes.md', 'Updated yesterday', 'Notes'],
        ].map(([name, updated, tag]) => (
          <div className="example-file-row" key={name}>
            <div className="example-file-icon">
              <FileText size={18} />
            </div>
            <div className="example-file-main">
              <strong>{name}</strong>
              <span>{updated}</span>
            </div>
            <span className="example-file-tag">{tag}</span>
          </div>
        ))}
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
        actions={currentPage.actions}
      >
        {renderPageContent(active, theme, setTheme)}
      </AppPage>
    </AppShell>
  )
}
