/* ============================================================
   LeaveFlow — Student Dashboard
   ============================================================ */
const QUOTA = 15;
let calDate = new Date();

function initStudent() {
  const user = Storage.getUser();
  if (!user || user.role !== 'student') return;

  _setUserUI(user);
  _setGreeting(user);
  _refreshAll();
  _renderCal();
  _setDateDefaults();
  _updateNotifBadge();
}

/* ── User UI ── */
function _setUserUI(u) {
  const ini = u.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  _setText('s-avatar',       ini);
  _setText('s-profile-avatar', ini);
  _setText('s-sidebar-name', u.name);
  _setText('s-sidebar-meta', `${u.id} · ${u.year}`);
  _setText('s-pf-id',        u.id);
  _setText('s-pf-dept',      u.dept);
  _setText('s-pf-year',      u.year);
  _setText('s-pf-faculty',   u.faculty);
  _setText('s-profile-name', u.name);
  _setText('s-profile-sub',  `${u.dept} · ${u.year}`);
  const fn = document.getElementById('s-faculty-name');
  if (fn) fn.value = u.faculty;
}

function _setGreeting(u) {
  const h = new Date().getHours();
  const g = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  _setText('s-welcome', `${g}, ${u.name.split(' ')[0]} 👋`);
}

/* ── Refresh ── */
function _refreshAll() {
  _updateStats();
  _renderRecentTable();
  _renderDashNotifs();
}

/* ── Stats ── */
function _updateStats() {
  const leaves   = Storage.getLeaves();
  const approved = leaves.filter(l => l.status === 'Approved');
  const pending  = leaves.filter(l => l.status === 'Pending').length;
  const rejected = leaves.filter(l => l.status === 'Rejected').length;
  const used     = approved.reduce((s, l) => s + l.days, 0);
  const remaining = Math.max(0, QUOTA - used);

  _setText('s-stat-remaining', remaining);
  _setText('s-stat-pending',   pending);
  _setText('s-stat-approved',  approved.length);
  _setText('s-stat-rejected',  rejected);

  const pct = Math.round((used / QUOTA) * 100);
  const bar = document.getElementById('s-quota-bar');
  if (bar) {
    bar.style.width = pct + '%';
    bar.className = 'progress-fill ' + (pct >= 80 ? 'red' : pct >= 55 ? 'yellow' : 'teal');
  }
}

/* ── Recent table ── */
function _renderRecentTable() {
  const leaves = Storage.getLeaves().slice(-5).reverse();
  const tb = document.getElementById('s-recent-table');
  if (!tb) return;
  tb.innerHTML = leaves.length
    ? leaves.map(l => `<tr>
        <td style="text-transform:capitalize;">${l.type}</td>
        <td>${l.from}${l.from !== l.to ? ' → ' + l.to : ''}</td>
        <td>${l.days}d</td>
        <td><span class="badge badge-${l.status.toLowerCase()}">${l.status}</span></td>
      </tr>`).join('')
    : `<tr><td colspan="4"><div class="empty-state"><div class="empty-icon">📭</div><p>No applications yet</p></div></td></tr>`;
}

/* ── Dashboard notifs ── */
function _renderDashNotifs() {
  const el = document.getElementById('s-dash-notifs');
  if (!el) return;
  el.innerHTML = Storage.getNotifs().slice(0, 4).map(_notifHTML).join('');
}

/* ── History ── */
function sRenderHistory() {
  const fs = document.getElementById('s-filter-status').value;
  const ft = document.getElementById('s-filter-type').value;
  let leaves = Storage.getLeaves();
  if (fs !== 'all') leaves = leaves.filter(l => l.status === fs);
  if (ft !== 'all') leaves = leaves.filter(l => l.type   === ft);
  leaves = [...leaves].reverse();

  const tb = document.getElementById('s-history-table');
  tb.innerHTML = leaves.length
    ? leaves.map((l, i) => `<tr>
        <td class="td-muted">${i + 1}</td>
        <td style="text-transform:capitalize;">${l.type}</td>
        <td>${l.from}</td><td>${l.to}</td>
        <td>${l.days}</td>
        <td class="td-clip">${l.reason}</td>
        <td><span class="badge badge-${l.status.toLowerCase()}">${l.status}</span></td>
        <td class="td-muted td-clip">${l.remarks}</td>
      </tr>`).join('')
    : `<tr><td colspan="8"><div class="empty-state"><div class="empty-icon">📭</div><p>No records match your filters</p></div></td></tr>`;
}

/* ── Notifications ── */
function sRenderNotifs() {
  const notifs = Storage.getNotifs();
  const el = document.getElementById('s-all-notifs');
  el.innerHTML = notifs.length
    ? notifs.map(n => _notifHTML(n, true)).join('')
    : `<div class="empty-state"><div class="empty-icon">🔔</div><p>No notifications yet</p></div>`;
  Storage.saveNotifs(notifs.map(n => ({ ...n, read: true })));
  _updateNotifBadge();
}

function _notifHTML(n, full = false) {
  const dot = n.type === 'approved' ? 'dot-teal' : n.type === 'rejected' ? 'dot-red' : 'dot-yellow';
  return `<div class="notif-item${!n.read && full ? ' unread' : ''}">
    <div class="notif-dot ${dot}"></div>
    <div class="notif-body"><p>${n.msg}</p><span>${n.time}</span></div>
  </div>`;
}

function _updateNotifBadge() {
  const c = Storage.unreadCount();
  const b = document.getElementById('s-notif-badge');
  if (b) { b.textContent = c; b.style.display = c > 0 ? 'inline-block' : 'none'; }
}

/* ── Calendar ── */
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function _renderCal() {
  const el = document.getElementById('s-cal-title');
  if (!el) return;
  el.textContent = `${MONTHS[calDate.getMonth()]} ${calDate.getFullYear()}`;

  const today    = new Date();
  const firstDay = new Date(calDate.getFullYear(), calDate.getMonth(), 1).getDay();
  const daysInM  = new Date(calDate.getFullYear(), calDate.getMonth() + 1, 0).getDate();

  const leaveDays = new Set();
  Storage.getLeaves().filter(l => l.status !== 'Rejected').forEach(l => {
    let d = new Date(l.from + 'T00:00:00');
    const end = new Date(l.to + 'T00:00:00');
    while (d <= end) {
      if (d.getMonth() === calDate.getMonth() && d.getFullYear() === calDate.getFullYear())
        leaveDays.add(d.getDate());
      d.setDate(d.getDate() + 1);
    }
  });

  let html = '';
  for (let i = 0; i < firstDay; i++) html += '<div class="cal-day empty"></div>';
  for (let d = 1; d <= daysInM; d++) {
    const isToday = today.getDate() === d && today.getMonth() === calDate.getMonth() && today.getFullYear() === calDate.getFullYear();
    const isLeave = leaveDays.has(d);
    html += `<div class="cal-day${isToday ? ' today' : ''}${isLeave ? ' leave' : ''}">${d}</div>`;
  }
  document.getElementById('s-cal-grid').innerHTML = html;
  _renderUpcoming();
}

function sPrevMonth() { calDate.setMonth(calDate.getMonth() - 1); _renderCal(); }
function sNextMonth() { calDate.setMonth(calDate.getMonth() + 1); _renderCal(); }

function _renderUpcoming() {
  const now    = new Date();
  const leaves = Storage.getLeaves().filter(l => new Date(l.from + 'T00:00:00') >= now && l.status !== 'Rejected');
  const el     = document.getElementById('s-upcoming');
  if (!el) return;
  el.innerHTML = leaves.length
    ? leaves.map(l => `<div class="upcoming-item">
        <div class="upcoming-row">
          <span class="upcoming-title">${l.type} Leave</span>
          <span class="badge badge-${l.status.toLowerCase()}">${l.status}</span>
        </div>
        <p class="upcoming-meta">${l.from}${l.from !== l.to ? ' → ' + l.to : ''} · ${l.days} day${l.days > 1 ? 's' : ''}</p>
      </div>`).join('')
    : `<div class="empty-state"><div class="empty-icon">📅</div><p>No upcoming leaves</p></div>`;
}

/* ── Apply Leave ── */
function _setDateDefaults() {
  const today = new Date().toISOString().split('T')[0];
  const fd = document.getElementById('s-from-date');
  const td = document.getElementById('s-to-date');
  if (fd) { fd.min = today; if (!fd.value) fd.value = today; }
  if (td) { td.min = today; if (!td.value) td.value = today; }
  sCalcDays();
}

function sCalcDays() {
  const from = document.getElementById('s-from-date')?.value;
  const to   = document.getElementById('s-to-date')?.value;
  if (from && to) {
    const diff = Math.round((new Date(to) - new Date(from)) / 86400000) + 1;
    const el = document.getElementById('s-leave-days');
    if (el) el.value = diff > 0 ? diff : 1;
  }
}

function sClearForm() {
  document.getElementById('s-leave-type').value = '';
  document.getElementById('s-reason').value     = '';
  const fd = document.getElementById('s-from-date');
  const td = document.getElementById('s-to-date');
  const today = new Date().toISOString().split('T')[0];
  if (fd) fd.value = today;
  if (td) td.value = today;
  sCalcDays();
}

function sSubmitLeave() {
  const type   = document.getElementById('s-leave-type').value;
  const from   = document.getElementById('s-from-date').value;
  const to     = document.getElementById('s-to-date').value;
  const reason = document.getElementById('s-reason').value.trim();
  const days   = parseInt(document.getElementById('s-leave-days').value) || 1;

  if (!type)   { showToast('Missing Field', 'Please select a leave type.', 'warning'); return; }
  if (!reason) { showToast('Missing Field', 'Please provide a reason.', 'warning'); return; }
  if (new Date(to) < new Date(from)) { showToast('Invalid Dates', 'End date cannot be before start date.', 'error'); return; }

  const used = Storage.getLeaves().filter(l => l.status === 'Approved').reduce((s, l) => s + l.days, 0);
  if (used + days > QUOTA) {
    showToast('Quota Exceeded', `Only ${QUOTA - used} days remaining this semester.`, 'error');
    return;
  }

  Storage.addLeave({ id: Date.now(), type, from, to, days, reason, status: 'Pending', remarks: '—', ts: new Date().toISOString().split('T')[0] });
  Storage.addNotif({ type: 'pending', msg: `Leave application for ${from}${from !== to ? ' → ' + to : ''} submitted successfully.` });

  sClearForm();
  _refreshAll();
  _updateNotifBadge();
  showToast('Submitted ✓', 'Your leave application has been sent to your faculty.', 'success');
  sShowPage('history');
}

/* ── Navigation ── */
function sShowPage(name) {
  document.querySelectorAll('#student-view .page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('#student-view .nav-item').forEach(n => n.classList.remove('active'));

  document.getElementById('s-page-' + name)?.classList.add('active');

  const map = { dashboard:0, apply:1, history:2, calendar:3, notifications:4, profile:5 };
  const items = document.querySelectorAll('#student-view .nav-item');
  if (items[map[name]] !== undefined) items[map[name]].classList.add('active');

  if (name === 'history')       sRenderHistory();
  if (name === 'calendar')      _renderCal();
  if (name === 'notifications') sRenderNotifs();

  document.querySelector('#student-view .sidebar')?.classList.remove('open');
}

/* ── Helpers ── */
function _setText(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }
