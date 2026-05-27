import React from 'react'

export default function Card({ children, className = '' }) {
  return (
    <div className={`card-surface rounded-3xl p-5 shadow-xl ${className}`} style={{ boxShadow: '0 15px 40px var(--shadow)' }}>
      {children}
    </div>
  )
}
