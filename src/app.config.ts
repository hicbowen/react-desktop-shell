import type { ComponentType } from 'react'
import {
  FileText,
  Home,
  LayoutGrid,
  Settings,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import FilesPage from './pages/FilesPage'
import HomePage from './pages/HomePage'
import SettingsPage from './pages/SettingsPage'
import ToolsPage from './pages/ToolsPage'

export type RouteId = 'home' | 'files' | 'tools' | 'settings'

export type NavGroup = {
  type: 'group'
  label: string
}

export type NavLink = {
  type: 'item'
  id: RouteId
  label: string
  icon: LucideIcon
}

export type NavItem = NavGroup | NavLink

export type AppConfig = {
  appName: string
  appIcon: LucideIcon
  defaultRoute: RouteId
  navItems: NavItem[]
  footerItems: NavLink[]
  routeComponents: Record<RouteId, ComponentType>
}

export const appConfig: AppConfig = {
  appName: '工具应用模板',
  appIcon: LayoutGrid,
  defaultRoute: 'home',
  navItems: [
    { type: 'item', id: 'home', label: '概览', icon: Home },
    { type: 'group', label: '工作区' },
    { type: 'item', id: 'files', label: '文件', icon: FileText },
    { type: 'item', id: 'tools', label: '工具', icon: Wrench },
  ],
  footerItems: [
    { type: 'item', id: 'settings', label: '设置', icon: Settings },
  ],
  routeComponents: {
    home: HomePage,
    files: FilesPage,
    tools: ToolsPage,
    settings: SettingsPage,
  },
}
