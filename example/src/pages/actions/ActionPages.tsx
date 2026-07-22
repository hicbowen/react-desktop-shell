import { useMemo, useState } from 'react'
import { Copy, Pencil, Plus, RefreshCw, Save, Trash2 } from 'lucide-react'
import { AppButton, AppCheckBox, AppCommandProvider, AppContextMenu, AppSelect, AppTextBox, AppToolbar, formatAppShortcut, useAppCommand, useAppCommands, useAppContextMenu, type AppCommand } from '../../../../src'
import { DemoControls, DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'
import { useDemoCopy } from '../../i18n/interactiveTranslations'

export function AppToolbarPage() {
  const t = useDemoCopy()
  const [compact, setCompact] = useState(false)
  const size = compact ? 'compact' : 'standard'
  return <DemoPage><DemoControls><AppCheckBox checked={compact} label={t('Compact controls')} onCheckedChange={setCompact} /></DemoControls><DemoSection title="Three aligned regions"><DemoPreview><AppToolbar start={<><AppTextBox aria-label={t('Filter items')} placeholder={t('Filter items')} size={size} /><AppSelect aria-label={t('Status')} defaultValue="all" options={[{ value: 'all', label: t('All states') }, { value: 'ready', label: t('Ready') }]} size={size} /></>} status={<span>{t('24 items')}</span>} end={<><AppButton size={size}>{t('Secondary')}</AppButton><AppButton appearance="primary" size={size}>{t('Primary action')}</AppButton></>} /></DemoPreview><p className="demo-note">{t('The compact toggle is page-local:')} {t(compact ? 'on' : 'off')}.</p></DemoSection><DemoSection title="Automatic action overflow" description="Resize the window to move trailing commands into the overflow menu."><DemoPreview><AppToolbar actions={[{ key: 'new', label: t('New'), icon: <Plus /> }, { key: 'save', label: t('Save'), icon: <Save /> }, { key: 'refresh', label: t('Refresh'), icon: <RefreshCw /> }, { key: 'delete', label: t('Delete'), icon: <Trash2 />, danger: true }]} start={<strong>{t('Document actions')}</strong>} /></DemoPreview></DemoSection></DemoPage>
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
  const t = useDemoCopy()
  const [saved, setSaved] = useState(0)
  const [enabled, setEnabled] = useState(true)
  const commands = useMemo<AppCommand[]>(() => [{
    id: 'file.save',
    label: t('Save document'),
    description: t('Save the active document'),
    icon: <Save />,
    shortcut: { ctrl: true, key: 's' },
    disabled: !enabled,
    execute: () => setSaved((value) => value + 1),
  }], [enabled, t])

  return <AppCommandProvider commands={commands}><DemoPage><DemoControls><AppCheckBox checked={enabled} label={t('Command enabled')} onCheckedChange={setEnabled} /></DemoControls><DemoSection title="Shared command state" description="The button and Ctrl+S shortcut execute the same platform-neutral command."><DemoPreview><CommandButtons /></DemoPreview><p className="demo-note">{t('Executed')} {saved} {t('times')}.</p></DemoSection></DemoPage></AppCommandProvider>
}

export function ContextMenuPage() {
  const t = useDemoCopy()
  const contextMenu = useAppContextMenu()

  return <DemoPage><DemoSection title="Nested contextual actions" description="Declarative and imperative triggers share the same menu layer. Editable and selected text retain native text actions."><AppContextMenu items={[{ key: 'new', label: t('New item'), icon: <Plus />, shortcut: 'Ctrl+N' }, { key: 'edit', label: t('Edit'), icon: <Pencil />, submenu: [{ key: 'rename', label: t('Rename') }, { key: 'duplicate', label: t('Duplicate'), icon: <Copy /> }] }, { key: 'refresh', label: t('Refresh'), icon: <RefreshCw /> }, { type: 'separator' }, { key: 'delete', label: t('Delete'), icon: <Trash2 />, danger: true }]}><DemoPreview className="demo-context-target"><strong>{t('Declarative context menu')}</strong><span>{t('Right-click this stable target.')}</span></DemoPreview></AppContextMenu><DemoPreview className="demo-context-target" onContextMenu={(event) => { event.preventDefault(); contextMenu.open({ items: [{ key: 'inspect', label: t('Inspect dynamic target') }, { key: 'refresh', label: t('Refresh'), icon: <RefreshCw /> }], x: event.clientX, y: event.clientY, trigger: event.currentTarget }) }}><strong>{t('Imperative context menu')}</strong><span>{t('Right-click this dynamic area.')}</span></DemoPreview><label className="demo-field">{t('Editable text')}<input defaultValue={t('Right-click to use native text actions')} /></label></DemoSection></DemoPage>
}
