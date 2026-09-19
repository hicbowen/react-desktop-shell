import { useRef, type KeyboardEvent } from 'react'
import { AppMenuFlyout } from '../menu-flyout'
import { useAppLocale } from '../localization/useAppLocale'
import type { AppMenuBarProps } from './types'
import './AppMenuBar.css'

export function AppMenuBar({ ariaLabel, className, menus, onSelect, style }: AppMenuBarProps) {
  const { messages } = useAppLocale()
  const refs = useRef<Array<HTMLButtonElement | null>>([])
  const move = (event: KeyboardEvent, index: number) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight' && event.key !== 'Home' && event.key !== 'End') return
    event.preventDefault()
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? menus.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + menus.length) % menus.length
    refs.current[next]?.focus()
  }
  return <nav aria-label={ariaLabel ?? messages.menuBar.label} className={['app-menu-bar', className].filter(Boolean).join(' ')} style={style}>
    {menus.map((menu, index) => <AppMenuFlyout
      ariaLabel={typeof menu.label === 'string' ? menu.label : undefined}
      items={menu.items.map((item) => item.type === 'separator' ? item : {
        key: item.key,
        command: item.command,
        commandId: item.commandId,
        label: item.label,
        icon: item.icon,
        disabled: item.disabled,
        checked: item.checked,
        danger: item.danger,
        shortcut: item.shortcut,
      })}
      key={menu.key}
      onSelect={(key) => {
        onSelect?.(key, menu.key)
      }}
    ><button accessKey={menu.accessKey} className="app-menu-bar__trigger" onKeyDown={(event) => move(event, index)} ref={(node) => { refs.current[index] = node }} type="button">{menu.label}</button></AppMenuFlyout>)}
  </nav>
}
