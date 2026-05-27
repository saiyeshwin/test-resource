import React, { useEffect, useState } from 'react'
import Card from '../components/Card'
import { api } from '../services/api'

export default function RiskReports() {
  const [projects, setProjects] = useState([])
  const [predictions, setPredictions] = useState({})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    setLoading(true)
    setMessage('')
    try {
      const projectData = await api.get('/projects')
      setProjects(projectData)
      await Promise.all(projectData.map(project => fetchPrediction(project.projectId)))
    } catch (err) {
      setMessage(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchPrediction = async projectId => {
    try {
      const prediction = await api.post(`/predict/${projectId}`, {})
      setPredictions(prev => ({ ...prev, [projectId]: prediction }))
    } catch (err) {
      setPredictions(prev => ({ ...prev, [projectId]: { riskStatus: 'UNKNOWN', delayProbability: 0, recommendation: err.message } }))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-3xl font-semibold" style={{ color: 'var(--text)' }}>Delay Risk Reports</h3>
          <p className="mt-1" style={{ color: 'var(--muted)' }}>AI-driven predictions for project delivery risk and recommended follow-ups.</p>
        </div>
      </div>

      {message && <Card style={{ background: 'var(--surface-strong)', border: '1px solid var(--border)' }}><p style={{ color: 'var(--text)' }}>{message}</p></Card>}

      {loading ? (
        <Card style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}><p style={{ color: 'var(--text)' }}>Loading risk reports...</p></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map(project => {
            const prediction = predictions[project.projectId]
            return (
              <Card key={project.projectId}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--text-h)' }}>{project.name}</p>
                    <p className="text-sm" style={{ color: 'var(--muted)' }}>Manager: {project.managerName || 'Unassigned'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold" style={{ color: 'var(--text-h)' }}>{prediction?.delayProbability ?? '–'}%</p>
                    <p className="text-xs uppercase tracking-[0.14em]" style={{ color: 'var(--accent)' }}>{prediction?.riskStatus || 'Unknown'}</p>
                  </div>
                </div>
                <div className="mt-4 text-sm" style={{ color: 'var(--muted)' }}>
                  {prediction?.recommendation || 'No recommendation available yet.'}
                </div>
                <button type="button" className="mt-4 rounded-3xl px-4 py-2 text-sm font-semibold transition" style={{ background: 'var(--surface-strong)', border: '1px solid var(--border)', color: 'var(--text)' }} onClick={() => fetchPrediction(project.projectId)}>
                  Refresh prediction
                </button>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
