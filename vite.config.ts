import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { demoSectionSourcesPlugin } from './example/demoSectionSourcesPlugin.ts'

const projectRoot = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(projectRoot, 'src/index.ts'),
        'data/index': resolve(projectRoot, 'src/data/index.ts'),
      },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.js`,
      cssFileName: 'style',
    },
    rollupOptions: {
      external: (id) =>
        id === 'react' ||
        id === 'react-dom' ||
        id === 'react/jsx-runtime' ||
        id === '@tanstack/react-table' ||
        id.startsWith('@tanstack/react-table/'),
    },
  },
  plugins: [demoSectionSourcesPlugin(), react()],
})
