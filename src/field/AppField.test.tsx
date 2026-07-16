// @vitest-environment jsdom
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppButton } from '../button'
import { AppEmptyState } from '../empty-state'
import { AppField } from './AppField'

describe('AppField and AppEmptyState', () => {
  let host: HTMLDivElement; let root: ReturnType<typeof createRoot>
  beforeEach(() => { ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true; host = document.createElement('div'); document.body.append(host); root = createRoot(host) })
  afterEach(() => { act(() => root.unmount()); host.remove() })
  it('associates labels and exposes one described message', () => { act(() => root.render(<AppField description="Help" htmlFor="name" label="Name"><input id="name" /></AppField>)); expect(host.querySelector('label')?.htmlFor).toBe('name'); const group = host.querySelector('[role=group]')!; expect(group.getAttribute('aria-describedby')).toBe(host.querySelector('.app-field__message')?.id) })
  it('prefers errors and reports horizontal state', () => { act(() => root.render(<AppField description="Help" error="Required" label="Name" orientation="horizontal"><input /></AppField>)); expect(host.querySelector('.app-field')?.classList.contains('app-field--horizontal')).toBe(true); expect(host.textContent).toContain('Required'); expect(host.textContent).not.toContain('Help'); expect(host.querySelector('[role=group]')?.getAttribute('aria-invalid')).toBe('true') })
  it('renders optional empty-state regions and keeps actions interactive', () => { const onClick = vi.fn(); act(() => root.render(<AppEmptyState action={<AppButton onClick={onClick}>Add</AppButton>} title="No students" />)); expect(host.querySelector('.app-empty-state__icon')).toBeNull(); expect(host.querySelector('.app-empty-state__description')).toBeNull(); act(() => host.querySelector('button')?.click()); expect(onClick).toHaveBeenCalledOnce() })
})
