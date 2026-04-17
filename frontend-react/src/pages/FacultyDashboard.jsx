import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'
import Sidebar from '../components/Sidebar'
import Toast from '../components/Toast'
import { useToast } from '../hooks/useToast'

const STUDENTS = [
  { name:'Arjun Sharma',  id:'CS2021045', year:'3rd', used:5,  att:86 },
  { name:'Meera Patel',   id:'CS2021012', year:'3rd', used:3,  att:92 },
  { name:'Rohan Desai',   id:'CS2021033', year:'3rd', used:8,  att:78 },
  { name:'Sneha Iyer',    id:'CS2021067', year:'3rd', used:2,  att:95 },
  { name:'Karan Singh',   id:'CS2021089', year:'3rd', used:6,  att:81 },
  { name:'Priya Menon',   id:'CS2021054', year:'3rd', used:1,  att:97 },
  { name:'Dev Kapoor',    id:'CS2021071', year:'3rd', used:4,  att:88 },
  { name:'Ananya Rao',    id:'CS2021028', year:'3rd', used:7,  att:75 },
]

export default function FacultyDashboard() {
  const { user } = useAuth()
  const { toasts, showToast } = useToast()
  const [page, setPage]           = useState('dashboard')
  const [leaves, setLeaves]       = useState([])
  const [sessionApproved, setSA]  = useState(0)
  const [modal, setModal]         = useState(null)
  const [remarks, setRemarks]     = useState('')
  const [arFilter, setArFilter]   = useState('all')

  const load = useCallback(async () => {
    const l = await api.getLeaves()
    setLeaves(l)
  }, [])

  useEffect(() => { load() }, [load])

  const pending = leaves.filter(l => l.status === 'Pending')
  const h = new Date().getHours()
  const greet = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'

  const confirmAction = async (status) => {
    if (!modal) return
    const r = remarks.trim() || (status === 'Approved' ? 'Approved.' : 'Request rejected.')
    try {
      await api.updateLeave(modal.id, { status, remarks: r })
      if (status === 'Approved') setSA(s => s + 1)
      setModal(null); setRemarks('')
      await load()
      showToast(status === 'Approved' ? '✓ Approved' : '✗ Rejected',
        `Leave has been ${status.toLowerCase()} and student notified.`,
        status === 'Approved' ? 'success' : 'error')
    } catch (e) { showToast('Error', e.message, 'error') }
  }

  const filteredAll = [...leaves].reverse().filter(l => arFilter === 'all' || l.status === arFilter)

  const typeCounts = {}
  leaves.forEach(l => { typeCounts[l.type] = (typeCounts[l.type] || 0) + 1 })
  const total = leaves.length
  const totalApproved = leaves.filter(l => l.status === 'Approved').length
  const totalDays = leaves.reduce((s, l) => s + l.days, 0)
  const months = {}
  leaves.forEach(l => { const m = l.from?.slice(0,7); if(m) months[m] = (months[m]||0) + l.days })

  return (
    <div className="dash-layout">
      <div className="bg-mesh" /><div className="bg-grid" />
      <Toast toasts={toasts} />
      <button className="mobile-toggle" onClick={() => document.querySelector('.sidebar').classList.toggle('open')}>☰</button>
      <Sidebar role="faculty" activePage={page} onNavigate={setPage} unread={pending.length} />

      <main className="main">

        {/* ── DASHBOARD ── */}
        {page === 'dashboard' && (
          <div className="fade-in">
            <div className="topbar">
              <div className="topbar-left">
                <h1>{greet}, {user?.name?.split(' ').pop()} 👋</h1>
                <p>Faculty leave management overview</p>
              </div>
            </div>
            <div className="stats-grid">
              <div className="stat-card c-yellow"><div className="stat-icon">⏳</div><div className="stat-value">{pending.length}</div><div className="stat-label">Pending Approval</div><div className="stat-sub">need your attention</div></div>
              <div className="stat-card c-teal"><div className="stat-icon">✅</div><div className="stat-value">{sessionApproved}</div><div className="stat-label">Approved This Session</div><div className="stat-sub">since you logged in</div></div>
              <div className="stat-card c-blue"><div className="stat-icon">👥</div><div className="stat-value">{STUDENTS.length}</div><div className="stat-label">Total Students</div><div className="stat-sub">under your mentorship</div></div>
              <div className="stat-card c-red"><div className="stat-icon">⚠️</div><div className="stat-value">{STUDENTS.filter(s=>s.used>5).length}</div><div className="stat-label">High Absentees</div><div className="stat-sub">above 5 days absent</div></div>
            </div>
            <div className="grid-2-1">
              <div className="card">
                <div className="card-header">
                  <div className="card-title"><div className="card-icon">⏳</div>Pending Requests</div>
                  <button className="btn btn-ghost btn-sm" onClick={() => setPage('pending')}>View All →</button>
                </div>
                <div className="table-wrap">
                  <table><thead><tr><th>Student</th><th>Type</th><th>Dates</th><th>Days</th><th>Action</th></tr></thead>
                  <tbody>
                    {pending.map(l => (
                      <tr key={l.id}>
                        <td className="td-primary">{l.student_name}</td>
                        <td style={{ textTransform:'capitalize' }}>{l.type}</td>
                        <td>{l.from}{l.from!==l.to?' → '+l.to:''}</td>
                        <td>{l.days}d</td>
                        <td><button className="btn btn-sm btn-success" onClick={() => { setModal(l); setRemarks('') }}>Review →</button></td>
                      </tr>
                    ))}
                    {!pending.length && <tr><td colSpan={5}><div className="empty-state"><div className="empty-icon">🎉</div><p>All caught up!</p></div></td></tr>}
                  </tbody></table>
                </div>
              </div>
              <div className="card">
                <div className="card-title" style={{ marginBottom:'1rem' }}><div className="card-icon">📈</div>Quick Stats</div>
                {[
                  { label:'Total Applications', val: total },
                  { label:'Approved', val: totalApproved, color:'var(--approved)' },
                  { label:'Pending',  val: pending.length, color:'var(--pending)' },
                  { label:'Rejected', val: leaves.filter(l=>l.status==='Rejected').length, color:'var(--rejected)' },
                  { label:'Medical Leaves',  val: leaves.filter(l=>l.type==='medical').length },
                  { label:'Academic Leaves', val: leaves.filter(l=>l.type==='academic').length },
                ].map(d => (
                  <div key={d.label} className="qs-row">
                    <span className="qs-label">{d.label}</span>
                    <span className="qs-val" style={{ color: d.color || 'var(--text-1)' }}>{d.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── PENDING ── */}
        {page === 'pending' && (
          <div className="fade-in">
            <div className="topbar"><div className="topbar-left"><h1>Pending Requests</h1><p>Review and act on leave applications awaiting approval</p></div></div>
            <div className="card">
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Student</th><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Reason</th><th>Applied</th><th>Actions</th></tr></thead>
                  <tbody>
                    {pending.map(l => (
                      <tr key={l.id}>
                        <td className="td-primary">{l.student_name}</td>
                        <td style={{ textTransform:'capitalize' }}>{l.type}</td>
                        <td>{l.from}</td><td>{l.to}</td><td>{l.days}d</td>
                        <td className="td-clip">{l.reason}</td>
                        <td className="td-muted">{l.ts}</td>
                        <td><button className="btn btn-sm btn-success" onClick={() => { setModal(l); setRemarks('') }}>Review →</button></td>
                      </tr>
                    ))}
                    {!pending.length && <tr><td colSpan={8}><div className="empty-state"><div className="empty-icon">🎉</div><p>No pending requests</p></div></td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── ALL REQUESTS ── */}
        {page === 'all-requests' && (
          <div className="fade-in">
            <div className="topbar"><div className="topbar-left"><h1>All Leave Requests</h1><p>Complete record of all student leave applications</p></div></div>
            <div className="card">
              <div style={{ display:'flex', gap:'.75rem', marginBottom:'1.25rem' }}>
                <select className="form-control" style={{ width:'auto', padding:'.45rem .85rem', fontSize:'.82rem' }} value={arFilter} onChange={e => setArFilter(e.target.value)}>
                  <option value="all">All Status</option><option value="Pending">Pending</option><option value="Approved">Approved</option><option value="Rejected">Rejected</option>
                </select>
              </div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Student</th><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Reason</th><th>Status</th><th>Remarks</th></tr></thead>
                  <tbody>
                    {filteredAll.map(l => (
                      <tr key={l.id}>
                        <td className="td-primary">{l.student_name}</td>
                        <td style={{ textTransform:'capitalize' }}>{l.type}</td>
                        <td>{l.from}</td><td>{l.to}</td><td>{l.days}d</td>
                        <td className="td-clip">{l.reason}</td>
                        <td><span className={`badge badge-${l.status.toLowerCase()}`}>{l.status}</span></td>
                        <td className="td-muted td-clip">{l.remarks}</td>
                      </tr>
                    ))}
                    {!filteredAll.length && <tr><td colSpan={8}><div className="empty-state"><div className="empty-icon">📭</div><p>No records found</p></div></td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── STUDENTS ── */}
        {page === 'students' && (
          <div className="fade-in">
            <div className="topbar"><div className="topbar-left"><h1>My Students</h1><p>Mentorship list with leave and attendance summary</p></div></div>
            <div className="card">
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Name</th><th>Roll No</th><th>Year</th><th>Leaves Used</th><th>Remaining</th><th>Attendance</th><th>Status</th></tr></thead>
                  <tbody>
                    {STUDENTS.map(s => {
                      const rem = 15 - s.used
                      const flag = s.used > 5
                      const attColor = s.att < 75 ? 'var(--rejected)' : s.att < 85 ? 'var(--pending)' : 'var(--approved)'
                      return (
                        <tr key={s.id}>
                          <td className="td-primary">{s.name}</td>
                          <td className="td-muted">{s.id}</td>
                          <td>{s.year}</td>
                          <td>{s.used}</td>
                          <td style={{ color: rem < 5 ? 'var(--rejected)' : 'var(--approved)' }}>{rem}</td>
                          <td style={{ color: attColor }}>{s.att}%</td>
                          <td><span className={`badge ${flag ? 'badge-rejected' : 'badge-approved'}`}>{flag ? '⚠ High Absence' : '✓ Good'}</span></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── REPORTS ── */}
        {page === 'reports' && (
          <div className="fade-in">
            <div className="topbar"><div className="topbar-left"><h1>Reports &amp; Analytics</h1><p>Leave patterns and department overview</p></div></div>
            <div className="stats-grid">
              <div className="stat-card c-teal"><div className="stat-icon">📊</div><div className="stat-value">{total}</div><div className="stat-label">Total Applications</div><div className="stat-sub">this semester</div></div>
              <div className="stat-card c-teal"><div className="stat-icon">✅</div><div className="stat-value">{total ? Math.round(totalApproved/total*100)+'%' : '—'}</div><div className="stat-label">Approval Rate</div><div className="stat-sub">approved vs total</div></div>
              <div className="stat-card c-yellow"><div className="stat-icon">📅</div><div className="stat-value">{total ? (totalDays/total).toFixed(1) : '—'}</div><div className="stat-label">Avg Days / Leave</div><div className="stat-sub">average duration</div></div>
              <div className="stat-card"><div className="stat-icon">🏆</div><div className="stat-value" style={{ fontSize:'1rem', textTransform:'capitalize' }}>{Object.entries(typeCounts).sort((a,b)=>b[1]-a[1])[0]?.[0] || '—'}</div><div className="stat-label">Most Common</div><div className="stat-sub">leave type</div></div>
            </div>
            <div className="grid-1-1">
              <div className="card">
                <div className="card-title" style={{ marginBottom:'1.25rem' }}><div className="card-icon">📊</div>Leave Type Breakdown</div>
                {total ? Object.entries(typeCounts).sort((a,b)=>b[1]-a[1]).map(([t,c]) => {
                  const pct = Math.round(c/total*100)
                  return (
                    <div key={t} className="rpt-bar">
                      <div className="rpt-bar-header"><span className="rpt-bar-label">{t}</span><span className="rpt-bar-count">{c} ({pct}%)</span></div>
                      <div className="progress-wrap"><div className="progress-fill teal" style={{ width: pct+'%' }} /></div>
                    </div>
                  )
                }) : <div className="empty-state"><p>No data yet</p></div>}
              </div>
              <div className="card">
                <div className="card-title" style={{ marginBottom:'1.25rem' }}><div className="card-icon">📅</div>Month-wise Summary</div>
                {Object.keys(months).length ? Object.entries(months).sort().map(([m,d]) => (
                  <div key={m} className="qs-row"><span className="qs-label">{m}</span><span className="qs-val">{d} day{d>1?'s':''}</span></div>
                )) : <div className="empty-state"><p>No data yet</p></div>}
              </div>
            </div>
          </div>
        )}

        {/* ── PROFILE ── */}
        {page === 'profile' && (
          <div className="fade-in">
            <div className="topbar"><div className="topbar-left"><h1>My Profile</h1><p>Your faculty information</p></div></div>
            <div className="card">
              <div style={{ display:'flex', alignItems:'center', gap:'1.25rem', marginBottom:'1.5rem', paddingBottom:'1.5rem', borderBottom:'1px solid var(--border)' }}>
                <div className="avatar-lg avatar-faculty">{user?.name?.split(' ').filter(w=>w).map(w=>w[0]).join('').toUpperCase().slice(0,2)}</div>
                <div>
                  <p style={{ fontSize:'1.2rem', fontWeight:600, color:'var(--text-1)' }}>{user?.name}</p>
                  <p style={{ color:'var(--text-3)', fontSize:'.875rem', marginTop:'.2rem' }}>{user?.designation} · {user?.dept}</p>
                </div>
              </div>
              <div className="profile-grid">
                <div className="profile-field"><label>Employee ID</label><p>{user?.roll_id}</p></div>
                <div className="profile-field"><label>Department</label><p>{user?.dept}</p></div>
                <div className="profile-field"><label>Designation</label><p>{user?.designation}</p></div>
                <div className="profile-field"><label>Mentoring</label><p>{STUDENTS.length} students</p></div>
                <div className="profile-field"><label>Email</label><p>{user?.email}</p></div>
                <div className="profile-field"><label>Joined</label><p>2015</p></div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ── REVIEW MODAL ── */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            <div className="modal-header">
              <h3>Review Leave Request</h3>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="modal-grid">
              <div className="modal-field"><label>Student</label><p>{modal.student_name}</p></div>
              <div className="modal-field"><label>Leave Type</label><p style={{ textTransform:'capitalize' }}>{modal.type}</p></div>
              <div className="modal-field"><label>From Date</label><p>{modal.from}</p></div>
              <div className="modal-field"><label>To Date</label><p>{modal.to}</p></div>
              <div className="modal-field"><label>Duration</label><p>{modal.days} day{modal.days>1?'s':''}</p></div>
              <div className="modal-field"><label>Applied On</label><p>{modal.ts}</p></div>
            </div>
            <div className="modal-field" style={{ marginTop:'.85rem' }}>
              <label>Reason</label>
              <p style={{ color:'var(--text-2)', lineHeight:1.5, fontSize:'.875rem' }}>{modal.reason}</p>
            </div>
            <div className="form-group" style={{ marginTop:'1rem' }}>
              <label className="form-label">Remarks for Student (optional)</label>
              <textarea className="form-control" value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Add a note for the student…" />
            </div>
            <div className="modal-actions">
              <button className="btn btn-success" onClick={() => confirmAction('Approved')}>✓ Approve</button>
              <button className="btn btn-danger"  onClick={() => confirmAction('Rejected')}>✗ Reject</button>
              <button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


