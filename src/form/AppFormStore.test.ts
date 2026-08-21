import { describe, expect, it, vi } from 'vitest'
import { AppFormStore } from './AppFormStore'

describe('AppFormStore', () => {
  it('tracks nested values, dirty values, and reset state', () => {
    const form = new AppFormStore({
      defaultValues: { profile: { name: 'Ada' }, tags: ['desktop'] },
    })
    form.registerField('profile.name')
    form.setValue('profile.name', 'Grace', { shouldValidate: false })

    expect(form.getValue('profile.name')).toBe('Grace')
    expect(form.state.isDirty).toBe(true)
    expect(form.getDirtyValues()).toEqual({ profile: { name: 'Grace' } })

    form.resetField('profile.name')
    expect(form.getValue('profile.name')).toBe('Ada')
    expect(form.state.isDirty).toBe(false)

    form.setValue('profile.name', 'Lin', { shouldValidate: false })
    form.reset()
    expect(form.getValues()).toEqual({ profile: { name: 'Ada' }, tags: ['desktop'] })
  })

  it('validates fields and clears form-level errors after correction', async () => {
    const form = new AppFormStore({
      defaultValues: { email: '' },
      validators: {
        onSubmit: ({ values }) => values.email ? undefined : { email: 'Email is required' },
      },
    })
    form.registerField('email', { required: true, requiredMessage: 'Email is required' })

    expect(await form.validate()).toBe(false)
    expect(form.getFieldMeta('email').error).toBe('Email is required')

    form.setValue('email', 'person@example.com', { shouldValidate: false })
    expect(await form.validate()).toBe(true)
    expect(form.state.errors).toEqual({})
  })

  it('submits a snapshot with only dirty values', async () => {
    const onSubmit = vi.fn()
    const form = new AppFormStore({
      defaultValues: { name: 'Ada', settings: { theme: 'light' } },
      onSubmit,
    })
    form.registerField('name')
    form.setValue('name', 'Grace', { shouldValidate: false })

    expect(await form.submit()).toBe(true)
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
      values: { name: 'Grace', settings: { theme: 'light' } },
      dirtyValues: { name: 'Grace' },
      form,
    }))
    expect(form.state.submitCount).toBe(1)
    expect(form.state.isSubmitting).toBe(false)
  })

  it('preserves stable list keys while editing list values', () => {
    const form = new AppFormStore({ defaultValues: { items: [{ label: 'A' }, { label: 'B' }] } })
    const initial = form.getListFields('items')
    form.insertListItem('items', 1, { label: 'C' })
    const inserted = form.getListFields('items')

    expect(inserted.map((field) => field.key)).toEqual([initial[0]?.key, expect.any(String), initial[1]?.key])
    form.moveListItem('items', 2, 0)
    expect(form.getValues()).toEqual({ items: [{ label: 'B' }, { label: 'A' }, { label: 'C' }] })
    form.removeListItem('items', 1)
    expect(form.getValues()).toEqual({ items: [{ label: 'B' }, { label: 'C' }] })
  })

  it('cancels stale asynchronous field validation when the value changes', async () => {
    let resolveValidation!: (error?: string) => void
    let validationSignal!: AbortSignal
    const form = new AppFormStore({ defaultValues: { email: 'old@example.com' } })
    form.registerField('email', {
      validators: {
        onSubmit: ({ signal }) => {
          validationSignal = signal
          return new Promise<string | undefined>((resolve) => {
            resolveValidation = resolve
          })
        },
      },
    })

    const validation = form.validateField('email')
    expect(form.state.isValidating).toBe(true)

    form.setValue('email', 'new@example.com', { shouldValidate: false })
    expect(validationSignal.aborted).toBe(true)
    expect(form.state.isValidating).toBe(false)

    resolveValidation('Stale error')
    await validation
    expect(form.state.errors).toEqual({})
  })

  it('tracks Date values by timestamp and clones submitted snapshots', async () => {
    const initialDate = new Date('2026-08-18T00:00:00.000Z')
    const onSubmit = vi.fn()
    const form = new AppFormStore({ defaultValues: { scheduledAt: initialDate }, onSubmit })
    form.registerField('scheduledAt')

    form.setValue('scheduledAt', new Date(initialDate), { shouldValidate: false })
    expect(form.state.isDirty).toBe(false)

    const updatedDate = new Date('2026-08-19T00:00:00.000Z')
    form.setValue('scheduledAt', updatedDate, { shouldValidate: false })
    expect(form.state.isDirty).toBe(true)
    await form.submit()

    const submittedValues = onSubmit.mock.calls[0]?.[0].values as { scheduledAt: Date }
    expect(submittedValues.scheduledAt).toEqual(updatedDate)
    expect(submittedValues.scheduledAt).not.toBe(updatedDate)
  })

  it('treats array names as one path and accepts multiple names variadically', async () => {
    const validateName = vi.fn()
    const validateEmail = vi.fn()
    const form = new AppFormStore({ defaultValues: { profile: { name: 'Ada' }, email: 'ada@example.com' } })
    form.registerField(['profile', 'name'], { validators: { onSubmit: validateName } })
    form.registerField('email', { validators: { onSubmit: validateEmail } })
    form.setErrors({ 'profile.name': 'Name error', email: 'Email error' })

    form.clearErrors(['profile', 'name'])
    expect(form.state.errors).toEqual({ email: 'Email error' })

    await form.validate(['profile', 'name'], 'email')
    expect(validateName).toHaveBeenCalledWith(expect.objectContaining({ name: ['profile', 'name'], path: 'profile.name', value: 'Ada' }))
    expect(validateEmail).toHaveBeenCalledWith(expect.objectContaining({ name: 'email', path: 'email', value: 'ada@example.com' }))
  })

  it('moves list metadata, registrations, and nested list keys with each item', async () => {
    const validateFirst = vi.fn()
    const validateSecond = vi.fn()
    const form = new AppFormStore({
      defaultValues: {
        items: [
          { label: 'A', children: ['A1'] },
          { label: 'B', children: ['B1'] },
        ],
      },
    })
    form.registerField('items.0.label', { validators: { onSubmit: validateFirst } })
    form.registerField('items.1.label', { validators: { onSubmit: validateSecond } })
    const itemKeys = form.getListFields('items').map((field) => field.key)
    const firstChildKeys = form.getListFields('items.0.children').map((field) => field.key)
    const secondChildKeys = form.getListFields('items.1.children').map((field) => field.key)
    form.setValue('items.0.label', 'A edited', { shouldTouch: true, shouldValidate: false })
    form.setErrors({ 'items.0.label': 'A error', 'items.1.label': 'B error' })

    form.moveListItem('items', 0, 1)

    expect(form.getValues()).toEqual({
      items: [
        { label: 'B', children: ['B1'] },
        { label: 'A edited', children: ['A1'] },
      ],
    })
    expect(form.getListFields('items').map((field) => field.key)).toEqual([itemKeys[1], itemKeys[0]])
    expect(form.getListFields('items.0.children').map((field) => field.key)).toEqual(secondChildKeys)
    expect(form.getListFields('items.1.children').map((field) => field.key)).toEqual(firstChildKeys)
    expect(form.state.errors).toEqual({ 'items.1.label': 'A error', 'items.0.label': 'B error' })
    expect(form.state.touched).toMatchObject({ 'items.1.label': true })
    expect(form.state.dirty).toMatchObject({ 'items.1.label': true, items: true })

    await form.validate('items.1.label', 'items.0.label')
    expect(validateFirst).toHaveBeenCalledWith(expect.objectContaining({ path: 'items.1.label', value: 'A edited' }))
    expect(validateSecond).toHaveBeenCalledWith(expect.objectContaining({ path: 'items.0.label', value: 'B' }))

    form.setErrors({ 'items.1.label': 'A error', 'items.0.label': 'B error' })
    form.removeListItem('items', 0)
    expect(form.state.errors).toEqual({ 'items.0.label': 'A error' })
    expect(form.state.touched).toMatchObject({ 'items.0.label': true })
    expect(form.getListFields('items.0.children').map((field) => field.key)).toEqual(firstChildKeys)

    form.insertListItem('items', 0, { label: 'New', children: ['N1'] })
    expect(form.state.errors).toEqual({ 'items.1.label': 'A error' })
    expect(form.state.touched).toMatchObject({ 'items.1.label': true })
    expect(form.getListFields('items.1.children').map((field) => field.key)).toEqual(firstChildKeys)
  })

  it('aborts pending validation before moving a list item', async () => {
    let resolveValidation!: (error?: string) => void
    let validationSignal!: AbortSignal
    const form = new AppFormStore({ defaultValues: { items: [{ label: 'A' }, { label: 'B' }] } })
    form.registerField('items.0.label', {
      validators: {
        onSubmit: ({ signal }) => {
          validationSignal = signal
          return new Promise<string | undefined>((resolve) => {
            resolveValidation = resolve
          })
        },
      },
    })

    const validation = form.validateField('items.0.label')
    expect(form.state.isValidating).toBe(true)
    form.moveListItem('items', 0, 1)
    expect(validationSignal.aborted).toBe(true)
    expect(form.state.isValidating).toBe(false)

    resolveValidation('Stale error')
    await validation
    expect(form.state.errors).toEqual({})
  })
})
