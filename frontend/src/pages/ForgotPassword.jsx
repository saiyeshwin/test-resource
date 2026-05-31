import React, { useState } from 'react'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const handle = e => { e.preventDefault(); alert('Password reset link simulated') }
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-md rounded-[32px] border p-8 shadow-2xl" style={{ borderColor: 'var(--border)', background: 'var(--surface)', boxShadow: '0 25px 50px rgba(0,0,0,0.08)' }}>
        <div className="mb-8 space-y-2 text-center">
          <p className="text-sm uppercase tracking-[0.3em]" style={{ color: 'var(--accent)' }}>Password recovery</p>
          <h3 className="text-3xl font-semibold" style={{ color: 'var(--text-h)' }}>Reset your password</h3>
          <p style={{ color: 'var(--muted)' }}>Enter your email and we’ll simulate a recovery link.</p>
        </div>
        <form onSubmit={handle} className="space-y-4">
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-3xl px-4 py-3 focus:outline-none"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
          />
          <button className="w-full rounded-3xl py-3 font-semibold transition" style={{ background: 'linear-gradient(90deg, var(--accent), var(--accent-2))', color: 'var(--text-h)' }}>Send reset link</button>
        </form>
      </div>
    </div>
  )
}
