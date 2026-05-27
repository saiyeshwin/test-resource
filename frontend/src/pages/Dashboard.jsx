import React, { useEffect, useState } from 'react'
import Card from '../components/Card'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'

export default function Dashboard() {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [sprints, setSprints] = useState([])
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadMetrics()
  }, [])

  const loadMetrics = async () => {
    setLoading(true)
    setMessage('')
    try {
      const [projectData, sprintData, resourceData] = await Promise.all([api.get('/projects'), api.get('/sprints'), api.get('/resources')])
      setProjects(projectData)
      setSprints(sprintData)
      setResources(resourceData)
    } catch (err) {
      setMessage(err.message)
    } finally {
      setLoading(false)
    }
  }

  const role = user?.role || 'Developer'
  const delayedCount = projects.filter(p => p.status === 'ON_HOLD' || p.status === 'ARCHIVED' || (typeof p.delayRiskScore === 'number' && p.delayRiskScore >= 60)).length
  const activeSprints = sprints.filter(s => s.status === 'ACTIVE').length
  const teamMembers = new Set(resources.map(r => r.userName)).size

  const capabilities = {
    Admin: [
      'Create and archive projects',
      'Assign managers to projects',
      'Upload project data via CSV',
      'View platform-wide project status'
    ],
    Manager: [
      'Create and manage sprints',
      'Assign tasks to developers',
      'Update task status and priority',
      'Add feedback and sprint retrospective notes'
    ],
    Developer: [
      'View assigned tasks and deadlines',
      'Update progress (To Do / In Progress / Done)',
      'View individual performance scores',
      'View project delay risk predictions'
    ]
  }
  const displayRole = capabilities[role] ? role : 'Developer'

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
        <Card className="shadow-sm" style={{ background: 'linear-gradient(135deg, var(--surface), var(--surface-strong))', color: 'var(--text)' }}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em]" style={{ color: 'var(--accent)' }}>Total Projects</p>
              <p className="mt-3 text-4xl font-semibold">{projects.length}</p>
            </div>
            <div className="rounded-3xl px-4 py-3" style={{ background: 'var(--surface)', color: 'var(--muted)' }}>Live</div>
          </div>
        </Card>
        <Card className="shadow-sm" style={{ background: 'linear-gradient(135deg, var(--surface), var(--surface-strong))', color: 'var(--text)' }}>
          <div>
            <p className="text-sm uppercase tracking-[0.24em]" style={{ color: 'var(--accent)' }}>Active sprints</p>
            <p className="mt-3 text-4xl font-semibold">{activeSprints}</p>
          </div>
        </Card>
        <Card className="shadow-sm" style={{ background: 'linear-gradient(135deg, var(--surface), var(--surface-strong))', color: 'var(--text)' }}>
          <div>
            <p className="text-sm uppercase tracking-[0.24em]" style={{ color: 'var(--accent-2)' }}>Team members</p>
            <p className="mt-3 text-4xl font-semibold">{teamMembers || 0}</p>
          </div>
        </Card>
        <Card className="shadow-sm" style={{ background: 'linear-gradient(135deg, var(--surface), var(--surface-strong))', color: 'var(--text)' }}>
          <div>
            <p className="text-sm uppercase tracking-[0.24em]" style={{ color: 'var(--muted)' }}>Delayed projects</p>
            <p className="mt-3 text-4xl font-semibold">{delayedCount}</p>
          </div>
        </Card>
      </div>

      {message && <Card style={{ background: 'var(--surface-strong)', border: '1px solid var(--border)' }}><p style={{ color: 'var(--text)' }}>{message}</p></Card>}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <Card className="shadow-sm" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="mb-4">
            <p className="text-sm uppercase tracking-[0.24em]" style={{ color: 'var(--accent)' }}>Role overview</p>
            <h3 className="text-xl font-semibold mt-3" style={{ color: 'var(--text-h)' }}>{role} capabilities</h3>
            <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>This dashboard summarizes your active workstream and platform responsibilities.</p>
          </div>
          <ul className="space-y-3">
            {capabilities[displayRole].map(item => (
              <li key={item} className="rounded-3xl p-4" style={{ background: 'var(--surface-strong)', color: 'var(--text)' }}>
                <span className="font-medium">•</span> {item}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="shadow-sm" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div>
            <p className="text-sm uppercase tracking-[0.24em]" style={{ color: 'var(--accent-2)' }}>Quick actions</p>
            <h3 className="text-xl font-semibold mt-3" style={{ color: 'var(--text-h)' }}>What you can do next</h3>
          </div>
          <div className="mt-5 space-y-4">
            {role === 'Admin' && (
              <p style={{ color: 'var(--muted)' }}>Use Projects to create and archive projects, assign managers, and upload CSV data to scale resource planning.</p>
            )}
            {role === 'Manager' && (
              <p style={{ color: 'var(--muted)' }}>Use Sprints to manage sprint cadence and Tasks to assign work, update priority, and capture feedback.</p>
            )}
            {role === 'Developer' && (
              <p style={{ color: 'var(--muted)' }}>Use Tasks to track assigned work, update progress, and review project risk insights.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
