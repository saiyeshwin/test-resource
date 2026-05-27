import React, { useEffect, useState } from 'react'
import Card from '../components/Card'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'

export default function Resources() {
  const { user } = useAuth()
  const isManager = user?.role === 'Manager' || user?.role === 'Admin'

  const [resources, setResources] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({ userId: '', projectId: '', utilizationPct: 50, availability: 'Available', feedback: '' })

  useEffect(() => {
    loadData()
  }, [])

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
        userId: Number(form.userId),
        projectId: Number(form.projectId),
        utilizationPct: Number(form.utilizationPct),
        availability: form.availability,
        feedback: form.feedback
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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-3xl font-semibold" style={{ color: 'var(--text)' }}>Resources</h3>
          <p className="mt-1" style={{ color: 'var(--muted)' }}>Track team workload, utilization, and availability across active projects.</p>
        </div>
      </div>

      {message && <Card style={{ background: 'var(--surface-strong)', border: '1px solid var(--border)' }}><p style={{ color: 'var(--text)' }}>{message}</p></Card>}

      {isManager && (
        <Card style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h4 className="text-lg font-semibold mb-4" style={{ color: 'var(--text)' }}>Assign team member</h4>
          <form onSubmit={handleCreate} className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                name="userId"
                type="number"
                value={form.userId}
                onChange={e => setForm({ ...form, userId: e.target.value })}
                placeholder="User ID"
                className="rounded-3xl px-4 py-3 focus:outline-none"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
              />
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
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                name="utilizationPct"
                type="number"
                min="0"
                max="100"
                value={form.utilizationPct}
                onChange={e => setForm({ ...form, utilizationPct: e.target.value })}
                placeholder="Utilization %"
                className="rounded-3xl px-4 py-3 focus:outline-none"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
              />
              <input
                name="availability"
                value={form.availability}
                onChange={e => setForm({ ...form, availability: e.target.value })}
                placeholder="Availability"
                className="rounded-3xl px-4 py-3 focus:outline-none"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
              />
            </div>
            <textarea
              name="feedback"
              value={form.feedback}
              onChange={e => setForm({ ...form, feedback: e.target.value })}
              placeholder="Feedback or notes"
              className="w-full rounded-3xl px-4 py-3 focus:outline-none"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
              rows="3"
            />
            <div className="flex flex-wrap gap-3">
              <button type="submit" className="rounded-3xl px-6 py-3 font-semibold transition" style={{ background: 'linear-gradient(90deg, var(--accent), var(--accent-2))', color: 'var(--text-h)' }}>
                Assign resource
              </button>
              <label className="rounded-3xl px-6 py-3 border transition cursor-pointer" style={{ borderColor: 'var(--border)', color: 'var(--text)', background: 'var(--surface)' }}>
                Upload CSV
                <input type="file" accept=".csv" onChange={handleUpload} className="hidden" />
              </label>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <Card style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}><p style={{ color: 'var(--text)' }}>Loading resources...</p></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {resources.map(resource => (
            <Card key={resource.resourceId}>
              <div className="font-semibold" style={{ color: 'var(--text-h)' }}>{resource.userName || 'Team member'}</div>
              <div className="text-sm mb-2" style={{ color: 'var(--muted)' }}>{resource.projectName || 'Project assignment'}</div>
              <div className="text-sm mb-1" style={{ color: 'var(--muted)' }}>Utilization</div>
              <div className="rounded h-3 overflow-hidden" style={{ background: 'var(--surface-strong)' }}>
                <div className="h-3 rounded" style={{ width: `${resource.utilizationPct ?? 0}%`, background: 'var(--accent)' }} />
              </div>
              <div className="mt-3 text-sm" style={{ color: 'var(--muted)' }}>Availability: {resource.availability || 'Unknown'}</div>
              <div className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>Notes: {resource.feedback || 'No notes'}</div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
