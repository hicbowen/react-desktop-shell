import { useState } from 'react'
import { FileText, Home, LayoutGrid, Settings, Wrench } from 'lucide-react'
import { AppRail, AppTitleBar } from '../../src'

export function ExampleApp() {
  const [active, setActive] = useState('home')

  return (
    <div className="example-app">
      <AppTitleBar
        title="FlowGo"
        icon={<LayoutGrid size={22} />}
        onMinimize={() => undefined}
        onMaximize={() => undefined}
        onClose={() => undefined}
      />

      <div className="example-body">
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

        <main className="example-content">
          <p className="example-kicker">Active item</p>
          <h1>{active}</h1>
          <p>
            The example keeps the original desktop shell shape while using the
            exported title bar and rail components.
          </p>
        </main>
      </div>
    </div>
  )
}
