import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../utils/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem('pos_user')
      return u ? JSON.parse(u) : null
    } catch {
      return null
    }
  })

  const [loading, setLoading] = useState(false)
  const [authReady, setAuthReady] = useState(false)

  const logout = useCallback(() => {
    localStorage.removeItem('pos_token')
    localStorage.removeItem('pos_user')
    setUser(null)
  }, [])

  const login = async (email, password) => {
    setLoading(true)

    try {
      const { data } = await api.post('/auth/login', { email, password })

      const token = data?.token
      const loggedInUser = data?.user

      if (token && loggedInUser) {
        localStorage.setItem('pos_token', token)
        localStorage.setItem('pos_user', JSON.stringify(loggedInUser))
        setUser(loggedInUser)
        return { success: true, user: loggedInUser }
      }

      if (data?.success === true && data?.user) {
        localStorage.setItem('pos_token', data.token)
        localStorage.setItem('pos_user', JSON.stringify(data.user))
        setUser(data.user)
        return { success: true, user: data.user }
      }

      return {
        success: false,
        message: data?.message || 'Login failed'
      }
    } catch (err) {
      return {
        success: false,
        message:
          err?.response?.data?.message ||
          err?.message ||
          'Login failed'
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('pos_token')

      if (!token) {
        setUser(null)
        setAuthReady(true)
        return
      }

      try {
        const { data } = await api.get('/auth/me')

        if (data?.user) {
          localStorage.setItem('pos_user', JSON.stringify(data.user))
          setUser(data.user)
        } else {
          logout()
        }
      } catch {
        logout()
      } finally {
        setAuthReady(true)
      }
    }

    checkAuth()
  }, [logout])

  const isAdmin = user?.role === 'admin'

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        authReady,
        isAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}