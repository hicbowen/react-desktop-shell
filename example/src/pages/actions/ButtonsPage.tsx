import { useState } from 'react'
import { MoreHorizontal, Save, Send, Trash2 } from 'lucide-react'
import { AppButton, AppDialog, AppIconButton, AppMenuFlyout, AppTooltip } from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'
import { useDemoCopy } from '../../i18n/interactiveTranslations'

export function ButtonsPage() {
  const t = useDemoCopy()
  const [dialogOpen, setDialogOpen] = useState(false)
  return <DemoPage>
    <DemoSection title="Appearances and sizes"><DemoPreview className="demo-component-row">
      <AppButton>{t('Standard')}</AppButton><AppButton appearance="primary" icon={<Save />}>{t('Save')}</AppButton><AppButton appearance="subtle">{t('Subtle')}</AppButton><AppButton appearance="danger" icon={<Trash2 />}>{t('Delete')}</AppButton><AppButton size="compact">{t('Compact')}</AppButton>
    </DemoPreview></DemoSection>
    <DemoSection title="States and icons"><DemoPreview className="demo-component-row"><AppButton icon={<Send />}>{t('Before')}</AppButton><AppButton icon={<Send />} iconPosition="end">{t('After')}</AppButton><AppButton loading>{t('Saving changes')}</AppButton><AppButton disabled>{t('Disabled')}</AppButton><AppIconButton ariaLabel={t('More actions')} icon={<MoreHorizontal />} /><AppTooltip content={t('More actions')}><AppIconButton ariaLabel={t('More actions with tooltip')} appearance="subtle" icon={<MoreHorizontal />} /></AppTooltip></DemoPreview></DemoSection>
    <DemoSection title="Composition"><DemoPreview className="demo-component-row"><AppMenuFlyout items={[{ key: 'rename', label: t('Rename') }, { key: 'delete', label: t('Delete'), danger: true }]}><AppButton>{t('Open menu')}</AppButton></AppMenuFlyout><AppButton appearance="primary" onClick={() => setDialogOpen(true)}>{t('Open dialog')}</AppButton><AppDialog actions={<AppButton appearance="primary" onClick={() => setDialogOpen(false)}>{t('Done')}</AppButton>} onOpenChange={setDialogOpen} open={dialogOpen} title={t('Button composition')}>{t('Buttons can be used as dialog actions.')}</AppDialog></DemoPreview></DemoSection>
  </DemoPage>
}
