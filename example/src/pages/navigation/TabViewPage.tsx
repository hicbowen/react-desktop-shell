import { useState } from 'react'
import { FileCode2, FileText } from 'lucide-react'
import { AppButton, AppTabView, useAppContextMenu, type AppTabViewItem } from '../../../../src'
import { DemoControls, DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'
import { useDemoCopy } from '../../i18n/interactiveTranslations'

export function AppTabViewPage() {
  const t = useDemoCopy()
  const initialTabs: AppTabViewItem[] = [
    { key: 'readme', label: 'README.md', icon: <FileText />, content: <p>{t('Project documentation')}</p>, pinned: true },
    { key: 'app', label: 'App.tsx', icon: <FileCode2 />, content: <p>{t('Application source')}</p>, dirty: true },
    { key: 'config', label: 'vite.config.ts', icon: <FileCode2 />, content: <p>{t('Build configuration')}</p> },
  ]
  const [tabs, setTabs] = useState(initialTabs)
  const [value, setValue] = useState('app')
  const contextMenu = useAppContextMenu()

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

  const closeMany = (keys: string[], fallbackKey: string) => {
    if (keys.includes(value)) setValue(fallbackKey)
    setTabs((current) => current.filter((item) => !keys.includes(item.key)))
  }

  const setPinned = (key: string, pinned: boolean) => setTabs((current) => current.map((item) => item.key === key ? { ...item, pinned } : item))

  const add = () => {
    const key = `untitled-${tabs.length + 1}`
    setTabs((current) => [...current, { key, label: t('Untitled'), content: <p>{t('New document')}</p> }])
    setValue(key)
  }

  return <DemoPage><DemoSection title="Document workspace" description="Tabs can be selected, closed, added, reordered, and paired with contextual commands without owning document state."><DemoPreview className="demo-tab-view-preview"><AppTabView
    items={tabs}
    onAddTab={add}
    onTabClose={close}
    onTabContextMenu={(tab, event) => {
      event.preventDefault()
      const index = tabs.findIndex((item) => item.key === tab.key)
      const closeOthers = tabs.filter((item) => item.key !== tab.key && !item.pinned)
      const closeRight = tabs.slice(index + 1).filter((item) => !item.pinned)
      contextMenu.open({
        items: [
          { key: 'close', label: t('Close'), disabled: tab.pinned, onClick: () => close(tab.key) },
          { key: 'pin', label: t(tab.pinned ? 'Unpin' : 'Pin'), onClick: () => setPinned(tab.key, !tab.pinned) },
          { key: 'close-others', label: t('Close others'), disabled: closeOthers.length === 0, onClick: () => closeMany(closeOthers.map((item) => item.key), tab.key) },
          { key: 'close-right', label: t('Close tabs to the right'), disabled: closeRight.length === 0, onClick: () => closeMany(closeRight.map((item) => item.key), tab.key) },
        ],
        trigger: event.currentTarget,
        x: event.clientX,
        y: event.clientY,
      })
    }}
    onTabReorder={reorder}
    onValueChange={setValue}
    value={value}
  /></DemoPreview><DemoControls><AppButton onClick={() => setTabs(initialTabs)}>{t('Restore tabs')}</AppButton></DemoControls></DemoSection></DemoPage>
}
