import React, { useEffect, useState } from 'react'
import Card from '../components/Card'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import { Upload } from 'lucide-react'

// Compute risk level from utilization percentage
function getRiskLevel(pct) {
  if (pct >= 85) return { label: 'High Risk', bg: 'var(--danger-bg)',  color: 'var(--danger)' }
  if (pct >= 70) return { label: 'Medium',    bg: 'var(--warning-bg)', color: 'var(--warning)' }
  return               { label: 'Healthy',    bg: 'var(--success-bg)', color: 'var(--success)' }
}

function getAvailabilityStyle(avail) {
  const v = (avail || '').toLowerCase()
  if (v === 'available')   return { bg: 'var(--success-bg)', color: 'var(--success)' }
  if (v === 'busy')        return { bg: 'var(--warning-bg)', color: 'var(--warning)' }
  if (v === 'unavailable') return { bg: 'var(--danger-bg)',  color: 'var(--danger)' }
  return                          { bg: 'var(--accent-bg)',  color: 'var(--accent)' }
}

function UtilBar({ pct = 0 }) {
  const risk = getRiskLevel(pct)
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 rounded-full h-1.5 overflow-hidden" style={{ background: 'var(--surface-strong)', minWidth: 40 }}>
        <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, background: risk.color }} />
      </div>
      <span className="text-xs font-semibold tabular-nums shrink-0" style={{ color: risk.color }}>{pct}%</span>
    </div>
  )
}

export default function Resources() {
  const { user } = useAuth()
  const isManager = user?.role === 'Manager' || user?.role === 'Admin'

  const [resources, setResources] = useState([])
  const [projects, setProjects]   = useState([])
  const [loading, setLoading]     = useState(false)
  const [message, setMessage]     = useState('')
  const [form, setForm] = useState({
    userId: '', projectId: '', utilizationPct: 50, availability: 'Available', feedback: ''
  })

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    setMessage('')
    try {
      const [resourceData, projectData] = await Promise.all([api.get('/resources'), api.get('/projects')])
      setResources(resourceData)
      setProjects(projectData)
    } catch (err) {
      setMessage(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async e => {
    e.preventDefault()
    setMessage('')
    try {
      await api.post('/resources', {
        userId:         Number(form.userId),
        projectId:      Number(form.projectId),
        utilizationPct: Number(form.utilizationPct),
        availability:   form.availability,
        feedback:       form.feedback
      })
      setForm({ userId: '', projectId: '', utilizationPct: 50, availability: 'Available', feedback: '' })
      await loadData()
      setMessage('Resource assigned successfully.')
    } catch (err) {
      setMessage(err.message)
    }
  }

  const handleUpload = async e => {
    const file = e.target.files?.[0]
    if (!file) return
    setMessage('')
    try {
      await api.upload('/uploads/resources', file)
      await loadData()
      setMessage('CSV imported successfully.')
    } catch (err) {
      setMessage(err.message)
    } finally {
      e.target.value = ''
    }
  }

  return (
    <div className="space-y-6 min-w-0 w-full">

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div>
        <h3 className="text-3xl font-semibold" style={{ color: 'var(--text)' }}>Resources</h3>
        <p className="mt-1 text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
          Track team workload, utilization, and availability across active projects.
        </p>
      </div>

      {/* ── Feedback banner ─────────────────────────────────────────────── */}
      {message && (
        <Card style={{ background: 'var(--surface-strong)', border: '1px solid var(--border)' }}>
          <p style={{ color: 'var(--text)' }}>{message}</p>
        </Card>
      )}

      {/* ── Assign form + CSV upload ─────────────────────────────────────
           Single column on mobile, two columns on large screens            */}
      {isManager && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Manual assignment form */}
          <Card style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <h4 className="text-lg font-semibold mb-4" style={{ color: 'var(--text)' }}>Assign team member</h4>
            <form onSubmit={handleCreate} className="space-y-4">

              {/* User ID — full width on mobile */}
              <div>
                <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide" style={{ color: 'var(--muted)' }}>User ID</label>
                <input
                  name="userId"
                  type="number"
                  value={form.userId}
                  onChange={e => setForm({ ...form, userId: e.target.value })}
                  placeholder="e.g. 101"
                  className="w-full rounded-2xl px-4 py-3 focus:outline-none"
                  style={{ background: 'var(--surface-strong)', border: '1px solid var(--border)', color: 'var(--text)' }}
                />
              </div>

              {/* Project — full width on mobile */}
              <div>
                <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide" style={{ color: 'var(--muted)' }}>Project</label>
                <select
                  name="projectId"
                  value={form.projectId}
                  onChange={e => setForm({ ...form, projectId: e.target.value })}
                  className="w-full rounded-2xl px-4 py-3 focus:outline-none"
                  style={{ background: 'var(--surface-strong)', border: '1px solid var(--border)', color: 'var(--text)' }}
                >
                  <option value="">Select project</option>
                  {projects.map(p => (
                    <option key={p.projectId} value={p.projectId}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Utilization + Availability — 2 cols only on sm+ */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide" style={{ color: 'var(--muted)' }}>Utilization (%)</label>
                  <input
                    name="utilizationPct"
                    type="number"
                    min="0"
                    max="100"
                    value={form.utilizationPct}
                    onChange={e => setForm({ ...form, utilizationPct: e.target.value })}
                    placeholder="e.g. 80"
                    className="w-full rounded-2xl px-4 py-3 focus:outline-none"
                    style={{ background: 'var(--surface-strong)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide" style={{ color: 'var(--muted)' }}>Availability</label>
                  <select
                    name="availability"
                    value={form.availability}
                    onChange={e => setForm({ ...form, availability: e.target.value })}
                    className="w-full rounded-2xl px-4 py-3 focus:outline-none"
                    style={{ background: 'var(--surface-strong)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  >
                    <option value="Available">Available</option>
                    <option value="Busy">Busy</option>
                    <option value="Unavailable">Unavailable</option>
                  </select>
                </div>
              </div>

              {/* Feedback — full width */}
              <div>
                <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide" style={{ color: 'var(--muted)' }}>Feedback or Notes</label>
                <textarea
                  name="feedback"
                  value={form.feedback}
                  onChange={e => setForm({ ...form, feedback: e.target.value })}
                  placeholder="Allocation details..."
                  className="w-full rounded-2xl px-4 py-3 focus:outline-none resize-none"
                  style={{ background: 'var(--surface-strong)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  rows="3"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto rounded-2xl px-6 py-3 font-semibold transition"
                style={{ background: 'linear-gradient(90deg, var(--accent), var(--accent-2))', color: 'var(--text-h)' }}
              >
                Assign Resource
              </button>
            </form>
          </Card>

          {/* CSV Upload */}
          <Card style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <h4 className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>Bulk CSV Import</h4>
            <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>Upload resource data for mass assignment and tracking.</p>
            <label
              className="flex items-center gap-3 w-full rounded-2xl px-4 py-4 cursor-pointer transition-colors"
              style={{ border: '1.5px dashed var(--border)', background: 'var(--surface-strong)' }}
            >
              <div
                className="flex items-center justify-center rounded-xl shrink-0"
                style={{ width: 36, height: 36, background: 'var(--accent-bg)' }}
              >
                <Upload size={16} color="var(--accent)" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Upload CSV</p>
                <p className="text-xs mt-0.5 break-all" style={{ color: 'var(--muted)' }}>
                  user_id, project_id, utilization_pct, availability, feedback
                </p>
              </div>
              <input type="file" accept=".csv" onChange={handleUpload} className="hidden" />
            </label>
          </Card>
        </div>
      )}

      {/* ── Resource Utilization Table ────────────────────────────────────
           Horizontally scrollable on mobile so nothing overflows the page  */}
      <Card style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
          <div>
            <p className="text-xs uppercase tracking-[0.22em]" style={{ color: 'var(--accent)' }}>Utilization</p>
            <h4 className="text-lg font-semibold mt-1" style={{ color: 'var(--text-h)' }}>Resource Utilization Overview</h4>
          </div>
          <span className="text-xs px-3 py-1 rounded-full font-semibold shrink-0" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
            {resources.length} member{resources.length !== 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: 'var(--surface-strong)' }} />
            ))}
          </div>
        ) : resources.length === 0 ? (
          <p className="text-sm py-4 text-center" style={{ color: 'var(--muted)' }}>No resources assigned yet.</p>
        ) : (
          <>
            {/* Desktop table — hidden on mobile */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Employee Name', 'Assigned Project', 'Utilization', 'Availability', 'Risk Level'].map(h => (
                      <th key={h} className="text-left pb-3 pr-4 text-xs uppercase tracking-wide font-semibold whitespace-nowrap" style={{ color: 'var(--muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {resources.map(r => {
                    const risk  = getRiskLevel(r.utilizationPct ?? 0)
                    const avail = getAvailabilityStyle(r.availability)
                    return (
                      <tr
                        key={r.resourceId}
                        className="transition-colors hover:bg-white/[0.02]"
                        style={{ borderBottom: '1px solid var(--border)' }}
                      >
                        <td className="py-3 pr-4 font-semibold whitespace-nowrap" style={{ color: 'var(--text-h)' }}>
                          {r.userName || `Member #${r.resourceId}`}
                        </td>
                        <td className="py-3 pr-4 max-w-[160px] truncate" style={{ color: 'var(--text)' }}>
                          {r.projectName || 'Unassigned'}
                        </td>
                        <td className="py-3 pr-6 w-36">
                          <UtilBar pct={r.utilizationPct ?? 0} />
                        </td>
                        <td className="py-3 pr-4">
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap" style={{ background: avail.bg, color: avail.color }}>
                            {r.availability || 'Unknown'}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap" style={{ background: risk.bg, color: risk.color }}>
                            {risk.label}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile card list — shown only on xs screens */}
            <div className="sm:hidden space-y-3">
              {resources.map(r => {
                const risk  = getRiskLevel(r.utilizationPct ?? 0)
                const avail = getAvailabilityStyle(r.availability)
                return (
                  <div
                    key={r.resourceId}
                    className="rounded-2xl p-4 space-y-3"
                    style={{ background: 'var(--surface-strong)', border: '1px solid var(--border)' }}
                  >
                    {/* Name + badges row */}
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <p className="font-semibold text-sm" style={{ color: 'var(--text-h)' }}>
                        {r.userName || `Member #${r.resourceId}`}
                      </p>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: avail.bg, color: avail.color }}>
                          {r.availability || 'Unknown'}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: risk.bg, color: risk.color }}>
                          {risk.label}
                        </span>
                      </div>
                    </div>

                    {/* Project */}
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>
                      <span className="font-medium uppercase tracking-wide">Project: </span>
                      <span style={{ color: 'var(--text)' }}>{r.projectName || 'Unassigned'}</span>
                    </p>

                    {/* Utilization bar */}
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide mb-1.5" style={{ color: 'var(--muted)' }}>Utilization</p>
                      <UtilBar pct={r.utilizationPct ?? 0} />
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
