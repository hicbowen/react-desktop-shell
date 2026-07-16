import {
  cloneElement,
  forwardRef,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type AriaAttributes,
  type CSSProperties,
  type FocusEventHandler,
  type KeyboardEventHandler,
  type MouseEventHandler,
  type PointerEventHandler,
  type ReactElement,
  type Ref,
} from 'react'
import { createPortal } from 'react-dom'
import { useAppOverlayHost } from '../overlay/AppOverlayHostContext'
import { OVERLAY_SURFACE_FALLBACK_STYLE } from '../overlay/surfaceFallback'
import {
  composeEventHandlers,
  getElementRef,
  useMergedRefs,
} from '../overlay/trigger'
import { useAnchoredOverlayPosition } from '../overlay/useAnchoredOverlayPosition'
import { useOverlayDismiss } from '../overlay/useOverlayDismiss'
import {
  OverlayParentContext,
  useOverlayTree,
} from '../overlay/OverlayTreeContext'
import type {
  AppMenuFlyoutEntry,
  AppMenuFlyoutItem,
  AppMenuFlyoutProps,
} from './types'
import './AppMenuFlyout.css'

const MENU_GAP = 5
const MENU_MIN_WIDTH = 188
const MENU_VIEWPORT_PADDING = 8

type FocusIntent = 'first' | 'last'

interface MenuTriggerProps {
  'aria-controls'?: string
  'aria-describedby'?: string
  'aria-expanded'?: boolean
  'aria-haspopup'?: AriaAttributes['aria-haspopup']
  onBlur?: FocusEventHandler<HTMLElement>
  onClick?: MouseEventHandler<HTMLElement>
  onFocus?: FocusEventHandler<HTMLElement>
  onKeyDown?: KeyboardEventHandler<HTMLElement>
  onPointerEnter?: PointerEventHandler<HTMLElement>
  onPointerLeave?: PointerEventHandler<HTMLElement>
  ref?: Ref<HTMLElement>
}

function isItem(entry: AppMenuFlyoutEntry): entry is AppMenuFlyoutItem {
  return entry.type !== 'separator'
}

function AppMenuFlyoutInner(
  props: AppMenuFlyoutProps,
  forwardedRef: Ref<HTMLElement>,
) {
  const {
    ariaLabel,
    children,
    className,
    disabled = false,
    items,
    maxHeight = 420,
    maxWidth = 320,
    onSelect,
    placement = 'bottom-start',
    ...triggerProps
  } = props as AppMenuFlyoutProps & MenuTriggerProps
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const menuUnavailable = disabled || items.length === 0
  const effectiveOpen = open && !menuUnavailable
  const triggerRef = useRef<HTMLElement | null>(null)
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([])
  const focusIntentRef = useRef<FocusIntent>('first')
  const focusedForOpenRef = useRef(false)
  const overlayHost = useAppOverlayHost()
  const menuId = useId()
  const overlayTree = useOverlayTree(effectiveOpen, overlayRef)
  const resolvedMaxHeight = Math.max(0, maxHeight)
  const resolvedMaxWidth = Math.max(0, maxWidth)
  const child = children as ReactElement<MenuTriggerProps>
  const enabledIndexes = useMemo(
    () =>
      items.flatMap((entry, index) =>
        isItem(entry) && !entry.disabled ? [index] : [],
      ),
    [items],
  )
  const firstEnabledIndex = enabledIndexes[0] ?? -1
  const lastEnabledIndex = enabledIndexes.at(-1) ?? -1

  const position = useAnchoredOverlayPosition({
    open: effectiveOpen,
    triggerRef,
    overlayRef,
    preferredPlacement: placement,
    gap: MENU_GAP,
    viewportPadding: MENU_VIEWPORT_PADDING,
    maxHeight: resolvedMaxHeight,
    maxWidth: resolvedMaxWidth,
    dependencies: [items.length, className],
  })

  const closeMenu = () => {
    focusedForOpenRef.current = false
    setOpen(false)
    setActiveIndex(-1)
  }

  const restoreTriggerFocus = () => {
    triggerRef.current?.focus({ preventScroll: true })
  }

  const closeMenuAndRestoreFocus = () => {
    closeMenu()
    restoreTriggerFocus()
  }

  useEffect(() => {
    if (!menuUnavailable) {
      return
    }

    focusedForOpenRef.current = false
    // eslint-disable-next-line react-hooks/set-state-in-effect -- external availability changes must clear stale internal open state.
    setOpen(false)
    setActiveIndex(-1)
  }, [menuUnavailable])

  useEffect(() => {
    if (!effectiveOpen || !position.measured || focusedForOpenRef.current) {
      return
    }

    focusedForOpenRef.current = true
    const index =
      focusIntentRef.current === 'last'
        ? lastEnabledIndex
        : firstEnabledIndex

    setActiveIndex(index)
    if (index >= 0) {
      itemRefs.current[index]?.focus({ preventScroll: true })
    } else {
      overlayRef.current?.focus({ preventScroll: true })
    }
  }, [effectiveOpen, firstEnabledIndex, lastEnabledIndex, position.measured])

  useOverlayDismiss({
    open: effectiveOpen,
    triggerRef,
    overlayRef,
    onDismiss: closeMenu,
    closeOnEscape: true,
    restoreFocus: true,
    isInsideBranch: overlayTree.isInsideBranch,
    isTopMost: overlayTree.isTopMost,
  })

  const openMenu = (intent: FocusIntent) => {
    if (menuUnavailable) {
      return
    }

    focusIntentRef.current = intent
    focusedForOpenRef.current = false
    setActiveIndex(intent === 'last' ? lastEnabledIndex : firstEnabledIndex)
    setOpen(true)
  }

  const selectItem = (item: AppMenuFlyoutItem) => {
    if (item.disabled) {
      return
    }

    onSelect?.(item.key)
    closeMenuAndRestoreFocus()
  }

  const focusItem = (index: number) => {
    if (index < 0) {
      return
    }

    setActiveIndex(index)
    itemRefs.current[index]?.focus({ preventScroll: true })
  }

  const moveFocus = (step: 1 | -1) => {
    if (enabledIndexes.length === 0) {
      return
    }

    const currentPosition = enabledIndexes.indexOf(activeIndex)
    const nextPosition =
      currentPosition < 0
        ? step === 1
          ? 0
          : enabledIndexes.length - 1
        : (currentPosition + step + enabledIndexes.length) %
          enabledIndexes.length

    focusItem(enabledIndexes[nextPosition] ?? -1)
  }

  const handleMenuKeyDown: KeyboardEventHandler<HTMLDivElement> = (event) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        moveFocus(1)
        break
      case 'ArrowUp':
        event.preventDefault()
        moveFocus(-1)
        break
      case 'Home':
        event.preventDefault()
        focusItem(firstEnabledIndex)
        break
      case 'End':
        event.preventDefault()
        focusItem(lastEnabledIndex)
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        if (activeIndex >= 0) {
          const item = items[activeIndex]

          if (item && isItem(item)) {
            selectItem(item)
          }
        }
        break
      case 'Tab':
        restoreTriggerFocus()
        closeMenu()
        break
    }
  }

  /* eslint-disable react-hooks/refs -- composed event callbacks and cloned refs
   * only access refs after React dispatches an event or during commit. */
  const handleTriggerClick = composeEventHandlers(
    child.props.onClick,
    composeEventHandlers(triggerProps.onClick, () => {
      if (menuUnavailable) {
        return
      }

      if (effectiveOpen) {
        closeMenu()
      } else {
        openMenu('first')
      }
    }),
  )
  const handleTriggerKeyDown = composeEventHandlers(
    child.props.onKeyDown,
    composeEventHandlers(triggerProps.onKeyDown, (event) => {
      if (menuUnavailable) {
        return
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        openMenu('first')
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        openMenu('last')
      }
    }),
  )
  const childRef = getElementRef(child)
  const forwardedChildRef = useMergedRefs(childRef, forwardedRef)
  const mergedRef = useMergedRefs(forwardedChildRef, triggerRef)
  const trigger = cloneElement(child, {
    ref: mergedRef,
    'aria-controls': effectiveOpen ? menuId : undefined,
    'aria-describedby':
      triggerProps['aria-describedby'] ?? child.props['aria-describedby'],
    'aria-expanded': effectiveOpen,
    'aria-haspopup': 'menu',
    onBlur: composeEventHandlers(child.props.onBlur, triggerProps.onBlur),
    onClick: handleTriggerClick,
    onFocus: composeEventHandlers(child.props.onFocus, triggerProps.onFocus),
    onKeyDown: handleTriggerKeyDown,
    onPointerEnter: composeEventHandlers(
      child.props.onPointerEnter,
      triggerProps.onPointerEnter,
    ),
    onPointerLeave: composeEventHandlers(
      child.props.onPointerLeave,
      triggerProps.onPointerLeave,
    ),
  })
  /* eslint-enable react-hooks/refs */

  if (!effectiveOpen || typeof document === 'undefined') {
    return trigger
  }

  const menuClassName = ['app-menu-flyout', className]
    .filter(Boolean)
    .join(' ')

  return (
    <>
      {trigger}
      {createPortal(
        <OverlayParentContext.Provider value={overlayTree.overlayId}>
          <div
          aria-label={ariaLabel}
          className={menuClassName}
          data-placement={position.placement}
          id={menuId}
          onKeyDown={handleMenuKeyDown}
          ref={overlayRef}
          role="menu"
          tabIndex={-1}
          style={{
            ...(overlayHost ? undefined : OVERLAY_SURFACE_FALLBACK_STYLE),
            '--app-menu-flyout-max-width': `${resolvedMaxWidth}px`,
            left: position.x,
            maxHeight: position.measured ? position.maxHeight : undefined,
            maxWidth: position.measured ? position.maxWidth : undefined,
            minWidth: position.measured
              ? Math.min(MENU_MIN_WIDTH, position.maxWidth)
              : undefined,
            pointerEvents: position.measured ? undefined : 'none',
            top: position.y,
            visibility: position.measured ? 'visible' : 'hidden',
          } as CSSProperties}
        >
          {items.map((entry, index) => {
            if (!isItem(entry)) {
              return (
                <div
                  className="app-menu-flyout__separator"
                  key={entry.key ?? `separator-${index}`}
                  role="separator"
                />
              )
            }

            return (
              <button
                className={[
                  'app-menu-flyout__item',
                  activeIndex === index
                    ? 'app-menu-flyout__item--active'
                    : '',
                  entry.danger ? 'app-menu-flyout__item--danger' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                disabled={entry.disabled}
                key={entry.key}
                onClick={() => selectItem(entry)}
                onFocus={() => setActiveIndex(index)}
                ref={(node) => {
                  itemRefs.current[index] = node
                }}
                role="menuitem"
                tabIndex={activeIndex === index ? 0 : -1}
                type="button"
              >
                <span className="app-menu-flyout__icon">{entry.icon}</span>
                <span className="app-menu-flyout__label">{entry.label}</span>
              </button>
            )
          })}
          </div>
        </OverlayParentContext.Provider>,
        overlayHost ?? document.body,
      )}
    </>
  )
}

export const AppMenuFlyout = forwardRef<HTMLElement, AppMenuFlyoutProps>(
  AppMenuFlyoutInner,
)

AppMenuFlyout.displayName = 'AppMenuFlyout'
