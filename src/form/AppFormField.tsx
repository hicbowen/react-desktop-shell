import { useEffect, useMemo, type CSSProperties } from 'react'
import { AppField } from '../field/AppField'
import { useAppLocale } from '../localization/useAppLocale'
import { getAppFormErrorMessage, getAppFormFieldId, getAppFormPath, getAppFormValue } from './path'
import { useAppFormContext, useAppFormLayout, useAppFormSelector } from './AppForm'
import type { AppFormFieldProps, AppFormSetValueOptions } from './types'

type AppFormFieldStyle = CSSProperties & Record<string, string | number>

function setResponsiveCssVariables(style: AppFormFieldStyle, value: AppFormFieldProps<unknown>['colSpan']) {
  if (value == null) return
  const responsive = typeof value === 'object' ? value : { base: value }
  for (const breakpoint of ['base', 'sm', 'md', 'lg'] as const) {
    const current = responsive[breakpoint]
    if (current != null) style[`--app-form-field-span-${breakpoint}`] = current
  }
}

function toCssValue(value: CSSProperties['width']) {
  return typeof value === 'number' ? `${value}px` : value
}

export function AppFormField<TValues, TValue = unknown>({ children, className, colSpan, controlWidth, description, disabled = false, label, labelAlign, labelWidth, name, orientation, preserve = true, required = false, requiredMessage, style, validators }: AppFormFieldProps<TValues, TValue>) {
  const form = useAppFormContext<TValues>()
  const { messages } = useAppLocale()
  const layout = useAppFormLayout()
  const path = getAppFormPath(name)
  const registration = useMemo(() => ({ validators, preserve, required, requiredMessage: requiredMessage ?? messages.common.required }), [messages.common.required, preserve, required, requiredMessage, validators])
  useEffect(() => form.registerField(name, registration), [form, name, path, registration])

  const selected = useAppFormSelector(form, (state) => ({
    value: getAppFormValue<TValue>(state.values, name),
    meta: form.getFieldMeta(name),
  }))
  const field = {
    name,
    path,
    inputId: getAppFormFieldId(name),
    value: selected.value as TValue,
    setValue: (value: TValue, options: AppFormSetValueOptions = {}) => form.setValue(name, value, { shouldDirty: true, shouldValidate: options.shouldValidate ?? true, ...options }),
    onBlur: () => form.markFieldBlurred(name),
    meta: selected.meta,
    form,
  }
  const fieldStyle = { ...(style ?? {}) } as AppFormFieldStyle
  setResponsiveCssVariables(fieldStyle, colSpan)
  const resolvedControlWidth = toCssValue(controlWidth ?? layout.controlWidth)
  if (resolvedControlWidth != null) fieldStyle['--app-field-control-width'] = resolvedControlWidth
  return <AppField className={className} description={description} disabled={disabled} error={getAppFormErrorMessage(selected.meta.error)} id={field.inputId} label={label} labelAlign={labelAlign ?? layout.labelAlign} labelWidth={labelWidth ?? layout.labelWidth} orientation={orientation ?? (layout.layout === 'vertical' ? 'vertical' : 'horizontal')} required={required} style={fieldStyle}>
    {children(field)}
  </AppField>
}
