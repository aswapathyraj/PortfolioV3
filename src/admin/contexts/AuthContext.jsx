import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api, getToken, setToken } from '../lib/api.js'

const AuthContext = createContext(null)

export const ROLES = { OWNER: 'owner', ADMIN: 'admin', EDITOR: 'editor' }

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null)
  const [ready, setReady] = useState(false)

  const login = useCallback(async ({ email, password }) => {
    const json = await api.post('/auth/login', { email, password })
    setToken(json.accessToken)
    setAdmin(json.admin)
    return json.admin
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout', {})
    } catch {
      // ignore — we clear locally regardless
    }
    setToken(null)
    setAdmin(null)
  }, [])

  const refresh = useCallback(async () => {
    try {
      const json = await api.post('/auth/refresh', {})
      setToken(json.accessToken)
      setAdmin(json.admin)
      return true
    } catch {
      setAdmin(null)
      return false
    }
  }, [])

  // On first load, try to restore the session silently.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (getToken()) {
        try {
          const json = await api.get('/auth/me')
          if (!cancelled) setAdmin(json.admin)
        } catch {
          await refresh()
        }
      } else {
        await refresh()
      }
      if (!cancelled) setReady(true)
    })()
    return () => {
      cancelled = true
    }
  }, [refresh])

  const value = useMemo(
    () => ({
      admin,
      ready,
      login,
      logout,
      refresh,
      isOwner: admin?.role === ROLES.OWNER,
      isAdmin: admin?.role === ROLES.OWNER || admin?.role === ROLES.ADMIN,
    }),
    [admin, ready, login, logout, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}