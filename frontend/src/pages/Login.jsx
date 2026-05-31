import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const roleOptions = [
  { id: 'ADMIN', title: 'Admin' },
  { id: 'MANAGER', title: 'Manager' },
  { id: 'DEVELOPER', title: 'Developer' }
]

export default function Login() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [role, setRole] = useState('ADMIN')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setError(null)

    if (!email || !pass) {
      setError('Email and password are required.')
      return
    }

    setLoading(true)

    try {
      await login({
        name: `${roleOptions.find(option => option.id === role)?.title || 'User'} User`,
        email,
        password: pass,
        role
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-md rounded-[32px] border p-8 shadow-2xl" style={{ borderColor: 'var(--border)', background: 'var(--surface)', boxShadow: '0 25px 50px rgba(0,0,0,0.06)' }}>
        <div className="mb-8 space-y-3 text-center">
          <p className="text-sm uppercase tracking-[0.3em]" style={{ color: 'var(--accent)' }}>Secure access</p>
          <h3 className="text-3xl font-semibold" style={{ color: 'var(--text-h)' }}>Sign in to RM Intelligence</h3>
          <p style={{ color: 'var(--muted)' }}>Authenticate with your workspace credentials.</p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {roleOptions.map(option => (
            <button
              type="button"
              key={option.id}
              onClick={() => setRole(option.id)}
              className="rounded-3xl border p-3 text-center transition"
              style={{
                borderColor: role === option.id ? 'var(--accent)' : 'var(--border)',
                background: role === option.id ? 'var(--surface-strong)' : 'var(--surface)',
                color: 'var(--text)'
              }}
            >
              <div className="text-sm font-semibold">{option.title}</div>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            className="w-full rounded-3xl px-4 py-3 focus:outline-none"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
          />
          <input
            value={pass}
            onChange={e => setPass(e.target.value)}
            placeholder="Password"
            type="password"
            className="w-full rounded-3xl px-4 py-3 focus:outline-none"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
          />
          <button disabled={loading} className="w-full rounded-3xl py-3 font-semibold transition" style={{ background: 'linear-gradient(90deg, var(--accent), var(--accent-2))', color: 'var(--text-h)' }}>
            {loading ? 'Signing in...' : `Sign in as ${role}`}
          </button>
        </form>

        {error && (
          <p className="mt-4 rounded-2xl px-4 py-3 text-sm"
            style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger)' }}>
            {error}
          </p>
        )}

        <div className="mt-5 flex items-center justify-between text-sm" style={{ color: 'var(--muted)' }}>
          <Link to="/forgot-password" style={{ color: 'inherit' }} className="hover:opacity-90 transition">Forgot password?</Link>
          <Link to="/register" style={{ color: 'inherit' }} className="hover:opacity-90 transition">Register</Link>
        </div>
      </div>
    </div>
  )
}
