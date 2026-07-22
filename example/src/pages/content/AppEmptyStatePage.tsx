import { UserPlus, Users } from 'lucide-react'
import { AppButton, AppEmptyState } from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'

export function AppEmptyStatePage() {
  return <DemoPage><DemoSection title="Empty states"><DemoPreview><AppEmptyState action={<AppButton appearance="primary" icon={<UserPlus />}>Add student</AppButton>} description="Add a student to create feedback and learning plans." icon={<Users />} title="No students yet" /><AppEmptyState align="start" appearance="compact" title="Nothing selected" description="Choose an item from the list to inspect it." /></DemoPreview></DemoSection></DemoPage>
}
