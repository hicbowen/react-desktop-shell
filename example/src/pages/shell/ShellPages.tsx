import { useState } from 'react'
import { FolderGit2, FolderOpen, Home, Settings } from '../../components/fluentIcons'
import {
  AppButton,
  AppIconButton,
  AppRail,
  AppPage,
  AppShell,
  AppSidePane,
  AppTextBox,
  AppTitleBar,
  AppToggleSwitch,
} from '../../../../src'
import { DemoControls, DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'
import { useDemoShell } from '../../components/DemoShellContext'
import { useDemoCopy } from '../../i18n/interactiveTranslations'

export function AppShellPage() {
  const t = useDemoCopy()
  const { locale, theme } = useDemoShell()
  const [activeItem, setActiveItem] = useState('home')
  const [lastAction, setLastAction] = useState('No action yet')
  const [maximized, setMaximized] = useState(false)
  const shellItems = [
    { key: 'home', label: t('Home'), icon: <Home /> },
    { key: 'files', label: t('Files'), icon: <FolderOpen /> },
    { key: 'settings', label: t('Settings'), icon: <Settings /> },
  ]
  const activePage = shellItems.find((item) => item.key === activeItem) ?? shellItems[0]

  return (
    <DemoPage>
      <DemoSection
        showSource={false}
        title="Application frame"
        description="AppShell coordinates the title bar, navigation rail, content, feedback hosts, and overlays."
      >
        <DemoPreview>
          <div className="demo-shell-diagram">
            <span className="demo-shell-diagram__rail">{t('Rail')}</span>
            <span className="demo-shell-diagram__titlebar">{t('Title bar')}</span>
            <strong className="demo-shell-diagram__content">{t('Content')}</strong>
            <span className="demo-shell-diagram__overlays">{t('Overlay layers')}</span>
          </div>
        </DemoPreview>
      </DemoSection>
      <DemoSection
        title="Live application shell"
        description="A real AppShell composition with a title bar, navigation rail, and page content."
      >
        <DemoPreview className="demo-shell-live-preview">
          <AppShell
            locale={locale}
            sidebar={{ displayMode: 'expanded', expandedWidth: 190 }}
            theme={theme}
            title={t('Preview application')}
            titleBar={
              <AppTitleBar
                maximized={maximized}
                onClose={() => undefined}
                onMinimize={() => undefined}
                onToggleMaximize={() => setMaximized((value) => !value)}
              />
            }
            rail={
              <AppRail
                items={shellItems}
                onValueChange={setActiveItem}
                value={activeItem}
              />
            }
          >
            <AppPage
              layout="fill"
              title={activePage.label}
              description={t('Page content is rendered inside AppShell.')}
              actions={
                <AppButton
                  appearance="primary"
                  onClick={() => setLastAction(t('Page action completed'))}
                >
                  {t('Run action')}
                </AppButton>
              }
            >
              <div className="demo-shell-live-content">
                <strong>{t('Selected page')}: {activePage.label}</strong>
                <span>{t('Last action:')} {t(lastAction)}</span>
              </div>
            </AppPage>
          </AppShell>
        </DemoPreview>
      </DemoSection>
    </DemoPage>
  )
}

export function AppTitleBarPage() {
  const t = useDemoCopy()
  const [maximized, setMaximized] = useState(false)
  const openRepository = () =>
    window.open(
      'https://github.com/hicbowen/react-desktop-shell',
      '_blank',
      'noopener,noreferrer',
    )
  return <DemoPage><DemoSection title="Window controls" description="Custom actions are placed immediately to the left of the native window controls."><DemoPreview className="demo-titlebar-preview"><AppTitleBar actions={<AppIconButton appearance="subtle" ariaLabel={t('Open react-desktop-shell on GitHub')} icon={<FolderGit2 size={14} />} onClick={openRepository} size="compact" />} maximized={maximized} onMinimize={() => undefined} onToggleMaximize={() => setMaximized((v) => !v)} onClose={() => undefined} /></DemoPreview><p className="demo-note">{t('Current preview state:')} {t(maximized ? 'maximized' : 'restored')}</p></DemoSection></DemoPage>
}

export function AppPagePage() {
  const t = useDemoCopy()
  return (
    <DemoPage>
      <DemoSection
        title="Page composition"
        description="AppPage provides a consistent header, action area, content layout, and optional side pane."
      >
        <DemoPreview>
          <AppPage
            className="demo-nested-page"
            title={t('Example page')}
            description={t('Supporting description text')}
            actions={
              <AppButton appearance="primary">{t('Action')}</AppButton>
            }
          >
            {t('Page content')}
          </AppPage>
        </DemoPreview>
      </DemoSection>
    </DemoPage>
  )
}

export function AppSidePanePage() {
  const t = useDemoCopy()
  const [open, setOpen] = useState(true)
  const [width, setWidth] = useState(380)
  const [resizable, setResizable] = useState(true)
  return <DemoPage><DemoControls><AppButton appearance="primary" onClick={() => setOpen(true)}>{t('Open pane')}</AppButton><AppToggleSwitch checked={resizable} label={t('Resizable')} onCheckedChange={setResizable} size="compact" /><span>{Math.round(width)}px</span></DemoControls><DemoSection title="Side pane preview"><div className="demo-pane-stage"><AppPage title={t('Host page')} sidePane={<AppSidePane open={open} title={t('Side pane preview')} width={width} resizable={resizable} onWidthChange={setWidth} onClose={() => setOpen(false)} footer={<AppButton onClick={() => setOpen(false)}>{t('Close')}</AppButton>}><label className="demo-field">{t('Label')}<AppTextBox placeholder={t('Neutral example value')} /></label></AppSidePane>}><p>{t('Open the pane to inspect sizing, dismissal, and resize behavior.')}</p></AppPage></div></DemoSection></DemoPage>
}
