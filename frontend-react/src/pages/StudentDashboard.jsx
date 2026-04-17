import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'
import Sidebar from '../components/Sidebar'
import Toast from '../components/Toast'
import { useToast } from '../hooks/useToast'

const QUOTA = 15
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const STATUS_MAP = {
  'Pending with Lecturer': { text: 'Submitted to Lecturer', class: 'badge-pending' },
  'Approved by Lecturer and Forwarded to Admin': { text: 'Approved by Lecturer, Awaiting Admin Approval', class: 'badge-info' },
  'Rejected by Lecturer': { text: 'Rejected by Lecturer', class: 'badge-rejected' },
  'Pending with Admin': { text: 'Awaiting Admin Approval', class: 'badge-info' }, // Fallback
  'Approved by Admin': { text: 'Approved by Admin', class: 'badge-approved' },
  'Rejected by Admin': { text: 'Rejected by Admin', class: 'badge-rejected' },
}

export default function StudentDashboard() {
  const { user } = useAuth()
  const { toasts, showToast } = useToast()
  const [page, setPage] = useState('dashboard')
  const [leaves, setLeaves] = useState([])
  const [notifs, setNotifs] = useState([])
  const [calDate, setCalDate] = useState(new Date())

  // Form state
  const today = new Date().toISOString().split('T')[0]
  const [leaveType, setLeaveType] = useState('')
  const [fromDate, setFromDate] = useState(today)
  const [toDate, setToDate] = useState(today)
  const [reason, setReason] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')

  const load = useCallback(async () => {
    try {
      const [l, n] = await Promise.all([api.myLeaves(), api.getNotifs()])
      setLeaves(l)
      setNotifs(n)
    } catch (e) {
      showToast('Error', e.message, 'error')
    }
  }, [showToast])

  useEffect(() => { load() }, [load])

  const days = Math.max(1, Math.round((new Date(toDate) - new Date(fromDate)) / 86400000) + 1)
  const approved = leaves.filter(l => l.status === 'Approved by Admin')
  const used = approved.reduce((s, l) => s + l.days, 0)
  const remaining = Math.max(0, QUOTA - used)
  const unread = notifs.filter(n => !n.read).length
  const quotaPct = Math.round((used / QUOTA) * 100)

  const submitLeave = async () => {
    if (!leaveType) { showToast('Missing Field', 'Please select a leave type.', 'warning'); return }
    if (!reason.trim()) { showToast('Missing Field', 'Please provide a reason.', 'warning'); return }
    if (new Date(toDate) < new Date(fromDate)) { showToast('Invalid Dates', 'End date cannot be before start date.', 'error'); return }
    if (used + days > QUOTA) { showToast('Quota Exceeded', `Only ${QUOTA - used} days remaining.`, 'error'); return }
    try {
      await api.applyLeave({ leave_type: leaveType, from_date: fromDate, to_date: toDate, days, reason: reason.trim() })
      setLeaveType('')
      setReason('')
      setFromDate(today)
      setToDate(today)
      await load()
      showToast('Submitted', 'Your leave application has been sent to your lecturer.', 'success')
      setPage('history')
    } catch (e) { showToast('Error', e.message, 'error') }
  }

  const markNotifsRead = async () => {
    try {
      await api.markRead()
      setNotifs(n => n.map(x => ({ ...x, read: true })))
    } catch (e) { }
  }

  // Calendar
  const leaveDays = new Set()
  leaves.filter(l => !l.status.includes('Rejected')).forEach(l => {
    let d = new Date(l.from_date + 'T00:00:00')
    const end = new Date(l.to_date + 'T00:00:00')
    while (d <= end) {
      if (d.getMonth() === calDate.getMonth() && d.getFullYear() === calDate.getFullYear())
        leaveDays.add(d.getDate())
      d.setDate(d.getDate() + 1)
    }
  })
  const firstDay = new Date(calDate.getFullYear(), calDate.getMonth(), 1).getDay()
  const daysInM = new Date(calDate.getFullYear(), calDate.getMonth() + 1, 0).getDate()
  const todayDate = new Date()

  const filteredLeaves = [...leaves].filter(l =>
    (filterStatus === 'all' || l.status === filterStatus) &&
    (filterType === 'all' || l.leave_type === filterType)
  )

  const notifDot = t => t === 'approved' ? 'dot-teal' : t === 'rejected' ? 'dot-red' : 'dot-yellow'

  const renderStatus = (s) => {
    const config = STATUS_MAP[s] || { text: s, class: 'badge-pending' }
    return <span className={`badge ${config.class}`}>{config.text}</span>
  }

  return (
    <div className="dash-layout">
      <div className="bg-mesh" /><div className="bg-grid" />
      <Toast toasts={toasts} />
      <button className="mobile-toggle" onClick={() => document.querySelector('.sidebar').classList.toggle('open')}>☰</button>
      <Sidebar role="student" activePage={page} onNavigate={p => { setPage(p); if (p === 'notifications') markNotifsRead() }} unread={unread} />

      <main className="main">

        {/* ── DASHBOARD ── */}
        {page === 'dashboard' && (
          <div className="fade-in">
            <div className="topbar">
              <div className="topbar-left">
                <h1>{`${new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'}, ${(user?.student_name || user?.roll_no || 'Student').split(' ')[0]}`}</h1>
                <p>Welcome back to AbsentAlert Student Portal</p>
              </div>
              <div className="topbar-right">
                <button className="btn btn-primary btn-sm" onClick={() => setPage('apply')}>+ New Leave Request</button>
              </div>
            </div>
            <div className="stats-grid">
              <div className="stat-card c-yellow">
                <div className="stat-icon">PND</div>
                <div className="stat-value">{leaves.filter(l => l.status.includes('Pending') || l.status.includes('Forwarded')).length}</div>
                <div className="stat-label">Pending Reviews</div>
                <div className="stat-sub">with Lecturer/Admin</div>
              </div>
              <div className="stat-card c-teal">
                <div className="stat-icon">APR</div>
                <div className="stat-value">{approved.length}</div>
                <div className="stat-label">Final Approved</div>
                <div className="stat-sub">by Admin</div>
              </div>
              <div className="stat-card c-red">
                <div className="stat-icon">REJ</div>
                <div className="stat-value">{leaves.filter(l => l.status.includes('Rejected')).length}</div>
                <div className="stat-label">Rejected</div>
                <div className="stat-sub">this semester</div>
              </div>
              <div className="stat-card c-blue">
                <div className="stat-icon">TOT</div>
                <div className="stat-value">{leaves.length}</div>
                <div className="stat-label">Total Applications</div>
                <div className="stat-sub">submitted so far</div>
              </div>
            </div>
            <div className="grid-2-1">
              <div className="card">
                <div className="card-header">
                  <div className="card-title"><div className="card-icon">—</div>Recent Status Updates</div>
                  <button className="btn btn-ghost btn-sm" onClick={() => setPage('history')}>View All</button>
                </div>
                <div className="table-wrap">
                  <table><thead><tr><th>Type</th><th>Dates</th><th>Days</th><th>Status</th></tr></thead>
                    <tbody>
                      {leaves.slice(0, 5).map(l => (
                        <tr key={l.id}>
                          <td style={{ textTransform: 'capitalize' }}>{l.leave_type}</td>
                          <td>{l.from_date}{l.from_date !== l.to_date ? ' to ' + l.to_date : ''}</td>
                          <td>{l.days}d</td>
                          <td>{renderStatus(l.status)}</td>
                        </tr>
                      ))}
                      {!leaves.length && <tr><td colSpan={4}><div className="empty-state"><p>No applications yet</p></div></td></tr>}
                    </tbody></table>
                </div>
              </div>
              <div className="card">
                <div className="card-header">
                  <div className="card-title"><div className="card-icon">—</div>Recent Activity</div>
                  <button className="btn btn-ghost btn-sm" onClick={() => { setPage('notifications'); markNotifsRead() }}>All</button>
                </div>
                {notifs.slice(0, 4).map(n => (
                  <div key={n.id} className="notif-item">
                    <div className={`notif-dot ${notifDot(n.type)}`} />
                    <div className="notif-body"><p>{n.msg}</p><span>{n.time}</span></div>
                  </div>
                ))}
                {!notifs.length && <div className="empty-state"><p>No activities found</p></div>}
              </div>
            </div>
          </div>
        )}

        {/* ── APPLY ── */}
        {page === 'apply' && (
          <div className="fade-in">
            <div className="topbar"><div className="topbar-left"><h1>Apply for Leave</h1><p>Your request will be sent to your lecturer for initial review.</p></div></div>
            <div className="card">
              <div className="card-title" style={{ marginBottom: '1.5rem' }}><div className="card-icon">—</div>New Application</div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Leave Type</label>
                  <select className="form-control" value={leaveType} onChange={e => setLeaveType(e.target.value)}>
                    <option value="">Select type</option>
                    <option value="medical">Medical / Health</option>
                    <option value="personal">Personal</option>
                    <option value="family">Family Emergency</option>
                    <option value="academic">Academic Event</option>
                    <option value="sports">Sports / Cultural</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Total Days</label>
                  <input className="form-control" type="number" value={days} readOnly />
                </div>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">From Date</label>
                  <input className="form-control" type="date" value={fromDate} min={today} onChange={e => setFromDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">To Date</label>
                  <input className="form-control" type="date" value={toDate} min={fromDate} onChange={e => setToDate(e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Reason for Absence</label>
                <textarea className="form-control" value={reason} onChange={e => setReason(e.target.value)} placeholder="Please provide a clear reason for your leave request" />
              </div>
              <div style={{ display: 'flex', gap: '.75rem', marginTop: '.75rem', flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={submitLeave}>Submit to Lecturer</button>
                <button className="btn btn-secondary" onClick={() => { setLeaveType(''); setReason(''); setFromDate(today); setToDate(today) }}>Clear Form</button>
              </div>
            </div>
          </div>
        )}

        {/* ── HISTORY ── */}
        {page === 'history' && (
          <div className="fade-in">
            <div className="topbar"><div className="topbar-left"><h1>Leave History</h1><p>Detailed view of all your leave applications</p></div></div>
            <div className="card">
              <div style={{ display: 'flex', gap: '.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                <select className="form-control" style={{ width: 'auto', padding: '.45rem .85rem', fontSize: '.82rem' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                  <option value="all">All Status</option>
                  {Object.keys(STATUS_MAP).map(s => <option key={s} value={s}>{STATUS_MAP[s].text}</option>)}
                </select>
                <select className="form-control" style={{ width: 'auto', padding: '.45rem .85rem', fontSize: '.82rem' }} value={filterType} onChange={e => setFilterType(e.target.value)}>
                  <option value="all">All Types</option><option value="medical">Medical</option><option value="personal">Personal</option><option value="family">Family</option><option value="academic">Academic</option><option value="sports">Sports</option>
                </select>
              </div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Date Applied</th><th>Type</th><th>Duration</th><th>Days</th><th>Reason</th><th>Status</th><th>Remarks</th></tr></thead>
                  <tbody>
                    {filteredLeaves.map((l, i) => (
                      <tr key={l.id}>
                        <td className="td-muted">{new Date(l.created_at).toLocaleDateString()}</td>
                        <td style={{ textTransform: 'capitalize' }}>{l.leave_type}</td>
                        <td>{l.from_date} to {l.to_date}</td>
                        <td>{l.days}</td>
                        <td className="td-clip" title={l.reason}>{l.reason}</td>
                        <td>{renderStatus(l.status)}</td>
                        <td className="td-muted td-clip" title={l.remarks}>{l.remarks || '—'}</td>
                      </tr>
                    ))}
                    {!filteredLeaves.length && <tr><td colSpan={7}><div className="empty-state"><p>No records found</p></div></td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── CALENDAR ── */}
        {page === 'calendar' && (
          <div className="fade-in">
            <div className="topbar"><div className="topbar-left"><h1>Leave Calendar</h1><p>Visual view of your leave days</p></div></div>
            <div className="grid-1-1">
              <div className="card">
                <div className="cal-nav">
                  <button className="cal-nav-btn" onClick={() => setCalDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}>‹</button>
                  <h3>{MONTHS[calDate.getMonth()]} {calDate.getFullYear()}</h3>
                  <button className="cal-nav-btn" onClick={() => setCalDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}>›</button>
                </div>
                <div className="cal-grid">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d} className="cal-day-label">{d}</div>)}
                  {Array(firstDay).fill(null).map((_, i) => <div key={'e' + i} className="cal-day empty" />)}
                  {Array(daysInM).fill(null).map((_, i) => {
                    const d = i + 1
                    const isToday = todayDate.getDate() === d && todayDate.getMonth() === calDate.getMonth() && todayDate.getFullYear() === calDate.getFullYear()
                    return <div key={d} className={`cal-day${isToday ? ' today' : ''}${leaveDays.has(d) ? ' leave' : ''}`}>{d}</div>
                  })}
                </div>
                <div className="cal-legend">
                  <div className="cal-legend-item"><div className="cal-legend-dot" style={{ background: 'var(--teal-dim)', border: '1px solid var(--teal)' }} />Today</div>
                  <div className="cal-legend-item"><div className="cal-legend-dot" style={{ background: 'var(--pending-bg)' }} />Confirmed Leave</div>
                </div>
              </div>
              <div className="card">
                <div className="card-title" style={{ marginBottom: '1rem' }}><div className="card-icon">—</div>Upcoming Absences</div>
                {leaves.filter(l => new Date(l.from_date + 'T00:00:00') >= new Date() && !l.status.includes('Rejected')).map(l => (
                  <div key={l.id} className="upcoming-item">
                    <div className="upcoming-row">
                      <span className="upcoming-title">{l.leave_type}</span>
                      {renderStatus(l.status)}
                    </div>
                    <p className="upcoming-meta">{l.from_date} to {l.to_date} · {l.days} day{l.days > 1 ? 's' : ''}</p>
                  </div>
                ))}
                {!leaves.filter(l => new Date(l.from_date + 'T00:00:00') >= new Date() && !l.status.includes('Rejected')).length &&
                  <div className="empty-state"><p>No upcoming travels or leaves</p></div>}
              </div>
            </div>
          </div>
        )}

        {/* ── NOTIFICATIONS ── */}
        {page === 'notifications' && (
          <div className="fade-in">
            <div className="topbar"><div className="topbar-left"><h1>Notifications</h1><p>Updates on your leave status</p></div></div>
            <div className="card">
              {notifs.length ? notifs.map(n => (
                <div key={n.id} className={`notif-item${!n.read ? ' unread' : ''}`}>
                  <div className={`notif-dot ${notifDot(n.type)}`} />
                  <div className="notif-body"><p>{n.msg}</p><span>{n.time}</span></div>
                </div>
              )) : <div className="empty-state"><p>No new notifications</p></div>}
            </div>
          </div>
        )}

        {/* ── PROFILE ── */}
        {page === 'profile' && (
          <div className="fade-in">
            <div className="topbar"><div className="topbar-left"><h1>Student Profile</h1></div></div>
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                <div className="avatar-lg avatar-student">
                  {(user?.student_name || user?.roll_no || 'S').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div>
                  <p style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-1)' }}>{user?.student_name || user?.roll_no}</p>
                  <p style={{ color: 'var(--text-3)', fontSize: '.875rem', marginTop: '.2rem' }}>{user?.department} · Semester {user?.semester}</p>
                </div>
              </div>
              <div className="profile-grid">
                <div className="profile-field"><label>Roll Number</label><p>{user?.roll_no}</p></div>
                <div className="profile-field"><label>Email</label><p>{user?.email}</p></div>
                <div className="profile-field"><label>Class</label><p>{user?.class_name}</p></div>
                <div className="profile-field"><label>Semester</label><p>{user?.semester || '—'}</p></div>
                <div className="profile-field"><label>Department</label><p>{user?.department}</p></div>
                <div className="profile-field"><label>Max Quota</label><p>{QUOTA} days / semester</p></div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
