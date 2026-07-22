import { useState } from 'react'
import { AppPagination, type AppPaginationValue } from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'

export function AppPaginationPage() {
  const [value, setValue] = useState<AppPaginationValue>({ pageIndex: 2, pageSize: 10 })
  return <DemoPage><DemoSection title="Standalone pagination" description="Navigate any paged collection with optional size, summary, and boundary controls."><DemoPreview><AppPagination onValueChange={setValue} pageSizeOptions={[10, 20, 50]} total={137} value={value} /></DemoPreview></DemoSection><DemoSection title="Compact pagination"><DemoPreview><AppPagination compact defaultValue={{ pageIndex: 0, pageSize: 20 }} showSummary={false} total={93} /></DemoPreview></DemoSection></DemoPage>
}
