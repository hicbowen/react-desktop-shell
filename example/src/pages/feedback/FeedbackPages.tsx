import { useState } from 'react'
import { Button, Input } from 'antd'
import { AppDialog, AppInfoBar, useAppMessageBox, useAppToast } from '../../../../src'
import { DemoControls, DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'

export function AppInfoBarPage() {
  const [visible, setVisible] = useState({ info: true, success: true, warning: true, error: true })
  const reset = () => setVisible({ info: true, success: true, warning: true, error: true })
  return <DemoPage><DemoControls><Button onClick={reset}>Reset dismissed bars</Button></DemoControls><DemoSection title="Status variants" description="Info bars keep contextual feedback close to the surface that produced it."><div className="demo-stack">{(['info', 'success', 'warning', 'error'] as const).map((status) => visible[status] ? <AppInfoBar key={status} status={status} title={`${status[0].toUpperCase()}${status.slice(1)} message`} message="Secondary description text for this component state." dismissible onDismiss={() => setVisible((current) => ({ ...current, [status]: false }))} /> : null)}</div></DemoSection></DemoPage>
}

export function AppToastPage() {
  const toast = useAppToast()
  return <DemoPage><DemoSection title="Transient notifications" description="Trigger one variant at a time and inspect placement, duration, actions, and dismissal."><DemoControls><Button onClick={() => toast.info('Informational notification')}>Info</Button><Button onClick={() => toast.success('Operation completed')}>Success</Button><Button onClick={() => toast.warning('Review required')}>Warning</Button><Button danger onClick={() => toast.error('Operation failed')}>Error</Button><Button onClick={() => toast.show({ title: 'Persistent notification', message: 'Dismiss this notification manually.', duration: 0, action: { label: 'Action', onClick: () => undefined } })}>Persistent + action</Button><Button onClick={() => toast.dismissAll()}>Dismiss all</Button></DemoControls></DemoSection></DemoPage>
}

export function AppDialogPage() {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  return <DemoPage><DemoSection title="Custom modal content" description="AppDialog is suited to forms and workflows that need complete content control."><DemoControls><Button type="primary" onClick={() => setOpen(true)}>Open dialog</Button></DemoControls><AppDialog open={open} onOpenChange={setOpen} title="Edit example value" description="Dialog state belongs to this page." actions={<><Button onClick={() => setOpen(false)}>Cancel</Button><Button type="primary" onClick={() => setOpen(false)}>Save</Button></>}><Input autoFocus value={value} onChange={(event) => setValue(event.target.value)} placeholder="Example value" /></AppDialog></DemoSection></DemoPage>
}

export function MessageBoxPage() {
  const messageBox = useAppMessageBox()
  const [result, setResult] = useState('No response yet')
  const confirm = async () => setResult(await messageBox.confirm({ title: 'Confirm selected action?', message: 'Message boxes provide a concise blocking decision.', confirmText: 'Continue', cancelText: 'Cancel' }) ? 'Confirmed' : 'Cancelled')
  const choose = async () => setResult((await messageBox.show({ title: 'Choose an option', message: 'A message box may return a custom button key.', buttons: [{ key: 'secondary', label: 'Secondary' }, { key: 'primary', label: 'Primary', primary: true }], defaultButton: 'primary' })) ?? 'Dismissed')
  return <DemoPage><DemoSection title="Promise-based decisions"><DemoControls><Button type="primary" onClick={() => void confirm()}>Confirm</Button><Button onClick={() => void choose()}>Custom buttons</Button></DemoControls><DemoPreview><span>Last result: <strong>{result}</strong></span></DemoPreview></DemoSection></DemoPage>
}
