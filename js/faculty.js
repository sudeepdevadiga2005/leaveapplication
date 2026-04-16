/* ============================================================
   LeaveFlow — Faculty Dashboard
   ============================================================ */
let currentLeaveId = null;
let sessionApproved = 0;

const STUDENTS = [
  { name:'Arjun Sharma',  id:'CS2021045', year:'3rd', used:5,  att:86 },
  { name:'Meera Patel',   id:'CS2021012', year:'3rd', used:3,  att:92 },
  { name:'Rohan Desai',   id:'CS2021033', year:'3rd', used:8,  att:78 },
  { name:'Sneha Iyer',    id:'CS2021067', year:'3rd', used:2,  att:95 },
  { name:'Karan Singh',   id:'CS2021089', year:'3rd', used:6,  att:81 },
  { name:'Priya Menon',   id:'CS2021054', year:'3rd', used:1,  att:97 },
  { name:'Dev Kapoor',    id:'CS2021071', year:'3rd', used:4,  att:88 },
  { name:'Ananya Rao',    id:'CS2021028', year:'3rd', used:7,  att:75 },
];

function initFaculty() {
  const user = Storage.getUser();
  if (!user || user.role !== 'faculty') return;
  _setFacultyUI(user);
  _refreshFacDash();
}

/* ── User UI ── */
function _setFacultyUI(u) {
  const ini = u.name.split(' ').filter(w => w).map(w => w[0]).join('').toUpperCase().slice(0, 2);
  ['f-avatar','f-fp-avatar'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = ini; });
  _fsetText('f-name',    u.name);
  _fsetText('f-meta',    u.designation);
  _fsetText('f-fp-name', u.name);
  _fsetText('f-fp-sub',  `${u.designation} · ${u.dept}`);
  _fsetText('f-fp-id',   u.id);
  _fsetText('f-fp-dept', u.dept);
  _fsetText('f-fp-desig',u.designation);
  const h = new Date().getHours();
  const g = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  _fsetText('f-welcome', `${g}, ${u.name.split(' ').pop()} 👋`);
}

function _refreshFacDash() {
  _updateFacStats();
  _renderFacDashPending();
  _renderQuickStats();
}

/* ── Stats ── */
function _updateFacStats() {
  const leaves  = Storage.getLeaves();
  const pending = leaves.filter(l => l.status === 'Pending').length;
  _fsetText('f-stat-pending',  pending);
  _fsetText('f-stat-approved', sessionApproved);
  const b = document.getElementById('f-pending-badge');
  if (b) { b.textContent = pending; b.style.display = pending > 0 ? 'inline-block' : 'none'; }
}

/* ── Dashboard pending ── */
function _renderFacDashPending() {
  const pending = Storage.getLeaves().filter(l => l.status === 'Pending');
  const tb = document.getElementById('f-dash-pending');
  if (!tb) return;
  tb.innerHTML = pending.length
    ? pending.map(l => `<tr>
        <td class="td-primary">Arjun Sharma</td>
        <td style="text-transform:capitalize;">${l.type}</td>
        <td>${l.from}${l.from !== l.to ? ' → ' + l.to : ''}</td>
        <td>${l.days}d</td>
        <td><button class="btn btn-sm btn-success" onclick="fOpenModal(${l.id})">Review →</button></td>
      </tr>`).join('')
    : `<tr><td colspan="5"><div class="empty-state"><div class="empty-icon">🎉</div><p>All caught up!</p></div></td></tr>`;
}

/* ── Quick stats ── */
function _renderQuickStats() {
  const l = Storage.getLeaves();
  const data = [
    { label:'Total Applications', val: l.length },
    { label:'Approved',           val: l.filter(x => x.status==='Approved').length,  color:'var(--approved)' },
    { label:'Pending',            val: l.filter(x => x.status==='Pending').length,   color:'var(--pending)'  },
    { label:'Rejected',           val: l.filter(x => x.status==='Rejected').length,  color:'var(--rejected)' },
    { label:'Medical Leaves',     val: l.filter(x => x.type==='medical').length },
    { label:'Academic Leaves',    val: l.filter(x => x.type==='academic').length },
  ];
  const el = document.getElementById('f-quick-stats');
  if (el) el.innerHTML = data.map(d => `
    <div class="qs-row">
      <span class="qs-label">${d.label}</span>
      <span class="qs-val" style="color:${d.color||'var(--text-1)'};">${d.val}</span>
    </div>`).join('');
}

/* ── Pending page ── */
function fRenderPending() {
  const pending = Storage.getLeaves().filter(l => l.status === 'Pending');
  const tb = document.getElementById('f-pending-table');
  tb.innerHTML = pending.length
    ? pending.map(l => `<tr>
        <td class="td-primary">Arjun Sharma</td>
        <td style="text-transform:capitalize;">${l.type}</td>
        <td>${l.from}</td><td>${l.to}</td>
        <td>${l.days}d</td>
        <td class="td-clip">${l.reason}</td>
        <td class="td-muted">${l.ts}</td>
        <td><button class="btn btn-sm btn-success" onclick="fOpenModal(${l.id})">Review →</button></td>
      </tr>`).join('')
    : `<tr><td colspan="8"><div class="empty-state"><div class="empty-icon">🎉</div><p>No pending requests</p></div></td></tr>`;
}

/* ── All requests ── */
function fRenderAllRequests() {
  const fs = document.getElementById('f-ar-status').value;
  let leaves = Storage.getLeaves();
  if (fs !== 'all') leaves = leaves.filter(l => l.status === fs);
  leaves = [...leaves].reverse();
  const tb = document.getElementById('f-all-table');
  tb.innerHTML = leaves.length
    ? leaves.map(l => `<tr>
        <td class="td-primary">Arjun Sharma</td>
        <td style="text-transform:capitalize;">${l.type}</td>
        <td>${l.from}</td><td>${l.to}</td>
        <td>${l.days}d</td>
        <td class="td-clip">${l.reason}</td>
        <td><span class="badge badge-${l.status.toLowerCase()}">${l.status}</span></td>
        <td class="td-muted td-clip">${l.remarks}</td>
      </tr>`).join('')
    : `<tr><td colspan="8"><div class="empty-state"><div class="empty-icon">📭</div><p>No records found</p></div></td></tr>`;
}

/* ── Students ── */
function fRenderStudents() {
  const tb = document.getElementById('f-students-table');
  tb.innerHTML = STUDENTS.map(s => {
    const rem = 15 - s.used;
    const flag = s.used > 5;
    const attColor = s.att < 75 ? 'var(--rejected)' : s.att < 85 ? 'var(--pending)' : 'var(--approved)';
    return `<tr>
      <td class="td-primary">${s.name}</td>
      <td class="td-muted">${s.id}</td>
      <td>${s.year}</td>
      <td>${s.used}</td>
      <td style="color:${rem < 5 ? 'var(--rejected)' : 'var(--approved)'};">${rem}</td>
      <td style="color:${attColor};">${s.att}%</td>
      <td><span class="badge ${flag ? 'badge-rejected' : 'badge-approved'}">${flag ? '⚠ High Absence' : '✓ Good'}</span></td>
    </tr>`;
  }).join('');
}

/* ── Reports ── */
function fRenderReports() {
  const leaves = Storage.getLeaves();
  const total  = leaves.length;
  const approved = leaves.filter(l => l.status === 'Approved').length;
  const totalDays = leaves.reduce((s, l) => s + l.days, 0);

  _fsetText('f-rpt-total',  total);
  _fsetText('f-rpt-rate',   total ? Math.round(approved / total * 100) + '%' : '—');
  _fsetText('f-rpt-avg',    total ? (totalDays / total).toFixed(1) : '—');

  const typeCounts = {};
  leaves.forEach(l => { typeCounts[l.type] = (typeCounts[l.type] || 0) + 1; });
  const top = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];
  _fsetText('f-rpt-common', top ? top[0] : '—');

  const breakdown = document.getElementById('f-type-breakdown');
  if (breakdown) {
    breakdown.innerHTML = total
      ? Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).map(([t, c]) => {
          const pct = Math.round(c / total * 100);
          return `<div class="rpt-bar">
            <div class="rpt-bar-header">
              <span class="rpt-bar-label">${t}</span>
              <span class="rpt-bar-count">${c} (${pct}%)</span>
            </div>
            <div class="progress-wrap"><div class="progress-fill teal" style="width:${pct}%"></div></div>
          </div>`;
        }).join('')
      : `<div class="empty-state"><p>No data yet</p></div>`;
  }

  const months = {};
  leaves.forEach(l => { const m = l.from.slice(0, 7); months[m] = (months[m] || 0) + l.days; });
  const monthEl = document.getElementById('f-month-breakdown');
  if (monthEl) {
    monthEl.innerHTML = Object.keys(months).length
      ? Object.entries(months).sort().map(([m, d]) => `
          <div class="qs-row">
            <span class="qs-label">${m}</span>
            <span class="qs-val">${d} day${d > 1 ? 's' : ''}</span>
          </div>`).join('')
      : `<div class="empty-state"><p>No data yet</p></div>`;
  }
}

/* ── Modal ── */
function fOpenModal(id) {
  currentLeaveId = id;
  const leave = Storage.getLeaves().find(l => l.id === id);
  if (!leave) return;
  document.getElementById('f-modal-content').innerHTML = `
    <div class="modal-grid">
      <div class="modal-field"><label>Student</label><p>Arjun Sharma</p></div>
      <div class="modal-field"><label>Leave Type</label><p style="text-transform:capitalize;">${leave.type}</p></div>
      <div class="modal-field"><label>From Date</label><p>${leave.from}</p></div>
      <div class="modal-field"><label>To Date</label><p>${leave.to}</p></div>
      <div class="modal-field"><label>Duration</label><p>${leave.days} day${leave.days > 1 ? 's' : ''}</p></div>
      <div class="modal-field"><label>Applied On</label><p>${leave.ts}</p></div>
    </div>
    <div class="modal-field" style="margin-top:0.85rem;">
      <label>Reason</label>
      <p style="color:var(--text-2);line-height:1.5;font-size:0.875rem;">${leave.reason}</p>
    </div>`;
  document.getElementById('f-modal-remarks').value = '';
  document.getElementById('f-action-modal').classList.add('open');
}

function fCloseModal() {
  document.getElementById('f-action-modal').classList.remove('open');
  currentLeaveId = null;
}

function fConfirmAction(status) {
  if (!currentLeaveId) return;
  const remarks = document.getElementById('f-modal-remarks').value.trim()
    || (status === 'Approved' ? 'Approved.' : 'Request rejected.');
  const updated = Storage.updateLeave(currentLeaveId, { status, remarks });
  if (!updated) return;
  Storage.addNotif({
    type: status === 'Approved' ? 'approved' : 'rejected',
    msg: `Your ${updated.type} leave for ${updated.from}${updated.from !== updated.to ? ' → ' + updated.to : ''} has been ${status.toLowerCase()}.`,
  });
  if (status === 'Approved') sessionApproved++;
  fCloseModal();
  _refreshFacDash();
  if (document.getElementById('f-page-pending')?.classList.contains('active'))      fRenderPending();
  if (document.getElementById('f-page-all-requests')?.classList.contains('active')) fRenderAllRequests();
  showToast(status === 'Approved' ? '✓ Approved' : '✗ Rejected',
    `Leave has been ${status.toLowerCase()} and student notified.`,
    status === 'Approved' ? 'success' : 'error');
}

/* ── Navigation ── */
function fShowPage(name) {
  document.querySelectorAll('#faculty-view .page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('#faculty-view .nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('f-page-' + name)?.classList.add('active');
  const map = { dashboard:0, pending:1, 'all-requests':2, students:3, reports:4, profile:5 };
  const items = document.querySelectorAll('#faculty-view .nav-item');
  if (items[map[name]] !== undefined) items[map[name]].classList.add('active');
  if (name === 'pending')      fRenderPending();
  if (name === 'all-requests') fRenderAllRequests();
  if (name === 'students')     fRenderStudents();
  if (name === 'reports')      fRenderReports();
  document.querySelector('#faculty-view .sidebar')?.classList.remove('open');
}

/* ── Helpers ── */
function _fsetText(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }
