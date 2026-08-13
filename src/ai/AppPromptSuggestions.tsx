import { useAppLocale } from '../localization/useAppLocale'
import type { AppPromptSuggestion, AppPromptSuggestionsProps } from './types'
import './AppPromptSuggestions.css'

export function AppPromptSuggestions({
  ariaLabel,
  className,
  columns,
  disabled = false,
  items,
  onSelect,
  size = 'standard',
  style,
  ...rest
}: AppPromptSuggestionsProps) {
  const { messages } = useAppLocale()
  const classes = [
    'app-prompt-suggestions',
    `app-prompt-suggestions--${size}`,
    columns != null ? `app-prompt-suggestions--columns-${columns}` : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      {...rest}
      aria-label={ariaLabel ?? messages.ai.suggestions}
      className={classes}
      role="list"
      style={style}
    >
      {items.map((item) => (
        <div key={item.id} role="listitem">
          <button
            aria-describedby={
              item.description
                ? `prompt-suggestion-${item.id}-description`
                : undefined
            }
            className="app-prompt-suggestions__item"
            data-suggestion-id={item.id}
            disabled={disabled || item.disabled}
            onClick={() => onSelect(item)}
            type="button"
          >
            {item.icon ? (
              <span aria-hidden="true" className="app-prompt-suggestions__icon">
                {item.icon}
              </span>
            ) : null}
            <span className="app-prompt-suggestions__copy">
              <span className="app-prompt-suggestions__label">
                {item.label}
              </span>
              {item.description ? (
                <span
                  className="app-prompt-suggestions__description"
                  id={`prompt-suggestion-${item.id}-description`}
                >
                  {item.description}
                </span>
              ) : null}
            </span>
          </button>
        </div>
      ))}
    </div>
  )
}

export type { AppPromptSuggestion, AppPromptSuggestionsProps }
