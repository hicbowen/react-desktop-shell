import { AppRail } from '../../../../src'
import { DemoControls, DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'
import { useDemoShell } from '../../components/DemoShellContext'

export function AppRailPage() {
  return <DemoPage><DemoSection title="Rail entries" description="Items, groups, submenus, badges, disabled states, and footer actions share a single entry model."><DemoPreview><div className="demo-rail-preview"><AppRail value="first" onChange={() => undefined} items={[{ key: 'first', label: 'First item', badge: 3 }, { type: 'group', label: 'Group' }, { type: 'submenu', key: 'submenu', label: 'Submenu', children: [{ key: 'child-one', label: 'Child one' }, { key: 'child-two', label: 'Child two', disabled: true }] }]} /></div></DemoPreview></DemoSection></DemoPage>
}

export function NavigationModesPage() {
  const { railDisplayMode, setRailDisplayMode } = useDemoShell()
  return <DemoPage><DemoSection title="Live navigation modes" description="These controls update the gallery's real outer AppShell."><DemoControls>{(['expanded', 'compact', 'minimal', 'auto'] as const).map((mode) => <button className={railDisplayMode === mode ? 'demo-choice demo-choice--active' : 'demo-choice'} key={mode} type="button" onClick={() => setRailDisplayMode(mode)}><strong>{mode}</strong><small>{mode === 'auto' ? 'Responsive breakpoints' : `${mode} rail presentation`}</small></button>)}</DemoControls></DemoSection></DemoPage>
}
