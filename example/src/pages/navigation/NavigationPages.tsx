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

export function AppRailPage() {
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
                  label: 'First item',
                  icon: <Inbox />,
                  badge: 3,
                },
                { type: 'group', label: 'Group' },
                {
                  type: 'submenu',
                  key: 'submenu',
                  label: 'Submenu',
                  icon: <FolderTree />,
                  children: [
                    {
                      key: 'child-one',
                      label: 'Child one',
                      icon: <FileText />,
                    },
                    {
                      key: 'child-two',
                      label: 'Child two',
                    },
                    {
                      key: 'child-three',
                      label: 'Child three',
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
  const [basicView, setBasicView] = useState('all')
  const [taskView, setTaskView] = useState('all-tasks')
  const [unmountView, setUnmountView] = useState('recent')
  const [hiddenView, setHiddenView] = useState('recent')
  const taskSummary: Record<string, string> = {
    'all-tasks': '12 tasks across all dates',
    today: '3 tasks due today',
    open: '7 tasks still to complete',
    completed: '5 completed tasks',
  }

  return (
    <DemoPage>
      <DemoSection title="Text">
        <DemoPreview>
          <AppSelectorBar
            ariaLabel="Task status"
            items={[
              { key: 'all', label: 'All' },
              { key: 'open', label: 'Open' },
              { key: 'done', label: 'Completed' },
            ]}
            value={basicView}
            onChange={setBasicView}
          />
        </DemoPreview>
      </DemoSection>

      <DemoSection title="Icon and text">
        <DemoPreview>
          <AppSelectorBar
            ariaLabel="Collection view"
            defaultValue="recent"
            items={[
              { key: 'recent', label: 'Recent', icon: <Clock3 /> },
              { key: 'favorites', label: 'Favorites', icon: <Heart /> },
              { key: 'history', label: 'History', icon: <History /> },
            ]}
          />
        </DemoPreview>
      </DemoSection>

      <DemoSection title="Disabled item">
        <DemoPreview>
          <AppSelectorBar
            ariaLabel="Release channel"
            items={[
              { key: 'stable', label: 'Stable' },
              { key: 'preview', label: 'Preview', disabled: true },
            ]}
          />
        </DemoPreview>
      </DemoSection>

      <DemoSection title="Icons">
        <DemoPreview>
          <AppSelectorBar
            ariaLabel="Quick task view"
            size="small"
            items={[
              { key: 'inbox', icon: <Inbox />, ariaLabel: 'All tasks' },
              { key: 'today', icon: <CalendarDays />, ariaLabel: 'Today' },
              { key: 'open', icon: <ListTodo />, ariaLabel: 'Open' },
              { key: 'done', icon: <CheckCircle2 />, ariaLabel: 'Completed' },
            ]}
          />
        </DemoPreview>
      </DemoSection>

      <DemoSection title="Task view">
        <DemoPreview>
          <div className="demo-selector-task-view">
            <AppSelectorBar
              ariaLabel="Task data view"
              items={[
                { key: 'all-tasks', label: 'All tasks' },
                { key: 'today', label: 'Today' },
                { key: 'open', label: 'Open' },
                { key: 'completed', label: 'Completed' },
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
              ariaLabel="Unmounted panel example"
              items={[
                { key: 'recent', label: 'Recent', panelId: 'unmount-recent' },
                {
                  key: 'favorites',
                  label: 'Favorites',
                  panelId: 'unmount-favorites',
                },
              ]}
              value={unmountView}
              onChange={setUnmountView}
            />
            <AppSelectorPanels value={unmountView}>
              <AppSelectorPanel id="unmount-recent" value="recent">
                <SelectorPanelStateDemo label="Recent" />
              </AppSelectorPanel>
              <AppSelectorPanel id="unmount-favorites" value="favorites">
                <SelectorPanelStateDemo label="Favorites" />
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
              ariaLabel="State-preserving panel example"
              items={[
                { key: 'recent', label: 'Recent', panelId: 'hidden-recent' },
                {
                  key: 'favorites',
                  label: 'Favorites',
                  panelId: 'hidden-favorites',
                },
              ]}
              value={hiddenView}
              onChange={setHiddenView}
            />
            <AppSelectorPanels mountStrategy="hidden" value={hiddenView}>
              <AppSelectorPanel id="hidden-recent" value="recent">
                <SelectorPanelStateDemo label="Recent" />
              </AppSelectorPanel>
              <AppSelectorPanel id="hidden-favorites" value="favorites">
                <SelectorPanelStateDemo label="Favorites" />
              </AppSelectorPanel>
            </AppSelectorPanels>
          </div>
        </DemoPreview>
      </DemoSection>
    </DemoPage>
  )
}

function SelectorPanelStateDemo({ label }: { label: string }) {
  const [count, setCount] = useState(0)

  return (
    <div className="demo-selector-panel-state">
      <strong>{label} panel</strong>
      <AppTextBox aria-label={`${label} note`} placeholder="Type a note" />
      <AppButton onClick={() => setCount((value) => value + 1)}>
        Count: {count}
      </AppButton>
    </div>
  )
}

export function NavigationModesPage() {
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
              <strong>{mode}</strong>
              <small>
                {mode === 'auto'
                  ? 'Responsive breakpoints'
                  : `${mode} rail presentation`}
              </small>
            </button>
          ))}
        </DemoControls>
      </DemoSection>
    </DemoPage>
  )
}
