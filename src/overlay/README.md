# Overlay infrastructure

This directory contains internal primitives for anchored, non-modal overlays.
They are not exported from the package root yet.

## Placement

`placeAnchoredOverlay(triggerRect, overlayRect, viewport, options)` supports
`top`, `bottom`, `left`, and `right`, with optional `-start` and `-end`
alignment. It flips only on the main axis, preserves alignment when flipped,
clamps the final coordinates to `viewportPadding`, and returns both `maxHeight`
and `maxWidth` for the chosen direction.

Vertical placements use the chosen top/bottom space for `maxHeight` and the
viewport content width for `maxWidth`. Horizontal placements use the chosen
left/right space for `maxWidth` and the viewport content height for
`maxHeight`. Explicit size limits are applied on top of those available-space
limits.

## React hooks

`useAnchoredOverlayPosition` accepts either a `triggerRef` or a stable
`triggerRect`, plus an `overlayRef`. When open, it hides behind
`measured=false`, measures in `requestAnimationFrame`, and returns the resolved
position. Callers should keep the overlay mounted but hidden until measurement
completes, then apply `x`, `y`, `maxHeight`, and `maxWidth`. Use `dependencies`
for values that can change the overlay's rendered size.

`useOverlayDismiss` centralizes Escape, outside pointer down, resize, external
scroll, and window blur dismissal. Trigger and overlay interactions are
excluded. Scroll events originating inside the overlay are also excluded so
scrollable menus remain open. Focus restoration is opt-in and applies to
Escape dismissal.

## Layering

Anchored overlays mount into the AppShell overlay host when possible. The
internal z-index tokens live on `.app-shell`:

- `--rds-z-overlay: 1050`
- `--rds-z-pane: 1100`
- `--rds-z-dialog: 1100`
- `--rds-z-toast: 1150`
- `--rds-z-context-menu: 1200`

Body portal fallbacks must provide CSS fallback values and preserve any theme
variables that would otherwise be lost outside AppShell.
