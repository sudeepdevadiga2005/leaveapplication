import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'
import Sidebar from '../components/Sidebar'
import Toast from '../components/Toast'
import { useToast } from '../hooks/useToast'

const STATUS_BADGE = {
  'Pending with Lecturer': 'badge-warning',
  'Rejected by Lecturer': 'badge-rejected',
  'Approved by Lecturer and Forwarded to Admin': 'badge-info',
  'Pending with Admin': 'badge-warning',
  'Approved by Admin': 'badge-approved',
  'Rejected by Admin': 'badge-rejected',
}

export default function LecturerDashboard() {
  const { user } = useAuth()
  const { toasts, showToast } = useToast()
  const [page, setPage] = useState('dashboard')
  const [requests, setRequests] = useState([])
  const [myLeaves, setMyLeaves] = useState([])
  const [modal, setModal] = useState(null)
  const [remarks, setRemarks] = useState('')
  const [modalAction, setModalAction] = useState('')

  const today = new Date().toISOString().split('T')[0]
  const [leaveType, setLeaveType] = useState('')
  const [fromDate, setFromDate] = useState(today)
  const [toDate, setToDate] = useState(today)
  const [reason, setReason] = useState('')

  const load = useCallback(async () => {
    try {
      const [r, m] = await Promise.all([api.studentRequests(), api.myLeaves()])
      setRequests(r)
      setMyLeaves(m)
    } catch (e) {
      showToast('Error', e.message, 'error')
    }
  }, [showToast])

  useEffect(() => { load() }, [load])

  const pendingRequests = requests.filter(l => l.status === 'Pending with Lecturer')
  const days = Math.max(1, Math.round((new Date(toDate) - new Date(fromDate)) / 86400000) + 1)
  const h = new Date().getHours()
  const greet = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'

  const openModal = (leave, action) => { setModal(leave); setModalAction(action); setRemarks('') }

  const confirmAction = async () => {
    if (!modal) return
    try {
      if (modalAction === 'approve') await api.approveLeave(modal.id, { remarks: remarks || 'Approved by Lecturer and Forwarded to Admin.' })
      if (modalAction === 'reject') await api.rejectLeave(modal.id, { remarks: remarks || 'Rejected by Lecturer.' })
      setModal(null)
      await load()
      showToast(
        modalAction === 'approve' ? 'Approved & Forwarded' : 'Rejected',
        modalAction === 'approve' ? 'Leave has been forwarded to Admin.' : 'Leave application rejected.',
        modalAction === 'approve' ? 'success' : 'error'
      )
    } catch (e) { showToast('Error', e.message, 'error') }
  }

  const submitLeave = async () => {
    if (!leaveType) { showToast('Missing', 'Select leave type', 'warning'); return }
    if (!reason.trim()) { showToast('Missing', 'Provide a reason', 'warning'); return }
    try {
      await api.applyLeave({ leave_type: leaveType, from_date: fromDate, to_date: toDate, days, reason })
      setLeaveType(''); setReason(''); setFromDate(today); setToDate(today)
      await load()
      showToast('Submitted', 'Your leave request has been sent to Admin.', 'success')
      setPage('my-leaves')
    } catch (e) { showToast('Error', e.message, 'error') }
  }

  const statusBadge = s => `badge ${STATUS_BADGE[s] || 'badge-pending'}`

  const ActionBtns = ({ l }) => (
    l.status === 'Pending with Lecturer' ? (
      <div style={{ display: 'flex', gap: 6 }}>
        <button className="btn btn-sm btn-success" style={{ minWidth: 70, fontWeight: 600 }}
          onClick={() => openModal(l, 'approve')}>Approve</button>
        <button className="btn btn-sm btn-danger" style={{ minWidth: 60, fontWeight: 600 }}
          onClick={() => openModal(l, 'reject')}>Reject</button>
      </div>
    ) : null
  )

  return (
    <div className="dash-layout">
      <div className="bg-mesh" /><div className="bg-grid" />
      <Toast toasts={toasts} />
      <button className="mobile-toggle" onClick={() => document.querySelector('.sidebar').classList.toggle('open')}>☰</button>
      <Sidebar activePage={page} onNavigate={setPage} badge={pendingRequests.length} />

      <main className="main">

        {/* DASHBOARD */}
        {page === 'dashboard' && (
          <div className="fade-in">
            <div className="topbar">
              <div className="topbar-left">
                <h1>{greet}, Lecturer</h1>
                <p>Manage your student requests and your own leaves</p>
              </div>
            </div>

            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
              <div className="stat-card c-yellow">
                <div className="stat-value">{pendingRequests.length}</div>
                <div className="stat-label">Pending Reviews</div>
                <div className="stat-sub">student applications</div>
              </div>
              <div className="stat-card c-teal">
                <div className="stat-value">{requests.filter(l => l.status.includes('Approved')).length}</div>
                <div className="stat-label">Forwarded/Approved</div>
                <div className="stat-sub">student leaves</div>
              </div>
              <div className="stat-card c-blue">
                <div className="stat-value">{myLeaves.length}</div>
                <div className="stat-label">My Own Leaves</div>
                <div className="stat-sub">applied to Admin</div>
              </div>
            </div>

            <div className="grid-2-1">
              <div className="card">
                <div className="card-header">
                  <div className="card-title">Awaiting Your Action</div>
                  <button className="btn btn-ghost btn-sm" onClick={() => setPage('requests')}>View All</button>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Student</th><th>Type</th><th>Dates</th><th>Days</th><th>Actions</th></tr></thead>
                    <tbody>
                      {pendingRequests.slice(0, 5).map(l => (
                        <tr key={l.id}>
                          <td className="td-primary">{l.applicant_name}</td>
                          <td style={{ textTransform: 'capitalize' }}>{l.leave_type}</td>
                          <td>{l.from_date} to {l.to_date}</td>
                          <td>{l.days}d</td>
                          <td><ActionBtns l={l} /></td>
                        </tr>
                      ))}
                      {!pendingRequests.length && (
                        <tr><td colSpan={5}><div className="empty-state"><p>No pending student requests.</p></div></td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="card">
                <div className="card-title" style={{ marginBottom: '1rem' }}>Overall Summary</div>
                {[
                  { label: 'Student Requests', val: requests.length },
                  { label: 'Needs My Review', val: pendingRequests.length, color: 'var(--pending)' },
                  { label: 'My Leave Status', val: myLeaves[0]?.status || 'None', color: myLeaves[0] ? 'var(--teal)' : 'var(--text-3)' },
                ].map(d => (
                  <div key={d.label} className="qs-row">
                    <span className="qs-label">{d.label}</span>
                    <span className="qs-val" style={{ color: d.color || 'var(--text-1)' }}>{d.val}</span>
                  </div>
                ))}
                <button className="btn btn-primary btn-full" style={{ marginTop: '1rem' }} onClick={() => setPage('apply')}>Apply for My Leave</button>
              </div>
            </div>
          </div>
        )}

        {/* STUDENT LEAVE REQUESTS */}
        {page === 'requests' && (
          <div className="fade-in">
            <div className="topbar">
              <div className="topbar-left">
                <h1>Student Leave Requests</h1>
                <p>Review and forward leave requests from your students</p>
              </div>
            </div>
            <div className="card">
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>Student</th><th>Class</th><th>Type</th><th>Duration</th><th>Days</th><th>Reason</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {requests.map(l => (
                      <tr key={l.id}>
                        <td className="td-primary">{l.applicant_name}</td>
                        <td><span className="badge badge-info">{l.class_name}</span></td>
                        <td style={{ textTransform: 'capitalize' }}>{l.leave_type}</td>
                        <td>{l.from_date} to {l.to_date}</td>
                        <td>{l.days}d</td>
                        <td className="td-clip" title={l.reason}>{l.reason}</td>
                        <td><span className={statusBadge(l.status)}>{l.status}</span></td>
                        <td><ActionBtns l={l} /></td>
                      </tr>
                    ))}
                    {!requests.length && (
                      <tr><td colSpan={8}><div className="empty-state"><p>No requests found.</p></div></td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* APPLY MY LEAVE */}
        {page === 'apply' && (
          <div className="fade-in">
            <div className="topbar">
              <div className="topbar-left">
                <h1>Apply for My Leave</h1>
                <p>Submit your personal leave request to the Management Admin</p>
              </div>
            </div>
            <div className="card">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Type of Leave</label>
                  <select className="form-control" value={leaveType} onChange={e => setLeaveType(e.target.value)}>
                    <option value="">Select type...</option>
                    <option value="medical">Medical</option>
                    <option value="personal">Personal Leave</option>
                    <option value="family">Family Responsibility</option>
                    <option value="academic">Academic Duty</option>
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
                  <label className="form-label">Start Date</label>
                  <input className="form-control" type="date" value={fromDate} min={today} onChange={e => setFromDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input className="form-control" type="date" value={toDate} min={fromDate} onChange={e => setToDate(e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Detailed Reason</label>
                <textarea className="form-control" value={reason} onChange={e => setReason(e.target.value)} placeholder="Provide context for your leave request..." />
              </div>
              <div style={{
                fontSize: '.78rem', color: '#1e40af', padding: '.75rem 1rem',
                background: '#dbeafe', border: '1px solid #3b82f6', borderRadius: 8, marginBottom: '1.25rem', lineHeight: 1.6
              }}>
                <strong>Notice:</strong> All lecturer leaves are processed directly by the Management/Admin team. You will be notified via email once a decision is made.
              </div>
              <button className="btn btn-primary" onClick={submitLeave}>Submit Request to Admin</button>
            </div>
          </div>
        )}

        {/* MY LEAVE HISTORY */}
        {page === 'my-leaves' && (
          <div className="fade-in">
            <div className="topbar">
              <div className="topbar-left">
                <h1>My Leave History</h1>
                <p>Overview of your personal leave applications</p>
              </div>
            </div>
            <div className="card">
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>Applied On</th><th>Type</th><th>Duration</th><th>Days</th><th>Reason</th><th>Current Status</th><th>Admin Remarks</th></tr>
                  </thead>
                  <tbody>
                    {myLeaves.map((l, i) => (
                      <tr key={l.id}>
                        <td className="td-muted">{new Date(l.created_at).toLocaleDateString()}</td>
                        <td style={{ textTransform: 'capitalize' }}>{l.leave_type}</td>
                        <td>{l.from_date} to {l.to_date}</td>
                        <td>{l.days}d</td>
                        <td className="td-clip" title={l.reason}>{l.reason}</td>
                        <td><span className={statusBadge(l.status)}>{l.status}</span></td>
                        <td className="td-muted td-clip" title={l.remarks}>{l.remarks || '—'}</td>
                      </tr>
                    ))}
                    {!myLeaves.length && (
                      <tr><td colSpan={7}><div className="empty-state"><p>You haven't applied for any leaves yet.</p></div></td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PROFILE */}
        {page === 'profile' && (
          <div className="fade-in">
            <div className="topbar"><div className="topbar-left"><h1>Lecturer Profile</h1></div></div>
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                <div className="avatar-lg avatar-faculty">
                  {user?.lecturer_name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div>
                  <p style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-1)' }}>{user?.lecturer_name}</p>
                  <p style={{ color: 'var(--text-3)', fontSize: '.875rem', marginTop: '.2rem' }}>{user?.department} · Faculty</p>
                </div>
              </div>
              <div className="profile-grid">
                <div className="profile-field"><label>Faculty ID</label><p>{user?.lecturer_id || '—'}</p></div>
                <div className="profile-field"><label>Department</label><p>{user?.department}</p></div>
                <div className="profile-field"><label>Email</label><p>{user?.email}</p></div>
                <div className="profile-field"><label>Account Type</label><p>Lecturer / Examiner</p></div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* REVIEW MODAL */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            <div className="modal-header">
              <h3>{modalAction === 'approve' ? 'Approve Student Leave' : 'Reject Student Leave'}</h3>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="modal-grid">
              <div className="modal-field"><label>Student Name</label><p>{modal.applicant_name}</p></div>
              <div className="modal-field"><label>Student Class</label><p>{modal.class_name}</p></div>
              <div className="modal-field"><label>Leave Type</label><p style={{ textTransform: 'capitalize' }}>{modal.leave_type}</p></div>
              <div className="modal-field"><label>Duration</label><p>{modal.from_date} to {modal.to_date} ({modal.days}d)</p></div>
            </div>
            <div className="modal-field" style={{ marginTop: '.85rem' }}>
              <label>Student's Reason</label>
              <p style={{ color: 'var(--text-2)', lineHeight: 1.5, fontSize: '.875rem' }}>{modal.reason}</p>
            </div>
            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label className="form-label">Your Remarks (will be visible to Student & Admin)</label>
              <textarea className="form-control" value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Provide any additional context..." />
            </div>
            <div className="modal-actions">
              {modalAction === 'approve' && (
                <button className="btn btn-success" style={{ minWidth: 140, fontWeight: 600 }} onClick={confirmAction}>Approve & Forward</button>
              )}
              {modalAction === 'reject' && (
                <button className="btn btn-danger" style={{ minWidth: 100, fontWeight: 600 }} onClick={confirmAction}>Reject Request</button>
              )}
              <button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
