import { AppLink } from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'
import { useDemoCopy } from '../../i18n/interactiveTranslations'

export function AppLinkPage() {
  const t = useDemoCopy()
  return <DemoPage><DemoSection title="Application links" description="Use links for navigation and external resources while preserving native anchor behavior."><DemoPreview><div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}><AppLink href="#components/app-link">{t('Internal link')}</AppLink><AppLink external href="https://github.com">{t('External documentation')}</AppLink><AppLink appearance="subtle" href="#components/app-link">{t('Subtle link')}</AppLink><AppLink disabled href="#disabled">{t('Disabled link')}</AppLink></div></DemoPreview></DemoSection></DemoPage>
}
