import type { CSSProperties, ReactNode } from 'react'

export interface AppWizardStep {
  key: string
  title: ReactNode
  description?: ReactNode
  content: ReactNode
  optional?: boolean
}

export interface AppWizardProps {
  steps: readonly AppWizardStep[]
  value?: string
  defaultValue?: string
  onValueChange?: (key: string) => void
  onNext?: (
    step: AppWizardStep,
  ) => boolean | void | Promise<boolean | void>
  onComplete: () => void | Promise<void>
  onCancel?: () => void
  primaryDisabled?: boolean
  completeLabel?: ReactNode
  ariaLabel?: string
  className?: string
  style?: CSSProperties
}
