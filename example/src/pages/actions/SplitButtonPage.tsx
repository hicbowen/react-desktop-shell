import { useState } from 'react'
import { Download, FileImage, FileText, Trash2 } from 'lucide-react'
import {
  AppSplitButton,
  AppToolbar,
  type AppMenuFlyoutEntry,
} from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'
import { useDemoCopy } from '../../i18n/interactiveTranslations'

export function AppSplitButtonPage() {
  const t = useDemoCopy()
  const [lastAction, setLastAction] = useState('None')
  const exportItems: AppMenuFlyoutEntry[] = [{ key: 'pdf', label: t('Export PDF'), icon: <FileText /> }, { key: 'image', label: t('Export image'), icon: <FileImage /> }, { type: 'separator' }, { key: 'remove', label: t('Remove export preset'), icon: <Trash2 />, danger: true }]

  return (
    <DemoPage>
      <DemoSection title="Split actions" description="The primary side runs the default command; the arrow opens alternate commands.">
        <DemoPreview className="demo-split-button-row">
          <AppSplitButton label={t('Export')} items={exportItems} onClick={() => setLastAction('default export')} onSelect={setLastAction} />
          <AppSplitButton icon={<Download />} label={t('Download')} items={exportItems} onClick={() => setLastAction('download')} onSelect={setLastAction} />
          <AppSplitButton disabled label={t('Disabled')} items={exportItems} />
          <AppSplitButton menuDisabled label={t('Menu disabled')} items={exportItems} onClick={() => setLastAction('primary still available')} />
          <span className="demo-note">{t('Last action:')} {t(lastAction)}</span>
        </DemoPreview>
      </DemoSection>
      <DemoSection title="Toolbar composition">
        <DemoPreview>
          <AppToolbar appearance="flat" status={t('Ready')} end={<AppSplitButton icon={<Download />} label={t('Export')} items={exportItems} onClick={() => setLastAction('toolbar export')} onSelect={setLastAction} />} />
        </DemoPreview>
      </DemoSection>
    </DemoPage>
  )
}
