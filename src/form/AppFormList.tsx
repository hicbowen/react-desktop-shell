import { useAppFormContext, useAppFormSelector } from './AppForm'
import { getAppFormPath, getAppFormValue } from './path'
import type { AppFormListProps } from './types'

const EMPTY_LIST: readonly unknown[] = []

export function AppFormList<TItem = unknown>({ children, name }: AppFormListProps<TItem>) {
  const form = useAppFormContext()
  const path = getAppFormPath(name)
  useAppFormSelector(form, (state) => {
    const value = getAppFormValue<unknown[]>(state.values, path)
    return value ?? EMPTY_LIST
  })
  const fields = form.getListFields(name)
  return children({
    fields,
    append: (value) => form.appendListItem(name, value),
    insert: (index, value) => form.insertListItem(name, index, value),
    remove: (index) => form.removeListItem(name, index),
    move: (from, to) => form.moveListItem(name, from, to),
  })
}
