const BASE = '/api'

async function req(method, path, body) {
  // 1. Network check — backend not running?
  let res
  try {
    res = await fetch(BASE + path, {
      method,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new Error('Cannot connect to server. Is the backend running on port 5000?')
  }

  // 2. Safe JSON parse — backend returned empty / non-JSON body
  let data
  try {
    data = await res.json()
  } catch {
    throw new Error(`Server error (HTTP ${res.status}) — invalid response. Check backend terminal for details.`)
  }

  // 3. API-level error (4xx / 5xx with JSON body)
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Request failed')
  }

  return data
}

export const api = {
  // Auth
  studentRegister:  (d)  => req('POST', '/student/register', d),
  studentLogin:     (d)  => req('POST', '/student/login', d),
  lecturerRegister: (d)  => req('POST', '/lecturer/register', d),
  lecturerLogin:    (d)  => req('POST', '/lecturer/login', d),
  managementLogin:  (d)  => req('POST', '/management/login', d),
  me:               ()   => req('GET',  '/me'),
  logout:           ()   => req('POST', '/logout'),

  // Leaves
  applyLeave:           (d)      => req('POST', '/leaves/apply', d),
  myLeaves:             ()       => req('GET',  '/leaves/my'),
  studentRequests:      ()       => req('GET',  '/leaves/student-requests'),
  lecturerRequests:     ()       => req('GET',  '/leaves/lecturer-requests'),
  adminStudentRequests: ()       => req('GET',  '/leaves/admin/student-requests'),
  adminLecturerRequests:()       => req('GET',  '/leaves/admin/lecturer-requests'),
  allLeaves:            ()       => req('GET',  '/leaves/all'),
  approveLeave:         (id, d)  => req('POST', `/leaves/approve/${id}`, d),
  rejectLeave:          (id, d)  => req('POST', `/leaves/reject/${id}`, d),

  // Admin
  createClass:      (d)      => req('POST',   '/admin/create-class', d),
  getClasses:       ()       => req('GET',    '/admin/classes'),
  deleteClass:      (id)     => req('DELETE', `/admin/delete-class/${id}`),
  createSubject:    (d)      => req('POST',   '/admin/create-subject', d),
  getSubjects:      ()       => req('GET',    '/admin/subjects'),
  deleteSubject:    (id)     => req('DELETE', `/admin/delete-subject/${id}`),
  assignLecturer:   (d)      => req('POST',   '/admin/assign-lecturer', d),
  getAssignments:   ()       => req('GET',    '/admin/assignments'),
  updateAssignment: (id, d)  => req('PUT',    `/admin/update-assignment/${id}`, d),
  deleteAssignment: (id)     => req('DELETE', `/admin/delete-assignment/${id}`),
  getStudents:      ()       => req('GET',    '/admin/students'),
  getLecturers:     ()       => req('GET',    '/admin/lecturers'),
  getDashboard:     ()       => req('GET',    '/admin/dashboard'),
  getStudentReport: ()       => req('GET',    '/leaves/student-report'),

  // Notifications
  getNotifs:    () => req('GET',   '/notifications/'),
  readAllNotifs:() => req('PATCH', '/notifications/read-all'),
}
