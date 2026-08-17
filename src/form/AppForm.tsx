/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useSyncExternalStore, type CSSProperties, type FormEvent, type ReactNode } from 'react'
import { useAppLocale } from '../localization/useAppLocale'
import { AppFormStore } from './AppFormStore'
import type {
  AppFormApi,
  AppFormColumns,
  AppFormErrorSummaryProps,
  AppFormLabelAlign,
  AppFormProps,
  AppFormResponsive,
  AppFormSectionProps,
  AppFormState,
  AppFormOptions,
} from './types'
import './AppForm.css'

const AppFormContext = createContext<AppFormApi<unknown> | null>(null)
const AppFormLayoutContext = createContext<{
  layout: AppFormProps<unknown>['layout']
  columns?: AppFormColumns
  gap?: CSSProperties['gap']
  labelWidth: AppFormProps<unknown>['labelWidth']
  labelAlign: AppFormLabelAlign
  controlWidth?: CSSProperties['width']
  compact: boolean
}>({ layout: 'vertical', labelWidth: '140px', labelAlign: 'start', compact: false })

type AppFormStyle = CSSProperties & Record<string, string | number>

function setResponsiveCssVariables<TValue extends string | number>(style: AppFormStyle, prefix: string, value: TValue | AppFormResponsive<TValue> | undefined) {
  if (value == null) return
  const responsive = typeof value === 'object' ? value : { base: value }
  for (const breakpoint of ['base', 'sm', 'md', 'lg'] as const) {
    const current = responsive[breakpoint]
    if (current != null) style[`--${prefix}-${breakpoint}`] = current
  }
}

function toCssValue(value: CSSProperties['gap'] | CSSProperties['width']) {
  return typeof value === 'number' ? `${value}px` : value
}

export function useAppForm<TValues>(options: AppFormOptions<TValues>): AppFormApi<TValues> {
  const [store] = useState(() => new AppFormStore(options))
  store.updateOptions(options)
  return store
}

export function useAppFormContext<TValues>() {
  const form = useContext(AppFormContext)
  if (!form) throw new Error('useAppFormContext must be used inside AppForm')
  return form as AppFormApi<TValues>
}

export function useAppFormLayout() {
  return useContext(AppFormLayoutContext)
}

export function useAppFormSelector<TValues, TSelected>(form: AppFormApi<TValues>, selector: (state: AppFormState<TValues>) => TSelected) {
  const snapshot = useSyncExternalStore(form.subscribe, form.getSnapshot, form.getSnapshot)
  return selector(snapshot)
}

export function AppForm<TValues>({ children, className, columns, compact = false, controlWidth, form, gap, labelAlign = 'start', labelWidth = '140px', layout = 'vertical', noValidate = true, style }: AppFormProps<TValues>) {
  const resolvedColumns = columns ?? (layout === 'grid' ? { base: 1, md: 2 } : undefined)
  const formStyle = { ...(style ?? {}) } as AppFormStyle
  setResponsiveCssVariables(formStyle, 'app-form-columns', resolvedColumns)
  const resolvedGap = toCssValue(gap)
  if (resolvedGap != null) formStyle['--app-form-gap'] = resolvedGap
  const resolvedControlWidth = toCssValue(controlWidth)
  if (resolvedControlWidth != null) formStyle['--app-form-control-width'] = resolvedControlWidth
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void form.submit().then((success) => {
      if (!success) form.focusFirstError()
    })
  }
  return <AppFormContext.Provider value={form as AppFormApi<unknown>}>
    <AppFormLayoutContext.Provider value={{ compact, controlWidth, columns: resolvedColumns, gap, labelAlign, labelWidth, layout }}>
      <form aria-busy={form.state.isSubmitting || undefined} className={['app-form', `app-form--${layout}`, compact ? 'app-form--compact' : '', className].filter(Boolean).join(' ')} noValidate={noValidate} onSubmit={handleSubmit} style={formStyle}>
        {children}
      </form>
    </AppFormLayoutContext.Provider>
  </AppFormContext.Provider>
}

export function AppFormSection({ children, className, description, style, title }: AppFormSectionProps) {
  return <fieldset className={['app-form-section', className].filter(Boolean).join(' ')} style={style}>
    {title || description ? <legend className="app-form-section__legend"><span>{title}</span>{description ? <small>{description}</small> : null}</legend> : null}
    <div className="app-form-section__content">{children}</div>
  </fieldset>
}

export function AppFormErrorSummary<TValues>({ className, form, style, title }: AppFormErrorSummaryProps<TValues>) {
  const { messages } = useAppLocale()
  const errors = useAppFormSelector(form, (state) => state.errors)
  const entries = Object.entries(errors)
  if (!entries.length) return null
  return <section aria-label={messages.validationSummary.label} className={['app-form-error-summary', className].filter(Boolean).join(' ')} style={style}>
    <strong>{title ?? messages.validationSummary.title}</strong>
    <ul>
      {entries.map(([path, error]) => <li key={path}><button onClick={() => {
        const target = document.getElementById(`app-form-field-${path.replace(/[^a-zA-Z0-9_-]+/g, '-')}`)
        target?.focus({ preventScroll: true })
        target?.scrollIntoView?.({ block: 'center', behavior: 'smooth' })
      }} type="button">{typeof error === 'object' && error && 'message' in error ? error.message as ReactNode : error}</button></li>)}
    </ul>
  </section>
}
