import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { QueryProvider } from './providers/QueryProvider'
import App from './App.tsx'
import './assets/styles/index.css'

// Inicializar sistema de monitoramento de performance
import './utils/performanceInitializer'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryProvider>
    <AuthProvider>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <App />
      </BrowserRouter>
    </AuthProvider>
  </QueryProvider>,
)