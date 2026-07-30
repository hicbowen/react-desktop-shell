import { useState } from 'react'
import { FileText, UserRound } from 'lucide-react'
import {
  AppButton,
  AppHoverCard,
  AppSelect,
  AppTextBox,
} from '../../../../src'
import {
  DemoPage,
  DemoPreview,
  DemoSection,
} from '../../components/DemoPage'

const statusOptions = [
  { label: 'In progress', value: 'progress' },
  { label: 'Ready for review', value: 'review' },
  { label: 'Completed', value: 'completed' },
]

export function AppHoverCardPage() {
  const [saved, setSaved] = useState(false)

  return (
    <DemoPage>
      <DemoSection
        title="Rich hover preview"
        description="Hover after the short delay or focus with the keyboard. Move into the card to inspect its content."
      >
        <DemoPreview className="demo-hover-card-row">
          <AppHoverCard
            ariaLabel="Document details"
            content={
              <div className="demo-hover-card-content">
                <div className="demo-hover-card-heading">
                  <span className="demo-hover-card-icon">
                    <FileText aria-hidden="true" size={18} />
                  </span>
                  <div>
                    <strong>Quarterly report.docx</strong>
                    <span>Modified 12 minutes ago</span>
                  </div>
                </div>
                <dl className="demo-hover-card-metadata">
                  <div>
                    <dt>Owner</dt>
                    <dd>Ada Lovelace</dd>
                  </div>
                  <div>
                    <dt>Status</dt>
                    <dd>Ready for review</dd>
                  </div>
                </dl>
              </div>
            }
          >
            <AppButton icon={<FileText />}>
              Quarterly report.docx
            </AppButton>
          </AppHoverCard>

          <AppHoverCard
            ariaLabel="Contributor details"
            content={
              <div className="demo-hover-card-content">
                <div className="demo-hover-card-heading">
                  <span className="demo-hover-card-avatar">AL</span>
                  <div>
                    <strong>Ada Lovelace</strong>
                    <span>Workspace owner</span>
                  </div>
                </div>
                <p className="demo-hover-card-description">
                  Reviewing the release notes and component documentation.
                </p>
                <AppButton size="small">Open profile</AppButton>
              </div>
            }
            placement="right"
          >
            <AppButton icon={<UserRound />}>Contributor</AppButton>
          </AppHoverCard>
        </DemoPreview>
      </DemoSection>

      <DemoSection
        title="Interactive hover card"
        description="Click the trigger to pin the card, then use its fields and actions without losing the surface."
      >
        <DemoPreview className="demo-hover-card-row">
          <AppHoverCard
            ariaLabel="Quick project edit"
            content={
              <div className="demo-hover-card-content">
                <div>
                  <strong>Quick edit</strong>
                  <p className="demo-hover-card-description">
                    Update lightweight project details without leaving the
                    current view.
                  </p>
                </div>
                <AppTextBox placeholder="Add a note" />
                <AppSelect
                  defaultValue="progress"
                  options={statusOptions}
                />
                <div className="demo-hover-card-actions">
                  <span aria-live="polite">
                    {saved ? 'Changes saved' : 'Click to keep this card open'}
                  </span>
                  <AppButton
                    appearance="primary"
                    size="small"
                    onClick={() => setSaved(true)}
                  >
                    Save
                  </AppButton>
                </div>
              </div>
            }
          >
            <AppButton>Hover or click for quick edit</AppButton>
          </AppHoverCard>
        </DemoPreview>
        <p className="demo-note">
          Hover opens after 500 ms. Leaving waits 200 ms so the pointer can
          cross into the card. Focus opens immediately, while Escape and an
          outside click dismiss it.
        </p>
      </DemoSection>
    </DemoPage>
  )
}
