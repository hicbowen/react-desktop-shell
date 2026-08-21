import type { CSSProperties, ReactNode } from 'react'
import type { AppFieldProps } from '../field/types'

export type AppFormNameSegment = string | number
export type AppFormName = string | readonly AppFormNameSegment[]

export interface AppFormResponsive<TValue> {
  base?: TValue
  sm?: TValue
  md?: TValue
  lg?: TValue
}

export type AppFormResponsiveValue<TValue> = TValue | AppFormResponsive<TValue>
export type AppFormColumns = AppFormResponsiveValue<number>
export type AppFormFieldSpan = AppFormResponsiveValue<number>
export type AppFormLabelAlign = 'start' | 'end'

export type AppFormDeepPartial<TValue> = TValue extends readonly (infer TItem)[]
  ? Array<AppFormDeepPartial<TItem>>
  : TValue extends object
    ? { [TKey in keyof TValue]?: AppFormDeepPartial<TValue[TKey]> }
    : TValue

export interface AppFormError {
  message: ReactNode
  code?: string
}

export type AppFormErrorValue = ReactNode | AppFormError
export type AppFormErrorMap = Record<string, AppFormErrorValue | undefined>

export interface AppFormState<TValues> {
  values: TValues
  errors: Readonly<Record<string, AppFormErrorValue>>
  touched: Readonly<Record<string, boolean>>
  dirty: Readonly<Record<string, boolean>>
  validating: Readonly<Record<string, boolean>>
  isDirty: boolean
  isValid: boolean
  isSubmitting: boolean
  isValidating: boolean
  submitCount: number
}

export interface AppFormValidationContext<TValues, TValue = TValues> {
  name?: AppFormName
  path?: string
  value: TValue
  values: TValues
  form: AppFormApi<TValues>
  signal: AbortSignal
}

export type AppFormValidationResult = AppFormErrorValue | null | false | undefined
export type AppFormFieldValidator<TValues, TValue = unknown> = (
  context: AppFormValidationContext<TValues, TValue>,
) => AppFormValidationResult | Promise<AppFormValidationResult>
export type AppFormFieldValidatorInput<TValues, TValue = unknown> =
  | AppFormFieldValidator<TValues, TValue>
  | readonly AppFormFieldValidator<TValues, TValue>[]

export interface AppFormFieldValidators<TValues, TValue = unknown> {
  onChange?: AppFormFieldValidatorInput<TValues, TValue>
  onBlur?: AppFormFieldValidatorInput<TValues, TValue>
  onSubmit?: AppFormFieldValidatorInput<TValues, TValue>
}

export type AppFormValidator<TValues> = (
  context: Omit<AppFormValidationContext<TValues, TValues>, 'name' | 'path'>,
) => AppFormErrorMap | void | Promise<AppFormErrorMap | void>

export interface AppFormValidators<TValues> {
  onChange?: AppFormValidator<TValues>
  onBlur?: AppFormValidator<TValues>
  onSubmit?: AppFormValidator<TValues>
}

export interface AppFormSubmitContext<TValues> {
  values: TValues
  dirtyValues: AppFormDeepPartial<TValues>
  form: AppFormApi<TValues>
  signal: AbortSignal
}

export interface AppFormOptions<TValues> {
  defaultValues: TValues
  validators?: AppFormValidators<TValues>
  onSubmit?: (context: AppFormSubmitContext<TValues>) => void | Promise<void>
  onSubmitError?: (error: unknown, context: AppFormSubmitContext<TValues>) => void
}

export interface AppFormSetValueOptions {
  shouldDirty?: boolean
  shouldTouch?: boolean
  shouldValidate?: boolean
}

export interface AppFormFieldMeta {
  name: AppFormName
  path: string
  touched: boolean
  dirty: boolean
  validating: boolean
  error?: AppFormErrorValue
  errors: readonly AppFormErrorValue[]
  isValid: boolean
}

export interface AppFormFieldRenderProps<TValues, TValue> {
  name: AppFormName
  path: string
  inputId: string
  value: TValue
  setValue: (value: TValue, options?: AppFormSetValueOptions) => void
  onBlur: () => void
  meta: AppFormFieldMeta
  form: AppFormApi<TValues>
}

export interface AppFormFieldRegistration<TValues, TValue> {
  validators?: AppFormFieldValidators<TValues, TValue>
  required?: boolean
  requiredMessage?: ReactNode
  preserve?: boolean
}

export interface AppFormApi<TValues> {
  readonly state: AppFormState<TValues>
  getSnapshot: () => AppFormState<TValues>
  subscribe: (listener: () => void) => () => void
  getValues: () => TValues
  getValue: <TValue = unknown>(name: AppFormName) => TValue | undefined
  setValue: <TValue = unknown>(name: AppFormName, value: TValue, options?: AppFormSetValueOptions) => void
  setValues: (values: TValues, options?: AppFormSetValueOptions) => void
  reset: (values?: TValues) => void
  resetField: (name: AppFormName) => void
  setErrors: (errors: AppFormErrorMap) => void
  clearErrors: (...names: AppFormName[]) => void
  validate: (...names: AppFormName[]) => Promise<boolean>
  validateField: (name: AppFormName) => Promise<boolean>
  submit: () => Promise<boolean>
  focusFirstError: () => void
  registerField: <TValue = unknown>(name: AppFormName, registration?: AppFormFieldRegistration<TValues, TValue>) => () => void
  getFieldMeta: (name: AppFormName) => AppFormFieldMeta
  markFieldBlurred: (name: AppFormName) => void
  getDirtyValues: () => AppFormDeepPartial<TValues>
  getListFields: (name: AppFormName) => readonly AppFormListField[]
  appendListItem: <TItem>(name: AppFormName, value: TItem) => void
  insertListItem: <TItem>(name: AppFormName, index: number, value: TItem) => void
  removeListItem: (name: AppFormName, index: number) => void
  moveListItem: (name: AppFormName, from: number, to: number) => void
}

export interface AppFormFieldProps<TValues, TValue = unknown> extends Omit<AppFieldProps, 'children' | 'disabled' | 'error' | 'id' | 'labelAlign' | 'labelWidth' | 'orientation' | 'required'> {
  name: AppFormName
  label: ReactNode
  children: (field: AppFormFieldRenderProps<TValues, TValue>) => ReactNode
  required?: boolean
  requiredMessage?: ReactNode
  disabled?: boolean
  orientation?: 'vertical' | 'horizontal'
  labelWidth?: number | string
  labelAlign?: AppFormLabelAlign
  controlWidth?: CSSProperties['width']
  colSpan?: AppFormFieldSpan
  validators?: AppFormFieldValidators<TValues, TValue>
  preserve?: boolean
}

export type AppFormLayoutMode = 'vertical' | 'horizontal' | 'responsive' | 'grid'

export interface AppFormProps<TValues> {
  form: AppFormApi<TValues>
  children?: ReactNode
  layout?: AppFormLayoutMode
  columns?: AppFormColumns
  gap?: CSSProperties['gap']
  labelWidth?: CSSProperties['width']
  labelAlign?: AppFormLabelAlign
  controlWidth?: CSSProperties['width']
  compact?: boolean
  className?: string
  style?: CSSProperties
  noValidate?: boolean
}

export interface AppFormSectionProps {
  title?: ReactNode
  description?: ReactNode
  children?: ReactNode
  className?: string
  style?: CSSProperties
}

export interface AppFormListField {
  key: string
  index: number
  name: number
}

export interface AppFormListRenderProps<TItem = unknown> {
  fields: readonly AppFormListField[]
  append: (value: TItem) => void
  insert: (index: number, value: TItem) => void
  remove: (index: number) => void
  move: (from: number, to: number) => void
}

export interface AppFormListProps<TItem = unknown> {
  name: AppFormName
  children: (list: AppFormListRenderProps<TItem>) => ReactNode
}

export interface AppFormErrorSummaryProps<TValues = unknown> {
  form: AppFormApi<TValues>
  title?: ReactNode
  className?: string
  style?: CSSProperties
}
