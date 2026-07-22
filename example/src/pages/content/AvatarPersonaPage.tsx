import { UserRound } from 'lucide-react'
import { AppAvatar, AppPersona } from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'
import { useDemoCopy } from '../../i18n/interactiveTranslations'

export function AppAvatarPersonaPage() {
  const t = useDemoCopy()
  return <DemoPage><DemoSection title="Identity and presence" description="Represent people, accounts, and collaborators from compact avatars through descriptive personas."><DemoPreview><div style={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: 24 }}><AppAvatar name={t('Ada Lovelace')} status="available" /><AppAvatar icon={<UserRound />} shape="square" size="large" status="busy" /><AppPersona avatar={{ status: 'available' }} name={t('Ada Lovelace')} secondaryText={t('Workspace owner')} tertiaryText={t('Available')} /><AppPersona avatar={{ status: 'away' }} name={t('Grace Hopper')} secondaryText={t('Reviewing changes')} size="large" /></div></DemoPreview></DemoSection></DemoPage>
}
