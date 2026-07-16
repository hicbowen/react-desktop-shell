import { MoreHorizontal, User } from 'lucide-react'
import {
  AppIconButton,
  AppListView,
  AppListViewItem,
  AppStatusBadge,
  AppTooltip,
} from '../../../../src'
import { DemoPage, DemoSection } from '../../components/DemoPage'

const informationRows = [
  <AppListViewItem
    description="Grade 5 · Python"
    icon={<User />}
    key="ada"
    title="Ada Lovelace"
    trailing={<AppStatusBadge status="success">Active</AppStatusBadge>}
    value="ada"
  />,
  <AppListViewItem
    description="Grade 6 · Visual coding"
    icon={<User />}
    key="grace"
    title="Grace Hopper"
    trailing={<AppTooltip content="More actions">
      <AppIconButton appearance="subtle" ariaLabel="Actions for Grace" icon={<MoreHorizontal />} />
    </AppTooltip>}
    value="grace"
  />,
  <AppListViewItem
    disabled
    description="Import row has an error"
    icon={<User />}
    key="linus"
    title="Linus"
    value="linus"
  />,
]

const selectionRows = [
  <AppListViewItem
    description="Grade 5 · Python"
    icon={<User />}
    key="ada"
    title="Ada Lovelace"
    trailing={<AppStatusBadge status="success">Active</AppStatusBadge>}
    value="ada"
  />,
  <AppListViewItem
    description="Grade 6 · Visual coding"
    icon={<User />}
    key="grace"
    title="Grace Hopper"
    trailing={<AppStatusBadge status="info">Review</AppStatusBadge>}
    value="grace"
  />,
  <AppListViewItem
    disabled
    description="Import row has an error"
    icon={<User />}
    key="linus"
    title="Linus"
    value="linus"
  />,
]

export function ListViewPage() {
  return <DemoPage>
    <DemoSection title="Static information list">
      <AppListView ariaLabel="Students">{informationRows}</AppListView>
    </DemoSection>
    <DemoSection title="Selection lists">
      <AppListView ariaLabel="Select a student" defaultValue={['ada']} selectionMode="single">
        {selectionRows}
      </AppListView>
      <AppListView ariaLabel="Import preview" density="compact" selectionMode="multiple">
        {selectionRows}
      </AppListView>
    </DemoSection>
    <DemoSection title="Invoke/action list">
      <AppListView
        activationMode="invoke"
        ariaLabel="Open a student"
        onItemInvoke={() => undefined}
      >
        {informationRows}
      </AppListView>
      <p className="demo-note">
        The row main action invokes the item; trailing buttons remain separate actions.
      </p>
    </DemoSection>
  </DemoPage>
}
