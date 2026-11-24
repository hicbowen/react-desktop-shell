# Forms and value contracts

Render these recipes below an existing `AppShell` or `AppProvider`. Import
`core/style.css` and `forms/style.css` once, or use the aggregate stylesheet.

## Choose by value semantics

| Control                                       | Controlled value        | Change callback / behavior                                                                 |
| --------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------ |
| `AppTextBox`, `AppTextArea`, `AppPasswordBox` | Native input text       | `onChange(event)`; read `event.currentTarget.value`                                        |
| `AppSelect`                                   | `string \| null`        | `onValueChange(value)`; `null` is explicitly empty, `undefined` is uncontrolled            |
| `AppComboBox`                                 | `string`                | `onValueChange(value)`; typing filters, choosing an option commits; clear yields `''`      |
| `AppAutoComplete`                             | `string`                | `onValueChange(value)`; free text is allowed; `onOptionSelect` reports a chosen suggestion |
| `AppCheckBox`, `AppToggleSwitch`              | `boolean` via `checked` | `onCheckedChange(checked)`                                                                 |
| `AppToggleButton`                             | `boolean` via `pressed` | `onPressedChange(pressed)`                                                                 |
| `AppNumberBox`                                | `number \| null`        | `onValueChange(value)`; temporary editing text is separate from the committed number       |
| `AppMultiSelect`, `AppCheckBoxGroup`          | String array            | `onValueChange(values)`                                                                    |
| `AppDatePicker`                               | `AppDateValue \| null`  | `onValueChange(value)`; `{ year, month, day }`, month is 1-based                           |
| `AppTimePicker`                               | `AppTimeValue \| null`  | `onValueChange(value)`; `{ hour, minute }`                                                 |

Do not reuse one adapter for every control. Use native `onChange` on text
controls and the dedicated callbacks on selection controls. Convert numeric
domain IDs to/from option strings at the application boundary.

`AppSelect` is a native single select. `AppComboBox` only commits supported
option values and restores unsupported filter text on blur. Choose
`AppAutoComplete` when arbitrary typed text should be saved. These distinctions
come from the Select, ComboBox, and AutoComplete pages in `example/src/pages/forms/`.

## Validated form recipe

Adapted from `FormLayoutPage.tsx` and `AppSelectPage.tsx` in that directory.
Submission belongs in `useAppForm({ onSubmit })`; `AppForm` receives the form
instance. Validation returns messages, and form-level validators return an
error map. `AppFormField` supplies values through a render function.

```tsx
import { useState } from 'react'
import { AppButton } from 'react-desktop-shell/core'
import {
  AppForm,
  AppFormErrorSummary,
  AppFormField,
  AppSelect,
  AppTextBox,
  useAppForm,
} from 'react-desktop-shell/forms'
import 'react-desktop-shell/core/style.css'
import 'react-desktop-shell/forms/style.css'

type Profile = { name: string; course: string | null }

export function ProfileEditor({ save }: { save: (values: Profile) => Promise<void> }) {
  const [submitError, setSubmitError] = useState('')
  const form = useAppForm<Profile>({
    defaultValues: { name: '', course: null },
    onSubmit: async ({ values }) => {
      setSubmitError('')
      await save(values)
    },
    onSubmitError: (error) => {
      setSubmitError(error instanceof Error ? error.message : 'Save failed')
    },
  })
  return (
    <AppForm form={form} layout="grid" columns={{ base: 1, md: 2 }}>
      <AppFormErrorSummary form={form} />
      <AppFormField<Profile, string>
        name="name"
        label="Name"
        required
        validators={{
          onBlur: ({ value }) => (value.trim() ? undefined : 'Enter a name'),
        }}
      >
        {({ value, setValue, onBlur }) => (
          <AppTextBox
            value={value}
            onBlur={onBlur}
            onChange={(event) => setValue(event.currentTarget.value)}
          />
        )}
      </AppFormField>
      <AppFormField<Profile, string | null> name="course" label="Course" required>
        {({ value, setValue, onBlur }) => (
          <AppSelect
            value={value}
            onValueChange={setValue}
            onBlur={onBlur}
            clearable
            placeholder="Choose a course"
            options={[
              { value: 'python', label: 'Python' },
              { value: 'visual', label: 'Visual coding' },
            ]}
          />
        )}
      </AppFormField>
      {submitError ? <p role="alert">{submitError}</p> : null}
      <AppButton type="submit" appearance="primary">
        Save
      </AppButton>
      <AppButton type="button" onClick={() => form.reset()}>
        Reset
      </AppButton>
    </AppForm>
  )
}
```

Pass the field's `onBlur` to a control when using blur validation/touched state.
`AppFormField` supplies `AppField` label/error context; for custom controls,
use its `inputId` and field metadata as required by the custom control.
`AppField` alone provides presentation/context, not a form store. Keep an
existing form library when the consumer already uses one.

## Dynamic fields and submission state

- Use `AppFormList`'s `field.key` as the React key, and `field.name` in the
  field path, such as `contacts.${field.name}.value`. Remove/move using the
  list's current indices. Do not use an array index as the React key.
- For UI that reacts to submission or dirty state, use
  `useAppFormSelector(form, state => state.isSubmitting)` (or another selector).
  Merely reading `form.state` does not subscribe the component to updates.
- Use `onSubmitError` for server errors. Map known field errors with
  `form.setErrors({ email: 'Already registered' })`; surface other failures
  separately. Validation contexts provide an `AbortSignal` for async work.
- `defaultValue`/`defaultValues` initialize state. Use controlled values or
  `form.reset(newValues)` when replacing the record being edited.
- `AppButton` defaults to `type="button"`. Set `type="submit"` explicitly
  for form submission and keep reset/add/remove actions as ordinary buttons.

## Date, time, and file boundaries

Date/time controls use structured local calendar values, not JavaScript `Date`
objects or strings. Range controls use `{ start, end } | null`. Use exported
parse/format helpers for serialization and keep time-zone conversion in the
application. `allowClear` is the date/time clearing prop; it is not `clearable`.

The calendar header offers month and year navigation. Browsing changes the
displayed month. Selecting a day updates the date or the pending date range.

`AppNumberBox` commits valid editing text on blur/Enter and restores the last
committed value on Escape. Preserve `null` when using `allowEmpty` rather than
silently turning it into zero.

`AppFilePicker` uses `files` / `onFilesChange` with `File[]` and supports an
adapter. Uploading, saving native paths, and handling backend results remain
application operations; selection does not automatically upload a file.
