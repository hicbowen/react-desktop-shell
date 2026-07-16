// @vitest-environment jsdom
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppButton } from '../button'
import { AppEmptyState } from '../empty-state'
import { AppField } from './AppField'
import { AppTextBox } from '../text-input'

describe('AppField and AppEmptyState', () => {
  let host: HTMLDivElement; let root: ReturnType<typeof createRoot>
  beforeEach(() => { ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true; host = document.createElement('div'); document.body.append(host); root = createRoot(host) })
  afterEach(() => { act(() => root.unmount()); host.remove() })
  it('automatically associates RDS controls with labels and messages', () => { act(() => root.render(<AppField description="Help" label="Name"><AppTextBox /></AppField>)); const input = host.querySelector('input')!; expect(input.id).not.toBe(''); expect(host.querySelector('label')?.htmlFor).toBe(input.id); expect(input.getAttribute('aria-describedby')).toBe(host.querySelector('.app-field__message')?.id) })
  it('passes error, required, and disabled semantics to RDS controls', () => { act(() => root.render(<AppField disabled error="Missing" label="Name" required><AppTextBox /></AppField>)); const input = host.querySelector('input')!; expect(input.getAttribute('aria-invalid')).toBe('true'); expect(input.required).toBe(true); expect(input.disabled).toBe(true); expect(host.textContent).not.toContain('required'); expect(host.querySelector('.app-field__required')?.getAttribute('aria-hidden')).toBe('true') })
  it('does not override explicit control associations', () => { act(() => root.render(<AppField description="Field help" id="field-id" label="Name"><AppTextBox aria-describedby="custom-help" id="custom-id" /></AppField>)); const input = host.querySelector('input')!; expect(input.id).toBe('custom-id'); expect(input.getAttribute('aria-describedby')).toBe('custom-help') })
  it('supports manual native-control associations and custom message ids', () => { act(() => root.render(<AppField description="Help" htmlFor="native" label="Name" messageId="native-help"><input aria-describedby="native-help" id="native" /></AppField>)); expect(host.querySelector('label')?.htmlFor).toBe('native'); expect(host.querySelector('.app-field__message')?.id).toBe('native-help') })
  it('prefers errors and preserves horizontal and vertical classes', () => { act(() => root.render(<><AppField description="Help" error="Missing" label="Name" orientation="horizontal"><AppTextBox /></AppField><AppField label="Other"><AppTextBox /></AppField></>)); expect(host.querySelector('.app-field')?.classList.contains('app-field--horizontal')).toBe(true); expect(host.textContent).toContain('Missing'); expect(host.textContent).not.toContain('Help'); expect(host.querySelectorAll('.app-field')[1]?.classList.contains('app-field--vertical')).toBe(true) })
  it('renders optional empty-state regions and keeps actions interactive', () => { const onClick = vi.fn(); act(() => root.render(<AppEmptyState action={<AppButton onClick={onClick}>Add</AppButton>} title="No students" />)); expect(host.querySelector('.app-empty-state__icon')).toBeNull(); expect(host.querySelector('.app-empty-state__description')).toBeNull(); act(() => host.querySelector('button')?.click()); expect(onClick).toHaveBeenCalledOnce() })
})
