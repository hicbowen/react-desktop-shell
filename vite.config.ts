import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        'antd/index': resolve(__dirname, 'src/antd/index.ts'),
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
        id === 'antd' ||
        id.startsWith('antd/'),
    },
  },
  plugins: [react()],
})
