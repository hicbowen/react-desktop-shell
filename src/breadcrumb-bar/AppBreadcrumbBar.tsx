import { AppMenuFlyout } from '../menu-flyout'
import { useAppLocale } from '../localization/useAppLocale'
import type { AppBreadcrumbBarProps } from './types'
import './AppBreadcrumbBar.css'

function Chevron() { return <svg aria-hidden="true" viewBox="0 0 12 12"><path d="m4 2.5 3.5 3.5L4 9.5" /></svg> }
export function AppBreadcrumbBar({ ariaLabel, className, items, maxVisibleItems = 5, onItemSelect, overflowLabel, style }: AppBreadcrumbBarProps) {
  const { messages } = useAppLocale()
  const text = messages.breadcrumbBar
  const visibleCount = Math.max(1, maxVisibleItems)
  const hidden = items.slice(0, Math.max(0, items.length - visibleCount))
  const visible = items.slice(hidden.length)
  return <nav aria-label={ariaLabel ?? text.label} className={['app-breadcrumb-bar', className].filter(Boolean).join(' ')} style={style}>
    <ol className="app-breadcrumb-bar__list">
      {hidden.length ? <li className="app-breadcrumb-bar__part"><AppMenuFlyout items={hidden.map((item) => ({ key: item.key, label: item.label, icon: item.icon, disabled: item.disabled }))} onSelect={onItemSelect}><button aria-label={overflowLabel ?? text.showEarlierLocations} className="app-breadcrumb-bar__button app-breadcrumb-bar__overflow" type="button">•••</button></AppMenuFlyout><span className="app-breadcrumb-bar__separator"><Chevron /></span></li> : null}
      {visible.map((item, index) => {
        const current = index === visible.length - 1
        return <li className="app-breadcrumb-bar__part" key={item.key}>
          <button aria-current={current ? 'page' : undefined} className="app-breadcrumb-bar__button" disabled={current || item.disabled} onClick={() => onItemSelect?.(item.key)} type="button">{item.icon ? <span className="app-breadcrumb-bar__icon">{item.icon}</span> : null}<span className="app-breadcrumb-bar__label">{item.label}</span></button>
          {!current ? <span className="app-breadcrumb-bar__separator"><Chevron /></span> : null}
        </li>
      })}
    </ol>
  </nav>
}
