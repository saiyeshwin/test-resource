import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import DashboardLayout from './layouts/DashboardLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import Sprints from './pages/Sprints'
import Tasks from './pages/Tasks'
import Resources from './pages/Resources'
import Analytics from './pages/Analytics'
import RiskReports from './pages/RiskReports'

const Protected = ({ children }) => {
  const { token } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route
          path="/"
          element={
            <Protected>
              <DashboardLayout />
            </Protected>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="sprints" element={<Sprints />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="resources" element={<Resources />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="risk-reports" element={<RiskReports />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  )
}
