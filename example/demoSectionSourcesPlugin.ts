import { readFileSync, readdirSync } from 'node:fs'
import { relative, resolve, sep } from 'node:path'
import { format } from 'prettier'
import { createHighlighter } from 'shiki'
import ts from 'typescript'
import type { Plugin } from 'vite'

const virtualModuleId = 'virtual:demo-section-sources'
const resolvedVirtualModuleId = `\0${virtualModuleId}`

interface DemoSectionSourceEntry {
  path: string
  sections: Array<{
    source: string
    highlightedHtml: string
  }>
}

let highlighterPromise:
  | ReturnType<typeof createHighlighter>
  | undefined

function getHighlighter() {
  highlighterPromise ??= createHighlighter({
    langs: ['tsx'],
    themes: ['light-plus', 'dark-plus'],
  })
  return highlighterPromise
}

function isNamedJsxElement(
  node: ts.Node,
  sourceFile: ts.SourceFile,
  name: string,
): node is ts.JsxElement {
  return (
    ts.isJsxElement(node) &&
    node.openingElement.tagName.getText(sourceFile) === name
  )
}

function meaningfulChildren(children: readonly ts.JsxChild[]) {
  return children.filter(
    (child) => !ts.isJsxText(child) || child.text.trim().length > 0,
  )
}

function unwrapPreview(
  child: ts.JsxChild,
  sourceFile: ts.SourceFile,
): ts.JsxChild[] {
  return isNamedJsxElement(child, sourceFile, 'DemoPreview')
    ? meaningfulChildren(child.children)
    : [child]
}

function indent(source: string) {
  return source
    .split('\n')
    .map((line) => `  ${line}`)
    .join('\n')
}

function collectBindingNames(name: ts.BindingName): string[] {
  if (ts.isIdentifier(name)) return [name.text]

  return name.elements.flatMap((element) =>
    ts.isOmittedExpression(element) ? [] : collectBindingNames(element.name),
  )
}

function collectLocalVariableStatements(declaration: ts.FunctionDeclaration) {
  const statements =
    declaration.body?.statements.filter(ts.isVariableStatement) ?? []
  const statementsByName = new Map<string, ts.VariableStatement>()

  for (const statement of statements) {
    for (const variable of statement.declarationList.declarations) {
      for (const name of collectBindingNames(variable.name)) {
        statementsByName.set(name, statement)
      }
    }
  }

  return { statements, statementsByName }
}

function collectReferencedVariableStatements(
  nodes: readonly ts.Node[],
  statements: readonly ts.VariableStatement[],
  statementsByName: ReadonlyMap<string, ts.VariableStatement>,
) {
  const referenced = new Set<ts.VariableStatement>()

  const visit = (node: ts.Node) => {
    if (
      ts.isJsxExpression(node) &&
      node.expression &&
      ts.isIdentifier(node.expression)
    ) {
      const statement = statementsByName.get(node.expression.text)
      if (statement) referenced.add(statement)
    }
    ts.forEachChild(node, visit)
  }

  nodes.forEach(visit)
  return statements.filter((statement) => referenced.has(statement))
}

function printSectionSource(
  section: ts.JsxElement,
  sourceFile: ts.SourceFile,
  printer: ts.Printer,
  localStatements: readonly ts.VariableStatement[],
  localStatementsByName: ReadonlyMap<string, ts.VariableStatement>,
) {
  const nodes = meaningfulChildren(section.children).flatMap((child) =>
    unwrapPreview(child, sourceFile),
  )
  const printed = nodes
    .map((node) =>
      printer.printNode(ts.EmitHint.Unspecified, node, sourceFile).trim(),
    )
    .filter(Boolean)

  if (printed.length === 0) return ''

  const jsxSource =
    printed.length === 1
      ? (printed[0] ?? '')
      : `<>\n${indent(printed.join('\n'))}\n</>`
  const declarationSource = collectReferencedVariableStatements(
    nodes,
    localStatements,
    localStatementsByName,
  ).map((statement) =>
    printer.printNode(ts.EmitHint.Unspecified, statement, sourceFile).trim(),
  )

  return declarationSource.length
    ? `${declarationSource.join('\n')}\n\n${jsxSource}`
    : jsxSource
}

async function collectFunctionSections(
  declaration: ts.FunctionDeclaration,
  sourceFile: ts.SourceFile,
  printer: ts.Printer,
) {
  const sections: string[] = []
  const { statements, statementsByName } =
    collectLocalVariableStatements(declaration)

  const visit = (node: ts.Node) => {
    if (isNamedJsxElement(node, sourceFile, 'DemoSection')) {
      const source = printSectionSource(
        node,
        sourceFile,
        printer,
        statements,
        statementsByName,
      )
      if (source) sections.push(source)
      return
    }
    ts.forEachChild(node, visit)
  }

  if (declaration.body) visit(declaration.body)
  const highlighter = await getHighlighter()
  return Promise.all(
    sections.map(async (source) => {
      const formatted = await format(source, {
        parser: 'typescript',
        printWidth: 88,
        semi: false,
        singleQuote: true,
        trailingComma: 'all',
      })
      const resolvedSource = formatted.trim().replace(/^;/, '')
      return {
        source: resolvedSource,
        highlightedHtml: highlighter.codeToHtml(resolvedSource, {
          lang: 'tsx',
          themes: {
            light: 'light-plus',
            dark: 'dark-plus',
          },
        }),
      }
    }),
  )
}

function collectPageFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name)
    if (entry.isDirectory()) return collectPageFiles(path)
    return entry.isFile() && entry.name.endsWith('.tsx') ? [path] : []
  })
}

async function collectDemoSectionSources(pageRoot: string) {
  const entries: Record<string, DemoSectionSourceEntry> = {}
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed })

  for (const file of collectPageFiles(pageRoot)) {
    const sourceText = readFileSync(file, 'utf8')
    const sourceFile = ts.createSourceFile(
      file,
      sourceText,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    )
    const displayPath = `example/src/pages/${relative(pageRoot, file)
      .split(sep)
      .join('/')}`

    for (const statement of sourceFile.statements) {
      if (!ts.isFunctionDeclaration(statement) || !statement.name) continue
      const sections = await collectFunctionSections(
        statement,
        sourceFile,
        printer,
      )
      if (sections.length) {
        entries[statement.name.text] = { path: displayPath, sections }
      }
    }
  }

  return entries
}

export function demoSectionSourcesPlugin(): Plugin {
  const pageRoot = resolve(process.cwd(), 'example/src/pages')

  return {
    name: 'demo-section-sources',
    resolveId(id) {
      return id === virtualModuleId ? resolvedVirtualModuleId : undefined
    },
    async load(id) {
      if (id !== resolvedVirtualModuleId) return undefined
      const files = collectPageFiles(pageRoot)
      for (const file of files) this.addWatchFile(file)
      const entries = await collectDemoSectionSources(pageRoot)
      return `export default ${JSON.stringify(entries)}`
    },
    handleHotUpdate(context) {
      if (!resolve(context.file).startsWith(pageRoot)) return
      const module =
        context.server.moduleGraph.getModuleById(resolvedVirtualModuleId)
      if (!module) return
      context.server.moduleGraph.invalidateModule(module)
      return [module]
    },
  }
}
