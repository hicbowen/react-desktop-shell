import type { AppFormName, AppFormNameSegment } from './types'

export function normalizeAppFormName(name: AppFormName): AppFormNameSegment[] {
  if (typeof name !== 'string') return [...name]
  return name.split('.').map((segment: string) => /^\d+$/.test(segment) ? Number(segment) : segment)
}

export function getAppFormPath(name: AppFormName): string {
  return normalizeAppFormName(name).map(String).join('.')
}

export function getAppFormFieldId(name: AppFormName): string {
  const path = getAppFormPath(name)
  const suffix = path.replace(/[^a-zA-Z0-9_-]+/g, '-') || 'root'
  return `app-form-field-${suffix}`
}

export function getAppFormValue<TValue = unknown>(source: unknown, name: AppFormName): TValue | undefined {
  let current = source
  for (const segment of normalizeAppFormName(name)) {
    if (current == null || typeof current !== 'object') return undefined
    current = (current as Record<string | number, unknown>)[segment]
  }
  return current as TValue | undefined
}

export function setAppFormValue<TValue = unknown>(source: unknown, name: AppFormName, value: TValue): unknown {
  const segments = normalizeAppFormName(name)
  if (!segments.length) return value

  const root = Array.isArray(source) ? [...source] : { ...(source as Record<string | number, unknown> ?? {}) }
  let cursor = root as Record<string | number, unknown>

  for (let index = 0; index < segments.length - 1; index += 1) {
    const segment = segments[index]!
    const nextSegment = segments[index + 1]!
    const current = cursor[segment]
    const next = Array.isArray(current)
      ? [...current]
      : current && typeof current === 'object'
        ? { ...(current as Record<string | number, unknown>) }
        : typeof nextSegment === 'number' ? [] : {}
    cursor[segment] = next
    cursor = next as Record<string | number, unknown>
  }

  cursor[segments[segments.length - 1]!] = value
  return root
}

export function deleteAppFormValue(source: unknown, name: AppFormName): unknown {
  const segments = normalizeAppFormName(name)
  if (!segments.length || source == null || typeof source !== 'object') return source

  const root = Array.isArray(source) ? [...source] : { ...(source as Record<string | number, unknown>) }
  let cursor = root as Record<string | number, unknown>
  for (let index = 0; index < segments.length - 1; index += 1) {
    const segment = segments[index]!
    const current = cursor[segment]
    if (current == null || typeof current !== 'object') return root
    const next = Array.isArray(current) ? [...current] : { ...(current as Record<string | number, unknown>) }
    cursor[segment] = next
    cursor = next as Record<string | number, unknown>
  }

  const last = segments[segments.length - 1]!
  if (Array.isArray(cursor) && typeof last === 'number') cursor.splice(last, 1)
  else delete cursor[last]
  return root
}

export function isAppFormValueEmpty(value: unknown): boolean {
  return value == null || value === '' || (Array.isArray(value) && value.length === 0)
}

export function getAppFormErrorMessage(error: import('./types').AppFormErrorValue | undefined) {
  if (error && typeof error === 'object' && 'message' in error) return error.message
  return error
}

export function areAppFormValuesEqual(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) return true
  if (typeof left !== typeof right || left == null || right == null) return false
  if (left instanceof Date || right instanceof Date) {
    return left instanceof Date && right instanceof Date && left.getTime() === right.getTime()
  }
  if (Array.isArray(left) || Array.isArray(right)) {
    if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) return false
    return left.every((value, index) => areAppFormValuesEqual(value, right[index]))
  }
  if (typeof left !== 'object' || typeof right !== 'object') return false
  const leftPrototype = Object.getPrototypeOf(left)
  const rightPrototype = Object.getPrototypeOf(right)
  if (leftPrototype !== rightPrototype) return false
  if (leftPrototype !== Object.prototype && leftPrototype !== null) return false
  const leftRecord = left as Record<string, unknown>
  const rightRecord = right as Record<string, unknown>
  const keys = Object.keys(leftRecord)
  return keys.length === Object.keys(rightRecord).length && keys.every((key) => areAppFormValuesEqual(leftRecord[key], rightRecord[key]))
}

export function cloneAppFormValue<TValue>(value: TValue): TValue {
  if (value instanceof Date) return new Date(value.getTime()) as TValue
  if (Array.isArray(value)) return value.map((item) => cloneAppFormValue(item)) as TValue
  if (value && typeof value === 'object') {
    const prototype = Object.getPrototypeOf(value)
    if (prototype !== Object.prototype && prototype !== null) return value
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, cloneAppFormValue(item)])) as TValue
  }
  return value
}

export function buildAppFormDirtyValues<TValue>(source: TValue, dirtyPaths: Iterable<string>): Partial<TValue> {
  let result: unknown = {}
  for (const path of dirtyPaths) {
    result = setAppFormValue(result, path, cloneAppFormValue(getAppFormValue(source, path)))
  }
  return result as Partial<TValue>
}
