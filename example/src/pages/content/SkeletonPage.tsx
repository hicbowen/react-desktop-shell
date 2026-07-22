import { AppSkeleton, AppSkeletonGroup } from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'

export function AppSkeletonPage() {
  return <DemoPage><DemoSection title="Loading placeholders" description="Compose semantic shapes while content structure is known but data is still loading."><DemoPreview><AppSkeletonGroup label="Loading document"><div style={{ display: 'grid', gridTemplateColumns: '48px 1fr', gap: 12, maxWidth: 520 }}><AppSkeleton height={48} shape="circle" width={48} /><div><AppSkeleton height={18} width="42%" /><div style={{ height: 10 }} /><AppSkeleton lines={3} /></div><AppSkeleton height={120} shape="rectangle" style={{ gridColumn: '1 / -1' }} /></div></AppSkeletonGroup></DemoPreview></DemoSection><DemoSection title="Static placeholders"><DemoPreview><AppSkeleton animated={false} lines={4} width={420} /></DemoPreview></DemoSection></DemoPage>
}
