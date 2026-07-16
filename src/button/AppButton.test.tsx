// @vitest-environment jsdom
import { act, createRef } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppButton } from './AppButton'
import { AppIconButton } from './AppIconButton'

describe('button primitives', () => {
  let host: HTMLDivElement
  let root: Root
  beforeEach(() => { ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true; host = document.createElement('div'); document.body.append(host); root = createRoot(host) })
  afterEach(() => { act(() => root.unmount()); host.remove() })
  const click = (button: HTMLButtonElement) => act(() => button.click())

  it('forwards click, submit type, and ref', () => {
    const onClick = vi.fn(); const ref = createRef<HTMLButtonElement>()
    act(() => root.render(<AppButton icon={<i data-icon="start" />} onClick={onClick} ref={ref} type="submit">Save</AppButton>))
    click(ref.current!); expect(onClick).toHaveBeenCalledOnce(); expect(ref.current?.type).toBe('submit'); expect(host.querySelector('[data-icon]')?.parentElement?.nextElementSibling?.textContent).toBe('Save')
  })
  it('blocks disabled and loading interactions while retaining content width', () => {
    const onClick = vi.fn()
    act(() => root.render(<><AppButton disabled onClick={onClick}>Disabled</AppButton><AppButton loading onClick={onClick}>Loading label</AppButton></>))
    host.querySelectorAll('button').forEach((button) => click(button)); expect(onClick).not.toHaveBeenCalled(); expect(host.textContent).toContain('Loading label')
  })
  it('supports end icons and accessible icon buttons', () => {
    act(() => root.render(<><AppButton icon={<i data-icon />} iconPosition="end">Next</AppButton><AppIconButton ariaLabel="More actions" icon={<i />} /></>))
    expect(host.querySelector('[data-icon]')?.parentElement?.previousElementSibling?.textContent).toBe('Next'); expect(host.querySelectorAll('button')[1]?.getAttribute('aria-label')).toBe('More actions')
  })
})
