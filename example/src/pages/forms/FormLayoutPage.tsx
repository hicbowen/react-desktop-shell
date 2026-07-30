import { useState } from 'react'
import {
  AppField,
  AppFormLayout,
  AppTextBox,
  AppValidationSummary,
} from '../../../../src'
import {
  DemoPage,
  DemoPreview,
  DemoSection,
} from '../../components/DemoPage'
import { getEmailValidationError } from './emailValidation'

export function AppFormLayoutPage() {
  const [email, setEmail] = useState('')
  const emailError = getEmailValidationError(email)
  const errors = emailError
    ? [{ key: 'email', fieldId: 'profile-email', message: emailError }]
    : []

  return (
    <DemoPage>
      <DemoSection
        title="Form layout"
        description="Align field labels and summarize validation without owning form state."
      >
        <DemoPreview>
          <div style={{ display: 'grid', gap: 12, maxWidth: 560 }}>
            <AppValidationSummary errors={errors} />
            <AppFormLayout orientation="responsive">
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
