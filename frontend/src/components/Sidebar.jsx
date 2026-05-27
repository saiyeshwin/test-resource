import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FiHome, FiGrid, FiLayers, FiUsers, FiBarChart2, FiAlertCircle } from 'react-icons/fi'

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
    { to: '/tasks', label: 'Tasks', icon: <FiLayers /> },
    { to: '/resources', label: 'Resources', icon: <FiUsers /> }
  ],
  Developer: [
    { to: '/dashboard', label: 'Dashboard', icon: <FiHome /> },
    { to: '/tasks', label: 'Tasks', icon: <FiLayers /> },
    { to: '/resources', label: 'Resources', icon: <FiUsers /> },
    { to: '/risk-reports', label: 'Risk Reports', icon: <FiAlertCircle /> }
  ]
}

export default function Sidebar() {
  const { user } = useAuth()
  const links = roleLinks[user?.role] || roleLinks.Developer

  return (
    <aside className="w-72 hidden md:flex md:flex-col" style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}>
      <div className="p-6" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="inline-flex items-center gap-3 rounded-3xl px-4 py-2 shadow-lg" style={{ background: 'linear-gradient(90deg, var(--accent), var(--accent-2))', boxShadow: '0 10px 30px var(--accent-bg)' }}>
          <div className="h-10 w-10 rounded-full flex items-center justify-center text-xl" style={{ background: 'var(--surface-strong)', color: 'var(--accent)' }}>AI</div>
          <div>
            <h1 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>RM Intelligence</h1>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>Project & Resource AI</p>
          </div>
        </div>
      </div>
      <nav className="p-4 space-y-2">
        {links.map(l => (
          <NavLink
            key={l.to}
            to={l.to}
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
  )
}
