import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'
import { describe, expect, it } from 'vitest'
import { zhCNInteractiveText } from './interactiveTranslations'
import { zhCNSectionText } from './sectionTranslations'

const translatedPropertyNames = new Set([
  'aria-label',
  'ariaLabel',
  'cancelText',
  'confirmText',
  'content',
  'description',
  'dismissLabel',
  'emptyContent',
  'emptyText',
  'error',
  'label',
  'message',
  'menuAriaLabel',
  'placeholder',
  'rejectDescription',
  'secondaryText',
  'tertiaryText',
  'title',
])

function getPageFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name)
    if (entry.isDirectory()) return getPageFiles(target)
    return entry.name.endsWith('.tsx') ? [target] : []
  })
}

function hasEnglish(text: string) {
  return /[A-Za-z]/.test(text)
}

function collectVisibleCopy(file: string) {
  const source = ts.createSourceFile(
    file,
    fs.readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  )
  const values: string[] = []

  function visit(node: ts.Node) {
    if (ts.isJsxText(node)) {
      const value = node.text.replace(/\s+/g, ' ').trim()
      if (value && hasEnglish(value)) values.push(value)
    }

    if (
      ts.isJsxAttribute(node) &&
      node.initializer &&
      ts.isStringLiteral(node.initializer)
    ) {
      const propertyName = node.name.getText(source)
      const tag = node.parent.parent.tagName.getText(source)
      const sectionCopy =
        tag === 'DemoSection' &&
        (propertyName === 'title' || propertyName === 'description')
      if (
        translatedPropertyNames.has(propertyName) &&
        !sectionCopy &&
        hasEnglish(node.initializer.text)
      ) {
        values.push(node.initializer.text)
      }
    }

    if (ts.isPropertyAssignment(node)) {
      const propertyName = node.name.getText(source).replace(/['"]/g, '')
      if (
        translatedPropertyNames.has(propertyName) &&
        ts.isStringLiteralLike(node.initializer) &&
        hasEnglish(node.initializer.text)
      ) {
        values.push(node.initializer.text)
      }
    }

    ts.forEachChild(node, visit)
  }

  visit(source)
  return values
}

describe('visible example copy translations', () => {
  it('has Chinese copy for static visible English outside section headings', () => {
    const pagesDirectory = path.resolve('example/src/pages')
    const visibleCopy = getPageFiles(pagesDirectory).flatMap(collectVisibleCopy)
    const missing = [...new Set(visibleCopy.filter(
      (text) =>
        !zhCNInteractiveText[text] &&
        !zhCNSectionText[text],
    ))]

    expect(missing).toEqual([])
  })

  it('has Chinese copy for literal keys passed to the demo translator', () => {
    const pagesDirectory = path.resolve('example/src/pages')
    const keys = getPageFiles(pagesDirectory).flatMap((file) => {
      const source = ts.createSourceFile(
        file,
        fs.readFileSync(file, 'utf8'),
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX,
      )
      const values: string[] = []

      function visit(node: ts.Node) {
        if (
          ts.isCallExpression(node) &&
          ts.isIdentifier(node.expression) &&
          node.expression.text === 't' &&
          node.arguments[0] &&
          ts.isStringLiteralLike(node.arguments[0])
        ) {
          values.push(node.arguments[0].text)
        }
        ts.forEachChild(node, visit)
      }

      visit(source)
      return values
    })
    const missing = [...new Set(keys.filter(
      (key) => !zhCNInteractiveText[key] && !zhCNSectionText[key],
    ))]

    expect(missing).toEqual([])
  })

  it('has Chinese copy for human-readable values stored in demo state', () => {
    const pagesDirectory = path.resolve('example/src/pages')
    const values = getPageFiles(pagesDirectory).flatMap((file) => {
      const source = ts.createSourceFile(
        file,
        fs.readFileSync(file, 'utf8'),
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX,
      )
      const stateValues: string[] = []

      function collectStrings(node: ts.Node) {
        if (
          ts.isStringLiteralLike(node) &&
          (/\s/.test(node.text) || /^[A-Z]/.test(node.text))
        ) {
          stateValues.push(node.text)
        }
        ts.forEachChild(node, collectStrings)
      }

      function visit(node: ts.Node) {
        if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
          const callName = node.expression.text
          if (callName === 'useState' || /^set[A-Z]/.test(callName)) {
            node.arguments.forEach(collectStrings)
          }
        }
        ts.forEachChild(node, visit)
      }

      visit(source)
      return stateValues
    })
    const missing = [...new Set(values.filter(
      (value) => !zhCNInteractiveText[value] && !zhCNSectionText[value],
    ))]

    expect(missing).toEqual([])
  })
})
