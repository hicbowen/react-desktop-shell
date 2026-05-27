import { useState, type ReactNode } from 'react'
import { Minus, Square, X } from 'lucide-react'
import './App.css'
import Sidebar from './Sidebar'
import { appConfig, type RouteId } from './app.config'
import { windowControls } from './platform/windowControls'

function TitleButton({
  icon,
  hovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
  danger = false,
}: {
  icon: ReactNode
  hovered: boolean
  onClick: () => void
  onMouseEnter: () => void
  onMouseLeave: () => void
  danger?: boolean
}) {
  return (
    <button
      className={`window-button ${hovered ? 'is-hovered' : ''} ${
        danger ? 'is-danger' : ''
      }`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      type="button"
    >
      {icon}
    </button>
  )
}

function App() {
  const [activeRoute, setActiveRoute] = useState<RouteId>(appConfig.defaultRoute)
  const [hovered, setHovered] = useState<string | null>(null)
  const AppIcon = appConfig.appIcon
  const ActivePage = appConfig.routeComponents[activeRoute]

  return (
    <div className="app">
      <header className="title-bar no-select">
        <div className="title-bar-left">
          <AppIcon className="app-logo" size={22} />
          <span className="app-name">{appConfig.appName}</span>
        </div>

        <div className="title-bar-right">
          <TitleButton
            icon={<Minus size={16} />}
            hovered={hovered === 'min'}
            onMouseEnter={() => setHovered('min')}
            onMouseLeave={() => setHovered(null)}
            onClick={windowControls.minimizeWindow}
          />
          <TitleButton
            icon={<Square size={13} />}
            hovered={hovered === 'max'}
            onMouseEnter={() => setHovered('max')}
            onMouseLeave={() => setHovered(null)}
            onClick={windowControls.toggleMaximizeWindow}
          />
          <TitleButton
            icon={<X size={18} />}
            hovered={hovered === 'close'}
            onMouseEnter={() => setHovered('close')}
            onMouseLeave={() => setHovered(null)}
            onClick={windowControls.closeWindow}
            danger
          />
        </div>
      </header>

      <div className="app-body">
        <Sidebar
          active={activeRoute}
          footerItems={appConfig.footerItems}
          items={appConfig.navItems}
          onChange={setActiveRoute}
        />
        <main className="app-content">
          <ActivePage />
        </main>
      </div>
    </div>
  )
}

export default App
