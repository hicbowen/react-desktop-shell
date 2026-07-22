import { useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react'
import { AppButton } from '../button'
import { AppPopover } from '../popover'
import { AppTextBox } from '../text-input'
import { useAppLocale } from '../localization/useAppLocale'
import { hexToHsv, hsvToHex, normalizeHexColor } from './colorMath'
import type { AppColorPickerPanelProps, AppColorPickerProps } from './types'
import './AppColorPicker.css'

const defaultPresets = ['#D13438', '#C239B3', '#8764B8', '#0078D4', '#038387', '#107C10', '#F7630C', '#8A8886']

export function AppColorPickerPanel({ value, defaultValue = '#0078D4', onValueChange, presets = defaultPresets, allowClear = false, disabled = false, className, style }: AppColorPickerPanelProps) {
  const { messages } = useAppLocale()
  const text = messages.colorPicker
  const controlled = value !== undefined
  const [internalValue, setInternalValue] = useState<string | null>(() => defaultValue ? normalizeHexColor(defaultValue) : null)
  const resolved = value === null ? null : normalizeHexColor(value ?? internalValue ?? '')
  const parsedHsv = hexToHsv(resolved ?? '#000000')
  const [interaction, setInteraction] = useState({ source: resolved, hsv: parsedHsv })
  const hsv = interaction.source === resolved ? interaction.hsv : parsedHsv
  const hue = hsv.h
  const [draftState, setDraftState] = useState({ source: resolved, text: resolved ?? '' })
  const draft = draftState.source === resolved ? draftState.text : resolved ?? ''

  const update = (next: string | null) => {
    if (!controlled) setInternalValue(next)
    onValueChange?.(next)
  }
  const updateHsv = (s: number, v: number, nextHue = hue) => {
    const nextHsv = { h: nextHue, s, v }
    const next = hsvToHex(nextHsv)
    setInteraction({ source: next, hsv: nextHsv })
    update(next)
  }
  const pickFromPointer = (event: PointerEvent<HTMLDivElement>) => {
    if (disabled) return
    const rect = event.currentTarget.getBoundingClientRect()
    if (!rect.width || !rect.height) return
    updateHsv(Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)), Math.min(1, Math.max(0, 1 - (event.clientY - rect.top) / rect.height)))
  }
  const handlePadKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? .1 : .01
    let s = hsv.s, v = hsv.v
    if (event.key === 'ArrowLeft') s -= step
    else if (event.key === 'ArrowRight') s += step
    else if (event.key === 'ArrowDown') v -= step
    else if (event.key === 'ArrowUp') v += step
    else return
    event.preventDefault()
    updateHsv(Math.min(1, Math.max(0, s)), Math.min(1, Math.max(0, v)))
  }
  const commitDraft = () => { const normalized = normalizeHexColor(draft); if (normalized) update(normalized); setDraftState({ source: normalized ?? resolved, text: normalized ?? resolved ?? '' }) }

  return <div className={['app-color-picker-panel', className].filter(Boolean).join(' ')} style={style}>
    <div aria-label={text.saturationValue} aria-valuetext={resolved ?? text.noColor} className="app-color-picker-panel__sv" onKeyDown={handlePadKeyDown} onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); pickFromPointer(event) }} onPointerMove={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) pickFromPointer(event) }} role="slider" style={{ '--app-color-picker-hue': `hsl(${hue} 100% 50%)` } as CSSProperties} tabIndex={disabled ? -1 : 0}><span className="app-color-picker-panel__thumb" style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%` }} /></div>
    <label className="app-color-picker-panel__hue"><span>{text.hue}</span><input aria-label={text.hue} disabled={disabled} max="359" min="0" onChange={(event) => updateHsv(hsv.s, hsv.v, Number(event.currentTarget.value))} type="range" value={Math.round(hue)} /></label>
    <div className="app-color-picker-panel__value"><span aria-hidden="true" className="app-color-picker-panel__preview" style={{ background: resolved ?? 'transparent' }} /><AppTextBox aria-label={text.hex} disabled={disabled} onBlur={commitDraft} onChange={(event) => setDraftState({ source: resolved, text: event.currentTarget.value })} onKeyDown={(event) => { if (event.key === 'Enter') commitDraft() }} size="compact" value={draft} /></div>
    <div aria-label={text.presets} className="app-color-picker-panel__presets" role="group">{presets.map((preset) => { const normalized = normalizeHexColor(preset); return normalized ? <button aria-label={normalized} aria-pressed={normalized === resolved} disabled={disabled} key={normalized} onClick={() => update(normalized)} style={{ background: normalized }} type="button" /> : null })}</div>
    {allowClear ? <AppButton disabled={disabled || resolved === null} onClick={() => update(null)} size="compact">{text.clear}</AppButton> : null}
  </div>
}

export function AppColorPicker({ open, defaultOpen, onOpenChange, placement, label, ...panelProps }: AppColorPickerProps) {
  const { messages } = useAppLocale()
  const resolved = panelProps.value === null ? null : normalizeHexColor(panelProps.value ?? panelProps.defaultValue ?? '#0078D4')
  return <AppPopover ariaLabel={label ?? messages.colorPicker.label} defaultOpen={defaultOpen} onOpenChange={onOpenChange} open={open} placement={placement} trigger={<button aria-label={label ?? messages.colorPicker.label} className="app-color-picker__trigger" disabled={panelProps.disabled} type="button"><span className="app-color-picker__swatch" style={{ background: resolved ?? 'transparent' }} /><span>{resolved ?? messages.colorPicker.noColor}</span></button>}><AppColorPickerPanel {...panelProps} /></AppPopover>
}
