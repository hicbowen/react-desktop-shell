import { useState } from 'react'
import { MoreHorizontal, Save, Send, Trash2 } from 'lucide-react'
import { AppButton, AppDialog, AppIconButton, AppMenuFlyout, AppTooltip } from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'

export function ButtonsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  return <DemoPage>
    <DemoSection title="Appearances and sizes"><DemoPreview className="demo-component-row">
      <AppButton>Standard</AppButton><AppButton appearance="primary" icon={<Save />}>Save</AppButton><AppButton appearance="subtle">Subtle</AppButton><AppButton appearance="danger" icon={<Trash2 />}>Delete</AppButton><AppButton size="compact">Compact</AppButton>
    </DemoPreview></DemoSection>
    <DemoSection title="States and icons"><DemoPreview className="demo-component-row"><AppButton icon={<Send />}>Before</AppButton><AppButton icon={<Send />} iconPosition="end">After</AppButton><AppButton loading>Saving changes</AppButton><AppButton disabled>Disabled</AppButton><AppIconButton ariaLabel="More actions" icon={<MoreHorizontal />} /><AppTooltip content="More actions"><AppIconButton ariaLabel="More actions with tooltip" appearance="subtle" icon={<MoreHorizontal />} /></AppTooltip></DemoPreview></DemoSection>
    <DemoSection title="Composition"><DemoPreview className="demo-component-row"><AppMenuFlyout items={[{ key: 'rename', label: 'Rename' }, { key: 'delete', label: 'Delete', danger: true }]}><AppButton>Open menu</AppButton></AppMenuFlyout><AppButton appearance="primary" onClick={() => setDialogOpen(true)}>Open dialog</AppButton><AppDialog actions={<AppButton appearance="primary" onClick={() => setDialogOpen(false)}>Done</AppButton>} onOpenChange={setDialogOpen} open={dialogOpen} title="Button composition">Buttons can be used as dialog actions.</AppDialog></DemoPreview></DemoSection>
  </DemoPage>
}
