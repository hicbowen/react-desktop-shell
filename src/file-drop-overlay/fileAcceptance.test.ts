// @vitest-environment jsdom

import { describe, expect, it } from 'vitest'
import {
  filterAcceptedFiles,
  isFileAccepted,
  previewFileDrag,
  validateDroppedFiles,
} from './fileAcceptance'

function transfer(...items: DataTransferItem[]) {
  return { items, types: ['Files'] } as unknown as DataTransfer
}

function item(type: string) {
  return { kind: 'file', type } as DataTransferItem
}

describe('file acceptance', () => {
  it('accepts every file when no rules are provided', () => {
    expect(isFileAccepted(new File(['a'], 'report.bin'))).toBe(true)
    expect(isFileAccepted(new File(['a'], 'report.bin'), [])).toBe(true)
  })

  it('matches extensions without case sensitivity', () => {
    expect(isFileAccepted(new File(['a'], 'REPORT.XLSX'), ['.xlsx'])).toBe(true)
    expect(isFileAccepted(new File(['a'], 'report.csv'), ['.xlsx'])).toBe(false)
  })

  it('matches exact MIME types', () => {
    const pdf = new File(['a'], 'report', { type: 'application/pdf' })
    expect(isFileAccepted(pdf, ['application/pdf'])).toBe(true)
    expect(isFileAccepted(pdf, ['text/csv'])).toBe(false)
  })

  it('matches wildcard MIME groups', () => {
    const image = new File(['a'], 'photo.bin', { type: 'image/png' })
    expect(isFileAccepted(image, ['image/*'])).toBe(true)
    expect(isFileAccepted(image, ['video/*'])).toBe(false)
  })

  it('filters files using all supported rule forms', () => {
    const files = [
      new File(['a'], 'data.CSV', { type: 'text/plain' }),
      new File(['a'], 'photo.png', { type: 'image/png' }),
      new File(['a'], 'report', { type: 'application/pdf' }),
      new File(['a'], 'archive.zip', { type: 'application/zip' }),
    ]
    expect(
      filterAcceptedFiles(files, ['.csv', 'image/*', 'application/pdf']),
    ).toEqual(files.slice(0, 3))
  })

  it('previews only reliable item MIME metadata', () => {
    expect(previewFileDrag(transfer(item('image/png')), ['image/*'], true)).toEqual(
      { state: 'accept' },
    )
    expect(
      previewFileDrag(transfer(item('application/pdf')), ['image/*'], true),
    ).toEqual({ state: 'reject', reason: 'type' })
    expect(previewFileDrag(transfer(item('text/csv')), ['.csv'], true)).toEqual(
      { state: 'pending' },
    )
    expect(previewFileDrag(transfer(item('')), ['image/*'], true)).toEqual({
      state: 'pending',
    })
  })

  it('keeps a transfer without inspectable items pending', () => {
    expect(previewFileDrag(transfer(), undefined, true)).toEqual({
      state: 'pending',
    })
  })

  it('previews an explicit multiple-file rejection', () => {
    expect(
      previewFileDrag(
        transfer(item('text/csv'), item('text/csv')),
        undefined,
        false,
      ),
    ).toEqual({ state: 'reject', reason: 'multiple' })
  })

  it('validates the complete dropped batch', () => {
    const csv = new File(['a'], 'DATA.CSV', { type: 'text/plain' })
    const text = new File(['b'], 'notes.txt', { type: 'text/plain' })
    expect(validateDroppedFiles([csv], ['.csv'], false)).toEqual({
      accepted: true,
      files: [csv],
    })
    expect(validateDroppedFiles([text], ['.csv'], true)).toEqual({
      accepted: false,
      files: [text],
      reason: 'type',
    })
    expect(validateDroppedFiles([csv, text], undefined, false)).toEqual({
      accepted: false,
      files: [csv, text],
      reason: 'multiple',
    })
  })
})
