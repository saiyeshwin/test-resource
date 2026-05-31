import React, { useEffect, useState } from 'react'
import Card from '../components/Card'
import { api } from '../services/api'
import axios from 'axios'
import {
  ResponsiveContainer,
  LineChart, Line,
  BarChart, Bar,
  ScatterChart, Scatter, ZAxis, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts'

// Color scale for developer utilization: green → yellow → red
function utilColor(pct) {
  if (pct >= 85) return 'var(--danger)'
  if (pct >= 70) return 'var(--warning)'
  return 'var(--success)'
}

// Custom tooltip formatter for recharts
const ChartTooltip = ({ active, payload, label, unit = '' }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-3 py-2 text-sm shadow-xl"
      style={{ background: 'var(--surface-strong)', border: '1px solid var(--border)', color: 'var(--text)' }}>
      <p className="font-semibold mb-1" style={{ color: 'var(--text-h)' }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color || 'var(--accent)' }}>
          {p.name}: <strong>{p.value}{unit}</strong>
        </p>
      ))}
    </div>
  )
}

export default function Analytics() {
  const [sprints, setSprints] = useState([])
  const [projects, setProjects] = useState([])
  const [utilization, setUtilization] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    setMessage('')
    try {
      // Fetch standard data from Spring Boot API
      const [sprintData, projectData] = await Promise.all([
        api.get('/sprints'),
        api.get('/projects')
      ])
      setSprints(sprintData)
      setProjects(projectData)

      // Fetch utilization data from Python ML service
      try {
        const utilRes = await axios.get('http://13.207.55.199:8000/analytics/developer-utilization')
        setUtilization(utilRes.data)
      } catch {
        // Fallback: empty — no fake data shown to user
        setUtilization([])
      }
    } catch (err) {
      setMessage(err.message)
    } finally {
      setLoading(false)
    }
  }

  // SprintDtos.Response: sprintId, projectId, sprintName, velocity, startDate, endDate, status
  const velocityData = sprints
    .filter(s => s.velocity != null)
    .map(s => ({ name: s.sprintName, velocity: s.velocity }))

  // ProjectDtos.Response: projectId, name, managerId, managerName, startDate, endDate, status, delayRiskScore
  const delayData = projects
    .filter(p => p.delayRiskScore != null)
    .map((p, i) => ({ name: p.name.length > 14 ? p.name.slice(0, 14) + '…' : p.name, risk: p.delayRiskScore }))

  const axisStyle = { fill: 'var(--muted)', fontSize: 11 }
  const gridStyle = { stroke: 'var(--border)', strokeDasharray: '3 3' }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs uppercase tracking-[0.22em]" style={{ color: 'var(--accent)' }}>AI Insights</p>
        <h3 className="text-3xl font-semibold mt-1" style={{ color: 'var(--text)' }}>Analytics</h3>
        <p className="mt-1" style={{ color: 'var(--muted)' }}>Sprint velocity, delay risk trends, and developer workload from live data.</p>
      </div>

      {message && (
        <Card style={{ background: 'var(--surface-strong)', border: '1px solid var(--border)' }}>
          <p style={{ color: 'var(--text)' }}>{message}</p>
        </Card>
      )}

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-64 rounded-3xl animate-pulse ${i === 3 ? 'lg:col-span-2' : ''}`}
              style={{ background: 'var(--surface)' }} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Chart 1 — Sprint Velocity (Bar) */}
          <Card style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p className="text-xs uppercase tracking-[0.22em] mb-1" style={{ color: 'var(--accent)' }}>Performance</p>
            <h4 className="text-base font-semibold mb-0.5" style={{ color: 'var(--text-h)' }}>Sprint Velocity</h4>
            <p className="text-xs mb-4" style={{ color: 'var(--muted)' }}>Story points completed per sprint</p>
            {velocityData.length === 0 ? (
              <p className="text-sm text-center py-10" style={{ color: 'var(--muted)' }}>No sprint velocity data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={velocityData} margin={{ left: -10 }}>
                  <CartesianGrid {...gridStyle} />
                  <XAxis dataKey="name" tick={axisStyle} />
                  <YAxis tick={axisStyle} unit=" pts" />
                  <Tooltip content={<ChartTooltip unit=" pts" />} />
                  <Bar dataKey="velocity" name="Velocity" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>

          {/* Chart 2 — Delay Risk Trend (Line) */}
          <Card style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p className="text-xs uppercase tracking-[0.22em] mb-1" style={{ color: 'var(--danger)' }}>Risk</p>
            <h4 className="text-base font-semibold mb-0.5" style={{ color: 'var(--text-h)' }}>Delay Risk by Project</h4>
            <p className="text-xs mb-4" style={{ color: 'var(--muted)' }}>AI-predicted delay risk score (0–100) per project</p>
            {delayData.length === 0 ? (
              <p className="text-sm text-center py-10" style={{ color: 'var(--muted)' }}>No delay risk scores available yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={delayData} margin={{ left: -10 }}>
                  <CartesianGrid {...gridStyle} />
                  <XAxis dataKey="name" tick={axisStyle} />
                  <YAxis tick={axisStyle} domain={[0, 100]} unit="%" />
                  <Tooltip content={<ChartTooltip unit="%" />} />
                  <Line type="monotone" dataKey="risk" name="Delay Risk"
                    stroke="var(--danger)" strokeWidth={2.5}
                    dot={{ r: 4, fill: 'var(--danger)', strokeWidth: 0 }}
                    activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Card>

          {/* Chart 3 — Developer Utilization Heatmap (Scatter) — full width */}
          <Card className="lg:col-span-2" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p className="text-xs uppercase tracking-[0.22em] mb-1" style={{ color: 'var(--warning)' }}>Workload</p>
            <h4 className="text-base font-semibold mb-0.5" style={{ color: 'var(--text-h)' }}>Developer Utilization Heatmap</h4>
            <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>
              Bubble size and color indicate workload intensity.
              <span style={{ color: 'var(--success)' }}> ● Healthy (&lt;70%)</span>
              <span style={{ color: 'var(--warning)' }}> ● Medium (70–84%)</span>
              <span style={{ color: 'var(--danger)' }}> ● High Risk (85%+)</span>
            </p>
            {utilization.length === 0 ? (
              <p className="text-sm text-center py-10" style={{ color: 'var(--muted)' }}>
                ML service data not available. Start the Python ML service to see utilization data.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid {...gridStyle} />
                  <XAxis type="category" dataKey="sprint_name" name="Sprint" tick={axisStyle} />
                  <YAxis type="category" dataKey="developer_name" name="Developer" tick={axisStyle} width={90} />
                  <ZAxis type="number" dataKey="utilization_pct" name="Utilization" range={[80, 700]} />
                  <Tooltip content={<ChartTooltip unit="%" />} />
                  <Scatter data={utilization} name="Utilization">
                    {utilization.map((entry, i) => (
                      <Cell key={`cell-${i}`} fill={utilColor(entry.utilization_pct)} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            )}
          </Card>

        </div>
      )}
    </div>
  )
}