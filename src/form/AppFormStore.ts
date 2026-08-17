import {
  areAppFormValuesEqual,
  buildAppFormDirtyValues,
  cloneAppFormValue,
  deleteAppFormValue,
  getAppFormFieldId,
  getAppFormPath,
  getAppFormValue,
  isAppFormValueEmpty,
  setAppFormValue,
} from './path'
import type {
  AppFormApi,
  AppFormDeepPartial,
  AppFormErrorMap,
  AppFormErrorValue,
  AppFormFieldRegistration,
  AppFormFieldValidatorInput,
  AppFormFieldMeta,
  AppFormName,
  AppFormOptions,
  AppFormSetValueOptions,
  AppFormState,
  AppFormValidationContext,
} from './types'

type AppFormListener = () => void
type AppFormValidationTrigger = 'onChange' | 'onBlur' | 'onSubmit'

interface RegisteredField<TValues> {
  name: AppFormName
  path: string
  registration: AppFormFieldRegistration<TValues, unknown>
}

function isError(error: AppFormErrorValue | null | false | undefined): error is AppFormErrorValue {
  return error !== undefined && error !== null && error !== false
}

function getValidatorList<TValues, TValue>(validator: AppFormFieldValidatorInput<TValues, TValue> | undefined) {
  if (!validator) return []
  return Array.isArray(validator) ? validator : [validator]
}

export class AppFormStore<TValues> implements AppFormApi<TValues> {
  private options: AppFormOptions<TValues>
  private values: TValues
  private initialValues: TValues
  private errors: Record<string, AppFormErrorValue> = {}
  private formErrorPaths = new Set<string>()
  private touched: Record<string, boolean> = {}
  private dirty: Record<string, boolean> = {}
  private validating: Record<string, boolean> = {}
  private listeners = new Set<AppFormListener>()
  private fields = new Map<string, RegisteredField<TValues>>()
  private validationTokens = new Map<string, number>()
  private validationControllers = new Map<string, AbortController>()
  private listKeys = new Map<string, string[]>()
  private keyCounter = 0
  private isSubmitting = false
  private submitCount = 0
  private submitController: AbortController | null = null
  private formValidationToken = 0
  private formValidationController: AbortController | null = null
  private formValidating = false
  private snapshot: AppFormState<TValues>

  constructor(options: AppFormOptions<TValues>) {
    this.options = options
    this.values = cloneAppFormValue(options.defaultValues)
    this.initialValues = cloneAppFormValue(options.defaultValues)
    this.snapshot = this.createSnapshot()
  }

  get state() {
    return this.snapshot
  }

  updateOptions(options: AppFormOptions<TValues>) {
    this.options = options
  }

  getSnapshot = () => this.snapshot

  subscribe = (listener: AppFormListener) => {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  getValues = () => this.values

  getValue = <TValue = unknown>(name: AppFormName) => getAppFormValue<TValue>(this.values, name)

  setValue = <TValue = unknown>(name: AppFormName, value: TValue, options: AppFormSetValueOptions = {}) => {
    const path = getAppFormPath(name)
    this.abortFormValidation()
    this.clearTrackedFormErrors()
    this.values = setAppFormValue(this.values, name, value) as TValues

    if (options.shouldDirty !== false) {
      if (areAppFormValuesEqual(getAppFormValue(this.values, name), getAppFormValue(this.initialValues, name))) delete this.dirty[path]
      else this.dirty[path] = true
    }
    if (options.shouldTouch) this.touched[path] = true
    delete this.errors[path]
    this.formErrorPaths.delete(path)
    this.emit()
    if (options.shouldValidate) {
      void this.validateField(name, 'onChange')
      void this.validateForm('onChange')
    }
  }

  setValues = (values: TValues, options: AppFormSetValueOptions = {}) => {
    this.abortFormValidation()
    this.clearTrackedFormErrors()
    this.values = cloneAppFormValue(values)
    if (options.shouldDirty !== false) {
      const paths = new Set([...Object.keys(this.dirty), ...this.fields.keys()])
      for (const path of paths) {
        if (areAppFormValuesEqual(getAppFormValue(this.values, path), getAppFormValue(this.initialValues, path))) delete this.dirty[path]
        else this.dirty[path] = true
      }
    }
    this.emit()
  }

  reset = (values?: TValues) => {
    this.abortValidation()
    if (values !== undefined) {
      this.initialValues = cloneAppFormValue(values)
    }
    this.values = cloneAppFormValue(values ?? this.initialValues)
    this.errors = {}
    this.formErrorPaths.clear()
    this.touched = {}
    this.dirty = {}
    this.validating = {}
    this.listKeys.clear()
    this.emit()
  }

  resetField = (name: AppFormName) => {
    const path = getAppFormPath(name)
    this.abortFormValidation()
    this.clearTrackedFormErrors()
    this.values = setAppFormValue(this.values, name, cloneAppFormValue(getAppFormValue(this.initialValues, name))) as TValues
    delete this.errors[path]
    this.formErrorPaths.delete(path)
    delete this.touched[path]
    delete this.dirty[path]
    this.emit()
  }

  setErrors = (errors: AppFormErrorMap) => {
    for (const [path, error] of Object.entries(errors)) {
      if (isError(error)) this.errors[path] = error
      else delete this.errors[path]
      this.formErrorPaths.delete(path)
    }
    this.emit()
  }

  clearErrors = (names?: AppFormName | readonly AppFormName[]) => {
    if (!names) {
      this.errors = {}
      this.formErrorPaths.clear()
    }
    else {
      const list = Array.isArray(names) && names.every((item) => typeof item === 'string' || Array.isArray(item))
        ? names as readonly AppFormName[]
        : [names as AppFormName]
      for (const name of list) {
        const path = getAppFormPath(name)
        delete this.errors[path]
        this.formErrorPaths.delete(path)
      }
    }
    this.emit()
  }

  registerField = <TValue = unknown>(name: AppFormName, registration: AppFormFieldRegistration<TValues, TValue> = {}) => {
    const path = getAppFormPath(name)
    this.fields.set(path, { name, path, registration: registration as AppFormFieldRegistration<TValues, unknown> })
    return () => {
      const current = this.fields.get(path)
      if (!current || current.registration !== registration) return
      this.fields.delete(path)
      if (registration.preserve === false) {
        this.values = deleteAppFormValue(this.values, name) as TValues
        delete this.errors[path]
        this.formErrorPaths.delete(path)
        delete this.touched[path]
        delete this.dirty[path]
        this.emit()
      }
    }
  }

  getFieldMeta = (name: AppFormName): AppFormFieldMeta => {
    const path = getAppFormPath(name)
    const error = this.errors[path]
    return {
      name,
      path,
      touched: Boolean(this.touched[path]),
      dirty: Boolean(this.dirty[path]),
      validating: Boolean(this.validating[path]),
      error,
      errors: error ? [error] : [],
      isValid: !error,
    }
  }

  markFieldBlurred = (name: AppFormName) => {
    this.abortFormValidation()
    this.clearTrackedFormErrors()
    const path = getAppFormPath(name)
    this.touched[path] = true
    this.emit()
    void this.validateField(name, 'onBlur')
    void this.validateForm('onBlur')
  }

  validateField = async (name: AppFormName, trigger: AppFormValidationTrigger = 'onSubmit') => {
    const path = getAppFormPath(name)
    const field = this.fields.get(path)
    if (!field) return !this.errors[path]

    const token = (this.validationTokens.get(path) ?? 0) + 1
    this.validationTokens.set(path, token)
    this.validationControllers.get(path)?.abort()
    const controller = new AbortController()
    this.validationControllers.set(path, controller)
    this.validating[path] = true
    this.emit()

    try {
      let error: AppFormErrorValue | undefined
      const value = getAppFormValue(this.values, name)
      if ((trigger === 'onBlur' || trigger === 'onSubmit') && field.registration.required && isAppFormValueEmpty(value)) {
        error = field.registration.requiredMessage ?? 'Required'
      }

      if (!error) {
        const validators = field.registration.validators?.[trigger]
        for (const validator of getValidatorList(validators)) {
          const context: AppFormValidationContext<TValues, unknown> = {
            name,
            path,
            value,
            values: this.values,
            form: this,
            signal: controller.signal,
          }
          const result = await validator(context)
          if (controller.signal.aborted) return !this.errors[path]
          if (isError(result)) {
            error = result
            break
          }
        }
      }

      if (this.validationTokens.get(path) !== token) return !this.errors[path]
      if (error) this.errors[path] = error
      else delete this.errors[path]
      this.formErrorPaths.delete(path)
      return !error
    } finally {
      if (this.validationTokens.get(path) === token) {
        delete this.validating[path]
        this.validationControllers.delete(path)
        this.emit()
      }
    }
  }

  validate = async (names?: AppFormName | readonly AppFormName[]) => {
    const fieldNames = names
      ? (Array.isArray(names) && names.every((item) => typeof item === 'string' || Array.isArray(item)) ? names as readonly AppFormName[] : [names as AppFormName])
      : [...this.fields.values()].map((field) => field.name)

    const results = await Promise.all(fieldNames.map((name) => this.validateField(name, 'onSubmit')))
    const formValid = await this.validateForm('onSubmit')
    return results.every(Boolean) && formValid
  }

  submit = async () => {
    if (this.isSubmitting) return false
    this.submitCount += 1
    this.isSubmitting = true
    this.submitController?.abort()
    this.submitController = new AbortController()
    this.emit()

    const context = {
      values: cloneAppFormValue(this.values),
      dirtyValues: this.getDirtyValues(),
      form: this,
      signal: this.submitController.signal,
    }

    try {
      const valid = await this.validate()
      if (!valid) return false
      await this.options.onSubmit?.(context)
      return true
    } catch (error) {
      this.options.onSubmitError?.(error, context)
      return false
    } finally {
      this.isSubmitting = false
      this.submitController = null
      this.emit()
    }
  }

  focusFirstError = () => {
    if (typeof document === 'undefined') return
    const firstPath = Object.keys(this.errors)[0]
    if (!firstPath) return
    const target = document.getElementById(getAppFormFieldId(firstPath))
    target?.focus({ preventScroll: true })
    target?.scrollIntoView?.({ block: 'center', behavior: 'smooth' })
  }

  getDirtyValues = (): AppFormDeepPartial<TValues> => buildAppFormDirtyValues(this.values, Object.keys(this.dirty)) as AppFormDeepPartial<TValues>

  getListFields = (name: AppFormName) => {
    const path = getAppFormPath(name)
    const value = getAppFormValue<unknown[]>(this.values, name) ?? []
    const keys = this.listKeys.get(path) ?? []
    while (keys.length < value.length) {
      this.keyCounter += 1
      keys.push(`${path || 'list'}-${this.keyCounter}`)
    }
    keys.length = value.length
    this.listKeys.set(path, keys)
    return keys.map((key, index) => ({ key, index, name: index }))
  }

  appendListItem = <TItem>(name: AppFormName, value: TItem) => {
    const current = getAppFormValue<TItem[]>(this.values, name) ?? []
    const keys = this.listKeys.get(getAppFormPath(name)) ?? []
    this.listKeys.set(getAppFormPath(name), keys)
    this.setValue(name, [...current, value], { shouldDirty: true, shouldValidate: false })
  }

  insertListItem = <TItem>(name: AppFormName, index: number, value: TItem) => {
    const current = [...(getAppFormValue<TItem[]>(this.values, name) ?? [])]
    current.splice(index, 0, value)
    const path = getAppFormPath(name)
    const keys = this.listKeys.get(path) ?? []
    this.keyCounter += 1
    keys.splice(index, 0, `${path || 'list'}-${this.keyCounter}`)
    this.listKeys.set(path, keys)
    this.setValue(name, current, { shouldDirty: true, shouldValidate: false })
  }

  removeListItem = (name: AppFormName, index: number) => {
    const current = [...(getAppFormValue<unknown[]>(this.values, name) ?? [])]
    current.splice(index, 1)
    const path = getAppFormPath(name)
    this.listKeys.get(path)?.splice(index, 1)
    this.setValue(name, current, { shouldDirty: true, shouldValidate: false })
  }

  moveListItem = (name: AppFormName, from: number, to: number) => {
    const current = [...(getAppFormValue<unknown[]>(this.values, name) ?? [])]
    const [item] = current.splice(from, 1)
    if (item === undefined) return
    current.splice(to, 0, item)
    const path = getAppFormPath(name)
    const keys = this.listKeys.get(path)
    if (keys) {
      const [key] = keys.splice(from, 1)
      if (key) keys.splice(to, 0, key)
    }
    this.setValue(name, current, { shouldDirty: true, shouldValidate: false })
  }

  private createSnapshot(): AppFormState<TValues> {
    return {
      values: this.values,
      errors: { ...this.errors },
      touched: { ...this.touched },
      dirty: { ...this.dirty },
      validating: { ...this.validating },
      isDirty: Object.keys(this.dirty).length > 0,
      isValid: Object.keys(this.errors).length === 0,
      isSubmitting: this.isSubmitting,
      isValidating: this.formValidating || Object.keys(this.validating).length > 0,
      submitCount: this.submitCount,
    }
  }

  private emit() {
    this.snapshot = this.createSnapshot()
    for (const listener of this.listeners) listener()
  }

  private abortValidation() {
    for (const controller of this.validationControllers.values()) controller.abort()
    this.validationControllers.clear()
    this.validating = {}
    this.abortFormValidation()
  }

  private clearTrackedFormErrors() {
    for (const path of this.formErrorPaths) delete this.errors[path]
    this.formErrorPaths.clear()
  }

  private abortFormValidation() {
    this.formValidationToken += 1
    this.formValidationController?.abort()
    this.formValidationController = null
    this.formValidating = false
  }

  private validateForm = async (trigger: AppFormValidationTrigger) => {
    const validator = this.options.validators?.[trigger]
    if (!validator) {
      if (this.formErrorPaths.size) {
        this.clearTrackedFormErrors()
        this.emit()
      }
      return true
    }

    const token = this.formValidationToken + 1
    this.formValidationToken = token
    this.formValidationController?.abort()
    const controller = new AbortController()
    this.formValidationController = controller
    this.clearTrackedFormErrors()
    this.formValidating = true
    this.emit()

    try {
      const errors = await validator({ value: this.values, values: this.values, form: this, signal: controller.signal })
      if (controller.signal.aborted || this.formValidationToken !== token) return true
      let hasErrors = false
      if (errors) {
        for (const [path, error] of Object.entries(errors)) {
          if (isError(error)) {
            this.errors[path] = error
            this.formErrorPaths.add(path)
            hasErrors = true
          }
        }
      }
      this.emit()
      return !hasErrors
    } finally {
      if (this.formValidationToken === token) {
        this.formValidating = false
        this.formValidationController = null
        this.emit()
      }
    }
  }
}
