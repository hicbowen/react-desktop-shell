import { useState } from 'react'
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Heart,
  History,
  Inbox,
  ListTodo,
} from 'lucide-react'
import { AppRail, AppSelectorBar } from '../../../../src'
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
                { key: 'first', label: 'First item', badge: 3 },
                { type: 'group', label: 'Group' },
                {
                  type: 'submenu',
                  key: 'submenu',
                  label: 'Submenu',
                  children: [
                    { key: 'child-one', label: 'Child one' },
                    { key: 'child-two', label: 'Child two', disabled: true },
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
    </DemoPage>
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
