import { useState } from 'react'
import {
  AppCheckBox,
  AppButton,
  AppForm,
  AppFormErrorSummary,
  AppFormField,
  AppFormList,
  AppFormSection,
  AppTextArea,
  AppTextBox,
  useAppForm,
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
  const [compact, setCompact] = useState(false)
  const [submitted, setSubmitted] = useState('')
  type ProfileForm = {
    name: string
    email: string
    notes: string
    contacts: Array<{ label: string; value: string }>
  }
  const form = useAppForm<ProfileForm>({
    defaultValues: { name: '', email: '', notes: '', contacts: [{ label: 'Work', value: '' }] },
    validators: {
      onSubmit: ({ values }) => {
        const emailError = getEmailValidationError(values.email)
        return emailError ? { email: emailError } : undefined
      },
    },
    onSubmit: async ({ values }) => {
      setSubmitted(`${values.name || 'Anonymous'} · ${values.email} · ${values.contacts.length} contacts`)
    },
  })

  return (
    <DemoPage>
      <DemoControls>
        <AppCheckBox checked={compact} label={t('Compact density')} onCheckedChange={setCompact} />
      </DemoControls>
      <DemoSection
        title="Form layout"
        description="A form owns nested values, validation, submission, and error focus while fields keep their control-specific change APIs."
      >
        <DemoPreview>
          <AppForm className="demo-form-stack" columns={{ base: 1, md: 2 }} compact={compact} controlWidth="100%" form={form} gap={16} labelAlign="end" labelWidth={110} layout="grid" style={{ maxWidth: 720 }}>
            <AppFormErrorSummary form={form} />
            <AppFormField label="Name" name="name">
              {({ value, setValue }) => <AppTextBox value={String(value ?? '')} onChange={(event) => setValue(event.currentTarget.value)} />}
            </AppFormField>
            <AppFormField
              label="Email"
              name="email"
              required
              requiredMessage="Email is required"
              validators={{
                onChange: ({ value }) => getEmailValidationError(String(value ?? '')) ?? undefined,
                onSubmit: ({ value }) => getEmailValidationError(String(value ?? '')) ?? undefined,
              }}
            >
              {({ value, setValue, onBlur }) => <AppTextBox onBlur={onBlur} type="email" value={String(value ?? '')} onChange={(event) => setValue(event.currentTarget.value)} />}
            </AppFormField>
            <AppFormField<ProfileForm, string> colSpan={{ base: 1, md: 2 }} label="Notes" name="notes">
              {({ value, setValue }) => <AppTextArea fullWidth minRows={3} value={value} onChange={(event) => setValue(event.currentTarget.value)} />}
            </AppFormField>
            <AppFormList<{ label: string; value: string }> name="contacts">
              {({ append, fields, remove }) => <AppFormSection title={t('Additional contacts')}>{fields.map((field) => <div key={field.key} style={{ display: 'grid', gap: 8, gridTemplateColumns: 'minmax(0, 1fr) auto', alignItems: 'end', marginTop: 10 }}><AppFormField<ProfileForm, string> label={`${t('Contact')} ${field.index + 1}`} name={`contacts.${field.name}.value`}>{({ value, setValue }) => <AppTextBox value={value} onChange={(event) => setValue(event.currentTarget.value)} placeholder={t('Contact value')} />}</AppFormField><AppButton type="button" onClick={() => remove(field.index)}>{t('Remove')}</AppButton></div>)}<AppButton type="button" onClick={() => append({ label: 'Other', value: '' })} style={{ marginTop: 10, justifySelf: 'start' }}>{t('Add contact')}</AppButton></AppFormSection>}
            </AppFormList>
            <div className="app-form__actions">
              <AppButton appearance="primary" type="submit">Submit</AppButton>
              <AppButton type="button" onClick={() => form.reset()}>Reset</AppButton>
            </div>
            {submitted ? <span className="demo-note">Submitted: {submitted}</span> : null}
          </AppForm>
        </DemoPreview>
      </DemoSection>
    </DemoPage>
  )
}
