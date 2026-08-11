import { useState } from 'react'
import {
  AppCheckBox,
  AppField,
  AppInfoBar,
  AppTextBox,
  AppWizard,
  type AppWizardStep,
} from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'
import { useDemoCopy } from '../../i18n/interactiveTranslations'

export function AppWizardPage() {
  const t = useDemoCopy()
  const [workspaceName, setWorkspaceName] = useState('')
  const [includeSampleData, setIncludeSampleData] = useState(true)
  const [nameError, setNameError] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [cancelled, setCancelled] = useState(false)

  const steps: AppWizardStep[] = [
    {
      key: 'basics',
      title: t('Workspace basics'),
      description: t('Give the new workspace a name to get started.'),
      content: (
        <div className="demo-wizard-form">
          <AppField
            error={nameError ? t('Enter a workspace name') : undefined}
            id="wizard-workspace-name"
            label={t('Workspace name')}
            required
          >
            <AppTextBox
              autoFocus
              id="wizard-workspace-name"
              onChange={(event) => {
                setWorkspaceName(event.target.value)
                if (event.target.value.trim()) setNameError(false)
              }}
              placeholder={t('For example, Product team')}
              value={workspaceName}
            />
          </AppField>
        </div>
      ),
    },
    {
      key: 'data',
      title: t('Import data'),
      description: t('Choose whether to start with a small set of sample data.'),
      optional: true,
      content: (
        <div className="demo-wizard-form">
          <AppCheckBox
            checked={includeSampleData}
            description={t('You can import more data later from the workspace.')}
            label={t('Include sample data')}
            onCheckedChange={setIncludeSampleData}
          />
        </div>
      ),
    },
    {
      key: 'template',
      title: t('Choose a workspace template'),
      description: t('Start with a template that matches the way your team works.'),
      content: (
        <div className="demo-wizard-note">
          <p>{t('A standard workspace template is selected for this preview.')}</p>
        </div>
      ),
    },
    {
      key: 'permissions',
      title: t('Configure member access'),
      description: t('Decide who can view and edit this workspace.'),
      content: (
        <div className="demo-wizard-note">
          <p>{t('Member access can be refined after the workspace is created.')}</p>
        </div>
      ),
    },
    {
      key: 'appearance',
      title: t('Set workspace appearance'),
      description: t('Choose a visual style before the workspace opens.'),
      optional: true,
      content: (
        <div className="demo-wizard-note">
          <p>{t('Appearance settings can be changed later from Settings.')}</p>
        </div>
      ),
    },
    {
      key: 'notifications',
      title: t('Choose notification preferences'),
      description: t('Choose which updates should appear in the workspace.'),
      optional: true,
      content: (
        <div className="demo-wizard-note">
          <p>{t('Notification preferences can be changed later without restarting the setup.')}</p>
        </div>
      ),
    },
    {
      key: 'connections',
      title: t('Check connected services'),
      description: t('Confirm that the services needed for this setup are available.'),
      content: (
        <div className="demo-wizard-note">
          <p>{t('All connected services are ready for the final step.')}</p>
        </div>
      ),
    },
    {
      key: 'mapping',
      title: t('Map imported fields'),
      description: t('Match imported fields with workspace properties.'),
      content: (
        <div className="demo-wizard-note">
          <p>{t('Imported fields are ready to be matched with workspace properties.')}</p>
        </div>
      ),
    },
    {
      key: 'schedule',
      title: t('Set synchronization schedule'),
      description: t('Choose when connected data should be refreshed.'),
      optional: true,
      content: (
        <div className="demo-wizard-note">
          <p>{t('This preview uses a daily synchronization schedule.')}</p>
        </div>
      ),
    },
    {
      key: 'security',
      title: t('Configure security options'),
      description: t('Review sign-in and data protection settings.'),
      optional: true,
      content: (
        <div className="demo-wizard-note">
          <p>{t('Security settings remain available from the workspace settings.')}</p>
        </div>
      ),
    },
    {
      key: 'resources',
      title: t('Prepare workspace resources'),
      description: t('Confirm the resources to create before the final review.'),
      content: (
        <div className="demo-wizard-note">
          <p>{t('Workspace resources will be prepared during creation.')}</p>
        </div>
      ),
    },
    {
      key: 'review',
      title: t('Review and create'),
      description: t('Check the choices before creating the workspace.'),
      content: (
        <dl className="demo-wizard-summary">
          <div>
            <dt>{t('Workspace name')}</dt>
            <dd>{workspaceName || t('Not set')}</dd>
          </div>
          <div>
            <dt>{t('Sample data')}</dt>
            <dd>{t(includeSampleData ? 'Included' : 'Skipped')}</dd>
          </div>
        </dl>
      ),
    },
  ]

  return (
    <DemoPage>
      <DemoSection
        description={t('Guide users through a setup flow while the host keeps the form and business state.')}
        title={t('Quick setup')}
      >
        <DemoPreview className="demo-wizard-preview">
          <AppWizard
            completeLabel={t('Create workspace')}
            onCancel={() => {
              setCancelled(true)
              setCompleted(false)
            }}
            onComplete={() => {
              setCompleted(true)
              setCancelled(false)
            }}
            onNext={(step) => {
              if (step.key !== 'basics') return true
              const valid = Boolean(workspaceName.trim())
              setNameError(!valid)
              return valid
            }}
            steps={steps}
          />
        </DemoPreview>
        {completed ? (
          <AppInfoBar
            message={t('The workspace is ready to use.')}
            status="success"
            title={t('Workspace created')}
          />
        ) : null}
        {cancelled ? (
          <AppInfoBar message={t('You can restart the setup at any time.')} title={t('Setup cancelled')} />
        ) : null}
      </DemoSection>
    </DemoPage>
  )
}
