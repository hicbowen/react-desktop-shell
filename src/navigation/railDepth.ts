import type { CSSProperties } from 'react'

const RAIL_ITEM_DEPTH_INDENT = 20

type RailDepthStyle = CSSProperties & {
  '--app-rail-item-depth-offset': string
}

export function getRailDepthStyle(depth: number): RailDepthStyle {
  return {
    '--app-rail-item-depth-offset': `${depth * RAIL_ITEM_DEPTH_INDENT}px`,
  }
}
