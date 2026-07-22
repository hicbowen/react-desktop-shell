import { useState } from 'react'
import { FileCode2, FileText } from 'lucide-react'
import { AppButton, AppTabView, type AppTabViewItem } from '../../../../src'
import { DemoPage, DemoSection } from '../../components/DemoPage'

const initialTabs: AppTabViewItem[] = [
  { key: 'readme', label: 'README.md', icon: <FileText />, content: <p>Project documentation</p>, pinned: true },
  { key: 'app', label: 'App.tsx', icon: <FileCode2 />, content: <p>Application source</p>, dirty: true },
  { key: 'config', label: 'vite.config.ts', icon: <FileCode2 />, content: <p>Build configuration</p> },
]

export function AppTabViewPage() {
  const [tabs, setTabs] = useState(initialTabs)
  const [value, setValue] = useState('app')

  const close = (key: string) => {
    const index = tabs.findIndex((tab) => tab.key === key)
    const next = tabs[index + 1] ?? tabs[index - 1]
    setTabs((current) => current.filter((tab) => tab.key !== key))
    if (value === key && next) setValue(next.key)
  }

  const reorder = (from: number, to: number) => setTabs((current) => {
    const copy = [...current]
    const [moved] = copy.splice(from, 1)
    if (moved) copy.splice(to, 0, moved)
    return copy
  })

  const add = () => {
    const key = `untitled-${tabs.length + 1}`
    setTabs((current) => [...current, { key, label: 'Untitled', content: <p>New document</p> }])
    setValue(key)
  }

  return <DemoPage><DemoSection title="Document workspace" description="Tabs can be selected, closed, added, and reordered without owning document state."><div style={{ height: 280 }}><AppTabView items={tabs} onAddTab={add} onTabClose={close} onTabReorder={reorder} onValueChange={setValue} value={value} /></div><AppButton onClick={() => setTabs(initialTabs)}>Restore tabs</AppButton></DemoSection></DemoPage>
}
