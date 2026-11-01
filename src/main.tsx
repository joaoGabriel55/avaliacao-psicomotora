import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { aplicarTemaSalvo } from './lib/tema'
import { definirIdiomaInicial } from './i18n'

aplicarTemaSalvo()
definirIdiomaInicial()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
