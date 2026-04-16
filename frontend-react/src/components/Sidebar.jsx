import { useAuth } from '../context/AuthContext'

const NAV = {
  student: [
    { id:'dashboard',     icon:'🏠', label:'Dashboard' },
    { id:'apply',         icon:'✍️', label:'Apply Leave' },
    { id:'history',       icon:'📋', label:'Leave History' },
    { id:'calendar',      icon:'📅', label:'Calendar' },
    { id:'notifications', icon:'🔔', label:'Notifications', badge:true },
    { id:'profile',       icon:'👤', label:'Profile' },
  ],
  lecturer: [
    { id:'dashboard',     icon:'🏠', label:'Dashboard' },
    { id:'requests',      icon:'⏳', label:'Student Requests', badge:true },
    { id:'all-requests',  icon:'📋', label:'All Requests' },
    { id:'apply',         icon:'✍️', label:'Apply My Leave' },
    { id:'my-leaves',     icon:'📄', label:'My Leave History' },
    { id:'profile',       icon:'👤', label:'Profile' },
  ],
  management: [
    { id:'dashboard',     icon:'🏠', label:'Dashboard' },
    { id:'assignments',   icon:'🔗', label:'Lecturer Assignments' },
    { id:'classes',       icon:'🏫', label:'Classes & Subjects' },
    { id:'lecturer-leaves',icon:'👨‍🏫',label:'Lecturer Leaves', badge:true },
    { id:'forwarded',     icon:'📨', label:'Forwarded Leaves' },
    { id:'all-leaves',    icon:'📋', label:'All Leaves' },
    { id:'students',      icon:'🎓', label:'Students' },
    { id:'lecturers',     icon:'👥', label:'Lecturers' },
    { id:'profile',       icon:'👤', label:'Profile' },
  ],
}

const ROLE_COLOR = { student:'student', lecturer:'faculty', management:'faculty' }
const ROLE_LABEL = { student:'Student Portal', lecturer:'Lecturer Portal', management:'Management Portal' }

export default function Sidebar({ activePage, onNavigate, badge = 0 }) {
  const { user, logout } = useAuth()
  const role = user?.role || 'student'
  const ini  = (user?.student_name || user?.lecturer_name || user?.email || 'U')
    .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  const displayName = user?.student_name || user?.lecturer_name || user?.email || ''
  const meta = role === 'student'
    ? `${user?.roll_no} · ${user?.class_name}`
    : role === 'lecturer'
    ? user?.department
    : 'Administrator'

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark">🎓</div>
        <div className="brand-text">
          <h2>Absent<span>Alert</span></h2>
          <p>{ROLE_LABEL[role]}</p>
        </div>
      </div>

      <div className="sidebar-user">
        <div className={`sidebar-avatar ${ROLE_COLOR[role]}`}>{ini}</div>
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">{displayName}</div>
          <div className="sidebar-user-meta">{meta}</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">Navigation</div>
        {(NAV[role] || []).map(item => (
          <div key={item.id}
            className={`nav-item ${activePage === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}>
            <span className="nav-icon">{item.icon}</span>
            {item.label}
            {item.badge && badge > 0 && (
              <span className="nav-badge yellow">{badge}</span>
            )}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="btn-logout" onClick={logout}>↩ &nbsp;Sign Out</button>
      </div>
    </aside>
  )
}
