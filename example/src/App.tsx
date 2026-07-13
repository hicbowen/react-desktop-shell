import { useEffect, useMemo, useState } from 'react'
import { ConfigProvider } from 'antd'
import { AppPage, AppRail, AppShell, AppTitleBar, type AppTheme, type PaneDisplayMode } from '../../src'
import { createAntdTheme, type AntdThemeMode } from '../../src/antd'
import { DemoShellContext } from './components/DemoShellContext'
import { demoPages, railFooterItems, railItems } from './demoRegistry'

function systemTheme(): AntdThemeMode {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ExampleApp() {
  const [activeKey, setActiveKey] = useState('overview')
  const [maximized, setMaximized] = useState(false)
  const [theme, setTheme] = useState<AppTheme>('system')
  const [railDisplayMode, setRailDisplayMode] = useState<PaneDisplayMode>('auto')
  const [resolvedTheme, setResolvedTheme] = useState<AntdThemeMode>(systemTheme)

  useEffect(() => {
    if (theme !== 'system') return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const update = () => setResolvedTheme(media.matches ? 'dark' : 'light')
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [theme])

  const effectiveTheme = theme === 'system' ? resolvedTheme : theme
  const antdTheme = useMemo(() => createAntdTheme({ mode: effectiveTheme }), [effectiveTheme])
  const currentPage = demoPages.find((page) => page.key === activeKey) ?? demoPages[0]!
  const Page = currentPage.component
  const shellContext = useMemo(() => ({ theme, setTheme, railDisplayMode, setRailDisplayMode }), [theme, railDisplayMode])

  return (
    <ConfigProvider theme={antdTheme}>
      <DemoShellContext.Provider value={shellContext}>
        <AppShell
          contextMenu="app"
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
            className={currentPage.layout === 'fill' ? 'example-page--fill' : undefined}
            contentClassName={currentPage.layout === 'fill' ? 'example-page__content--fill' : undefined}
            key={activeKey}
            title={currentPage.label}
            description={currentPage.description}
          >
            <Page />
          </AppPage>
        </AppShell>
      </DemoShellContext.Provider>
    </ConfigProvider>
  )
}
