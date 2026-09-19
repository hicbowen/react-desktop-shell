import { useMemo, useRef, useState, type KeyboardEvent } from 'react'
import {
  executeAppCommand,
  formatAppShortcut,
  useOptionalAppCommands,
} from '../command'
import { useAppLocale } from '../localization/useAppLocale'
import { AppSpotlightSurface } from '../spotlight-surface'
import type { AppCommandPaletteProps } from './types'
import './AppCommandPalette.css'

function matches(value: string, query: string) {
  let at = 0
  const text = value.toLocaleLowerCase()
  for (const char of query.toLocaleLowerCase()) {
    at = text.indexOf(char, at)
    if (at < 0) return false
    at++
  }
  return true
}

function formatCommandError(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}

export function AppCommandPalette({
  ariaLabel,
  commands,
  emptyText,
  maxResults = 12,
  onOpenChange,
  open,
  placeholder,
}: AppCommandPaletteProps) {
  const { messages } = useAppLocale()
  const commandApi = useOptionalAppCommands()
  const resolvedCommands = useMemo(
    () => commands ?? commandApi?.commands ?? [],
    [commandApi?.commands, commands],
  )
  const text = messages.commandPalette
  const resolvedLabel = ariaLabel ?? text.label
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const results = useMemo(
    () =>
      resolvedCommands
        .filter(
          (command) =>
            !command.hidden &&
            matches(
              `${typeof command.label === 'string' ? command.label : command.id} ${command.id} ${command.description ?? ''} ${command.group ?? ''} ${(command.keywords ?? []).join(' ')}`,
              query,
            ),
        )
        .slice(0, maxResults),
    [maxResults, query, resolvedCommands],
  )

  const run = (index: number) => {
    const command = results[index]
    if (!command || command.disabled || commandApi?.isPending(command.id)) return
    if (commandApi?.get(command.id)) {
      commandApi.execute(command.id, { source: 'palette' })
    } else {
      executeAppCommand(command, { source: 'palette' })
    }
    setQuery('')
    onOpenChange(false)
  }
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive((value) => (results.length ? (value + 1) % results.length : 0))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((value) =>
        results.length ? (value - 1 + results.length) % results.length : 0,
      )
    } else if (event.key === 'Enter') {
      event.preventDefault()
      run(active)
    }
  }

  return (
    <AppSpotlightSurface
      ariaLabel={resolvedLabel}
      className="app-command-palette"
      initialFocusRef={inputRef}
      onOpenChange={onOpenChange}
      open={open}
      topOffset="min(18vh, 140px)"
      width={560}
    >
      <div onKeyDown={handleKeyDown}>
        <input
          aria-label={resolvedLabel}
          className="app-command-palette__input"
          onChange={(event) => {
            setQuery(event.target.value)
            setActive(0)
          }}
          placeholder={placeholder ?? text.placeholder}
          ref={inputRef}
          value={query}
        />
        <div className="app-command-palette__results" role="listbox">
          {results.length ? (
            results.map((command, index) => (
              <button
                aria-selected={active === index}
                className="app-command-palette__result"
                data-group={command.group}
                disabled={command.disabled || commandApi?.isPending(command.id)}
                key={command.id}
                onClick={() => run(index)}
                onMouseEnter={() => setActive(index)}
                role="option"
                type="button"
              >
                <span className="app-command-palette__icon">
                  {command.icon}
                </span>
                <span className="app-command-palette__text">
                  <span>{command.label}</span>
                  {command.group ? (
                    <small className="app-command-palette__group">
                      {command.group}
                    </small>
                  ) : null}
                  {command.description ? (
                    <small>{command.description}</small>
                  ) : null}
                  {commandApi?.getError(command.id) !== undefined ? (
                    <small className="app-command-palette__error" role="alert">
                      {formatCommandError(commandApi?.getError(command.id))}
                    </small>
                  ) : null}
                </span>
                {command.shortcut ? (
                  <kbd>{formatAppShortcut(command.shortcut)}</kbd>
                ) : null}
              </button>
            ))
          ) : (
            <div className="app-command-palette__empty">
              {emptyText ?? text.empty}
            </div>
          )}
        </div>
      </div>
    </AppSpotlightSurface>
  )
}
