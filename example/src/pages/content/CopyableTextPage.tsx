import { AppCopyableText } from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'
import { useDemoCopy } from '../../i18n/interactiveTranslations'

export function AppCopyableTextPage() {
  const t = useDemoCopy()
  return <DemoPage><DemoSection title="Copyable values" description="Pair identifiers, paths, and generated values with accessible clipboard feedback."><DemoPreview><div style={{ display: 'grid', gap: 16, maxWidth: 520, width: '100%' }}><AppCopyableText text="project://desktop-shell/main" /><AppCopyableText text="8F2A-19C4-77BD">{t('License key')}: 8F2A-19C4-77BD</AppCopyableText><AppCopyableText text="/Users/example/Documents/a-very-long-workspace-path" truncate /></div></DemoPreview></DemoSection></DemoPage>
}
