import { useState } from 'react'
import { Select, Switch } from 'antd'
import { AppSettingsGroup, AppSettingsRow } from '../../../../src'
import { DemoPage, DemoSection } from '../../components/DemoPage'
import { useDemoShell } from '../../components/DemoShellContext'

export function AppSettingsGroupPage() {
  const [enabled, setEnabled] = useState(true)
  const [detail, setDetail] = useState('standard')
  return <DemoPage><DemoSection title="Grouped settings" description="AppSettingsGroup adds a heading, supporting description, and consistent row container."><div className="demo-settings"><AppSettingsGroup title="Example group" description="A neutral collection of related controls."><AppSettingsRow title="Enable feature" description="Controls whether the dependent row is available." control={<Switch checked={enabled} onChange={setEnabled} />} /><AppSettingsRow title="Detail level" description="A dependent setting demonstrates disabled styling." disabled={!enabled} control={<Select aria-label="Detail level" disabled={!enabled} value={detail} onChange={setDetail} options={[{ value: 'compact', label: 'Compact' }, { value: 'standard', label: 'Standard' }, { value: 'detailed', label: 'Detailed' }]} />} /></AppSettingsGroup></div></DemoSection></DemoPage>
}

export function AppSettingsRowPage() {
  const [enabled, setEnabled] = useState(true)
  return <DemoPage><DemoSection title="Row states" description="Rows align titles, descriptions, icons, controls, and disabled state."><div className="demo-settings"><AppSettingsGroup><AppSettingsRow title="Interactive row" description="A standard row with a trailing control." control={<Switch checked={enabled} onChange={setEnabled} />} /><AppSettingsRow title="Disabled row" description="Unavailable preferences retain structure and context." disabled control={<Switch disabled />} /><AppSettingsRow title="Version value" description="Read from package metadata at build time." control={<strong>v{__APP_VERSION__}</strong>} /></AppSettingsGroup></div></DemoSection></DemoPage>
}

export function ThemeControlsPage() {
  const { theme, setTheme } = useDemoShell()
  return <DemoPage><DemoSection title="Live application theme" description="Theme controls update the real outer AppShell and its integrated feedback surfaces."><div className="demo-choice-grid">{(['system', 'light', 'dark'] as const).map((value) => <button className={theme === value ? 'demo-choice demo-choice--active' : 'demo-choice'} key={value} type="button" onClick={() => setTheme(value)}><strong>{value}</strong><small>{value === 'system' ? 'Follow operating system' : `Always use ${value} mode`}</small></button>)}</div></DemoSection></DemoPage>
}
