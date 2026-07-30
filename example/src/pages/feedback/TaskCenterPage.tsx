import { useState } from 'react'
import {
  AppTaskCenter,
  AppTaskIndicator,
  AppToolbar,
  type AppTask,
} from '../../../../src'
import {
  DemoPage,
  DemoPreview,
  DemoSection,
} from '../../components/DemoPage'

const initial: AppTask[] = [
  {
    id: 'scan',
    title: 'Scanning workspace',
    description: '1,248 files checked',
    state: 'running',
    progress: 64,
    cancellable: true,
  },
  {
    id: 'export',
    title: 'Export report',
    description: 'Saved to Documents',
    state: 'success',
    dismissible: true,
  },
  {
    id: 'sync',
    title: 'Synchronize database',
    description: 'Connection timed out',
    state: 'error',
    retryable: true,
    dismissible: true,
  },
]

export function AppTaskCenterPage() {
  const [tasks, setTasks] = useState(initial)

  return (
    <DemoPage>
      <DemoSection title="Background tasks">
        <AppTaskCenter
          onCancel={(id) =>
            setTasks((all) =>
              all.map((task) =>
                task.id === id
                  ? {
                      ...task,
                      state: 'canceled',
                      cancellable: false,
                      dismissible: true,
                    }
                  : task,
              ),
            )
          }
          onDismiss={(id) =>
            setTasks((all) => all.filter((task) => task.id !== id))
          }
          onRetry={(id) =>
            setTasks((all) =>
              all.map((task) =>
                task.id === id
                  ? { ...task, state: 'queued', retryable: false }
                  : task,
              ),
            )
          }
          tasks={tasks}
        />
      </DemoSection>

      <DemoSection
        title="Activity indicator"
        description="Surface active background work in compact application chrome."
      >
        <DemoPreview>
          <div className="demo-stack">
            <AppToolbar
              start={<strong>Current workspace</strong>}
              status={<span>Background tasks</span>}
              end={<AppTaskIndicator tasks={tasks} />}
            />
            <AppToolbar
              start={<strong>Idle workspace</strong>}
              status={<span>No active tasks</span>}
              end={<AppTaskIndicator tasks={[]} />}
            />
          </div>
        </DemoPreview>
      </DemoSection>
    </DemoPage>
  )
}
