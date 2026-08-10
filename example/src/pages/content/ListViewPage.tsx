import { useState } from 'react'
import { MoreHorizontal, User } from '../../components/fluentIcons'
import {
  AppIconButton,
  AppListView,
  AppListViewItem,
  AppSegmentedControl,
  AppStatusBadge,
  AppTooltip,
  AppToggleSwitch,
} from '../../../../src'
import { DemoControls, DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'
import { useDemoCopy } from '../../i18n/interactiveTranslations'

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
  const t = useDemoCopy()
  const [selectionMode, setSelectionMode] = useState<'single' | 'multiple'>('single')
  const [compact, setCompact] = useState(false)

  return <DemoPage>
    <DemoSection title="Static information list">
      <AppListView ariaLabel="Students">{informationRows}</AppListView>
    </DemoSection>
    <DemoSection title="Selection lists">
      <DemoControls>
        <span>{t('Selection mode')}</span>
        <AppSegmentedControl
          ariaLabel={t('Selection mode')}
          onValueChange={(value) => {
            if (value === 'single' || value === 'multiple') setSelectionMode(value)
          }}
          options={[
            { value: 'single', label: t('Single') },
            { value: 'multiple', label: t('Multiple') },
          ]}
          size="compact"
          value={selectionMode}
        />
        <AppToggleSwitch checked={compact} label={t('Compact density')} onCheckedChange={setCompact} size="compact" />
      </DemoControls>
      <DemoPreview className="demo-list-selection-preview">
        <AppListView
          ariaLabel={t('Select a student')}
          className="demo-list-selection"
          defaultValue={['ada']}
          density={compact ? 'compact' : 'standard'}
          selectionMode={selectionMode}
        >
          {selectionRows}
        </AppListView>
      </DemoPreview>
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
