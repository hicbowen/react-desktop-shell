import { Check, Clock3, XCircle } from 'lucide-react'
import { AppCard, AppStatusBadge } from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'

export function AppStatusBadgePage() {
  return <DemoPage><DemoSection title="Status badges"><DemoPreview className="demo-component-row">{(['neutral', 'info', 'success', 'warning', 'danger'] as const).map((status) => <AppStatusBadge key={status} status={status}>{status}</AppStatusBadge>)}<AppStatusBadge appearance="filled" icon={<Check />} status="success">Done</AppStatusBadge><AppStatusBadge appearance="outline" icon={<XCircle />} status="danger">Failed</AppStatusBadge></DemoPreview><DemoPreview className="demo-component-row"><AppStatusBadge marker="dot" status="success">Online</AppStatusBadge><AppStatusBadge appearance="ghost" marker="dot" status="warning">Pending</AppStatusBadge></DemoPreview><DemoPreview className="demo-status-list"><AppCard><strong>Course category</strong> <AppStatusBadge status="info">Python</AppStatusBadge></AppCard><div className="demo-list-placeholder"><span><Clock3 size={16} /> Update channel</span><AppStatusBadge status="warning">Preview</AppStatusBadge></div></DemoPreview></DemoSection></DemoPage>
}
