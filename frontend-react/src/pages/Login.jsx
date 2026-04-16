import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'

const ROLES = [
  { key:'student',    label:'🎓 Student',    color:'var(--teal)' },
  { key:'lecturer',   label:'👨‍🏫 Lecturer',   color:'var(--blue)' },
  { key:'management', label:'🏛️ Management', color:'var(--purple)' },
]

export default function Login() {
  const { setUser } = useAuth()
  const [role, setRole]     = useState('student')
  const [mode, setMode]     = useState('login')   // login | register
  const [form, setForm]     = useState({})
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    setError(''); setLoading(true)
    try {
      let res
      if (mode === 'login') {
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
        setError(''); setMode('login')
        alert('Registration successful! Please login.')
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (r) => {
    setRole(r); setMode('login'); setForm({})
    if (r === 'student')    setForm({ identifier: 'arjun@demo.com', password: '1234' })
    if (r === 'lecturer')   setForm({ email: 'priya@demo.com',      password: '1234' })
    if (r === 'management') setForm({ email: 'admin@demo.com',      password: 'admin123' })
  }

  const activeColor = ROLES.find(r => r.key === role)?.color || 'var(--teal)'

  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
                  minHeight:'100vh', padding:'1.5rem', position:'relative', zIndex:1 }}>
      <div className="fade-up" style={{ width:'100%', maxWidth:'460px' }}>

        {/* Brand */}
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <div style={{ width:64, height:64, background:`rgba(${activeColor === 'var(--teal)' ? '45,212,191' : activeColor === 'var(--blue)' ? '96,165,250' : '167,139,250'},.15)`,
            border:`1px solid ${activeColor}40`, borderRadius:20, display:'flex', alignItems:'center',
            justifyContent:'center', margin:'0 auto 1rem', fontSize:28, transition:'all .3s' }}>🎓</div>
          <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:'2rem', letterSpacing:'-.5px' }}>
            Absent<span style={{ color: activeColor }}>Alert</span>
          </h1>
          <p style={{ color:'var(--text-3)', fontSize:'.875rem', marginTop:'.3rem' }}>
            Leave Approval Management System
          </p>
        </div>

        <div className="card" style={{ borderRadius:24, padding:'2rem', background:'rgba(15,30,53,.92)',
          backdropFilter:'blur(24px)', boxShadow:'0 24px 64px rgba(0,0,0,.5)' }}>

          {/* Role tabs */}
          <div style={{ display:'flex', gap:4, background:'rgba(0,0,0,.3)', borderRadius:14, padding:4, marginBottom:'1.5rem' }}>
            {ROLES.map(r => (
              <button key={r.key} onClick={() => { setRole(r.key); setMode('login'); setForm({}); setError('') }}
                style={{ flex:1, padding:'.5rem .25rem', border:`1px solid ${role===r.key ? r.color+'40' : 'transparent'}`,
                  background: role===r.key ? r.color+'18' : 'transparent',
                  color: role===r.key ? r.color : 'var(--text-3)',
                  fontFamily:"'Inter',sans-serif", fontSize:'.78rem', fontWeight:600,
                  cursor:'pointer', borderRadius:11, transition:'all .25s', whiteSpace:'nowrap' }}>
                {r.label}
              </button>
            ))}
          </div>

          {/* Mode toggle (no register for management) */}
          {role !== 'management' && (
            <div style={{ display:'flex', gap:4, background:'rgba(0,0,0,.2)', borderRadius:10, padding:3, marginBottom:'1.25rem' }}>
              {['login','register'].map(m => (
                <button key={m} onClick={() => { setMode(m); setForm({}); setError('') }}
                  style={{ flex:1, padding:'.45rem', border:'none',
                    background: mode===m ? activeColor+'20' : 'transparent',
                    color: mode===m ? activeColor : 'var(--text-3)',
                    fontFamily:"'Inter',sans-serif", fontSize:'.82rem', fontWeight:500,
                    cursor:'pointer', borderRadius:8, transition:'all .2s', textTransform:'capitalize' }}>
                  {m}
                </button>
              ))}
            </div>
          )}

          {/* ── LOGIN FORMS ── */}
          {mode === 'login' && (
            <>
              {role === 'student' && (
                <div className="form-group">
                  <label className="form-label">Roll Number or Email</label>
                  <div className="input-group">
                    <span className="input-icon">🎓</span>
                    <input className="form-control" value={form.identifier||''} onChange={e=>set('identifier',e.target.value)}
                      placeholder="CS2021001 or arjun@demo.com" onKeyDown={e=>e.key==='Enter'&&handleSubmit()} />
                  </div>
                </div>
              )}
              {(role === 'lecturer' || role === 'management') && (
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <div className="input-group">
                    <span className="input-icon">✉️</span>
                    <input className="form-control" type="email" value={form.email||''} onChange={e=>set('email',e.target.value)}
                      placeholder={role==='management' ? 'admin@demo.com' : 'priya@demo.com'} onKeyDown={e=>e.key==='Enter'&&handleSubmit()} />
                  </div>
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-group">
                  <span className="input-icon">🔒</span>
                  <input className="form-control" type="password" value={form.password||''} onChange={e=>set('password',e.target.value)}
                    placeholder="••••••••" onKeyDown={e=>e.key==='Enter'&&handleSubmit()} />
                </div>
              </div>
            </>
          )}

          {/* ── STUDENT REGISTER ── */}
          {mode === 'register' && role === 'student' && (
            <>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Roll Number *</label>
                  <input className="form-control" value={form.roll_no||''} onChange={e=>set('roll_no',e.target.value)} placeholder="CS2021001" />
                </div>
                <div className="form-group">
                  <label className="form-label">Student Name</label>
                  <input className="form-control" value={form.student_name||''} onChange={e=>set('student_name',e.target.value)} placeholder="Full name" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input className="form-control" type="email" value={form.email||''} onChange={e=>set('email',e.target.value)} placeholder="student@college.com" />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Department *</label>
                  <input className="form-control" value={form.department||''} onChange={e=>set('department',e.target.value)} placeholder="Computer Science" />
                </div>
                <div className="form-group">
                  <label className="form-label">Class *</label>
                  <input className="form-control" value={form.class_name||''} onChange={e=>set('class_name',e.target.value)} placeholder="CS-A" />
                </div>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Semester</label>
                  <input className="form-control" value={form.semester||''} onChange={e=>set('semester',e.target.value)} placeholder="5" />
                </div>
                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <input className="form-control" type="password" value={form.password||''} onChange={e=>set('password',e.target.value)} placeholder="••••••••" />
                </div>
              </div>
            </>
          )}

          {/* ── LECTURER REGISTER ── */}
          {mode === 'register' && role === 'lecturer' && (
            <>
              <div className="form-group">
                <label className="form-label">Lecturer Name *</label>
                <input className="form-control" value={form.lecturer_name||''} onChange={e=>set('lecturer_name',e.target.value)} placeholder="Dr. Full Name" />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input className="form-control" type="email" value={form.email||''} onChange={e=>set('email',e.target.value)} placeholder="lecturer@college.com" />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Department *</label>
                  <input className="form-control" value={form.department||''} onChange={e=>set('department',e.target.value)} placeholder="Computer Science" />
                </div>
                <div className="form-group">
                  <label className="form-label">Lecturer ID (optional)</label>
                  <input className="form-control" value={form.lecturer_id||''} onChange={e=>set('lecturer_id',e.target.value)} placeholder="FAC001" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Password *</label>
                <input className="form-control" type="password" value={form.password||''} onChange={e=>set('password',e.target.value)} placeholder="••••••••" />
              </div>
              <p style={{ fontSize:'.75rem', color:'var(--text-3)', marginBottom:'.5rem', padding:'.5rem .75rem',
                background:'rgba(96,165,250,.06)', borderRadius:8, border:'1px solid rgba(96,165,250,.15)' }}>
                ℹ️ Class & subject assignment is done by Management after registration.
              </p>
            </>
          )}

          {error && (
            <div style={{ color:'var(--rejected)', fontSize:'.82rem', margin:'.75rem 0',
              padding:'.6rem .875rem', background:'var(--rejected-bg)',
              border:'1px solid rgba(248,113,113,.25)', borderRadius:10, textAlign:'center' }}>
              ⚠ {error}
            </div>
          )}

          <button onClick={handleSubmit} disabled={loading}
            style={{ width:'100%', padding:'.875rem', marginTop:'.5rem',
              background:`linear-gradient(135deg, ${activeColor}, ${activeColor}cc)`,
              color: activeColor === 'var(--purple)' ? '#fff' : '#042f2e',
              border:'none', borderRadius:14, fontFamily:"'Inter',sans-serif",
              fontSize:'.95rem', fontWeight:700, cursor:'pointer', transition:'all .2s',
              display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
            {loading ? <><span className="spinner" /> Processing…</> :
              mode === 'login' ? 'Sign In →' : 'Register →'}
          </button>

          {/* Demo credentials */}
          <div className="divider"><span>Demo Credentials</span></div>
          <div style={{ padding:'.875rem 1rem', background:'rgba(45,212,191,.04)',
            border:'1px solid rgba(45,212,191,.1)', borderRadius:12, fontSize:'.78rem',
            color:'var(--text-3)', lineHeight:2 }}>
            {[
              { r:'student',    label:'Student',    cred:'arjun@demo.com / 1234' },
              { r:'lecturer',   label:'Lecturer',   cred:'priya@demo.com / 1234' },
              { r:'management', label:'Management', cred:'admin@demo.com / admin123' },
            ].map(d => (
              <div key={d.r} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <strong style={{ color:'var(--teal)' }}>{d.label}:</strong>
                <code onClick={() => fillDemo(d.r)}
                  style={{ background:'rgba(45,212,191,.1)', border:'1px solid rgba(45,212,191,.2)',
                    borderRadius:6, padding:'1px 8px', color:'var(--teal)', cursor:'pointer', fontSize:'.75rem' }}>
                  {d.cred}
                </code>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
