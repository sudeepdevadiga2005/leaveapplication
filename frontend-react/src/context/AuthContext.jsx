import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(() => {
    try {
      const stored = localStorage.getItem('aa_user')
      return stored ? JSON.parse(stored) : null
    } catch { return null }
  })
  const [loading, setLoading] = useState(true)

  const setUser = (u) => {
    setUserState(u)
    if (u) localStorage.setItem('aa_user', JSON.stringify(u))
    else localStorage.removeItem('aa_user')
  }

  useEffect(() => {
    // Verify session is still valid on the backend
    api.me()
      .then(d => { setUser(d.user) })
      .catch(() => {
        // Session expired — clear local storage
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const logout = async () => {
    await api.logout().catch(() => {})
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)


