import React from 'react'

const statusConfig = {
  active:    { bg: 'var(--success-bg)',  color: 'var(--success)',  label: 'Active' },
  completed: { bg: 'var(--success-bg)',  color: 'var(--success)',  label: 'Completed' },
  planned:   { bg: 'var(--accent-bg)',   color: 'var(--accent)',   label: 'Planned' },
  on_hold:   { bg: 'var(--warning-bg)',  color: 'var(--warning)',  label: 'On Hold' },
  delayed:   { bg: 'var(--danger-bg)',   color: 'var(--danger)',   label: 'Delayed' },
  archived:  { bg: 'var(--danger-bg)',   color: 'var(--danger)',   label: 'Archived' },
}

export default function StatusBadge({ status = 'planned' }) {
  const key = status.toLowerCase().replace(' ', '_')
  const cfg = statusConfig[key] || statusConfig.planned
  return (
    <span
      className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-[0.12em]"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  )
}

