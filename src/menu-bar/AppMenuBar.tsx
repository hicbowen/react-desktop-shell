import { useRef, type KeyboardEvent } from 'react'
import { AppMenuFlyout } from '../menu-flyout'
import { executeAppCommand, formatAppShortcut } from '../command'
import type { AppMenuBarProps } from './types'
import './AppMenuBar.css'

export function AppMenuBar({ ariaLabel = 'Application menu', className, menus, onSelect, style }: AppMenuBarProps) {
  const refs = useRef<Array<HTMLButtonElement | null>>([])
  const move = (event: KeyboardEvent, index: number) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight' && event.key !== 'Home' && event.key !== 'End') return
    event.preventDefault()
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? menus.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + menus.length) % menus.length
    refs.current[next]?.focus()
  }
  return <nav aria-label={ariaLabel} className={['app-menu-bar', className].filter(Boolean).join(' ')} style={style}>
    {menus.map((menu, index) => <AppMenuFlyout
      ariaLabel={typeof menu.label === 'string' ? menu.label : undefined}
      items={menu.items.map((item) => item.type === 'separator' ? item : {
        key: item.key,
        label: item.command?.label ?? item.label ?? item.key,
        icon: item.command?.icon ?? item.icon,
        disabled: item.command?.disabled ?? item.disabled,
        checked: item.command?.checked ?? item.checked,
        danger: item.danger,
        shortcut: item.shortcut ?? (item.command?.shortcut ? formatAppShortcut(item.command.shortcut) : undefined),
      })}
      key={menu.key}
      onSelect={(key) => {
        const item = menu.items.find((candidate) => candidate.type !== 'separator' && candidate.key === key)
        if (item && item.type !== 'separator' && item.command) executeAppCommand(item.command, { source: 'menu' })
        onSelect?.(key, menu.key)
      }}
    ><button accessKey={menu.accessKey} className="app-menu-bar__trigger" onKeyDown={(event) => move(event, index)} ref={(node) => { refs.current[index] = node }} type="button">{menu.label}</button></AppMenuFlyout>)}
  </nav>
}
