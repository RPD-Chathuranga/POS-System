import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../utils/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem('pos_user')
      return u ? JSON.parse(u) : null
    } catch { return null }
  })
  const [loading, setLoading] = useState(false)

  const login = async (email, password) => {
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      if (data.success) {
        localStorage.setItem('pos_token', data.token)
        localStorage.setItem('pos_user', JSON.stringify(data.user))
        setUser(data.user)
        return { success: true }
      }

      return { success: false, message: data.message || 'Login failed' }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed' }
    } finally {
      setLoading(false)
    }
  }

  const logout = useCallback(() => {
    localStorage.removeItem('pos_token')
    localStorage.removeItem('pos_user')
    setUser(null)
  }, [])

  const isAdmin = user?.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
