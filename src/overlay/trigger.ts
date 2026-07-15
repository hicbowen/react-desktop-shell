import {
  useCallback,
  version as reactVersion,
  type ReactElement,
  type Ref,
  type RefCallback,
} from 'react'

const REACT_MAJOR_VERSION = Number.parseInt(
  reactVersion.split('.')[0] ?? '19',
  10,
)

export interface PreventableEvent {
  defaultPrevented: boolean
}

export function composeEventHandlers<Event extends PreventableEvent>(
  originalHandler: ((event: Event) => void) | undefined,
  internalHandler: ((event: Event) => void) | undefined,
) {
  return (event: Event) => {
    originalHandler?.(event)

    if (!event.defaultPrevented) {
      internalHandler?.(event)
    }
  }
}

export function getElementRef<Element>(
  element: ReactElement<{ ref?: Ref<Element> }>,
) {
  return REACT_MAJOR_VERSION >= 19
    ? element.props.ref
    : (element as unknown as { ref?: Ref<Element> }).ref
}

function setRef<Value>(ref: Ref<Value> | undefined, value: Value | null) {
  if (typeof ref === 'function') {
    return ref(value)
  }

  if (ref) {
    ;(ref as { current: Value | null }).current = value
  }
}

export function useMergedRefs<Value>(
  firstRef: Ref<Value> | undefined,
  secondRef: Ref<Value> | undefined,
): RefCallback<Value> {
  return useCallback((value) => {
    const refs = [firstRef, secondRef]
    const cleanups = refs.map((ref) => setRef(ref, value))

    if (REACT_MAJOR_VERSION < 19) {
      return
    }

    return () => {
      refs.forEach((ref, index) => {
        const cleanup = cleanups[index]

        if (typeof cleanup === 'function') {
          cleanup()
        } else {
          setRef(ref, null)
        }
      })
    }
  }, [firstRef, secondRef])
}
