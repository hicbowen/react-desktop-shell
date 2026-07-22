import { useMemo, useState } from 'react'
import { Copy, Pencil, Plus, RefreshCw, Save, Trash2 } from 'lucide-react'
import { AppButton, AppCheckBox, AppCommandProvider, AppContextMenu, AppSelect, AppTextBox, AppToolbar, formatAppShortcut, useAppCommand, useAppCommands, useAppContextMenu, type AppCommand } from '../../../../src'
import { DemoControls, DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'

export function AppToolbarPage() {
  const [compact, setCompact] = useState(false)
  const size = compact ? 'compact' : 'standard'
  return <DemoPage><DemoControls><AppCheckBox checked={compact} label="Compact controls" onCheckedChange={setCompact} /></DemoControls><DemoSection title="Three aligned regions"><DemoPreview><AppToolbar start={<><AppTextBox aria-label="Filter items" placeholder="Filter items" size={size} /><AppSelect aria-label="Status" defaultValue="all" options={[{ value: 'all', label: 'All states' }, { value: 'ready', label: 'Ready' }]} size={size} /></>} status={<span>24 items</span>} end={<><AppButton size={size}>Secondary</AppButton><AppButton appearance="primary" size={size}>Primary action</AppButton></>} /></DemoPreview><p className="demo-note">The compact toggle is page-local: {compact ? 'on' : 'off'}.</p></DemoSection><DemoSection title="Automatic action overflow" description="Resize the window to move trailing commands into the overflow menu."><DemoPreview><AppToolbar actions={[{ key: 'new', label: 'New', icon: <Plus /> }, { key: 'save', label: 'Save', icon: <Save /> }, { key: 'refresh', label: 'Refresh', icon: <RefreshCw /> }, { key: 'delete', label: 'Delete', icon: <Trash2 />, danger: true }]} start={<strong>Document actions</strong>} /></DemoPreview></DemoSection></DemoPage>
}

function CommandButtons() {
  const save = useAppCommand('file.save')
  const { execute } = useAppCommands()

  return <AppToolbar
    start={<AppButton disabled={save?.disabled} icon={save?.icon} onClick={() => execute('file.save', { source: 'toolbar' })}>{save?.label}</AppButton>}
    status={save?.shortcut ? <span>{formatAppShortcut(save.shortcut)}</span> : null}
  />
}

export function AppCommandPage() {
  const [saved, setSaved] = useState(0)
  const [enabled, setEnabled] = useState(true)
  const commands = useMemo<AppCommand[]>(() => [{
    id: 'file.save',
    label: 'Save document',
    description: 'Save the active document',
    icon: <Save />,
    shortcut: { ctrl: true, key: 's' },
    disabled: !enabled,
    execute: () => setSaved((value) => value + 1),
  }], [enabled])

  return <AppCommandProvider commands={commands}><DemoPage><DemoControls><AppCheckBox checked={enabled} label="Command enabled" onCheckedChange={setEnabled} /></DemoControls><DemoSection title="Shared command state" description="The button and Ctrl+S shortcut execute the same platform-neutral command."><DemoPreview><CommandButtons /></DemoPreview><p className="demo-note">Executed {saved} times.</p></DemoSection></DemoPage></AppCommandProvider>
}

export function ContextMenuPage() {
  const contextMenu = useAppContextMenu()

  return <DemoPage><DemoSection title="Nested contextual actions" description="Declarative and imperative triggers share the same menu layer. Editable and selected text retain native text actions."><AppContextMenu items={[{ key: 'new', label: 'New item', icon: <Plus />, shortcut: 'Ctrl+N' }, { key: 'edit', label: 'Edit', icon: <Pencil />, submenu: [{ key: 'rename', label: 'Rename' }, { key: 'duplicate', label: 'Duplicate', icon: <Copy /> }] }, { key: 'refresh', label: 'Refresh', icon: <RefreshCw /> }, { type: 'separator' }, { key: 'delete', label: 'Delete', icon: <Trash2 />, danger: true }]}><DemoPreview className="demo-context-target"><strong>Declarative context menu</strong><span>Right-click this stable target.</span></DemoPreview></AppContextMenu><DemoPreview className="demo-context-target" onContextMenu={(event) => { event.preventDefault(); contextMenu.open({ items: [{ key: 'inspect', label: 'Inspect dynamic target' }, { key: 'refresh', label: 'Refresh', icon: <RefreshCw /> }], x: event.clientX, y: event.clientY, trigger: event.currentTarget }) }}><strong>Imperative context menu</strong><span>Right-click this dynamic area.</span></DemoPreview><label className="demo-field">Editable text<input defaultValue="Right-click to use native text actions" /></label></DemoSection></DemoPage>
}
