// @vitest-environment node

import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { createRef } from 'react'
import { useAnchoredOverlayPosition } from './useAnchoredOverlayPosition'

function ServerHarness() {
  const position = useAnchoredOverlayPosition({
    open: true,
    triggerRef: createRef<HTMLElement>(),
    overlayRef: createRef<HTMLElement>(),
  })

  return <span>{String(position.measured)}</span>
}

describe('useAnchoredOverlayPosition SSR', () => {
  it('renders without accessing browser globals', () => {
    expect(() => renderToString(<ServerHarness />)).not.toThrow()
    expect(renderToString(<ServerHarness />)).toContain('false')
  })
})
