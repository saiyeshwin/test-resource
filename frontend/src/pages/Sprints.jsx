import React, { useEffect, useState } from 'react'
import Card from '../components/Card'
import StatusBadge from '../components/StatusBadge'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import { Zap, CalendarRange } from 'lucide-react'

const sprintStatuses = ['PLANNED', 'ACTIVE', 'COMPLETED']

// Map sprint status to StatusBadge key
const sprintStatusKey = s => ({ PLANNED: 'planned', ACTIVE: 'active', COMPLETED: 'completed' }[s] || 'planned')

export default function Sprints() {
  const { user } = useAuth()
  const isManager = user?.role === 'Manager' || user?.role === 'Admin'

  const [sprints, setSprints] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({ projectId: '', sprintName: '', velocity: 0, startDate: '', endDate: '', status: 'PLANNED' })
  const [editSprint, setEditSprint] = useState(null)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    setMessage('')
    try {
      const [sprintData, projectData] = await Promise.all([api.get('/sprints'), api.get('/projects')])
      setSprints(sprintData)
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
      await api.post('/sprints', {
        projectId: Number(form.projectId),
        sprintName: form.sprintName,
        velocity: Number(form.velocity),
        startDate: form.startDate || null,
        endDate: form.endDate || null,
        status: form.status
      })
      setForm({ projectId: '', sprintName: '', velocity: 0, startDate: '', endDate: '', status: 'PLANNED' })
      await loadData()
      setMessage('Sprint created successfully.')
    } catch (err) {
      setMessage(err.message)
    }
  }

  const handleUpdate = async e => {
    e.preventDefault()
    if (!editSprint) return
    setMessage('')
    try {
      await api.put(`/sprints/${editSprint.sprintId}`, {
        sprintName: form.sprintName,
        velocity: Number(form.velocity),
        startDate: form.startDate || null,
        endDate: form.endDate || null,
        status: form.status
      })
      setEditSprint(null)
      setForm({ projectId: '', sprintName: '', velocity: 0, startDate: '', endDate: '', status: 'PLANNED' })
      await loadData()
      setMessage('Sprint updated successfully.')
    } catch (err) {
      setMessage(err.message)
    }
  }

  const startEdit = sprint => {
    setEditSprint(sprint)
    setForm({
      projectId: sprint.projectId ?? '',
      sprintName: sprint.sprintName,
      velocity: sprint.velocity || 0,
      startDate: sprint.startDate || '',
      endDate: sprint.endDate || '',
      status: sprint.status || 'PLANNED'
    })
  }

  // Look up project name from already-loaded projects list
  const getProjectName = projectId =>
    projects.find(p => p.projectId === projectId)?.name || `Project #${projectId}`

  const inputStyle = { background: 'var(--surface-strong)', border: '1px solid var(--border)', color: 'var(--text)' }
  const labelStyle = { color: 'var(--muted)' }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-3xl font-semibold" style={{ color: 'var(--text)' }}>Sprints</h3>
          <p className="mt-1" style={{ color: 'var(--muted)' }}>Plan sprint cadence, assign backlog items, and track velocity.</p>
        </div>
      </div>

      {message && (
        <Card style={{ background: 'var(--surface-strong)', border: '1px solid var(--border)' }}>
          <p style={{ color: 'var(--text)' }}>{message}</p>
        </Card>
      )}

      {/* Create / Edit Form */}
      {isManager && (
        <Card style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h4 className="text-lg font-semibold mb-5" style={{ color: 'var(--text)' }}>
            {editSprint ? 'Update Sprint' : 'Create Sprint'}
          </h4>
          <form onSubmit={editSprint ? handleUpdate : handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide" style={labelStyle}>Project</label>
                <select
                  value={form.projectId}
                  onChange={e => setForm({ ...form, projectId: e.target.value })}
                  className="w-full rounded-2xl px-4 py-3 focus:outline-none"
                  style={inputStyle}
                >
                  <option value="">Select project</option>
                  {projects.map(project => (
                    <option key={project.projectId} value={project.projectId}>{project.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide" style={labelStyle}>Sprint Name</label>
                <input
                  value={form.sprintName}
                  onChange={e => setForm({ ...form, sprintName: e.target.value })}
                  placeholder="e.g. Sprint 4 – Auth Module"
                  className="w-full rounded-2xl px-4 py-3 focus:outline-none"
                  style={inputStyle}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide" style={labelStyle}>Velocity (pts)</label>
                <input
                  type="number" min="0"
                  value={form.velocity}
                  onChange={e => setForm({ ...form, velocity: e.target.value })}
                  placeholder="0"
                  className="w-full rounded-2xl px-4 py-3 focus:outline-none"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide" style={labelStyle}>Start Date</label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={e => setForm({ ...form, startDate: e.target.value })}
                  className="w-full rounded-2xl px-4 py-3 focus:outline-none"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide" style={labelStyle}>End Date</label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={e => setForm({ ...form, endDate: e.target.value })}
                  className="w-full rounded-2xl px-4 py-3 focus:outline-none"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide" style={labelStyle}>Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                  className="w-full rounded-2xl px-4 py-3 focus:outline-none"
                  style={inputStyle}
                >
                  {sprintStatuses.map(s => (
                    <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 pt-1">
              <button type="submit" className="rounded-2xl px-6 py-3 font-semibold transition"
                style={{ background: 'linear-gradient(90deg, var(--accent), var(--accent-2))', color: 'var(--text-h)' }}>
                {editSprint ? 'Save Sprint' : 'Create Sprint'}
              </button>
              {editSprint && (
                <button type="button" className="rounded-2xl px-6 py-3 border transition"
                  style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                  onClick={() => { setEditSprint(null); setForm({ projectId: '', sprintName: '', velocity: 0, startDate: '', endDate: '', status: 'PLANNED' }) }}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </Card>
      )}

      {/* Sprint List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 rounded-3xl animate-pulse" style={{ background: 'var(--surface)' }} />
          ))}
        </div>
      ) : sprints.length === 0 ? (
        <Card style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <p className="text-sm text-center py-4" style={{ color: 'var(--muted)' }}>No sprints found. Create your first sprint above.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sprints.map(sprint => (
            <Card key={sprint.sprintId} style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-base font-semibold truncate" style={{ color: 'var(--text-h)' }}>{sprint.sprintName}</p>
                  {/* projectName resolved from loaded projects — SprintDtos only returns projectId */}
                  <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>{getProjectName(sprint.projectId)}</p>
                </div>
                <StatusBadge status={sprintStatusKey(sprint.status)} />
              </div>
              <div className="mt-3 flex items-center gap-4 text-sm" style={{ color: 'var(--muted)' }}>
                <span className="flex items-center gap-1.5">
                  <Zap size={13} />
                  {sprint.velocity ?? 0} pts
                </span>
                <span style={{ color: 'var(--border)' }}>·</span>
                <span className="flex items-center gap-1.5">
                  <CalendarRange size={13} />
                  {sprint.startDate || 'TBD'} → {sprint.endDate || 'TBD'}
                </span>
              </div>
              {isManager && (
                <button type="button"
                  className="mt-4 rounded-2xl px-4 py-2 text-sm font-semibold transition"
                  style={{ background: 'var(--surface-strong)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  onClick={() => startEdit(sprint)}>
                  Edit Sprint
                </button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
