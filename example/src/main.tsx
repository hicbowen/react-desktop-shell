import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../../src/navigation/AppRail.css'
import '../../src/AppTitleBar.css'
import { ExampleApp } from './App'
import './styles/base.css'
import './styles/demo-page.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ExampleApp />
  </StrictMode>,
)
