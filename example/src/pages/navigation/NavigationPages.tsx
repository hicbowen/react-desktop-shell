import { useState } from 'react'
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  FolderTree,
  Heart,
  History,
  Inbox,
  ListTodo,
  LockKeyhole,
} from '../../components/fluentIcons'
import {
  AppButton,
  AppRail,
  AppSegmentedControl,
  AppSelectorBar,
  AppSelectorPanel,
  AppSelectorPanels,
  AppTextBox,
} from '../../../../src'
import {
  DemoControls,
  DemoPage,
  DemoPreview,
  DemoSection,
} from '../../components/DemoPage'
import { useDemoShell } from '../../components/DemoShellContext'
import { useDemoCopy } from '../../i18n/interactiveTranslations'

export function AppRailPage() {
  const t = useDemoCopy()
  const [selected, setSelected] = useState('first')

  return (
    <DemoPage>
      <DemoSection
        title="Rail entries"
        description="Items, groups, submenus, badges, disabled states, and footer actions share a single entry model."
      >
        <DemoPreview>
          <div className="demo-rail-preview">
            <AppRail
              value={selected}
              onValueChange={setSelected}
              items={[
                {
                  key: 'first',
                  label: t('First item'),
                  icon: <Inbox />,
                  badge: 3,
                },
                { type: 'group', label: t('Group') },
                {
                  type: 'submenu',
                  key: 'submenu',
                  label: t('Submenu'),
                  icon: <FolderTree />,
                  children: [
                    {
                      key: 'child-one',
                      label: t('Child one'),
                      icon: <FileText />,
                    },
                    {
                      key: 'child-two',
                      label: t('Child two'),
                    },
                    {
                      key: 'child-three',
                      label: t('Child three'),
                      icon: <LockKeyhole />,
                      disabled: true,
                    },
                  ],
                },
              ]}
            />
          </div>
        </DemoPreview>
      </DemoSection>
    </DemoPage>
  )
}

export function AppSelectorBarPage() {
  const t = useDemoCopy()
  const [basicView, setBasicView] = useState('all')
  const [taskView, setTaskView] = useState('all-tasks')
  const [panelView, setPanelView] = useState('recent')
  const [panelStrategy, setPanelStrategy] = useState<'unmount' | 'hidden'>('unmount')
  const taskSummary: Record<string, string> = {
    'all-tasks': t('12 tasks across all dates'),
    today: t('3 tasks due today'),
    open: t('7 tasks still to complete'),
    completed: t('5 completed tasks'),
  }

  return (
    <DemoPage>
      <DemoSection title="Text">
        <DemoPreview>
          <AppSelectorBar
            ariaLabel={t('Task status')}
            items={[
              { key: 'all', label: t('All') },
              { key: 'open', label: t('Open') },
              { key: 'done', label: t('Completed') },
            ]}
            value={basicView}
            onValueChange={setBasicView}
          />
        </DemoPreview>
      </DemoSection>

      <DemoSection title="Icon and text">
        <DemoPreview>
          <AppSelectorBar
            ariaLabel={t('Collection view')}
            defaultValue="recent"
            items={[
              { key: 'recent', label: t('Recent'), icon: <Clock3 /> },
              { key: 'favorites', label: t('Favorites'), icon: <Heart /> },
              { key: 'history', label: t('History'), icon: <History /> },
            ]}
          />
        </DemoPreview>
      </DemoSection>

      <DemoSection title="Disabled item">
        <DemoPreview>
          <AppSelectorBar
            ariaLabel={t('Release channel')}
            items={[
              { key: 'stable', label: t('stable') },
              { key: 'preview', label: t('Preview'), disabled: true },
            ]}
          />
        </DemoPreview>
      </DemoSection>

      <DemoSection title="Icons">
        <DemoPreview>
          <AppSelectorBar
            ariaLabel={t('Quick task view')}
            size="small"
            items={[
              { key: 'inbox', icon: <Inbox />, ariaLabel: t('All tasks') },
              { key: 'today', icon: <CalendarDays />, ariaLabel: t('Today') },
              { key: 'open', icon: <ListTodo />, ariaLabel: t('Open') },
              { key: 'done', icon: <CheckCircle2 />, ariaLabel: t('Completed') },
            ]}
          />
        </DemoPreview>
      </DemoSection>

      <DemoSection title="Task view">
        <DemoPreview>
          <div className="demo-selector-task-view">
            <AppSelectorBar
              ariaLabel={t('Task data view')}
              items={[
                { key: 'all-tasks', label: t('All tasks') },
                { key: 'today', label: t('Today') },
                { key: 'open', label: t('Open') },
                { key: 'completed', label: t('Completed') },
              ]}
              value={taskView}
              onValueChange={setTaskView}
            />
            <div className="demo-selector-task-summary">
              <ListTodo aria-hidden="true" size={20} />
              <strong>{taskSummary[taskView]}</strong>
            </div>
          </div>
        </DemoPreview>
      </DemoSection>

      <DemoSection
        title="Panel lifecycle"
        description="Compare unmounting inactive panels with keeping them mounted while the selector and panel content stay the same."
      >
        <DemoControls>
          <span>{t('Panel strategy')}</span>
          <AppSegmentedControl
            ariaLabel={t('Panel strategy')}
            onValueChange={(value) => {
              if (value === 'unmount' || value === 'hidden') setPanelStrategy(value)
            }}
            options={[
              { value: 'unmount', label: t('Unmounted') },
              { value: 'hidden', label: t('State-preserving') },
            ]}
            size="compact"
            value={panelStrategy}
          />
        </DemoControls>
        <DemoPreview>
          <div className="demo-selector-panel-view">
            <AppSelectorBar
              ariaLabel={t('Panel view')}
              items={[
                { key: 'recent', label: t('Recent'), panelId: 'selector-recent' },
                {
                  key: 'favorites',
                  label: t('Favorites'),
                  panelId: 'selector-favorites',
                },
              ]}
              value={panelView}
              onValueChange={setPanelView}
            />
            <AppSelectorPanels
              motion={panelStrategy === 'hidden' ? 'directional' : 'entrance'}
              mountStrategy={panelStrategy}
              value={panelView}
            >
              <AppSelectorPanel id="selector-recent" value="recent">
                <SelectorPanelStateDemo label={t('Recent')} />
              </AppSelectorPanel>
              <AppSelectorPanel id="selector-favorites" value="favorites">
                <SelectorPanelStateDemo label={t('Favorites')} />
              </AppSelectorPanel>
            </AppSelectorPanels>
          </div>
        </DemoPreview>
      </DemoSection>
    </DemoPage>
  )
}

function SelectorPanelStateDemo({ label }: { label: string }) {
  const t = useDemoCopy()
  const [count, setCount] = useState(0)

  return (
    <div className="demo-selector-panel-state">
      <strong>{label} {t('panel')}</strong>
      <AppTextBox aria-label={`${label} ${t('note')}`} placeholder={t('Type a note')} />
      <AppButton onClick={() => setCount((value) => value + 1)}>
        {t('Count')}: {count}
      </AppButton>
    </div>
  )
}

export function NavigationModesPage() {
  const t = useDemoCopy()
  const { railDisplayMode, setRailDisplayMode } = useDemoShell()
  return (
    <DemoPage>
      <DemoSection
        title="Live navigation modes"
        description="These controls update the gallery's real outer AppShell."
      >
        <DemoControls>
          {(['expanded', 'compact', 'minimal', 'auto'] as const).map((mode) => (
            <button
              className={
                railDisplayMode === mode
                  ? 'demo-choice demo-choice--active'
                  : 'demo-choice'
              }
              key={mode}
              type="button"
              onClick={() => setRailDisplayMode(mode)}
            >
              <strong>{t(mode)}</strong>
              <small>
                {mode === 'auto'
                  ? t('Responsive breakpoints')
                  : `${t(mode)}${t('rail presentation')}`}
              </small>
            </button>
          ))}
        </DemoControls>
      </DemoSection>
    </DemoPage>
  )
}
