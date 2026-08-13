import type {
  HighlighterCore,
  LanguageRegistration,
  ThemeRegistration,
} from 'shiki/core'

const LANGUAGE_LOADERS = {
  bash: () => import('@shikijs/langs/bash'),
  c: () => import('@shikijs/langs/c'),
  cpp: () => import('@shikijs/langs/cpp'),
  csharp: () => import('@shikijs/langs/csharp'),
  css: () => import('@shikijs/langs/css'),
  dart: () => import('@shikijs/langs/dart'),
  dockerfile: () => import('@shikijs/langs/dockerfile'),
  go: () => import('@shikijs/langs/go'),
  graphql: () => import('@shikijs/langs/graphql'),
  html: () => import('@shikijs/langs/html'),
  java: () => import('@shikijs/langs/java'),
  javascript: () => import('@shikijs/langs/javascript'),
  json: () => import('@shikijs/langs/json'),
  jsonc: () => import('@shikijs/langs/jsonc'),
  jsx: () => import('@shikijs/langs/jsx'),
  kotlin: () => import('@shikijs/langs/kotlin'),
  lua: () => import('@shikijs/langs/lua'),
  markdown: () => import('@shikijs/langs/markdown'),
  php: () => import('@shikijs/langs/php'),
  powershell: () => import('@shikijs/langs/powershell'),
  python: () => import('@shikijs/langs/python'),
  ruby: () => import('@shikijs/langs/ruby'),
  rust: () => import('@shikijs/langs/rust'),
  scss: () => import('@shikijs/langs/scss'),
  sql: () => import('@shikijs/langs/sql'),
  swift: () => import('@shikijs/langs/swift'),
  toml: () => import('@shikijs/langs/toml'),
  tsx: () => import('@shikijs/langs/tsx'),
  typescript: () => import('@shikijs/langs/typescript'),
  vue: () => import('@shikijs/langs/vue'),
  xml: () => import('@shikijs/langs/xml'),
  yaml: () => import('@shikijs/langs/yaml'),
  zsh: () => import('@shikijs/langs/zsh'),
} as const

type MarkdownLanguage = keyof typeof LANGUAGE_LOADERS

const LANGUAGE_ALIASES: Record<string, MarkdownLanguage> = {
  bash: 'bash',
  c: 'c',
  'c#': 'csharp',
  'c++': 'cpp',
  cpp: 'cpp',
  cs: 'csharp',
  csharp: 'csharp',
  css: 'css',
  dart: 'dart',
  docker: 'dockerfile',
  dockerfile: 'dockerfile',
  go: 'go',
  gql: 'graphql',
  graphql: 'graphql',
  html: 'html',
  java: 'java',
  javascript: 'javascript',
  js: 'javascript',
  json: 'json',
  jsonc: 'jsonc',
  jsx: 'jsx',
  kt: 'kotlin',
  kotlin: 'kotlin',
  kts: 'kotlin',
  lua: 'lua',
  markdown: 'markdown',
  md: 'markdown',
  php: 'php',
  py: 'python',
  powershell: 'powershell',
  ps: 'powershell',
  ps1: 'powershell',
  pwsh: 'powershell',
  python: 'python',
  rb: 'ruby',
  ruby: 'ruby',
  rs: 'rust',
  rust: 'rust',
  scss: 'scss',
  sql: 'sql',
  sh: 'bash',
  shell: 'bash',
  swift: 'swift',
  ts: 'typescript',
  tsx: 'tsx',
  typescript: 'typescript',
  toml: 'toml',
  vue: 'vue',
  xml: 'xml',
  yaml: 'yaml',
  yml: 'yaml',
  zsh: 'zsh',
}

const highlightedCodeCache = new Map<string, string | null>()
const languageLoadPromises = new Map<string, Promise<void>>()
let highlighterPromise: Promise<HighlighterCore> | undefined

async function loadLanguageRegistration(
  language: MarkdownLanguage,
): Promise<LanguageRegistration[]> {
  const module = await LANGUAGE_LOADERS[language]()
  return module.default
}

function getHighlighter() {
  highlighterPromise ??= Promise.all([
    import('shiki/core'),
    import('shiki/engine/javascript'),
    import('@shikijs/themes/light-plus'),
    import('@shikijs/themes/dark-plus'),
  ]).then(
    ([{ createHighlighterCore }, { createJavaScriptRegexEngine }, light, dark]) =>
      createHighlighterCore({
        engine: createJavaScriptRegexEngine(),
        langs: [],
        themes: [
          light.default as ThemeRegistration,
          dark.default as ThemeRegistration,
        ],
      }),
  )
  return highlighterPromise
}

async function ensureLanguage(
  highlighter: HighlighterCore,
  language: MarkdownLanguage,
) {
  if (highlighter.getLoadedLanguages().includes(language)) return

  let loadPromise = languageLoadPromises.get(language)
  if (!loadPromise) {
    loadPromise = loadLanguageRegistration(language).then((registrations) =>
      highlighter.loadLanguage(...registrations),
    )
    languageLoadPromises.set(language, loadPromise)
  }
  await loadPromise
}

export function resolveMarkdownLanguage(
  language: string | undefined,
): MarkdownLanguage | undefined {
  const normalized = language?.trim().toLowerCase()
  if (!normalized) return undefined
  return LANGUAGE_ALIASES[normalized]
}

export async function highlightMarkdownCode(
  code: string,
  language: MarkdownLanguage,
): Promise<string | null> {
  const cacheKey = `${language}\u0000${code}`
  if (highlightedCodeCache.has(cacheKey)) {
    return highlightedCodeCache.get(cacheKey) ?? null
  }

  try {
    const highlighter = await getHighlighter()
    await ensureLanguage(highlighter, language)
    const highlighted = highlighter.codeToHtml(code, {
      lang: language,
      themes: {
        light: 'light-plus',
        dark: 'dark-plus',
      },
      defaultColor: false,
      rootStyle: false,
      cssVariablePrefix: '--app-ai-markdown-shiki-',
    })
    highlightedCodeCache.set(cacheKey, highlighted)
    return highlighted
  } catch {
    highlightedCodeCache.set(cacheKey, null)
    return null
  }
}
