import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../../src/AppRail.css'
import '../../src/AppTitleBar.css'
import { ExampleApp } from './App'
import './style.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ExampleApp />
  </StrictMode>,
)
