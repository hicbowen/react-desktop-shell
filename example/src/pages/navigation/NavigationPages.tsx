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
} from 'lucide-react'
import {
  AppButton,
  AppRail,
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
              onChange={setSelected}
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
  const [unmountView, setUnmountView] = useState('recent')
  const [hiddenView, setHiddenView] = useState('recent')
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
            onChange={setBasicView}
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
              onChange={setTaskView}
            />
            <div className="demo-selector-task-summary">
              <ListTodo aria-hidden="true" size={20} />
              <strong>{taskSummary[taskView]}</strong>
            </div>
          </div>
        </DemoPreview>
      </DemoSection>

      <DemoSection
        title="Unmounted panels"
        description="The default strategy releases inactive panels, so their local input and counter state reset when selected again."
      >
        <DemoPreview>
          <div className="demo-selector-panel-view">
            <AppSelectorBar
              ariaLabel={t('Unmounted panel example')}
              items={[
                { key: 'recent', label: t('Recent'), panelId: 'unmount-recent' },
                {
                  key: 'favorites',
                  label: t('Favorites'),
                  panelId: 'unmount-favorites',
                },
              ]}
              value={unmountView}
              onChange={setUnmountView}
            />
            <AppSelectorPanels value={unmountView}>
              <AppSelectorPanel id="unmount-recent" value="recent">
                <SelectorPanelStateDemo label={t('Recent')} />
              </AppSelectorPanel>
              <AppSelectorPanel id="unmount-favorites" value="favorites">
                <SelectorPanelStateDemo label={t('Favorites')} />
              </AppSelectorPanel>
            </AppSelectorPanels>
          </div>
        </DemoPreview>
      </DemoSection>

      <DemoSection
        title="State-preserving panels"
        description="The hidden strategy keeps every panel mounted, preserving local state while removing inactive panels from layout and accessibility navigation."
      >
        <DemoPreview>
          <div className="demo-selector-panel-view">
            <AppSelectorBar
              ariaLabel={t('State-preserving panel example')}
              items={[
                { key: 'recent', label: t('Recent'), panelId: 'hidden-recent' },
                {
                  key: 'favorites',
                  label: t('Favorites'),
                  panelId: 'hidden-favorites',
                },
              ]}
              value={hiddenView}
              onChange={setHiddenView}
            />
            <AppSelectorPanels mountStrategy="hidden" value={hiddenView}>
              <AppSelectorPanel id="hidden-recent" value="recent">
                <SelectorPanelStateDemo label={t('Recent')} />
              </AppSelectorPanel>
              <AppSelectorPanel id="hidden-favorites" value="favorites">
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
