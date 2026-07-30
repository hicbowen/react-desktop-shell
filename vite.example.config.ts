import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import packageJson from './package.json' with { type: 'json' }
import { demoSectionSourcesPlugin } from './example/demoSectionSourcesPlugin'

export default defineConfig({
  root: 'example',
  plugins: [demoSectionSourcesPlugin(), react()],
  define: { __APP_VERSION__: JSON.stringify(packageJson.version) },
})
