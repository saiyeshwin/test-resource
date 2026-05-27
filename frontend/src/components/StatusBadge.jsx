import React from 'react'

const colors = {
  active: 'bg-cyan-500/15 text-cyan-300',
  delayed: 'bg-rose-500/15 text-rose-300',
  planned: 'bg-amber-500/15 text-amber-300',
}

export default function StatusBadge({ status = 'planned' }) {
  return <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-[0.12em] ${colors[status] || colors.planned}`}>{status}</span>
}
