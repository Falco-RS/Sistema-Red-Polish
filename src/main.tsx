import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'
import { AuthProvider } from './common/AuthContext'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; 
import './i18next'; 
import { LoaderProvider } from './common/LoaderContext' // 👈 importar el nuevo contexto

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <LoaderProvider> {/* 👈 envolver aquí */}
          <App />
        </LoaderProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)