import React, { useEffect, useState } from 'react'
import Card from '../components/Card'
import { api } from '../services/api'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts'

export default function Analytics() {
  const [sprints, setSprints] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

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

  const velocityData = sprints.map(sprint => ({ name: sprint.sprintName, points: sprint.velocity || 0 }))
  const delayData = projects.map((project, index) => ({ month: `P${index + 1}`, value: project.delayRiskScore || 0 }))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Analytics</h3>
      </div>

      {message && <Card style={{ background: 'var(--surface-strong)', border: '1px solid var(--border)' }}><p style={{ color: 'var(--text)' }}>{message}</p></Card>}

      {loading ? (
        <Card style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}><p style={{ color: 'var(--text)' }}>Loading analytics...</p></Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <h4 className="font-semibold mb-2">Sprint Velocity</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={velocityData.length ? velocityData : [{ name: 'No data', points: 0 }] }>
                <XAxis dataKey="name" tick={{ fill: 'var(--muted)' }} />
                <YAxis tick={{ fill: 'var(--muted)' }} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg)', borderRadius: 12, borderColor: 'var(--border)' }} />
                <Bar dataKey="points" fill="var(--accent)" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <h4 className="font-semibold mb-2">Delay Trend</h4>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={delayData.length ? delayData : [{ month: 'No data', value: 0 }] }>
                <XAxis dataKey="month" tick={{ fill: 'var(--muted)' }} />
                <YAxis tick={{ fill: 'var(--muted)' }} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg)', borderRadius: 12, borderColor: 'var(--border)' }} />
                <Line type="monotone" dataKey="value" stroke="var(--accent-2)" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}
    </div>
  )
}
