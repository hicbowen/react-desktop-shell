import { Download, FileImage, FileText } from 'lucide-react'
import { AppDropDownButton, useAppToast } from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'
import { useDemoCopy } from '../../i18n/interactiveTranslations'

export function AppDropDownButtonPage() {
  const t = useDemoCopy()
  const toast = useAppToast()
  return <DemoPage><DemoSection title="Menu-only command" description="Open a command menu when no single default action should be implied."><DemoPreview><div style={{ display: 'flex', gap: 12 }}><AppDropDownButton icon={<Download />} items={[{ key: 'pdf', label: t('Export PDF'), icon: <FileText /> }, { key: 'image', label: t('Export image'), icon: <FileImage /> }]} menuAriaLabel={t('Export formats')} onSelect={(key) => toast.info(`${t('Selected format')}: ${key}`)}>{t('Export')}</AppDropDownButton><AppDropDownButton disabled items={[]}>{t('Unavailable')}</AppDropDownButton></div></DemoPreview></DemoSection></DemoPage>
}
