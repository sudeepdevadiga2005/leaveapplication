import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import StudentDashboard    from './pages/StudentDashboard'
import LecturerDashboard   from './pages/LecturerDashboard'
import ManagementDashboard from './pages/ManagementDashboard'

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
                  minHeight:'100vh', color:'var(--teal)', gap:12, fontSize:'1rem' }}>
      <span className="spinner" style={{ width:28, height:28, borderWidth:3 }} />
      Loading AbsentAlert…
    </div>
  )

  if (!user) return <Login />
  if (user.role === 'student')    return <StudentDashboard />
  if (user.role === 'lecturer')   return <LecturerDashboard />
  if (user.role === 'management') return <ManagementDashboard />
  return <Login />
}

export default function App() {
  return (
    <AuthProvider>
      <div className="bg-mesh" /><div className="bg-grid" />
      <AppRoutes />
    </AuthProvider>
  )
}
