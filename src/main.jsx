import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './globals.css'
import { BrowserRouter } from 'react-router-dom'

// Helpful boot-time logs and global error handlers to surface runtime errors
console.log('[orderiq] booting app (main.jsx)')

window.addEventListener('error', (event) => {
  console.error('[orderiq] global error captured:', event.error || event.message, event)
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('[orderiq] unhandled promise rejection:', event.reason)
})

const rootEl = document.getElementById('root')
if (!rootEl) {
  console.error('[orderiq] root element not found: expected element with id="root" in index.html')
} else {
    try {
      ReactDOM.createRoot(rootEl).render(
        <React.StrictMode>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </React.StrictMode>,
      )
    } catch (err) {
      console.error('[orderiq] error while rendering App:', err)
    }
}
