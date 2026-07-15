// @vitest-environment jsdom

import { describe, expect, it } from 'vitest'
import { filterAcceptedFiles, isFileAccepted } from './fileAcceptance'

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
})
