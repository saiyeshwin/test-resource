import React, { useEffect, useState } from 'react'
import Card from '../components/Card'
import StatusBadge from '../components/StatusBadge'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import { Upload } from 'lucide-react'

const projectStatuses = ['PLANNED', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED']

export default function Projects() {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [newProject, setNewProject] = useState({ name: '', managerId: '', startDate: '', endDate: '', status: 'PLANNED' })
  const [editProject, setEditProject] = useState(null)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    setLoading(true)
    setMessage('')
    try {
      const data = await api.get('/projects')
      setProjects(data)
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
      await api.post('/projects', {
        name: newProject.name,
        managerId: newProject.managerId ? Number(newProject.managerId) : null,
        startDate: newProject.startDate || null,
        endDate: newProject.endDate || null,
        status: newProject.status
      })
      setNewProject({ name: '', managerId: '', startDate: '', endDate: '', status: 'PLANNED' })
      await loadProjects()
      setMessage('Project created successfully.')
    } catch (err) {
      setMessage(err.message)
    }
  }

  const handleUpdate = async e => {
    e.preventDefault()
    if (!editProject) return
    setMessage('')

    try {
      await api.put(`/projects/${editProject.projectId}`, {
        name: newProject.name,
        managerId: newProject.managerId ? Number(newProject.managerId) : null,
        startDate: newProject.startDate || null,
        endDate: newProject.endDate || null,
        status: newProject.status
      })
      setEditProject(null)
      setNewProject({ name: '', managerId: '', startDate: '', endDate: '', status: 'PLANNED' })
      await loadProjects()
      setMessage('Project updated successfully.')
    } catch (err) {
      setMessage(err.message)
    }
  }

  const handleDelete = async projectId => {
    setMessage('')
    try {
      await api.delete(`/projects/${projectId}`)
      await loadProjects()
      setMessage('Project archived successfully.')
    } catch (err) {
      setMessage(err.message)
    }
  }

  const handleUpload = async e => {
    const file = e.target.files?.[0]
    if (!file) return
    setMessage('')

    try {
      await api.upload('/uploads/projects', file)
      await loadProjects()
      setMessage('CSV uploaded successfully.')
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
          <h3 className="text-3xl font-semibold" style={{ color: 'var(--text)' }}>Projects</h3>
          <p className="mt-1" style={{ color: 'var(--muted)' }}>Manage active workflows, assign managers, and monitor platform-wide status.</p>
        </div>
      </div>

      {(user?.role === 'Admin' || user?.role === 'Manager') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <h4 className="text-lg font-semibold mb-4" style={{ color: 'var(--text)' }}>{editProject ? 'Update project' : 'Create new project'}</h4>
            <form onSubmit={editProject ? handleUpdate : handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide" style={{ color: 'var(--muted)' }}>Project Name</label>
                <input
                  name="name"
                  value={newProject.name}
                  onChange={e => setNewProject({ ...newProject, [e.target.name]: e.target.value })}
                  placeholder="e.g. AI Analytics Dashboard"
                  className="w-full rounded-2xl px-4 py-3 focus:outline-none"
                  style={{ background: 'var(--surface-strong)', border: '1px solid var(--border)', color: 'var(--text)' }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide" style={{ color: 'var(--muted)' }}>Manager ID</label>
                <input
                  name="managerId"
                  value={newProject.managerId}
                  onChange={e => setNewProject({ ...newProject, [e.target.name]: e.target.value })}
                  placeholder="e.g. 42"
                  className="w-full rounded-2xl px-4 py-3 focus:outline-none"
                  style={{ background: 'var(--surface-strong)', border: '1px solid var(--border)', color: 'var(--text)' }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide" style={{ color: 'var(--muted)' }}>Start Date</label>
                  <input
                    name="startDate"
                    value={newProject.startDate}
                    onChange={e => setNewProject({ ...newProject, [e.target.name]: e.target.value })}
                    type="date"
                    className="w-full rounded-2xl px-4 py-3 focus:outline-none"
                    style={{ background: 'var(--surface-strong)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide" style={{ color: 'var(--muted)' }}>End Date</label>
                  <input
                    name="endDate"
                    value={newProject.endDate}
                    onChange={e => setNewProject({ ...newProject, [e.target.name]: e.target.value })}
                    type="date"
                    className="w-full rounded-2xl px-4 py-3 focus:outline-none"
                    style={{ background: 'var(--surface-strong)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide" style={{ color: 'var(--muted)' }}>Status</label>
                <select
                  name="status"
                  value={newProject.status}
                  onChange={e => setNewProject({ ...newProject, [e.target.name]: e.target.value })}
                  className="w-full rounded-2xl px-4 py-3 focus:outline-none"
                  style={{ background: 'var(--surface-strong)', border: '1px solid var(--border)', color: 'var(--text)' }}
                >
                  {projectStatuses.map(status => (
                    <option key={status} value={status}>{status.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-wrap gap-3 pt-1">
                <button type="submit" className="rounded-2xl px-6 py-3 font-semibold transition" style={{ background: 'linear-gradient(90deg, var(--accent), var(--accent-2))', color: 'var(--text-h)' }}>
                  {editProject ? 'Save changes' : 'Create project'}
                </button>
                {editProject && (
                  <button type="button" className="rounded-2xl px-6 py-3 border transition" style={{ borderColor: 'var(--border)', color: 'var(--text)' }} onClick={() => {
                    setEditProject(null)
                    setNewProject({ name: '', managerId: '', startDate: '', endDate: '', status: 'PLANNED' })
                  }}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </Card>

          <Card style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <h4 className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>Bulk CSV Import</h4>
            <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>Upload project data for mass creation and updates.</p>
            <label
              className="flex items-center gap-3 w-full rounded-2xl px-4 py-3 cursor-pointer transition-colors"
              style={{
                border: '1.5px dashed var(--border)',
                background: 'var(--surface-strong)',
              }}
            >
              <div className="flex items-center justify-center rounded-xl shrink-0"
                style={{ width: 34, height: 34, background: 'var(--accent-bg)' }}>
                <Upload size={15} color="var(--accent)" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Upload CSV</p>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>name, manager_id, status, delay_risk_score · .csv</p>
              </div>
              <input type="file" accept=".csv" onChange={handleUpload} className="hidden" />
            </label>
          </Card>
        </div>
      )}

      {message && <Card style={{ background: 'var(--surface-strong)', border: '1px solid var(--border)' }}><p style={{ color: 'var(--text)' }}>{message}</p></Card>}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-48 rounded-3xl animate-pulse" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {projects.map(project => (
            <Card key={project.projectId} className="" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold" style={{ color: 'var(--text)' }}>{project.name}</p>
                    <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>Manager: {project.managerName || 'Unassigned'}</p>
                  </div>
                  <StatusBadge status={project.status?.toLowerCase()} />
                </div>
                <div className="text-sm" style={{ color: 'var(--muted)' }}>
                  Delay risk: {project.delayRiskScore != null ? `${project.delayRiskScore}%` : 'Not evaluated'}
                </div>
                <div className="text-sm" style={{ color: 'var(--muted)' }}>
                  {project.startDate || 'TBD'} → {project.endDate || 'TBD'}
                </div>
                {(user?.role === 'Admin' || user?.role === 'Manager') && (
                  <div className="flex flex-wrap gap-3">
                    <button type="button" className="rounded-3xl px-4 py-2 border transition" style={{ borderColor: 'var(--border)', color: 'var(--text)' }} onClick={() => {
                      setEditProject(project)
                      setNewProject({
                        name: project.name,
                        managerId: project.managerId || '',
                        startDate: project.startDate || '',
                        endDate: project.endDate || '',
                        status: project.status || 'PLANNED'
                      })
                    }}>
                      Manage
                    </button>
                    {user?.role === 'Admin' && (
                      <button type="button" className="rounded-3xl px-4 py-2 bg-rose-500/10 text-rose-700 transition" onClick={() => handleDelete(project.projectId)}>
                        Archive
                      </button>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
