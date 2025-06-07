// src/context/AuthContext.tsx
import { createContext, useContext, useState } from 'react'

interface AuthContextType {
  user: any
  idTrans: number | null
  token: string | null
  login: (userData: any, token: string) => void
  logout: () => void
  setIdTrans: (id: number | null) => void

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

  const [idTrans, setIdTransState] = useState<number | null>(() => {
    const stored = localStorage.getItem('idTrans')
    return stored ? Number(stored) : null
  })

  const setIdTrans = (id: number | null) => {
    setIdTransState(id)
    if (id !== null) {
      localStorage.setItem('idTrans', String(id))
    } else {
      localStorage.removeItem('idTrans')
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
    <AuthContext.Provider value={{ user, token, login, logout, idTrans, setIdTrans }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return context
}
