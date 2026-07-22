import { useState } from 'react'
import { AppInlineEdit } from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'
import { useDemoCopy } from '../../i18n/interactiveTranslations'

export function AppInlineEditPage() {
  const t = useDemoCopy()
  const [name, setName] = useState('Quarterly report.docx')
  return <DemoPage><DemoSection title="Desktop inline editing" description="Rename resources with double-click or F2, then commit with Enter or cancel with Escape."><DemoPreview><div style={{ display: 'grid', gap: 12, width: 360 }}><strong>{t('Document name')}</strong><AppInlineEdit ariaLabel={t('Document name')} onValueChange={setName} required selection="basename" showActions validate={(value) => value.includes('/') ? t('Names cannot contain slashes') : null} value={name} /><span style={{ color: 'var(--app-shell-muted-text-color)', fontSize: 12 }}>{t('Double-click the name or press F2 to edit.')}</span></div></DemoPreview></DemoSection></DemoPage>
}
