import { useState } from 'react'
import { FolderGit2 } from 'lucide-react'
import {
  AppButton,
  AppIconButton,
  AppPage,
  AppSidePane,
  AppTextBox,
  AppTitleBar,
  AppToggleSwitch,
} from '../../../../src'
import { DemoControls, DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'
import { useDemoCopy } from '../../i18n/interactiveTranslations'

export function AppShellPage() {
  const t = useDemoCopy()
  return <DemoPage><DemoSection title="Application frame" description="AppShell coordinates the title bar, navigation rail, content, feedback hosts, and overlays."><DemoPreview><div className="demo-shell-diagram"><span className="demo-shell-diagram__rail">{t('Rail')}</span><span className="demo-shell-diagram__titlebar">{t('Title bar')}</span><strong className="demo-shell-diagram__content">{t('Content')}</strong><span className="demo-shell-diagram__overlays">{t('Overlay layers')}</span></div></DemoPreview></DemoSection></DemoPage>
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
  return <DemoPage><DemoSection title="Page composition" description="AppPage provides a consistent header, action area, content layout, and optional side pane."><DemoPreview><div className="demo-nested-page"><header><div><strong>{t('Example page')}</strong><small>{t('Supporting description text')}</small></div><AppButton appearance="primary">{t('Action')}</AppButton></header><div>{t('Page content')}</div></div></DemoPreview></DemoSection></DemoPage>
}

export function AppSidePanePage() {
  const t = useDemoCopy()
  const [open, setOpen] = useState(true)
  const [width, setWidth] = useState(380)
  const [resizable, setResizable] = useState(true)
  return <DemoPage><DemoControls><AppButton appearance="primary" onClick={() => setOpen(true)}>{t('Open pane')}</AppButton><AppToggleSwitch checked={resizable} label={t('Resizable')} onCheckedChange={setResizable} size="compact" /><span>{Math.round(width)}px</span></DemoControls><DemoSection title="Side pane preview"><div className="demo-pane-stage"><AppPage title={t('Host page')} sidePane={<AppSidePane open={open} title={t('Side pane preview')} width={width} resizable={resizable} onWidthChange={setWidth} onClose={() => setOpen(false)} footer={<AppButton onClick={() => setOpen(false)}>{t('Close')}</AppButton>}><label className="demo-field">{t('Label')}<AppTextBox placeholder={t('Neutral example value')} /></label></AppSidePane>}><p>{t('Open the pane to inspect sizing, dismissal, and resize behavior.')}</p></AppPage></div></DemoSection></DemoPage>
}
