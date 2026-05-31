import React, { useEffect, useState } from 'react'
import Card from '../components/Card'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'

// Backend TaskPriority enum: LOW, MEDIUM, HIGH, CRITICAL
// Backend TaskStatus enum: TO_DO, IN_PROGRESS, DONE
const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
const statuses = ['TO_DO', 'IN_PROGRESS', 'DONE']

const priorityConfig = {
  LOW:      { bg: 'var(--surface-strong)',  color: 'var(--muted)',   label: 'Low' },
  MEDIUM:   { bg: 'var(--accent-bg)',       color: 'var(--accent)',  label: 'Medium' },
  HIGH:     { bg: 'var(--warning-bg)',      color: 'var(--warning)', label: 'High' },
  CRITICAL: { bg: 'var(--danger-bg)',       color: 'var(--danger)',  label: 'Critical' },
}

const statusConfig = {
  TO_DO:       { bg: 'var(--surface-strong)',  color: 'var(--muted)',   label: 'To Do' },
  IN_PROGRESS: { bg: 'var(--accent-bg)',       color: 'var(--accent)',  label: 'In Progress' },
  DONE:        { bg: 'var(--success-bg)',      color: 'var(--success)', label: 'Done' },
}

function PriorityBadge({ priority }) {
  const cfg = priorityConfig[priority] || priorityConfig.MEDIUM
  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
      style={{ background: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </span>
  )
}

function StatusBadge({ status }) {
  const cfg = statusConfig[status] || statusConfig.TO_DO
  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
      style={{ background: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </span>
  )
}

export default function Tasks() {
  const { user } = useAuth()
  const isManager = user?.role === 'Manager' || user?.role === 'Admin'
  const isDeveloper = user?.role === 'Developer'

  const [tasks, setTasks] = useState([])
  const [sprints, setSprints] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [newTask, setNewTask] = useState({ sprintId: '', assigneeId: '', title: '', priority: 'MEDIUM', status: 'TO_DO', storyPoints: 1 })

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    setMessage('')
    try {
      const [tasksData, sprintsData] = await Promise.all([api.get('/tasks'), api.get('/sprints')])
      setTasks(tasksData)
      setSprints(sprintsData)
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
      await api.post('/tasks', {
        sprintId: Number(newTask.sprintId),
        assigneeId: newTask.assigneeId ? Number(newTask.assigneeId) : null,
        title: newTask.title,
        priority: newTask.priority,
        status: newTask.status,
        storyPoints: Number(newTask.storyPoints)
      })
      setNewTask({ sprintId: '', assigneeId: '', title: '', priority: 'MEDIUM', status: 'TO_DO', storyPoints: 1 })
      await loadData()
      setMessage('Task created successfully.')
    } catch (err) {
      setMessage(err.message)
    }
  }

  const handleUpdate = async (taskId, update) => {
    setMessage('')
    try {
      const task = tasks.find(t => t.taskId === taskId)
      if (!task) return
      await api.put(`/tasks/${taskId}`, {
        sprintId: task.sprintId,
        assigneeId: task.assigneeId,
        title: task.title,
        priority: update.priority || task.priority,
        status: update.status || task.status,
        storyPoints: task.storyPoints || 0
      })
      setTasks(prev => prev.map(t => (t.taskId === taskId ? { ...t, ...update } : t)))
    } catch (err) {
      setMessage(err.message)
    }
  }

  // Backend TaskDtos.Response has: taskId, sprintId, assigneeId, assigneeName, title, priority, status, storyPoints
  // Sprint name resolved client-side from already-loaded sprints (SprintDtos.Response has sprintId + sprintName)
  const getSprintName = sprintId =>
    sprints.find(s => s.sprintId === sprintId)?.sprintName || `Sprint #${sprintId}`

  const displayedTasks = isDeveloper
    ? tasks.filter(t => user.name && t.assigneeName?.toLowerCase().includes(user.name.split(' ')[0].toLowerCase()))
    : tasks

  const inputStyle = { background: 'var(--surface-strong)', border: '1px solid var(--border)', color: 'var(--text)' }
  const labelStyle = { color: 'var(--muted)' }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-3xl font-semibold" style={{ color: 'var(--text)' }}>Tasks</h3>
        <p className="mt-1" style={{ color: 'var(--muted)' }}>Track task progress, update priorities and assign work to developers.</p>
      </div>

      {message && (
        <Card style={{ background: 'var(--surface-strong)', border: '1px solid var(--border)' }}>
          <p style={{ color: 'var(--text)' }}>{message}</p>
        </Card>
      )}

      {/* Create Task Form — Managers/Admins only */}
      {isManager && (
        <Card style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h4 className="text-lg font-semibold mb-5" style={{ color: 'var(--text)' }}>Create Task</h4>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide" style={labelStyle}>Sprint</label>
                <select
                  value={newTask.sprintId}
                  onChange={e => setNewTask({ ...newTask, sprintId: e.target.value })}
                  className="w-full rounded-2xl px-4 py-3 focus:outline-none"
                  style={inputStyle}
                >
                  <option value="">Select sprint</option>
                  {sprints.map(sprint => (
                    <option key={sprint.sprintId} value={sprint.sprintId}>{sprint.sprintName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide" style={labelStyle}>Assignee ID</label>
                <input
                  value={newTask.assigneeId}
                  onChange={e => setNewTask({ ...newTask, assigneeId: e.target.value })}
                  placeholder="User ID to assign"
                  className="w-full rounded-2xl px-4 py-3 focus:outline-none"
                  style={inputStyle}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide" style={labelStyle}>Task Title</label>
              <input
                value={newTask.title}
                onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="e.g. Implement JWT auth middleware"
                className="w-full rounded-2xl px-4 py-3 focus:outline-none"
                style={inputStyle}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide" style={labelStyle}>Priority</label>
                <select
                  value={newTask.priority}
                  onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                  className="w-full rounded-2xl px-4 py-3 focus:outline-none"
                  style={inputStyle}
                >
                  {priorities.map(p => <option key={p} value={p}>{priorityConfig[p].label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide" style={labelStyle}>Status</label>
                <select
                  value={newTask.status}
                  onChange={e => setNewTask({ ...newTask, status: e.target.value })}
                  className="w-full rounded-2xl px-4 py-3 focus:outline-none"
                  style={inputStyle}
                >
                  {statuses.map(s => <option key={s} value={s}>{statusConfig[s].label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide" style={labelStyle}>Story Points</label>
                <input
                  type="number" min="1"
                  value={newTask.storyPoints}
                  onChange={e => setNewTask({ ...newTask, storyPoints: e.target.value })}
                  className="w-full rounded-2xl px-4 py-3 focus:outline-none"
                  style={inputStyle}
                />
              </div>
            </div>
            <button type="submit" className="rounded-2xl px-6 py-3 font-semibold transition"
              style={{ background: 'linear-gradient(90deg, var(--accent), var(--accent-2))', color: 'var(--text-h)' }}>
              Add Task
            </button>
          </form>
        </Card>
      )}

      {/* Task Board Table */}
      <Card style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="mb-4">
          <p className="text-xs uppercase tracking-[0.22em]" style={{ color: 'var(--accent)' }}>Board</p>
          <h4 className="text-lg font-semibold mt-1" style={{ color: 'var(--text-h)' }}>Task Board</h4>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
            {isDeveloper
              ? 'Update your task status and priority. Only your assigned tasks are shown.'
              : 'Manage developer work and monitor team progress across sprints.'}
          </p>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: 'var(--surface-strong)' }} />
            ))}
          </div>
        ) : displayedTasks.length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: 'var(--muted)' }}>
            {isDeveloper ? 'No tasks assigned to you yet.' : 'No tasks found.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Title', 'Sprint', 'Assignee', 'Points', 'Priority', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left pb-3 pr-4 text-xs uppercase tracking-wide font-semibold whitespace-nowrap"
                      style={{ color: 'var(--muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayedTasks.map(task => (
                  <tr key={task.taskId} className="hover:bg-white/[0.02] transition-colors"
                    style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="py-3 pr-4 font-medium max-w-[200px]" style={{ color: 'var(--text-h)' }}>
                      <span className="truncate block">{task.title}</span>
                    </td>
                    {/* Sprint name resolved from loaded sprints list — TaskDtos only returns sprintId */}
                    <td className="py-3 pr-4 whitespace-nowrap" style={{ color: 'var(--muted)' }}>
                      {getSprintName(task.sprintId)}
                    </td>
                    {/* assigneeName comes directly from TaskDtos.Response */}
                    <td className="py-3 pr-4 whitespace-nowrap" style={{ color: 'var(--muted)' }}>
                      {task.assigneeName || 'Unassigned'}
                    </td>
                    <td className="py-3 pr-4 text-center" style={{ color: 'var(--muted)' }}>
                      {task.storyPoints ?? '—'}
                    </td>
                    <td className="py-3 pr-4">
                      <PriorityBadge priority={task.priority} />
                    </td>
                    <td className="py-3 pr-4">
                      <StatusBadge status={task.status} />
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2 flex-wrap">
                        {/* Priority change dropdown */}
                        <select
                          value={task.priority}
                          onChange={e => handleUpdate(task.taskId, { priority: e.target.value })}
                          className="rounded-xl px-2 py-1 text-xs focus:outline-none"
                          style={{ background: 'var(--surface-strong)', border: '1px solid var(--border)', color: 'var(--text)' }}
                        >
                          {priorities.map(p => <option key={p} value={p}>{priorityConfig[p].label}</option>)}
                        </select>
                        {/* Status change dropdown */}
                        <select
                          value={task.status}
                          onChange={e => handleUpdate(task.taskId, { status: e.target.value })}
                          className="rounded-xl px-2 py-1 text-xs focus:outline-none"
                          style={{ background: 'var(--surface-strong)', border: '1px solid var(--border)', color: 'var(--text)' }}
                        >
                          {statuses.map(s => <option key={s} value={s}>{statusConfig[s].label}</option>)}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
