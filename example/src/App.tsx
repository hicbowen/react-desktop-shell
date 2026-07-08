import { useState } from 'react'
import { FileText, Home, LayoutGrid, Settings, Wrench } from 'lucide-react'
import { AppRail, AppShell, AppTitleBar } from '../../src'

export function ExampleApp() {
  const [active, setActive] = useState('home')
  const [maximized, setMaximized] = useState(false)

  return (
    <AppShell
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
      <p className="example-kicker">Active item</p>
      <h1>{active}</h1>
      <p>
        The example keeps the desktop shell layout in the exported AppShell
        component while AppTitleBar and AppRail stay focused on their own UI.
      </p>
    </AppShell>
  )
}
