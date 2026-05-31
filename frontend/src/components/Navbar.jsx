import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { FiMenu, FiSun, FiMoon, FiLogOut } from 'react-icons/fi'

export default function Navbar({ onMenuClick }) {
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

  // Derive initials for the compact mobile avatar
  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : 'U'

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark')

  return (
    <header
      className="flex flex-row items-center justify-between px-4 md:px-6 shadow-sm backdrop-blur-sm"
      style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        height: '60px',
      }}
    >

      {/* ── Left side ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 min-w-0">

        {/* Hamburger — mobile/tablet only */}
        <button
          id="mobile-menu-toggle"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="md:hidden shrink-0 rounded-xl p-2 transition flex items-center justify-center"
          style={{ border: '1px solid var(--border)', background: 'var(--surface-strong)', color: 'var(--text)' }}
        >
          <FiMenu size={18} />
        </button>

        {/* Brand name — mobile only, replaces verbose greeting */}
        <div className="md:hidden min-w-0">
          <span className="text-sm font-bold tracking-tight truncate" style={{ color: 'var(--text-h)' }}>
            RM Intelligence
          </span>
        </div>

        {/* Full greeting — desktop only */}
        <div className="hidden md:block">
          <p className="text-xs uppercase tracking-[0.28em] leading-none mb-0.5" style={{ color: 'var(--accent)' }}>
            Enterprise Overview
          </p>
          <h2 className="text-xl font-semibold leading-tight" style={{ color: 'var(--text-h)' }}>
            {user?.name ? `Welcome back, ${user.name}` : 'Welcome back'}
          </h2>
        </div>
      </div>

      {/* ── Right side ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">

        {/* User info column — desktop only */}
        <div className="hidden md:flex flex-col text-right leading-tight mr-1">
          <span className="text-xs" style={{ color: 'var(--muted)' }}>Signed in as</span>
          <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>{user?.name || 'Guest User'}</span>
          <span className="text-xs uppercase tracking-[0.18em]" style={{ color: 'var(--accent)' }}>
            {user?.role || 'Developer'}
          </span>
        </div>

        {/* Avatar pill — mobile only */}
        <div
          className="md:hidden flex items-center justify-center rounded-full shrink-0 text-xs font-bold"
          style={{
            width: 32, height: 32,
            background: 'var(--accent)',
            color: '#fff',
          }}
          title={user?.name}
        >
          {initials}
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title="Toggle theme"
          aria-label="Toggle colour theme"
          className="rounded-full p-2.5 transition flex items-center justify-center"
          style={{ border: '1px solid var(--border)', background: 'var(--surface-strong)', color: 'var(--text)' }}
        >
          {theme === 'dark' ? <FiMoon size={16} /> : <FiSun size={16} />}
        </button>

        {/* Logout — icon-only on mobile, text on desktop */}
        <button
          onClick={logout}
          title="Sign out"
          aria-label="Logout"
          className="rounded-xl transition flex items-center gap-2"
          style={{
            border: '1px solid var(--border)',
            background: 'var(--surface-strong)',
            color: 'var(--text)',
            padding: '6px 10px',
          }}
        >
          <FiLogOut size={16} />
          <span className="hidden md:inline text-sm">Logout</span>
        </button>
      </div>

    </header>
  )
}
