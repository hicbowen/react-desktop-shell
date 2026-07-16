import { useMemo, useState } from 'react'
import { AppPage, AppRail, AppShell, AppTitleBar, type AppLocale, type AppTheme, type PaneDisplayMode } from '../../src'
import { DemoShellContext } from './components/DemoShellContext'
import { demoPages, railFooterItems, railItems } from './demoRegistry'

export function ExampleApp() {
  const [activeKey, setActiveKey] = useState('overview')
  const [maximized, setMaximized] = useState(false)
  const [theme, setTheme] = useState<AppTheme>('system')
  const [locale, setLocale] = useState<AppLocale>('system')
  const [railDisplayMode, setRailDisplayMode] = useState<PaneDisplayMode>('auto')
  const currentPage = demoPages.find((page) => page.key === activeKey) ?? demoPages[0]!
  const Page = currentPage.component
  const shellContext = useMemo(
    () => ({
      theme,
      setTheme,
      locale,
      setLocale,
      railDisplayMode,
      setRailDisplayMode,
    }),
    [locale, theme, railDisplayMode],
  )

  return (
    <DemoShellContext.Provider value={shellContext}>
      <AppShell
        contextMenu="app"
        locale={locale}
        title="React Desktop Shell"
        sidebar={{ displayMode: railDisplayMode, onDisplayModeChange: setRailDisplayMode, expandedWidth: 292 }}
        theme={theme}
        titleBar={
          <AppTitleBar
            maximized={maximized}
            onClose={() => undefined}
            onMinimize={() => undefined}
            onToggleMaximize={() => setMaximized((value) => !value)}
          />
        }
        rail={<AppRail value={activeKey} items={railItems} footerItems={railFooterItems} onChange={setActiveKey} />}
        contentClassName="example-content"
      >
        <AppPage
          key={activeKey}
          layout={currentPage.layout === 'fill' ? 'fill' : 'flow'}
          title={currentPage.label}
          description={currentPage.description}
        >
          <Page />
        </AppPage>
      </AppShell>
    </DemoShellContext.Provider>
  )
}
