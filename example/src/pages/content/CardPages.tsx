import { useState } from 'react'
import {
  Blend,
  CheckCircle2,
  Cloud,
  DatabaseBackup,
  Ellipsis,
  FileUp,
  HardDrive,
  Palette,
  Sparkles,
  Users,
} from 'lucide-react'
import {
  AppButton,
  AppCard,
  AppCardFooter,
  AppCardGroup,
  AppCardHeader,
  AppIconButton,
} from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'

const sameSurfaceContent = (
  <AppCardHeader
    title="Recent project"
    description="Continue working in your last workspace"
  />
)

export function AppCardPage() {
  const [mode, setMode] = useState('local')
  const [cardActivations, setCardActivations] = useState(0)
  const [internalStatus, setInternalStatus] = useState('No action yet')

  return (
    <DemoPage>
      <DemoSection title="Static surface">
        <DemoPreview>
          <AppCard>
            <AppCardHeader
              icon={<Users />}
              title="Student overview"
              description="The current class has 24 students"
            />
            <div>18 after-class feedback reports were completed this week.</div>
          </AppCard>
        </DemoPreview>
      </DemoSection>

      <DemoSection title="Header, content, and footer">
        <DemoPreview>
          <AppCard>
            <AppCardHeader
              icon={<DatabaseBackup />}
              title="Data backup"
              description="Protect local application data"
              action={
                <AppIconButton appearance="subtle" ariaLabel="More backup options" icon={<Ellipsis size={16} />} size="compact" />
              }
            />
            <div>Last backup: today at 10:30</div>
            <AppCardFooter
              start={<span>24.6 MB total</span>}
              end={<AppButton appearance="primary">Back up now</AppButton>}
            />
          </AppCard>
        </DemoPreview>
      </DemoSection>

      <DemoSection title="Footer separation">
        <DemoPreview>
          <div className="demo-card-grid demo-card-grid--comparison">
            <AppCard>
              <div>Default footer</div>
              <AppCardFooter end={<AppButton>Update</AppButton>} start="10:30" />
            </AppCard>
            <AppCard>
              <div>Divided Footer</div>
              <AppCardFooter divided end={<AppButton>Update</AppButton>} start="10:30" />
            </AppCard>
          </div>
        </DemoPreview>
      </DemoSection>

      <DemoSection title="Appearance">
        <DemoPreview>
          <div className="demo-card-grid demo-card-grid--comparison">
            <AppCard appearance="filled">{sameSurfaceContent}</AppCard>
            <AppCard appearance="outlined">{sameSurfaceContent}</AppCard>
            <AppCard appearance="subtle">{sameSurfaceContent}</AppCard>
          </div>
        </DemoPreview>
      </DemoSection>

      <DemoSection title="Horizontal tool card">
        <DemoPreview>
          <AppCard orientation="horizontal">
            <span className="demo-card-tool-icon"><FileUp /></span>
            <div className="demo-card-tool-content">
              <strong>Data import</strong>
              <span>Import student information from Excel</span>
            </div>
            <AppButton>Select file</AppButton>
          </AppCard>
        </DemoPreview>
      </DemoSection>

      <DemoSection title="Interactive states">
        <DemoPreview>
          <div className="demo-card-grid demo-card-grid--states">
            <AppCard onClick={() => setCardActivations((count) => count + 1)}>
              <AppCardHeader title="Normal" description="Click, hover, or press Enter" />
            </AppCard>
            <AppCard className="demo-card-state--hover" interactive>
              <AppCardHeader title="Hover" description="State reference" />
            </AppCard>
            <AppCard className="demo-card-state--pressed" interactive>
              <AppCardHeader title="Pressed" description="State reference" />
            </AppCard>
            <AppCard className="demo-card-state--focus" interactive>
              <AppCardHeader title="Focus" description="State reference" />
            </AppCard>
            <AppCard disabled onClick={() => undefined}>
              <AppCardHeader title="Disabled" description="Unavailable" />
            </AppCard>
          </div>
          <div className="demo-note">Card activations: {cardActivations}</div>
        </DemoPreview>
      </DemoSection>

      <DemoSection title="Selected mode">
        <DemoPreview>
          <div className="demo-card-grid demo-card-grid--comparison">
            {[
              { key: 'local', title: 'Local mode', icon: <HardDrive /> },
              { key: 'cloud', title: 'Cloud mode', icon: <Cloud /> },
              { key: 'hybrid', title: 'Hybrid mode', icon: <Blend /> },
            ].map((item) => (
              <AppCard
                key={item.key}
                onClick={() => setMode(item.key)}
                selected={mode === item.key}
              >
                <AppCardHeader icon={item.icon} title={item.title} />
              </AppCard>
            ))}
          </div>
        </DemoPreview>
      </DemoSection>

      <DemoSection title="Continuous settings group">
        <DemoPreview>
          <AppCardGroup>
            <AppCard orientation="horizontal" padding="compact">
              <Palette size={18} />
              <span className="demo-card-group-label">Application theme</span>
              <strong>System</strong>
            </AppCard>
            <AppCard orientation="horizontal" padding="compact">
              <Sparkles size={18} />
              <span className="demo-card-group-label">Accent color</span>
              <strong>Blue</strong>
            </AppCard>
            <AppCard orientation="horizontal" padding="compact">
              <CheckCircle2 size={18} />
              <span className="demo-card-group-label">Animations</span>
              <strong>On</strong>
            </AppCard>
          </AppCardGroup>
        </DemoPreview>
      </DemoSection>

      <DemoSection title="Internal actions">
        <DemoPreview>
          <AppCard
            onClick={() => setInternalStatus('The card was activated')}
          >
            <AppCardHeader
              title="Interactive tool card"
              description="Internal controls do not activate the card"
              action={
                <AppButton
                  size="compact"
                  onClick={() => setInternalStatus('Header action completed')}
                >
                  More
                </AppButton>
              }
            />
            <AppButton
              onClick={() => setInternalStatus('Content action completed')}
            >
              Content action
            </AppButton>
            <AppCardFooter
              start={internalStatus}
              end={
                <AppButton
                  appearance="primary"
                  onClick={() => setInternalStatus('Footer action completed')}
                >
                  Complete
                </AppButton>
              }
            />
          </AppCard>
        </DemoPreview>
      </DemoSection>
    </DemoPage>
  )
}
