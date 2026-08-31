import { useState } from 'react'
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  FolderTree,
  FolderOpen,
  Heart,
  History,
  Home,
  Inbox,
  ListTodo,
  LockKeyhole,
  Settings,
} from '../../components/fluentIcons'
import {
  AppButton,
  AppPage,
  AppRail,
  AppRadioGroup,
  AppSegmentedControl,
  AppSelectorBar,
  AppSelectorPanel,
  AppSelectorPanels,
  AppShell,
  AppTextBox,
  AppTitleBar,
  type PaneDisplayMode,
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
  const [lifecycleView, setLifecycleView] = useState('recent')
  const [panelStrategy, setPanelStrategy] = useState<'unmount' | 'hidden'>('unmount')
  const [animationView, setAnimationView] = useState('recent')
  const [panelMotion, setPanelMotion] = useState<'none' | 'entrance' | 'directional'>('entrance')
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
              value={lifecycleView}
              onValueChange={setLifecycleView}
            />
            <AppSelectorPanels
              motion="none"
              mountStrategy={panelStrategy}
              value={lifecycleView}
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

      <DemoSection
        title="Panel animation"
        description="Compare panel motion independently while inactive panels remain mounted."
      >
        <DemoControls>
          <span>{t('Animation')}</span>
          <AppSegmentedControl
            ariaLabel={t('Animation')}
            onValueChange={(value) => {
              if (value === 'none' || value === 'entrance' || value === 'directional') setPanelMotion(value)
            }}
            options={[
              { value: 'none', label: t('None') },
              { value: 'entrance', label: t('Entrance') },
              { value: 'directional', label: t('Directional') },
            ]}
            size="compact"
            value={panelMotion}
          />
        </DemoControls>
        <DemoPreview>
          <div className="demo-selector-panel-view">
            <AppSelectorBar
              ariaLabel={t('Panel view')}
              items={[
                { key: 'recent', label: t('Recent'), panelId: 'animation-recent' },
                { key: 'favorites', label: t('Favorites'), panelId: 'animation-favorites' },
              ]}
              value={animationView}
              onValueChange={setAnimationView}
            />
            <AppSelectorPanels
              motion={panelMotion}
              mountStrategy="hidden"
              value={animationView}
            >
              <AppSelectorPanel id="animation-recent" value="recent">
                <SelectorPanelStateDemo label={t('Recent')} />
              </AppSelectorPanel>
              <AppSelectorPanel id="animation-favorites" value="favorites">
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
  const { locale, theme, themePreset } = useDemoShell()
  const [displayMode, setDisplayMode] = useState<PaneDisplayMode>('expanded')
  const [activeItem, setActiveItem] = useState('home')
  const navigationItems = [
    { key: 'home', label: t('Home'), icon: <Home /> },
    { key: 'files', label: t('Files'), icon: <FolderOpen /> },
    { key: 'settings', label: t('Settings'), icon: <Settings /> },
  ]

  return (
    <DemoPage>
      <DemoSection
        title="Live navigation modes"
        description="Switch the display mode in a local AppShell preview without changing the surrounding gallery."
      >
        <DemoControls>
          <AppRadioGroup
            ariaLabel={t('Navigation display mode')}
            label={t('Navigation display mode')}
            onValueChange={(value) => setDisplayMode(value as PaneDisplayMode)}
            options={[
              { value: 'expanded', label: t('Expanded') },
              { value: 'compact', label: t('Compact') },
              { value: 'minimal', label: t('Hidden') },
              { value: 'auto', label: t('Automatic') },
            ]}
            orientation="horizontal"
            value={displayMode}
          />
        </DemoControls>
        <DemoPreview className="demo-shell-live-preview">
          <AppShell
            locale={locale}
            sidebar={{ displayMode, expandedWidth: 190 }}
            theme={theme}
            themePreset={themePreset}
            title={t('Preview application')}
            titleBar={
              <AppTitleBar
                center={
                  <span className="demo-titlebar-center">
                    {t('Editor workspace')}
                  </span>
                }
              />
            }
            rail={
              <AppRail
                items={navigationItems}
                onValueChange={setActiveItem}
                value={activeItem}
              />
            }
          >
            <AppPage
              layout="fill"
              title={t('Preview application')}
              description={t('Page content is rendered inside AppShell.')}
            >
              <div className="demo-shell-live-content">
                <strong>
                  {t('Navigation display mode')}: {t(displayMode)}
                </strong>
              </div>
            </AppPage>
          </AppShell>
        </DemoPreview>
      </DemoSection>
    </DemoPage>
  )
}
