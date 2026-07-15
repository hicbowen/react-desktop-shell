import { useState } from 'react'
import { Download, FileImage, FileText, Trash2 } from 'lucide-react'
import {
  AppSplitButton,
  AppToolbar,
  type AppMenuFlyoutEntry,
} from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'

const exportItems: AppMenuFlyoutEntry[] = [
  { key: 'pdf', label: 'Export PDF', icon: <FileText /> },
  { key: 'image', label: 'Export image', icon: <FileImage /> },
  { type: 'separator' },
  { key: 'remove', label: 'Remove export preset', icon: <Trash2 />, danger: true },
]

export function AppSplitButtonPage() {
  const [lastAction, setLastAction] = useState('None')

  return (
    <DemoPage>
      <DemoSection title="Split actions" description="The primary side runs the default command; the arrow opens alternate commands.">
        <DemoPreview className="demo-split-button-row">
          <AppSplitButton label="Export" items={exportItems} onClick={() => setLastAction('default export')} onSelect={setLastAction} />
          <AppSplitButton icon={<Download />} label="Download" items={exportItems} onClick={() => setLastAction('download')} onSelect={setLastAction} />
          <AppSplitButton disabled label="Disabled" items={exportItems} />
          <AppSplitButton menuDisabled label="Menu disabled" items={exportItems} onClick={() => setLastAction('primary still available')} />
          <span className="demo-note">Last action: {lastAction}</span>
        </DemoPreview>
      </DemoSection>
      <DemoSection title="Toolbar composition">
        <DemoPreview>
          <AppToolbar appearance="flat" status="Ready" end={<AppSplitButton icon={<Download />} label="Export" items={exportItems} onClick={() => setLastAction('toolbar export')} onSelect={setLastAction} />} />
        </DemoPreview>
      </DemoSection>
    </DemoPage>
  )
}
