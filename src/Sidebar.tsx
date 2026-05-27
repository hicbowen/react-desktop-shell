import { useEffect, useState } from 'react'
import type { NavItem, NavLink, RouteId } from './app.config'
import './sidebar.css'

const COLLAPSE_WIDTH = 700

export default function Sidebar({
  active,
  footerItems,
  items,
  onChange,
}: {
  active: RouteId
  footerItems: NavLink[]
  items: NavItem[]
  onChange: (id: RouteId) => void
}) {
  const [collapsed, setCollapsed] = useState(
    window.innerWidth < COLLAPSE_WIDTH,
  )

  useEffect(() => {
    const onResize = () => {
      setCollapsed(window.innerWidth < COLLAPSE_WIDTH)
    }

    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const renderItem = (item: NavLink) => {
    const Icon = item.icon

    return (
      <button
        key={item.id}
        className={`sidebar-item ${active === item.id ? 'active' : ''}`}
        onClick={() => onChange(item.id)}
        title={collapsed ? item.label : undefined}
        type="button"
      >
        <Icon size={16} />
        {!collapsed && <span>{item.label}</span>}
      </button>
    )
  }

  return (
    <aside className={`sidebar no-select ${collapsed ? 'collapsed' : ''}`}>
      <nav className="sidebar-nav">
        {items.map((item, index) => {
          if (item.type === 'group') {
            if (collapsed) return null

            return (
              <div key={`group-${index}`} className="sidebar-group-title">
                {item.label}
              </div>
            )
          }

          return renderItem(item)
        })}
      </nav>
      <div className="sidebar-footer">{footerItems.map(renderItem)}</div>
    </aside>
  )
}
