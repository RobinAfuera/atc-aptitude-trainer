import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// B612 was designed for aircraft cockpit displays. Bundled, so the app makes
// no third-party requests and works offline once loaded.
import '@fontsource/b612/400.css'
import '@fontsource/b612/700.css'
import '@fontsource/b612-mono/700.css'
import './styles.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
