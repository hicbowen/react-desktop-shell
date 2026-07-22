// @vitest-environment jsdom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { AppSkeleton, AppSkeletonGroup } from './AppSkeleton'

describe('AppSkeleton', () => {
  let container: HTMLDivElement
  let root: Root
  beforeEach(() => { container = document.createElement('div'); document.body.append(container); root = createRoot(container) })
  afterEach(() => { act(() => root.unmount()); container.remove() })

  it('renders multiple text lines with a shorter final line', () => {
    act(() => root.render(<AppSkeleton lines={3} />))
    const lines = container.querySelectorAll('.app-skeleton--text')
    expect(lines).toHaveLength(3)
    expect((lines[2] as HTMLElement).style.width).toBe('72%')
  })

  it('provides one accessible loading announcement per group', () => {
    act(() => root.render(<AppSkeletonGroup label="Loading profile"><AppSkeleton shape="circle" /><AppSkeleton /></AppSkeletonGroup>))
    expect(container.querySelector('[role="status"]')?.getAttribute('aria-label')).toBe('Loading profile')
    expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(2)
  })
})
