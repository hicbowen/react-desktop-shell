import { useState } from 'react'
import { Copy, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { AppButton, AppCheckBox, AppContextMenu, AppSelect, AppTextBox, AppToolbar, useAppContextMenu } from '../../../../src'
import { DemoControls, DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'

export function AppToolbarPage() {
  const [compact, setCompact] = useState(false)
  const size = compact ? 'compact' : 'standard'
  return <DemoPage><DemoControls><AppCheckBox checked={compact} label="Compact controls" onCheckedChange={setCompact} /></DemoControls><DemoSection title="Three aligned regions"><DemoPreview><AppToolbar start={<><AppTextBox aria-label="Filter items" placeholder="Filter items" size={size} /><AppSelect aria-label="Status" defaultValue="all" options={[{ value: 'all', label: 'All states' }, { value: 'ready', label: 'Ready' }]} size={size} /></>} status={<span>24 items</span>} end={<><AppButton size={size}>Secondary</AppButton><AppButton appearance="primary" size={size}>Primary action</AppButton></>} /></DemoPreview><p className="demo-note">The compact toggle is page-local: {compact ? 'on' : 'off'}.</p></DemoSection></DemoPage>
}

export function ContextMenuPage() {
  const contextMenu = useAppContextMenu()

  return <DemoPage><DemoSection title="Nested contextual actions" description="Declarative and imperative triggers share the same menu layer. Editable and selected text retain native text actions."><AppContextMenu items={[{ key: 'new', label: 'New item', icon: <Plus />, shortcut: 'Ctrl+N' }, { key: 'edit', label: 'Edit', icon: <Pencil />, submenu: [{ key: 'rename', label: 'Rename' }, { key: 'duplicate', label: 'Duplicate', icon: <Copy /> }] }, { key: 'refresh', label: 'Refresh', icon: <RefreshCw /> }, { type: 'separator' }, { key: 'delete', label: 'Delete', icon: <Trash2 />, danger: true }]}><DemoPreview className="demo-context-target"><strong>Declarative context menu</strong><span>Right-click this stable target.</span></DemoPreview></AppContextMenu><DemoPreview className="demo-context-target" onContextMenu={(event) => { event.preventDefault(); contextMenu.open({ items: [{ key: 'inspect', label: 'Inspect dynamic target' }, { key: 'refresh', label: 'Refresh', icon: <RefreshCw /> }], x: event.clientX, y: event.clientY, trigger: event.currentTarget }) }}><strong>Imperative context menu</strong><span>Right-click this dynamic area.</span></DemoPreview><label className="demo-field">Editable text<input defaultValue="Right-click to use native text actions" /></label></DemoSection></DemoPage>
}
