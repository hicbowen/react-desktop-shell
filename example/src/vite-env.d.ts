/// <reference types="vite/client" />
declare const __APP_VERSION__: string

declare module 'virtual:demo-section-sources' {
  const sources: Record<
    string,
    {
      path: string
      sections: Array<{
        source: string
        highlightedHtml: string
      }>
    }
  >
  export default sources
}
