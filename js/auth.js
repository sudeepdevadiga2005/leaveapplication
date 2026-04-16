/* ============================================================
   LeaveFlow — Auth & View Router
   ============================================================ */
let currentRole = 'student';

/* ── Role tabs ── */
function setRole(role) {
  currentRole = role;
  document.getElementById('tab-student').classList.toggle('active', role === 'student');
  document.getElementById('tab-faculty').classList.toggle('active', role === 'faculty');
  document.getElementById('login-email').value    = '';
  document.getElementById('login-pass').value     = '';
  document.getElementById('login-error').style.display = 'none';
  document.getElementById('login-email').placeholder = role === 'student' ? 'student@demo.com' : 'faculty@demo.com';
}

function fillDemo(role) {
  setRole(role);
  document.getElementById('login-email').value = role === 'student' ? 'student@demo.com' : 'faculty@demo.com';
  document.getElementById('login-pass').value  = '1234';
}

/* ── Login ── */
function login() {
  const email = document.getElementById('login-email').value.trim();
  const pass  = document.getElementById('login-pass').value.trim();
  const btn   = document.getElementById('login-btn');

  if (!email || !pass) { _loginError('Please enter your credentials.'); return; }

  btn.disabled   = true;
  btn.innerHTML  = '<span class="spinner"></span> Signing in…';

  setTimeout(() => {
    if (currentRole === 'student' && email === 'student@demo.com' && pass === '1234') {
      Storage.setUser({ role:'student', name:'Arjun Sharma', id:'CS2021045', dept:'Computer Science', year:'3rd Year', faculty:'Dr. Priya Nair' });
      _showView('student');
    } else if (currentRole === 'faculty' && email === 'faculty@demo.com' && pass === '1234') {
      Storage.setUser({ role:'faculty', name:'Dr. Priya Nair', id:'FAC2015', dept:'Computer Science', designation:'Associate Professor' });
      _showView('faculty');
    } else {
      btn.disabled  = false;
      btn.innerHTML = 'Sign In &nbsp;→';
      _loginError('Invalid credentials. Use the demo accounts below.');
    }
  }, 650);
}

function _loginError(msg) {
  const el = document.getElementById('login-error');
  el.textContent   = '⚠ ' + msg;
  el.style.display = 'block';
  setTimeout(() => el.style.display = 'none', 4500);
}

/* ── View switcher ── */
function _showView(view) {
  document.getElementById('login-view').style.display   = 'none';
  document.getElementById('student-view').style.display = 'none';
  document.getElementById('faculty-view').style.display = 'none';
  document.getElementById(view + '-view').style.display = 'flex';
  if (view === 'student') initStudent();
  if (view === 'faculty') initFaculty();
}

/* ── Logout (called from both dashboards) ── */
function logout() {
  Storage.clearUser();
  document.getElementById('login-email').value = '';
  document.getElementById('login-pass').value  = '';
  document.getElementById('login-btn').disabled   = false;
  document.getElementById('login-btn').innerHTML  = 'Sign In &nbsp;→';
  setRole('student');
  _showView('login');
}

/* ── Global toast ── */
function showToast(title, msg, type = 'success') {
  const icons = { success:'✅', error:'❌', warning:'⚠️', info:'ℹ️' };
  const t = document.createElement('div');
  t.className = `toast t-${type}`;
  t.innerHTML = `<span class="toast-icon">${icons[type]||'ℹ️'}</span>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-msg">${msg}</div>
    </div>`;
  document.getElementById('toast-container').appendChild(t);
  requestAnimationFrame(() => { requestAnimationFrame(() => t.classList.add('show')); });
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 500);
  }, 3800);
}

/* ── Mobile sidebar ── */
function toggleSidebar(viewPrefix) {
  document.querySelector(`#${viewPrefix}-view .sidebar`)?.classList.toggle('open');
}

/* ── Boot ── */
document.addEventListener('DOMContentLoaded', () => {
  Storage.seed();
  const user = Storage.getUser();
  if (user?.role === 'student')      _showView('student');
  else if (user?.role === 'faculty') _showView('faculty');
  else                               _showView('login');

  document.getElementById('login-email').addEventListener('keydown', e => { if (e.key === 'Enter') login(); });
  document.getElementById('login-pass').addEventListener('keydown',  e => { if (e.key === 'Enter') login(); });
});
