import { useState } from 'react'
import {
  AppCheckBox,
  AppField,
  AppFormLayout,
  AppTextBox,
  AppValidationSummary,
} from '../../../../src'
import {
  DemoControls,
  DemoPage,
  DemoPreview,
  DemoSection,
} from '../../components/DemoPage'
import { getEmailValidationError } from './emailValidation'
import { useDemoCopy } from '../../i18n/interactiveTranslations'

export function AppFormLayoutPage() {
  const t = useDemoCopy()
  const [email, setEmail] = useState('')
  const [compact, setCompact] = useState(false)
  const emailError = getEmailValidationError(email)
  const errors = emailError
    ? [{ key: 'email', fieldId: 'profile-email', message: emailError }]
    : []

  return (
    <DemoPage>
      <DemoControls>
        <AppCheckBox checked={compact} label={t('Compact density')} onCheckedChange={setCompact} />
      </DemoControls>
      <DemoSection
        title="Form layout"
        description="Align field labels and summarize validation without owning form state."
      >
        <DemoPreview>
          <div style={{ display: 'grid', gap: 12, maxWidth: 560 }}>
            <AppValidationSummary errors={errors} />
            <AppFormLayout compact={compact} orientation="responsive">
              <AppField label="Name">
                <AppTextBox />
              </AppField>
              <AppField
                error={emailError ?? undefined}
                id="profile-email"
                label="Email"
                required
              >
                <AppTextBox
                  onChange={(event) => setEmail(event.currentTarget.value)}
                  type="email"
                  value={email}
                />
              </AppField>
            </AppFormLayout>
          </div>
        </DemoPreview>
      </DemoSection>
    </DemoPage>
  )
}
