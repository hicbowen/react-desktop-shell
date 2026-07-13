import { useState } from 'react'
import { Button, Input, Switch } from 'antd'
import { FolderGit2 } from 'lucide-react'
import { AppPage, AppSidePane, AppTitleBar } from '../../../../src'
import { DemoControls, DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'

export function AppShellPage() {
  return <DemoPage><DemoSection title="Application frame" description="AppShell coordinates the title bar, navigation rail, content, feedback hosts, and overlays."><DemoPreview><div className="demo-shell-diagram"><span className="demo-shell-diagram__rail">Rail</span><span className="demo-shell-diagram__titlebar">Title bar</span><strong className="demo-shell-diagram__content">Content</strong><span className="demo-shell-diagram__overlays">Overlay layers</span></div></DemoPreview></DemoSection></DemoPage>
}

export function AppTitleBarPage() {
  const [maximized, setMaximized] = useState(false)
  return <DemoPage><DemoSection title="Window controls" description="Custom actions are placed immediately to the left of the native window controls."><DemoPreview className="demo-titlebar-preview"><AppTitleBar actions={<Button aria-label="Open react-desktop-shell on GitHub" href="https://github.com/hicbowen/react-desktop-shell" icon={<FolderGit2 size={14} />} rel="noreferrer" size="small" target="_blank" type="text" />} maximized={maximized} onMinimize={() => undefined} onToggleMaximize={() => setMaximized((v) => !v)} onClose={() => undefined} /></DemoPreview><p className="demo-note">Current preview state: {maximized ? 'maximized' : 'restored'}</p></DemoSection></DemoPage>
}

export function AppPagePage() {
  return <DemoPage><DemoSection title="Page composition" description="AppPage provides a consistent header, action area, content layout, and optional side pane."><DemoPreview><div className="demo-nested-page"><header><div><strong>Example page</strong><small>Supporting description text</small></div><Button type="primary">Action</Button></header><div>Page content</div></div></DemoPreview></DemoSection></DemoPage>
}

export function AppSidePanePage() {
  const [open, setOpen] = useState(true)
  const [width, setWidth] = useState(380)
  const [resizable, setResizable] = useState(true)
  return <DemoPage><DemoControls><Button type="primary" onClick={() => setOpen(true)}>Open pane</Button><span><Switch checked={resizable} onChange={setResizable} /> Resizable</span><span>{Math.round(width)}px</span></DemoControls><DemoSection title="Side pane preview"><div className="demo-pane-stage"><AppPage title="Host page" sidePane={<AppSidePane open={open} title="Side pane preview" width={width} resizable={resizable} onWidthChange={setWidth} onClose={() => setOpen(false)} footer={<Button onClick={() => setOpen(false)}>Close</Button>}><label className="demo-field">Label<Input placeholder="Neutral example value" /></label></AppSidePane>}><p>Open the pane to inspect sizing, dismissal, and resize behavior.</p></AppPage></div></DemoSection></DemoPage>
}
