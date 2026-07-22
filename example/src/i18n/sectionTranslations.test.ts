import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'
import { describe, expect, it } from 'vitest'
import { zhCNSectionText } from './sectionTranslations'

function getPageFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name)
    if (entry.isDirectory()) return getPageFiles(target)
    return entry.name.endsWith('.tsx') ? [target] : []
  })
}

function getStaticSectionText(file: string) {
  const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const values: string[] = []
  function visit(node: ts.Node) {
    if (ts.isJsxOpeningElement(node) && node.tagName.getText(source) === 'DemoSection') {
      for (const attribute of node.attributes.properties) {
        if (!ts.isJsxAttribute(attribute) || !attribute.initializer || !ts.isStringLiteral(attribute.initializer)) continue
        if (attribute.name.getText(source) === 'title' || attribute.name.getText(source) === 'description') values.push(attribute.initializer.text)
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(source)
  return values
}

describe('section translations', () => {
  it('has a Chinese translation for every static DemoSection title and description', () => {
    const pagesDirectory = path.resolve('example/src/pages')
    const sourceText = getPageFiles(pagesDirectory).flatMap(getStaticSectionText)
    const missing = [...new Set(sourceText.filter((text) => !zhCNSectionText[text]))]
    expect(missing).toEqual([])
  })
})
