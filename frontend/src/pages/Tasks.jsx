import React, { useEffect, useState } from 'react'
import Card from '../components/Card'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'

const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
const statuses = ['TO_DO', 'IN_PROGRESS', 'DONE']
const statusStyles = {
  TO_DO: 'bg-amber-100 text-amber-700',
  IN_PROGRESS: 'bg-sky-100 text-sky-700',
  DONE: 'bg-emerald-100 text-emerald-700'
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

  useEffect(() => {
    loadData()
  }, [])

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
      setMessage('Task updated successfully.')
    } catch (err) {
      setMessage(err.message)
    }
  }

  const displayedTasks = isDeveloper
    ? tasks.filter(t => user.name && t.assigneeName?.toLowerCase().includes(user.name.split(' ')[0].toLowerCase()))
    : tasks

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-3xl font-semibold" style={{ color: 'var(--text)' }}>Tasks</h3>
          <p className="mt-1" style={{ color: 'var(--muted)' }}>Track task progress, update priorities and assign work to developers.</p>
        </div>
      </div>

      {message && <Card style={{ background: 'var(--surface-strong)', border: '1px solid var(--border)' }}><p style={{ color: 'var(--text)' }}>{message}</p></Card>}

      {isManager && (
        <Card style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h4 className="text-lg font-semibold mb-4" style={{ color: 'var(--text)' }}>Create task</h4>
          <form onSubmit={handleCreate} className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                name="sprintId"
                value={newTask.sprintId}
                onChange={e => setNewTask({ ...newTask, sprintId: e.target.value })}
                className="rounded-3xl px-4 py-3 focus:outline-none"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
              >
                <option value="">Select sprint</option>
                {sprints.map(sprint => (
                  <option key={sprint.sprintId} value={sprint.sprintId}>{sprint.sprintName}</option>
                ))}
              </select>
              <input
                name="assigneeId"
                value={newTask.assigneeId}
                onChange={e => setNewTask({ ...newTask, assigneeId: e.target.value })}
                placeholder="Assignee ID"
                className="rounded-3xl px-4 py-3 focus:outline-none"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
              />
            </div>
            <input
              name="title"
              value={newTask.title}
              onChange={e => setNewTask({ ...newTask, title: e.target.value })}
              placeholder="Task title"
              className="rounded-3xl px-4 py-3 focus:outline-none"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                name="priority"
                value={newTask.priority}
                onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                className="rounded-3xl px-4 py-3 focus:outline-none"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
              >
                {priorities.map(priority => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
              <select
                name="status"
                value={newTask.status}
                onChange={e => setNewTask({ ...newTask, status: e.target.value })}
                className="rounded-3xl px-4 py-3 focus:outline-none"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
              >
                {statuses.map(status => (
                  <option key={status} value={status}>{status.replace('_', ' ')}</option>
                ))}
              </select>
              <input
                name="storyPoints"
                type="number"
                min="1"
                value={newTask.storyPoints}
                onChange={e => setNewTask({ ...newTask, storyPoints: e.target.value })}
                placeholder="Story points"
                className="rounded-3xl px-4 py-3 focus:outline-none"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
              />
            </div>
            <button type="submit" className="w-full rounded-3xl py-3 font-semibold transition" style={{ background: 'linear-gradient(90deg, var(--accent), var(--accent-2))', color: 'var(--text-h)' }}>Add task</button>
          </form>
        </Card>
      )}

      <Card style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="mb-4">
          <h4 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Task board</h4>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            {isDeveloper
              ? 'Update your task status and priority. Only your assigned tasks are shown.'
              : 'Manage developer work and monitor team progress across sprints.'}
          </p>
        </div>

        {loading ? (
          <p style={{ color: 'var(--text)' }}>Loading tasks…</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="p-3" style={{ color: 'var(--muted)' }}>Title</th>
                  <th className="p-3" style={{ color: 'var(--muted)' }}>Sprint</th>
                  <th className="p-3" style={{ color: 'var(--muted)' }}>Assignee</th>
                  <th className="p-3" style={{ color: 'var(--muted)' }}>Priority</th>
                  <th className="p-3" style={{ color: 'var(--muted)' }}>Status</th>
                  <th className="p-3" style={{ color: 'var(--muted)' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {displayedTasks.map(task => (
                  <tr key={task.taskId} style={{ borderTop: '1px solid var(--border)' }}>
                    <td className="p-3" style={{ color: 'var(--text)' }}>{task.title}</td>
                    <td className="p-3" style={{ color: 'var(--muted)' }}>{task.sprintId || 'N/A'}</td>
                    <td className="p-3" style={{ color: 'var(--muted)' }}>{task.assigneeName || 'Unassigned'}</td>
                    <td className="p-3">
                      <select
                        value={task.priority}
                        onChange={e => handleUpdate(task.taskId, { priority: e.target.value })}
                        className="rounded-3xl px-3 py-2 focus:outline-none"
                        style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
                      >
                        {priorities.map(priority => (
                          <option key={priority} value={priority}>{priority}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3">
                      <select
                        value={task.status}
                        onChange={e => handleUpdate(task.taskId, { status: e.target.value })}
                        className="rounded-3xl px-3 py-2 focus:outline-none"
                        style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
                      >
                        {statuses.map(status => (
                          <option key={status} value={status}>{status.replace('_', ' ')}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[task.status]}`}>
                        {task.status.replace('_', ' ')}
                      </span>
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
