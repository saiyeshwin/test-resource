import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'

const AuthContext = createContext()

const normalizeRole = role => {
  if (!role) return null
  const normalized = role.toString().toUpperCase()
  return {
    ADMIN: 'Admin',
    MANAGER: 'Manager',
    DEVELOPER: 'Developer'
  }[normalized] || role
}

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const t = localStorage.getItem('rm_token')
    const u = localStorage.getItem('rm_user')
    if (t) setToken(t)
    if (u) {
      const savedUser = JSON.parse(u)
      setUser({ ...savedUser, role: normalizeRole(savedUser.role) })
    }
  }, [])

  const login = async (payload = { name: 'Demo User', role: 'Developer' }) => {
    const data = await api.post('/auth/login', {
      email: payload.email,
      password: payload.password
    })
    const userPayload = {
      name: payload.name || payload.username || 'Demo User',
      email: payload.email || '',
      username: payload.username || '',
      role: normalizeRole(payload.role || 'DEVELOPER')
    }

    localStorage.setItem('rm_token', data.token)
    localStorage.setItem('rm_user', JSON.stringify(userPayload))
    setToken(data.token)
    setUser(userPayload)
    navigate('/dashboard')
  }

  const register = async (payload = { name: 'New User', role: 'Developer' }) => {
    const data = await api.post('/auth/register', {
      name: payload.name,
      email: payload.email,
      password: payload.password,
      role: payload.role
    })
    const userPayload = {
      name: payload.name || payload.username || 'New User',
      email: payload.email || '',
      username: payload.username || '',
      role: normalizeRole(payload.role || 'DEVELOPER')
    }

    localStorage.setItem('rm_token', data.token)
    localStorage.setItem('rm_user', JSON.stringify(userPayload))
    setToken(data.token)
    setUser(userPayload)
    navigate('/dashboard')
  }

  const logout = () => {
    localStorage.removeItem('rm_token')
    localStorage.removeItem('rm_user')
    setToken(null)
    setUser(null)
    navigate('/login')
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
