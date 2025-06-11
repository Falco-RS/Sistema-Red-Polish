// src/context/AuthContext.tsx
import { createContext, useContext, useState } from 'react'
import i18next from 'i18next';

interface AuthContextType {
  user: any
  idTrans: number | null
  token: string | null
  login: (userData: any, token: string) => void
  logout: () => void
  setIdTrans: (id: number | null) => void
  isCompra: boolean | null
  setIsCompra: (value: boolean | null) => void
  language: string
  setLanguage: (lang: string) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(() => {
    const storedUser = localStorage.getItem('user')
    return storedUser ? JSON.parse(storedUser) : null
  })

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token')
  })

  const [language, setLanguageState] = useState<string>(() => {
    return localStorage.getItem('language') || 'es'
  })

  const setLanguage = (lang: string) => {
    setLanguageState(lang)
    localStorage.setItem('language', lang)
    i18next.changeLanguage(lang) 
  }


  const [idTrans, setIdTransState] = useState<number | null>(() => {
    const stored = localStorage.getItem('idTrans')
    return stored ? Number(stored) : null
  })

  const [isCompra, setIsCompraState] = useState<boolean | null>(() => {
    const stored = localStorage.getItem('isCompra')
    return stored === 'true' ? true : stored === 'false' ? false : null
  })

  const setIdTrans = (id: number | null) => {
    setIdTransState(id)
    if (id !== null) {
      localStorage.setItem('idTrans', String(id))
    } else {
      localStorage.removeItem('idTrans')
    }
  }

  const setIsCompra = (value: boolean | null) => {
    setIsCompraState(value)
    if (value !== null) {
      localStorage.setItem('isCompra', String(value))
    } else {
      localStorage.removeItem('isCompra')
    }
  }

  const login = (userData: any, token: string) => {
    setUser(userData)
    setToken(token)
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('token', token)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        idTrans,
        setIdTrans,
        isCompra,
        setIsCompra,
        language,
        setLanguage,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return context
}
