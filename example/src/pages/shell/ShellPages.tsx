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

export function AppShellPage() {
  return <DemoPage><DemoSection title="Application frame" description="AppShell coordinates the title bar, navigation rail, content, feedback hosts, and overlays."><DemoPreview><div className="demo-shell-diagram"><span className="demo-shell-diagram__rail">Rail</span><span className="demo-shell-diagram__titlebar">Title bar</span><strong className="demo-shell-diagram__content">Content</strong><span className="demo-shell-diagram__overlays">Overlay layers</span></div></DemoPreview></DemoSection></DemoPage>
}

export function AppTitleBarPage() {
  const [maximized, setMaximized] = useState(false)
  const openRepository = () =>
    window.open(
      'https://github.com/hicbowen/react-desktop-shell',
      '_blank',
      'noopener,noreferrer',
    )
  return <DemoPage><DemoSection title="Window controls" description="Custom actions are placed immediately to the left of the native window controls."><DemoPreview className="demo-titlebar-preview"><AppTitleBar actions={<AppIconButton appearance="subtle" ariaLabel="Open react-desktop-shell on GitHub" icon={<FolderGit2 size={14} />} onClick={openRepository} size="compact" />} maximized={maximized} onMinimize={() => undefined} onToggleMaximize={() => setMaximized((v) => !v)} onClose={() => undefined} /></DemoPreview><p className="demo-note">Current preview state: {maximized ? 'maximized' : 'restored'}</p></DemoSection></DemoPage>
}

export function AppPagePage() {
  return <DemoPage><DemoSection title="Page composition" description="AppPage provides a consistent header, action area, content layout, and optional side pane."><DemoPreview><div className="demo-nested-page"><header><div><strong>Example page</strong><small>Supporting description text</small></div><AppButton appearance="primary">Action</AppButton></header><div>Page content</div></div></DemoPreview></DemoSection></DemoPage>
}

export function AppSidePanePage() {
  const [open, setOpen] = useState(true)
  const [width, setWidth] = useState(380)
  const [resizable, setResizable] = useState(true)
  return <DemoPage><DemoControls><AppButton appearance="primary" onClick={() => setOpen(true)}>Open pane</AppButton><AppToggleSwitch checked={resizable} label="Resizable" onCheckedChange={setResizable} size="compact" /><span>{Math.round(width)}px</span></DemoControls><DemoSection title="Side pane preview"><div className="demo-pane-stage"><AppPage title="Host page" sidePane={<AppSidePane open={open} title="Side pane preview" width={width} resizable={resizable} onWidthChange={setWidth} onClose={() => setOpen(false)} footer={<AppButton onClick={() => setOpen(false)}>Close</AppButton>}><label className="demo-field">Label<AppTextBox placeholder="Neutral example value" /></label></AppSidePane>}><p>Open the pane to inspect sizing, dismissal, and resize behavior.</p></AppPage></div></DemoSection></DemoPage>
}
