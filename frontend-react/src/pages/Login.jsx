import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'

const ROLES = [
  { key: 'student',    label: 'Student',    color: 'var(--teal)'   },
  { key: 'lecturer',   label: 'Lecturer',   color: 'var(--blue)'   },
  { key: 'management', label: 'Management', color: 'var(--purple)' },
]

const S = {
  page: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    minHeight: '100vh', padding: '1.5rem', position: 'relative', zIndex: 1,
  },
  wrap: { width: '100%', maxWidth: '480px' },
  brand: { textAlign: 'center', marginBottom: '2rem' },
  logo: (color) => ({
    width: 56, height: 56,
    background: `rgba(45,212,191,.12)`,
    border: `1.5px solid ${color}`,
    borderRadius: 16,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 1rem',
    fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: '1.1rem',
    color: color, letterSpacing: 1, transition: 'all .3s',
  }),
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 22,
    padding: '2rem',
    boxShadow: 'var(--shadow-lg)',
  },
  roleTabs: {
    display: 'flex', gap: 4,
    background: 'var(--bg-2)',
    borderRadius: 13, padding: 4,
    marginBottom: '1.5rem',
    border: '1px solid var(--border)',
  },
  roleBtn: (active, color) => ({
    flex: 1, padding: '.55rem .25rem',
    border: `1px solid ${active ? color : 'transparent'}`,
    background: active ? color + '15' : 'transparent',
    color: active ? color : 'var(--text-3)',
    fontFamily: "'Inter',sans-serif", fontSize: '.82rem', fontWeight: 600,
    cursor: 'pointer', borderRadius: 10, transition: 'all .22s', whiteSpace: 'nowrap',
  }),
  modeTabs: {
    display: 'flex', gap: 4,
    background: 'var(--bg-2)',
    borderRadius: 10, padding: 3,
    marginBottom: '1.5rem',
    border: '1px solid var(--border)',
  },
  modeBtn: (active, color) => ({
    flex: 1, padding: '.5rem',
    border: 'none',
    background: active ? color + '15' : 'transparent',
    color: active ? color : 'var(--text-3)',
    fontFamily: "'Inter',sans-serif", fontSize: '.85rem', fontWeight: 600,
    cursor: 'pointer', borderRadius: 8, transition: 'all .2s', textTransform: 'capitalize',
  }),
  // ── Alert boxes ──
  alertError: {
    display: 'flex', alignItems: 'center', gap: 12,
    color: '#dc2626',
    fontSize: '.9rem', fontWeight: 600,
    margin: '0 0 1rem 0',
    padding: '1rem 1.25rem',
    background: '#fee2e2',
    border: '2px solid #ef4444',
    borderRadius: 12,
    lineHeight: 1.5,
  },
  alertSuccess: {
    display: 'flex', alignItems: 'center', gap: 12,
    color: '#059669',
    fontSize: '.9rem', fontWeight: 600,
    margin: '0 0 1rem 0',
    padding: '1rem 1.25rem',
    background: '#d1fae5',
    border: '2px solid #10b981',
    borderRadius: 12,
    lineHeight: 1.5,
  },
  alertIcon: {
    flexShrink: 0, width: 24, height: 24,
    borderRadius: '50%', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    fontSize: '.9rem', fontWeight: 700,
    background: '#fff',
  },
  submitBtn: (color) => ({
    width: '100%', padding: '.9rem',
    marginTop: '.75rem',
    background: `linear-gradient(135deg, ${color}, ${color}cc)`,
    color: color === 'var(--purple)' ? '#fff' : '#fff',
    border: 'none', borderRadius: 13,
    fontFamily: "'Inter',sans-serif",
    fontSize: '.95rem', fontWeight: 700,
    cursor: 'pointer', transition: 'all .2s',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    letterSpacing: '.3px',
  }),
}

export default function Login() {
  const { setUser } = useAuth()
  const [role, setRole]       = useState('student')
  const [mode, setMode]       = useState('login')
  const [form, setForm]       = useState({})
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const activeColor = ROLES.find(r => r.key === role)?.color || 'var(--teal)'

  const handleSubmit = async () => {
    setError(''); setSuccess(''); setLoading(true)
    try {
      if (mode === 'login') {
        let res
        if (role === 'student')    res = await api.studentLogin({ identifier: form.identifier, password: form.password })
        if (role === 'lecturer')   res = await api.lecturerLogin({ email: form.email, password: form.password })
        if (role === 'management') res = await api.managementLogin({ email: form.email, password: form.password })
        setUser(res.user)
      } else {
        if (role === 'student') {
          await api.studentRegister({
            roll_no: form.roll_no, email: form.email, password: form.password,
            student_name: form.student_name, department: form.department,
            class_name: form.class_name, semester: form.semester,
          })
        } else {
          await api.lecturerRegister({
            lecturer_name: form.lecturer_name, email: form.email,
            password: form.password, department: form.department,
            lecturer_id: form.lecturer_id,
          })
        }
        setForm({})
        setMode('login')
        setSuccess('Registration successful! You can now sign in.')
      }
    } catch (e) {
      setError(e.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const switchRole = (r) => {
    setRole(r); setMode('login'); setForm({}); setError(''); setSuccess('')
  }

  const switchMode = (m) => {
    setMode(m); setForm({}); setError(''); setSuccess('')
  }

  return (
    <div style={S.page}>
      <div className="fade-up" style={S.wrap}>

        {/* Brand */}
        <div style={S.brand}>
          <div style={S.logo(activeColor)}>AA</div>
          <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:'2rem', letterSpacing:'-.5px', color:'var(--text-1)' }}>
            Absent<span style={{ color: activeColor }}>Alert</span>
          </h1>
          <p style={{ color:'var(--text-3)', fontSize:'.875rem', marginTop:'.3rem' }}>
            Leave Approval Management System
          </p>
        </div>

        <div style={S.card}>

          {/* Role tabs */}
          <div style={S.roleTabs}>
            {ROLES.map(r => (
              <button key={r.key} onClick={() => switchRole(r.key)} style={S.roleBtn(role === r.key, r.color)}>
                {r.label}
              </button>
            ))}
          </div>

          {/* Login / Register toggle */}
          {role !== 'management' && (
            <div style={S.modeTabs}>
              {['login', 'register'].map(m => (
                <button key={m} onClick={() => switchMode(m)} style={S.modeBtn(mode === m, activeColor)}>
                  {m === 'login' ? 'Sign In' : 'Register'}
                </button>
              ))}
            </div>
          )}

          {/* ── SUCCESS MESSAGE ── */}
          {success && (
            <div style={S.alertSuccess}>
              <div style={{ ...S.alertIcon, background:'rgba(52,211,153,.25)', color:'#34d399' }}>✓</div>
              <span>{success}</span>
            </div>
          )}

          {/* ── ERROR MESSAGE ── */}
          {error && (
            <div style={S.alertError}>
              <div style={{ ...S.alertIcon, background:'rgba(248,113,113,.25)', color:'#f87171' }}>!</div>
              <span>{error}</span>
            </div>
          )}

          {/* ── LOGIN FORM ── */}
          {mode === 'login' && (
            <>
              {role === 'student' && (
                <div className="form-group">
                  <label className="form-label">Roll Number or Email</label>
                  <input className="form-control" value={form.identifier || ''} onChange={e => set('identifier', e.target.value)}
                    placeholder="Enter your roll number or email" onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
                </div>
              )}
              {(role === 'lecturer' || role === 'management') && (
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input className="form-control" type="email" value={form.email || ''} onChange={e => set('email', e.target.value)}
                    placeholder="Enter your email address" onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-control" type="password" value={form.password || ''} onChange={e => set('password', e.target.value)}
                  placeholder="Enter your password" onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
              </div>
            </>
          )}

          {/* ── STUDENT REGISTER ── */}
          {mode === 'register' && role === 'student' && (
            <>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Roll Number <span style={{color:'var(--rejected)'}}>*</span></label>
                  <input className="form-control" value={form.roll_no || ''} onChange={e => set('roll_no', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-control" value={form.student_name || ''} onChange={e => set('student_name', e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email Address <span style={{color:'var(--rejected)'}}>*</span></label>
                <input className="form-control" type="email" value={form.email || ''} onChange={e => set('email', e.target.value)} />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Department <span style={{color:'var(--rejected)'}}>*</span></label>
                  <input className="form-control" value={form.department || ''} onChange={e => set('department', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Class <span style={{color:'var(--rejected)'}}>*</span></label>
                  <input className="form-control" value={form.class_name || ''} onChange={e => set('class_name', e.target.value)} />
                </div>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Semester</label>
                  <input className="form-control" value={form.semester || ''} onChange={e => set('semester', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Password <span style={{color:'var(--rejected)'}}>*</span></label>
                  <input className="form-control" type="password" value={form.password || ''} onChange={e => set('password', e.target.value)} />
                </div>
              </div>
            </>
          )}

          {/* ── LECTURER REGISTER ── */}
          {mode === 'register' && role === 'lecturer' && (
            <>
              <div className="form-group">
                <label className="form-label">Full Name <span style={{color:'var(--rejected)'}}>*</span></label>
                <input className="form-control" value={form.lecturer_name || ''} onChange={e => set('lecturer_name', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address <span style={{color:'var(--rejected)'}}>*</span></label>
                <input className="form-control" type="email" value={form.email || ''} onChange={e => set('email', e.target.value)} />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Department <span style={{color:'var(--rejected)'}}>*</span></label>
                  <input className="form-control" value={form.department || ''} onChange={e => set('department', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Lecturer ID <span style={{color:'var(--text-3)',fontWeight:400}}>(optional)</span></label>
                  <input className="form-control" value={form.lecturer_id || ''} onChange={e => set('lecturer_id', e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Password <span style={{color:'var(--rejected)'}}>*</span></label>
                <input className="form-control" type="password" value={form.password || ''} onChange={e => set('password', e.target.value)} />
              </div>
              <div style={{ fontSize:'.78rem', color:'var(--text-3)', padding:'.65rem .875rem',
                background:'rgba(96,165,250,.07)', border:'1px solid rgba(96,165,250,.18)',
                borderRadius:8, marginBottom:'.5rem', lineHeight:1.5 }}>
                Note: Class and subject assignment is handled by Management after registration.
              </div>
            </>
          )}

          {/* Submit button */}
          <button onClick={handleSubmit} disabled={loading} style={S.submitBtn(activeColor)}>
            {loading
              ? <><span className="spinner" /> Processing…</>
              : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>

        </div>
      </div>
    </div>
  )
}
