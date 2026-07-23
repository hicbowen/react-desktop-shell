import { useState } from 'react'
import { AppButton, AppDialog, AppInfoBar, AppTextBox, useAppMessageBox, useAppToast } from '../../../../src'
import { DemoControls, DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'
import { useDemoCopy } from '../../i18n/interactiveTranslations'

export function AppInfoBarPage() {
  const [visible, setVisible] = useState({ info: true, success: true, warning: true, error: true })
  const reset = () => setVisible({ info: true, success: true, warning: true, error: true })
  return <DemoPage><DemoControls><AppButton onClick={reset}>Reset dismissed bars</AppButton></DemoControls><DemoSection title="Status variants" description="Info bars keep contextual feedback close to the surface that produced it."><div className="demo-stack">{(['info', 'success', 'warning', 'error'] as const).map((status) => visible[status] ? <AppInfoBar key={status} status={status} title={`${status[0].toUpperCase()}${status.slice(1)} message`} message="Secondary description text for this component state." dismissible onDismiss={() => setVisible((current) => ({ ...current, [status]: false }))} /> : null)}</div></DemoSection></DemoPage>
}

export function AppToastPage() {
  const toast = useAppToast()
  const t = useDemoCopy()
  return <DemoPage><DemoSection title="Transient notifications" description="Trigger one variant at a time and inspect placement, duration, actions, and dismissal."><DemoControls><AppButton onClick={() => toast.info(t('Informational notification'))}>Info</AppButton><AppButton onClick={() => toast.success(t('Operation completed'))}>Success</AppButton><AppButton onClick={() => toast.warning(t('Review required'))}>Warning</AppButton><AppButton appearance="danger" onClick={() => toast.error(t('Operation failed'))}>Error</AppButton><AppButton onClick={() => toast.show({ title: t('Persistent notification'), message: t('Dismiss this notification manually.'), duration: 0, action: { label: t('Action'), onClick: () => undefined } })}>Persistent + action</AppButton><AppButton onClick={() => toast.dismissAll()}>Dismiss all</AppButton></DemoControls></DemoSection></DemoPage>
}

export function AppDialogPage() {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  return <DemoPage><DemoSection title="Custom modal content" description="AppDialog is suited to forms and workflows that need complete content control."><DemoControls><AppButton appearance="primary" onClick={() => setOpen(true)}>Open dialog</AppButton></DemoControls><AppDialog open={open} onOpenChange={setOpen} title="Edit example value" description="Dialog state belongs to this page." actions={<><AppButton onClick={() => setOpen(false)}>Cancel</AppButton><AppButton appearance="primary" onClick={() => setOpen(false)}>Save</AppButton></>}><AppTextBox autoFocus value={value} onChange={(event) => setValue(event.target.value)} placeholder="Example value" /></AppDialog></DemoSection></DemoPage>
}

export function MessageBoxPage() {
  const messageBox = useAppMessageBox()
  const t = useDemoCopy()
  const [result, setResult] = useState('No response yet')
  const confirm = async () => setResult(await messageBox.confirm({ title: t('Confirm selected action?'), message: t('Message boxes provide a concise blocking decision.'), confirmText: t('Continue'), cancelText: t('Cancel') }) ? 'Confirmed' : 'Cancelled')
  const choose = async () => setResult((await messageBox.show({ title: t('Choose an option'), message: t('A message box may return a custom button key.'), buttons: [{ key: 'secondary', label: t('Secondary') }, { key: 'primary', label: t('Primary'), primary: true }], defaultButton: 'primary' })) ?? 'Dismissed')
  return <DemoPage><DemoSection title="Promise-based decisions"><DemoControls><AppButton appearance="primary" onClick={() => void confirm()}>Confirm</AppButton><AppButton onClick={() => void choose()}>Custom buttons</AppButton></DemoControls><DemoPreview><span>Last result: <strong>{result}</strong></span></DemoPreview></DemoSection></DemoPage>
}
