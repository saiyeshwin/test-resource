import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Card from '../components/Card'
import { api } from '../services/api'

const sprintStatuses = ['PLANNED', 'ACTIVE', 'COMPLETED']

export default function Sprints() {
  const { user } = useAuth()
  const isManager = user?.role === 'Manager' || user?.role === 'Admin'

  const [sprints, setSprints] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({ projectId: '', sprintName: '', velocity: 0, startDate: '', endDate: '', status: 'PLANNED' })
  const [editSprint, setEditSprint] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-3xl font-semibold" style={{ color: 'var(--text)' }}>Sprints</h3>
          <p className="mt-1" style={{ color: 'var(--muted)' }}>Plan sprint cadence, assign backlog items, and track velocity.</p>
        </div>
        {isManager && (
          <button className="rounded-3xl px-5 py-3 font-semibold transition" style={{ background: 'linear-gradient(90deg, var(--accent), var(--accent-2))', color: 'var(--text-h)' }}>
            Manage sprint workflow
          </button>
        )}
      </div>

      {message && <Card style={{ background: 'var(--surface-strong)', border: '1px solid var(--border)' }}><p style={{ color: 'var(--text)' }}>{message}</p></Card>}

      {isManager && (
        <Card style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h4 className="text-lg font-semibold mb-4" style={{ color: 'var(--text)' }}>{editSprint ? 'Update sprint' : 'Create sprint'}</h4>
          <form onSubmit={editSprint ? handleUpdate : handleCreate} className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                name="projectId"
                value={form.projectId}
                onChange={e => setForm({ ...form, projectId: e.target.value })}
                className="rounded-3xl px-4 py-3 focus:outline-none"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
              >
                <option value="">Select project</option>
                {projects.map(project => (
                  <option key={project.projectId} value={project.projectId}>{project.name}</option>
                ))}
              </select>
              <input
                name="sprintName"
                value={form.sprintName}
                onChange={e => setForm({ ...form, sprintName: e.target.value })}
                placeholder="Sprint name"
                className="rounded-3xl px-4 py-3 focus:outline-none"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                name="velocity"
                type="number"
                min="0"
                value={form.velocity}
                onChange={e => setForm({ ...form, velocity: e.target.value })}
                placeholder="Velocity"
                className="rounded-3xl px-4 py-3 focus:outline-none"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
              />
              <input
                name="startDate"
                type="date"
                value={form.startDate}
                onChange={e => setForm({ ...form, startDate: e.target.value })}
                className="rounded-3xl px-4 py-3 focus:outline-none"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
              />
              <input
                name="endDate"
                type="date"
                value={form.endDate}
                onChange={e => setForm({ ...form, endDate: e.target.value })}
                className="rounded-3xl px-4 py-3 focus:outline-none"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
              />
            </div>
            <select
              name="status"
              value={form.status}
              onChange={e => setForm({ ...form, status: e.target.value })}
              className="rounded-3xl px-4 py-3 focus:outline-none"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
            >
              {sprintStatuses.map(status => (
                <option key={status} value={status}>{status.replace('_', ' ')}</option>
              ))}
            </select>
            <div className="flex flex-wrap gap-3">
              <button type="submit" className="rounded-3xl px-6 py-3 font-semibold transition" style={{ background: 'linear-gradient(90deg, var(--accent), var(--accent-2))', color: 'var(--text-h)' }}>
                {editSprint ? 'Save sprint' : 'Create sprint'}
              </button>
              {editSprint && (
                <button type="button" className="rounded-3xl px-6 py-3 border transition" style={{ borderColor: 'var(--border)', color: 'var(--text)' }} onClick={() => {
                  setEditSprint(null)
                  setForm({ projectId: '', sprintName: '', velocity: 0, startDate: '', endDate: '', status: 'PLANNED' })
                }}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <Card style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}><p style={{ color: 'var(--text)' }}>Loading sprints...</p></Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {sprints.map(sprint => (
            <Card key={sprint.sprintId} style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold" style={{ color: 'var(--text)' }}>{sprint.sprintName}</p>
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>Project ID: {sprint.projectId}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs uppercase tracking-[0.12em] text-slate-700">{sprint.status.replace('_', ' ')}</span>
              </div>
              <div className="mt-3 text-sm" style={{ color: 'var(--muted)' }}>
                Velocity: {sprint.velocity ?? 'N/A'} | {sprint.startDate || 'TBD'} → {sprint.endDate || 'TBD'}
              </div>
              {isManager && (
                <button type="button" className="mt-4 rounded-3xl px-4 py-2 text-sm font-semibold transition" style={{ background: 'var(--surface-strong)', border: '1px solid var(--border)', color: 'var(--text)' }} onClick={() => startEdit(sprint)}>
                  Edit sprint
                </button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
