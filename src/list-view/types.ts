import type { CSSProperties, ReactNode } from 'react'
interface AppListViewBaseProps { value?: string[]; defaultValue?: string[]; onValueChange?: (value: string[]) => void; onItemInvoke?: (value: string) => void; ariaLabel: string; density?: 'compact' | 'standard'; children: ReactNode; className?: string; style?: CSSProperties }
type AppListViewSelectionProps = { selectionMode: 'single' | 'multiple'; activationMode?: 'selection' }
type AppListViewNonSelectionProps = { selectionMode?: 'none'; activationMode?: 'selection' | 'invoke' }
export type AppListViewProps = AppListViewBaseProps & (AppListViewSelectionProps | AppListViewNonSelectionProps)
export interface AppListViewItemProps { value: string; icon?: ReactNode; title: ReactNode; description?: ReactNode; secondaryText?: ReactNode; trailing?: ReactNode; disabled?: boolean; interactive?: boolean; className?: string; style?: CSSProperties }
export interface AppListViewItemInternalProps extends AppListViewItemProps { selected?: boolean; tabIndex?: number; selectionMode?: AppListViewProps['selectionMode']; itemRole?: 'option' | 'listitem' | 'button'; focusable?: boolean; onItemClick?: (value: string, event: React.MouseEvent<HTMLDivElement>) => void; onItemKeyDown?: (value: string, event: React.KeyboardEvent<HTMLDivElement>) => void }
