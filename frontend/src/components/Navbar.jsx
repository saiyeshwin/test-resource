import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { FiMenu } from 'react-icons/fi'

export default function Navbar() {
  const { user, logout } = useAuth()
  const [theme, setTheme] = useState(() => {
    try {
      const stored = localStorage.getItem('theme')
      if (stored) return stored
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark'
    } catch (e) {}
    return 'light'
  })

  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light')
      localStorage.setItem('theme', theme)
    } catch (e) {}
  }, [theme])

  return (
    <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between p-5 shadow-sm backdrop-blur-sm" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
      <div>
        <p className="text-sm uppercase tracking-[0.3em]" style={{ color: 'var(--accent)' }}>Enterprise Overview</p>
        <h2 className="text-2xl font-semibold" style={{ color: 'var(--text-h)' }}>{user?.name ? `Welcome back, ${user.name}` : 'Welcome back'}</h2>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex flex-col text-right">
          <span className="text-sm" style={{ color: 'var(--muted)' }}>Signed in as</span>
          <span style={{ color: 'var(--text)' }} className="font-medium">{user?.name || 'Guest User'}</span>
          <span className="text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--accent)' }}>{user?.role || 'Developer'}</span>
        </div>
        <button
          onClick={() => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))}
          title="Toggle theme"
          className="rounded-2xl px-3 py-2 transition"
          style={{ border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }}
        >
          {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
        </button>
        <button onClick={logout} className="rounded-2xl px-4 py-2 transition" style={{ border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }}>Logout</button>
      </div>
    </header>
  )
}
