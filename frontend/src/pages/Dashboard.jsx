import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/Card'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import {
  FolderOpen,
  Zap,
  Users,
  AlertTriangle,
  HeartPulse,
  CheckCircle2,
  AlertCircle,
  XCircle,
  FolderPlus,
  UserPlus,
  Upload,
  Brain,
  ChevronRight,
} from 'lucide-react'

// ── small icon wrapper ───────────────────────────────────────────────────────
function IconBox({ icon: Icon, bg, color }) {
  return (
    <div
      className="flex items-center justify-center rounded-xl shrink-0"
      style={{ width: 36, height: 36, background: bg }}
    >
      <Icon size={18} color={color} strokeWidth={2} />
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [sprints, setSprints] = useState([])
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => { loadMetrics() }, [])

  const loadMetrics = async () => {
    setLoading(true)
    setMessage('')
    try {
      const [projectData, sprintData, resourceData] = await Promise.all([
        api.get('/projects'), api.get('/sprints'), api.get('/resources')
      ])
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
  const delayedCount = projects.filter(p =>
    p.status === 'ON_HOLD' || p.status === 'ARCHIVED' ||
    (typeof p.delayRiskScore === 'number' && p.delayRiskScore >= 60)
  ).length
  const activeSprints = sprints.filter(s => s.status === 'ACTIVE').length
  const teamMembers = new Set(resources.map(r => r.userName)).size

  // Project health buckets
  const onTrack  = projects.filter(p => p.status === 'ACTIVE'   && (!p.delayRiskScore || p.delayRiskScore < 40)).length
  const atRisk   = projects.filter(p => (p.delayRiskScore >= 40 && p.delayRiskScore < 70) || p.status === 'ON_HOLD').length
  const critical = projects.filter(p => p.delayRiskScore >= 70  || p.status === 'ARCHIVED').length

  const capabilities = {
    Admin:   ['Create and archive projects', 'Assign managers to projects', 'Upload project data via CSV', 'View platform-wide project status'],
    Manager: ['Create and manage sprints', 'Assign tasks to developers', 'Update task status and priority', 'Add feedback and sprint retrospective notes'],
    Developer: ['View assigned tasks and deadlines', 'Update progress (To Do / In Progress / Done)', 'View individual performance scores', 'View project delay risk predictions'],
  }
  const displayRole = capabilities[role] ? role : 'Developer'

  // Quick-action definitions per role
  const quickActions = {
    Admin: [
      { label: 'Create Project',      icon: FolderPlus,  to: '/projects',      accent: 'var(--accent)' },
      { label: 'Assign Resource',     icon: UserPlus,    to: '/resources',     accent: 'var(--success)' },
      { label: 'Upload CSV',          icon: Upload,      to: '/projects',      accent: 'var(--warning)' },
      { label: 'Generate Risk Report',icon: Brain,       to: '/risk-reports',  accent: 'var(--danger)' },
    ],
    Manager: [
      { label: 'Create Sprint',       icon: Zap,         to: '/sprints',       accent: 'var(--success)' },
      { label: 'Assign Task',         icon: UserPlus,    to: '/tasks',         accent: 'var(--accent)' },
      { label: 'Upload CSV',          icon: Upload,      to: '/projects',      accent: 'var(--warning)' },
      { label: 'Generate Risk Report',icon: Brain,       to: '/risk-reports',  accent: 'var(--danger)' },
    ],
    Developer: [
      { label: 'View My Tasks',       icon: CheckCircle2,to: '/tasks',         accent: 'var(--success)' },
      { label: 'Check Risk Reports',  icon: Brain,       to: '/risk-reports',  accent: 'var(--danger)' },
      { label: 'Team Resources',      icon: Users,       to: '/resources',     accent: 'var(--accent)' },
      { label: 'Analytics',           icon: Zap,         to: '/analytics',     accent: 'var(--warning)' },
    ],
  }
  const actions = quickActions[role] || quickActions.Developer

  return (
    <div className="space-y-5">

      {/* ── Stat Cards Row ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">

        {/* Total Projects */}
        <Card paddingClass="p-4" className="shadow-sm" style={{ background: 'linear-gradient(135deg, var(--surface), var(--surface-strong))', color: 'var(--text)' }}>
          <div className="flex items-start justify-between mb-2">
            <IconBox icon={FolderOpen} bg="var(--accent-bg)" color="var(--accent)" />
            <span className="flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: 'var(--success)' }} />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: 'var(--success)' }} />
              </span>
              Live
            </span>
          </div>
          <p className="text-3xl font-bold">{projects.length}</p>
          <p className="text-xs uppercase tracking-[0.2em] mt-0.5" style={{ color: 'var(--text-accent)' }}>Total Projects</p>
        </Card>

        {/* Active Sprints */}
        <Card paddingClass="p-4" className="shadow-sm" style={{ background: 'linear-gradient(135deg, var(--surface), var(--surface-strong))', color: 'var(--text)' }}>
          <div className="mb-2">
            <IconBox icon={Zap} bg="var(--success-bg)" color="var(--success)" />
          </div>
          <p className="text-3xl font-bold" style={{ color: activeSprints > 0 ? 'var(--success)' : 'var(--text)' }}>{activeSprints}</p>
          <p className="text-xs uppercase tracking-[0.2em] mt-0.5" style={{ color: 'var(--success)' }}>Active Sprints</p>
        </Card>

        {/* Team Members */}
        <Card paddingClass="p-4" className="shadow-sm" style={{ background: 'linear-gradient(135deg, var(--surface), var(--surface-strong))', color: 'var(--text)' }}>
          <div className="mb-2">
            <IconBox icon={Users} bg="var(--accent-bg)" color="var(--accent)" />
          </div>
          <p className="text-3xl font-bold">{teamMembers || 0}</p>
          <p className="text-xs uppercase tracking-[0.2em] mt-0.5" style={{ color: 'var(--text-accent)' }}>Team Members</p>
        </Card>

        {/* Delayed Projects */}
        <Card paddingClass="p-4" className="shadow-sm" style={{ background: 'linear-gradient(135deg, var(--surface), var(--surface-strong))', color: 'var(--text)' }}>
          <div className="mb-2">
            <IconBox
              icon={AlertTriangle}
              bg={delayedCount > 0 ? 'var(--danger-bg)' : 'var(--success-bg)'}
              color={delayedCount > 0 ? 'var(--danger)' : 'var(--success)'}
            />
          </div>
          <p className="text-3xl font-bold" style={{ color: delayedCount > 0 ? 'var(--danger)' : 'var(--text)' }}>{delayedCount}</p>
          <p className="text-xs uppercase tracking-[0.2em] mt-0.5" style={{ color: delayedCount > 0 ? 'var(--danger)' : 'var(--muted)' }}>Delayed Projects</p>
        </Card>
      </div>

      {message && <Card style={{ background: 'var(--surface-strong)', border: '1px solid var(--border)' }}><p style={{ color: 'var(--text)' }}>{message}</p></Card>}

      {/* ── Second Row: Health + Quick Actions ──────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* Project Health Widget */}
        <Card className="shadow-sm" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2 mb-4">
            <IconBox icon={HeartPulse} bg="var(--accent-bg)" color="var(--accent)" />
            <div>
              <p className="text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--text-accent)' }}>AI Health Check</p>
              <h3 className="text-base font-semibold leading-tight" style={{ color: 'var(--text-h)' }}>Project Health</h3>
            </div>
          </div>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between rounded-xl px-3 py-2.5" style={{ background: 'var(--success-bg)' }}>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={16} color="var(--success)" />
                <span className="text-sm font-medium" style={{ color: 'var(--success)' }}>On Track</span>
              </div>
              <span className="text-lg font-bold" style={{ color: 'var(--success)' }}>{onTrack}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl px-3 py-2.5" style={{ background: 'var(--warning-bg)' }}>
              <div className="flex items-center gap-2.5">
                <AlertCircle size={16} color="var(--warning)" />
                <span className="text-sm font-medium" style={{ color: 'var(--warning)' }}>At Risk</span>
              </div>
              <span className="text-lg font-bold" style={{ color: 'var(--warning)' }}>{atRisk}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl px-3 py-2.5" style={{ background: 'var(--danger-bg)' }}>
              <div className="flex items-center gap-2.5">
                <XCircle size={16} color="var(--danger)" />
                <span className="text-sm font-medium" style={{ color: 'var(--danger)' }}>Critical</span>
              </div>
              <span className="text-lg font-bold" style={{ color: 'var(--danger)' }}>{critical}</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/risk-reports')}
            className="mt-4 w-full flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition"
            style={{ background: 'var(--surface-strong)', border: '1px solid var(--border)', color: 'var(--accent)' }}
          >
            View Full Report <ChevronRight size={13} />
          </button>
        </Card>

        {/* Quick Actions Card */}
        <Card className="shadow-sm xl:col-span-2" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2 mb-4">
            <IconBox icon={Brain} bg="var(--accent-bg)" color="var(--accent)" />
            <div>
              <p className="text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--text-accent)' }}>AI Platform</p>
              <h3 className="text-base font-semibold leading-tight" style={{ color: 'var(--text-h)' }}>Quick Actions</h3>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {actions.map(({ label, icon: Icon, to, accent }) => (
              <button
                key={label}
                onClick={() => navigate(to)}
                className="group flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all hover:scale-[1.02]"
                style={{ background: 'var(--surface-strong)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-center justify-center rounded-lg shrink-0 transition-colors" style={{ width: 32, height: 32, background: `color-mix(in srgb, ${accent} 15%, transparent)` }}>
                  <Icon size={15} color={accent} strokeWidth={2} />
                </div>
                <span className="text-sm font-medium flex-1" style={{ color: 'var(--text)' }}>{label}</span>
                <ChevronRight size={13} style={{ color: 'var(--muted)' }} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Third Row: Role Overview ─────────────────────────────────────── */}
      <Card className="shadow-sm" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2 mb-3">
          <IconBox icon={Users} bg="var(--accent-bg)" color="var(--accent)" />
          <div>
            <p className="text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--accent)' }}>Role Overview</p>
            <h3 className="text-base font-semibold leading-tight" style={{ color: 'var(--text-h)' }}>{role} Capabilities</h3>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2">
          {capabilities[displayRole].map((item, i) => (
            <div key={item} className="rounded-xl px-4 py-2.5 flex items-center gap-2" style={{ background: 'var(--surface-strong)' }}>
              <span style={{ color: 'var(--accent)' }}>▸</span>
              <span className="text-sm" style={{ color: 'var(--text)' }}>{item}</span>
            </div>
          ))}
        </div>
      </Card>

    </div>
  )
}
