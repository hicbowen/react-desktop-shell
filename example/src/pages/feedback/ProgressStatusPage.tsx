import { Check, Clock3, XCircle } from 'lucide-react'
import { AppCard, AppProgressBar, AppProgressRing, AppStatusBadge } from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'

export function AppProgressPage() {
  return <DemoPage>
    <DemoSection title="Progress rings">
      <DemoPreview className="demo-component-row">
        <AppProgressRing label="Small" size="small" />
        <AppProgressRing label="Checking updates" />
        <AppProgressRing label="Large" labelPosition="bottom" size="large" />
        <AppProgressRing ariaLabel="Background task" labelPosition="hidden" />
      </DemoPreview>
    </DemoSection>
    <DemoSection title="Progress bars">
      <DemoPreview className="demo-progress-stack">
        <AppProgressBar description="68 / 100 records" label="Importing students" showValue value={68} />
        <AppProgressBar indeterminate label="Preparing preview" />
        <AppProgressBar label="Complete" showValue status="success" value={100} />
        <AppProgressBar description="Connection interrupted" label="Upload failed" status="error" value={42} />
      </DemoPreview>
    </DemoSection>
  </DemoPage>
}

export function AppStatusBadgePage() {
  return <DemoPage><DemoSection title="Status badges">
      <DemoPreview className="demo-component-row">
        {(['neutral', 'info', 'success', 'warning', 'danger'] as const).map((status) => <AppStatusBadge key={status} status={status}>{status}</AppStatusBadge>)}
        <AppStatusBadge appearance="filled" icon={<Check />} status="success">Done</AppStatusBadge>
        <AppStatusBadge appearance="outline" icon={<XCircle />} status="danger">Failed</AppStatusBadge>
      </DemoPreview>
      <DemoPreview className="demo-component-row">
        <AppStatusBadge marker="dot" status="success">Online</AppStatusBadge>
        <AppStatusBadge appearance="ghost" marker="dot" status="warning">Pending</AppStatusBadge>
      </DemoPreview>
      <DemoPreview className="demo-status-list">
        <AppCard><strong>Course category</strong> <AppStatusBadge status="info">Python</AppStatusBadge></AppCard>
        <div className="demo-list-placeholder"><span><Clock3 size={16} /> Update channel</span><AppStatusBadge status="warning">Preview</AppStatusBadge></div>
      </DemoPreview>
    </DemoSection></DemoPage>
}
