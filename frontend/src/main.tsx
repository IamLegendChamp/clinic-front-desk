import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@muibook/components/css/mui-reset.css'
import '@muibook/components/css/mui-tokens.css'
import '@muibook/components/css/mui-brand.css'
import '@muibook/components/css/mui-base.css'
import './index.css'
import App from './App.tsx'

// Set API base URL before any shared remote code runs (axios uses it at load time).
// In dev we always use same origin so Vite proxies /api to the backend (no CORS needed).
;(globalThis as unknown as { __CLINIC_API_BASE_URL__?: string }).__CLINIC_API_BASE_URL__ =
  import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL ?? '')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
