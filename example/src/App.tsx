import { useCallback, useEffect, useMemo, useState } from 'react'
import { AppPage, AppRail, AppShell, AppTitleBar, useResolvedAppLocale, type AppLocale, type AppTheme, type PaneDisplayMode } from '../../src'
import { DemoShellContext } from './components/DemoShellContext'
import { DemoComponentPage } from './components/DemoComponentPage'
import { demoPages, getDemoPages, getRailFooterItems, getRailItems } from './demoRegistry'
import { DemoI18nContext, demoMessages } from './i18n/DemoI18nContext'
import { getDemoHash, getDemoKeyFromHash } from './demoNavigation'

const demoPageKeys = new Set(demoPages.map((page) => page.key))

export function ExampleApp() {
  const [activeKey, setActiveKey] = useState(() => getDemoKeyFromHash(window.location.hash, demoPageKeys))
  const [maximized, setMaximized] = useState(false)
  const [theme, setTheme] = useState<AppTheme>('system')
  const [locale, setLocale] = useState<AppLocale>('system')
  const [railDisplayMode, setRailDisplayMode] = useState<PaneDisplayMode>('auto')
  const resolvedLocale = useResolvedAppLocale(locale)
  const localizedPages = useMemo(() => getDemoPages(resolvedLocale), [resolvedLocale])
  const railItems = useMemo(() => getRailItems(localizedPages), [localizedPages])
  const railFooterItems = useMemo(() => getRailFooterItems(localizedPages), [localizedPages])
  const navigateTo = useCallback((key: string) => {
    const nextKey = demoPageKeys.has(key) ? key : 'overview'
    setActiveKey(nextKey)
    const nextHash = getDemoHash(nextKey)
    if (window.location.hash !== nextHash) window.location.hash = nextHash
  }, [])
  useEffect(() => {
    const handleHashChange = () => setActiveKey(getDemoKeyFromHash(window.location.hash, demoPageKeys))
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])
  const currentPage = localizedPages.find((page) => page.key === activeKey) ?? localizedPages[0]!
  const Page = currentPage.component
  const isComponentPage = currentPage.category !== 'getting-started' && currentPage.category !== 'settings'
  const shellContext = useMemo(
    () => ({
      theme,
      setTheme,
      locale,
      setLocale,
      railDisplayMode,
      setRailDisplayMode,
      pages: localizedPages,
      navigateTo,
    }),
    [locale, theme, railDisplayMode, localizedPages, navigateTo],
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
        rail={<AppRail value={activeKey} items={railItems} footerItems={railFooterItems} onChange={navigateTo} />}
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
          {isComponentPage ? (
            <DemoComponentPage definition={currentPage} pages={localizedPages} onNavigate={navigateTo}>
              <Page />
            </DemoComponentPage>
          ) : <Page />}
        </AppPage>
        </AppShell>
      </DemoI18nContext.Provider>
    </DemoShellContext.Provider>
  )
}
