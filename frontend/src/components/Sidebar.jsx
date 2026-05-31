import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FiHome, FiGrid, FiLayers, FiCheckSquare, FiUsers, FiBarChart2, FiAlertCircle, FiX } from 'react-icons/fi'

const roleLinks = {
  Admin: [
    { to: '/dashboard', label: 'Dashboard', icon: <FiHome /> },
    { to: '/projects', label: 'Projects', icon: <FiGrid /> },
    { to: '/resources', label: 'Resources', icon: <FiUsers /> },
    { to: '/analytics', label: 'Analytics', icon: <FiBarChart2 /> },
    { to: '/risk-reports', label: 'Risk Reports', icon: <FiAlertCircle /> }
  ],
  Manager: [
    { to: '/dashboard', label: 'Dashboard', icon: <FiHome /> },
    { to: '/projects', label: 'Projects', icon: <FiGrid /> },
    { to: '/sprints', label: 'Sprints', icon: <FiLayers /> },
    { to: '/tasks', label: 'Tasks', icon: <FiCheckSquare /> },
    { to: '/resources', label: 'Resources', icon: <FiUsers /> }
  ],
  Developer: [
    { to: '/dashboard', label: 'Dashboard', icon: <FiHome /> },
    { to: '/tasks', label: 'Tasks', icon: <FiCheckSquare /> },
    { to: '/resources', label: 'Resources', icon: <FiUsers /> },
    { to: '/risk-reports', label: 'Risk Reports', icon: <FiAlertCircle /> }
  ]
}

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth()
  const links = roleLinks[user?.role] || roleLinks.Developer

  return (
    <>
      {/* ── Mobile backdrop overlay ──────────────────────────────────────────
          Renders a blurred dark scrim behind the drawer on mobile.
          Clicking it closes the menu. Hidden on desktop (md:hidden). */}
      <div
        id="sidebar-backdrop"
        onClick={onClose}
        aria-hidden="true"
        className={`
          fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden
          transition-opacity duration-300 ease-in-out
          ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
      />

      {/* ── Sidebar drawer ───────────────────────────────────────────────────
          Mobile:  fixed overlay that slides in from the left.
          Desktop: static, permanently visible column. */}
      <aside
        id="sidebar"
        className={`
          flex flex-col
          fixed top-0 left-0 bottom-0 z-50 w-72
          md:static md:z-auto md:translate-x-0
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}
      >
        {/* Brand header */}
        <div className="p-5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3">
            {/* RMI Logo Mark */}
            <div
              className="relative flex items-center justify-center shrink-0"
              style={{
                width: 42, height: 42,
                borderRadius: 10,
                background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)',
                boxShadow: '0 4px 16px var(--accent-bg)'
              }}
            >
              {/* Subtle grid overlay */}
              <div className="absolute inset-0 opacity-10" style={{
                borderRadius: 10,
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
                backgroundSize: '8px 8px'
              }} />
              <span className="relative text-white font-bold text-sm tracking-tight" style={{ letterSpacing: '-0.02em' }}>RMI</span>
            </div>

            {/* Brand text */}
            <div className="min-w-0">
              <p className="text-sm font-bold leading-tight truncate" style={{ color: 'var(--text-h)', letterSpacing: '-0.01em' }}>RM Intelligence</p>
              <p className="text-xs leading-tight truncate" style={{ color: 'var(--muted)', letterSpacing: '0.02em' }}>Resource Management AI</p>
            </div>
          </div>

          {/* Close button — only visible on mobile */}
          <button
            id="sidebar-close"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="md:hidden rounded-xl p-2 flex items-center justify-center transition"
            style={{ border: '1px solid var(--border)', background: 'var(--surface-strong)', color: 'var(--text)' }}
          >
            <FiX size={16} />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          {links.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={onClose}   // ← auto-close drawer on navigation
              className={() => 'flex items-center gap-3 rounded-2xl px-4 py-3 transition'}
              style={({ isActive }) =>
                isActive
                  ? { background: 'var(--accent)', color: 'var(--text-h)', boxShadow: 'inset 0 0 18px var(--accent-bg)' }
                  : { color: 'var(--muted)' }
              }
            >
              <span className="text-lg">{l.icon}</span>
              <span className="font-medium">{l.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}
