import { useMemo, useState } from 'react'
import { AppPage, AppRail, AppShell, AppTitleBar, useResolvedAppLocale, type AppLocale, type AppTheme, type PaneDisplayMode } from '../../src'
import { DemoShellContext } from './components/DemoShellContext'
import { getDemoPages, getRailFooterItems, getRailItems } from './demoRegistry'
import { DemoI18nContext, demoMessages } from './i18n/DemoI18nContext'

export function ExampleApp() {
  const [activeKey, setActiveKey] = useState('overview')
  const [maximized, setMaximized] = useState(false)
  const [theme, setTheme] = useState<AppTheme>('system')
  const [locale, setLocale] = useState<AppLocale>('system')
  const [railDisplayMode, setRailDisplayMode] = useState<PaneDisplayMode>('auto')
  const resolvedLocale = useResolvedAppLocale(locale)
  const localizedPages = useMemo(() => getDemoPages(resolvedLocale), [resolvedLocale])
  const railItems = useMemo(() => getRailItems(localizedPages), [localizedPages])
  const railFooterItems = useMemo(() => getRailFooterItems(localizedPages), [localizedPages])
  const currentPage = localizedPages.find((page) => page.key === activeKey) ?? localizedPages[0]!
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
      <DemoI18nContext.Provider value={{ locale: resolvedLocale, messages: demoMessages[resolvedLocale] }}>
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
          title={
            <span className="example-page-title">
              <span>{currentPage.label}</span>
              {currentPage.apiNames.length > 0 && !currentPage.apiNames.includes(currentPage.label) ? (
                <code>{currentPage.apiNames.join(' · ')}</code>
              ) : null}
            </span>
          }
          description={currentPage.description}
        >
          <Page />
        </AppPage>
        </AppShell>
      </DemoI18nContext.Provider>
    </DemoShellContext.Provider>
  )
}
