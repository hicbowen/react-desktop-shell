import { useState } from 'react'
import { Button } from 'antd'
import { Copy, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { AppContextMenu, AppToolbar } from '../../../../src'
import { DemoControls, DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'

export function AppToolbarPage() {
  const [compact, setCompact] = useState(false)
  return <DemoPage><DemoControls><label><input type="checkbox" checked={compact} onChange={(event) => setCompact(event.target.checked)} /> Compact controls</label></DemoControls><DemoSection title="Three aligned regions"><DemoPreview><AppToolbar start={<><input className="demo-input" aria-label="Filter items" placeholder="Filter items" /><select className="demo-input" aria-label="Status"><option>All states</option><option>Ready</option></select></>} status={<span>24 items</span>} end={<><Button>Secondary</Button><Button type="primary">Primary action</Button></>} /></DemoPreview><p className="demo-note">The compact toggle is page-local: {compact ? 'on' : 'off'}.</p></DemoSection></DemoPage>
}

export function ContextMenuPage() {
  return <DemoPage><DemoSection title="Nested contextual actions" description="Right-click the target to open the component menu. Editable and selected text retain native text actions."><AppContextMenu items={[{ key: 'new', label: 'New item', icon: <Plus />, shortcut: 'Ctrl+N' }, { key: 'edit', label: 'Edit', icon: <Pencil />, submenu: [{ key: 'rename', label: 'Rename' }, { key: 'duplicate', label: 'Duplicate', icon: <Copy /> }] }, { key: 'refresh', label: 'Refresh', icon: <RefreshCw /> }, { type: 'separator' }, { key: 'delete', label: 'Delete', icon: <Trash2 />, danger: true }]}><DemoPreview className="demo-context-target"><strong>Context menu target</strong><span>Right-click anywhere in this neutral preview surface.</span></DemoPreview></AppContextMenu><label className="demo-field">Editable text<input defaultValue="Right-click to use native text actions" /></label></DemoSection></DemoPage>
}
