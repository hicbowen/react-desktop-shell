import type { AnchorHTMLAttributes, ReactNode } from 'react'

export interface AppLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  appearance?: 'default' | 'subtle'
  disabled?: boolean
  externalIcon?: ReactNode
}
