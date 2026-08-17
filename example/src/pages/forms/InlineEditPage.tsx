import { AppForm, AppFormField, AppInlineEdit, useAppForm } from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'
import { useDemoCopy } from '../../i18n/interactiveTranslations'

export function AppInlineEditPage() {
  const t = useDemoCopy()
  const form = useAppForm<{ name: string }>({ defaultValues: { name: 'Quarterly report.docx' } })
  return <DemoPage><DemoSection title="Desktop inline editing" description="Rename resources with double-click or F2, then commit with Enter or cancel with Escape."><DemoPreview><AppForm form={form}><AppFormField<{ name: string }, string> label={t('Document name')} name="name">{({ setValue, value }) => <div style={{ display: 'grid', gap: 12, width: 360 }}><AppInlineEdit ariaLabel={t('Document name')} onValueChange={setValue} required selection="basename" showActions validate={(next) => next.includes('/') ? t('Names cannot contain slashes') : null} value={value} /><span style={{ color: 'var(--app-shell-muted-text-color)', fontSize: 12 }}>{t('Double-click the name or press F2 to edit.')}</span></div>}</AppFormField></AppForm></DemoPreview></DemoSection></DemoPage>
}
