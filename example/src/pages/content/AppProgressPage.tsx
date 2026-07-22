import { AppProgressBar, AppProgressRing } from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'

export function AppProgressPage() {
  return <DemoPage><DemoSection title="Progress rings"><DemoPreview className="demo-component-row"><AppProgressRing label="Small" size="small" /><AppProgressRing label="Checking updates" /><AppProgressRing label="Large" labelPosition="bottom" size="large" /><AppProgressRing ariaLabel="Background task" labelPosition="hidden" /></DemoPreview></DemoSection><DemoSection title="Progress bars"><DemoPreview className="demo-progress-stack"><AppProgressBar description="68 / 100 records" label="Importing students" showValue value={68} /><AppProgressBar indeterminate label="Preparing preview" /><AppProgressBar label="Complete" showValue status="success" value={100} /><AppProgressBar description="Connection interrupted" label="Upload failed" status="error" value={42} /></DemoPreview></DemoSection></DemoPage>
}
