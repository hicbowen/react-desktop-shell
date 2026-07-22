import { AppDivider, AppSeparator } from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'
import { useDemoCopy } from '../../i18n/interactiveTranslations'

export function AppDividerPage() {
  const t = useDemoCopy()
  return <DemoPage><DemoSection title="Content separation" description="Separate adjacent content without introducing another container."><DemoPreview><div style={{ display: 'grid', gap: 20, width: '100%' }}><span>{t('General settings')}</span><AppDivider /><span>{t('Advanced settings')}</span><AppSeparator appearance="strong">{t('Account')}</AppSeparator><div style={{ alignItems: 'center', display: 'flex', gap: 12, height: 32 }}><span>{t('Left')}</span><AppDivider orientation="vertical" /><span>{t('Right')}</span></div></div></DemoPreview></DemoSection></DemoPage>
}
