import React from 'react'

export default function Button({ children, onClick, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-white rounded ${className}`}
      style={{ background: 'var(--accent)' }}
    >
      {children}
    </button>
  )
}
