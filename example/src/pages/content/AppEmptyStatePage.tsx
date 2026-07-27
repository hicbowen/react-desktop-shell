import { UserPlus, Users } from 'lucide-react'
import { AppButton, AppEmptyState } from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'

export function AppEmptyStatePage() {
  return <DemoPage><DemoSection title="Empty states"><DemoPreview><AppEmptyState actions={<AppButton appearance="primary" icon={<UserPlus />}>Add student</AppButton>} description="Add a student to create feedback and learning plans." icon={<Users />} title="No students yet" /><AppEmptyState align="start" layout="inline" size="small" title="Nothing selected" description="Choose an item from the list to inspect it." /><div style={{ height: 240, display: 'flex', border: '1px solid var(--app-shell-border-color)' }}><AppEmptyState description="Try changing or clearing the current filters." layout="fill" title="No matching students" visual="default" /></div><AppEmptyState description="No matching results" layout="inline" size="small" visual="none" /></DemoPreview></DemoSection></DemoPage>
}
