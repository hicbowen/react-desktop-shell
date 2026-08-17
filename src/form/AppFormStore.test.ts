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
})
