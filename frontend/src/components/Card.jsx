import React from 'react'

export default function Card({ children, className = '', paddingClass = 'p-5', style }) {
  return (
    <div className={`card-surface rounded-3xl ${paddingClass} shadow-xl ${className}`} style={{ boxShadow: '0 15px 40px var(--shadow)', ...style }}>
      {children}
    </div>
  )
}

