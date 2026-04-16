# 📋 LeaveFlow — Automated Leave Intimation System for Colleges

> A fully functional, browser-based leave management system for students and faculty — no backend, no setup, just open and run.

---

## 🚨 Problem Statement

College leave management is still largely paper-based. Students hand-write applications, physically submit them to faculty, and wait days for approval with zero visibility into status. This creates delays, lost paperwork, miscommunication, and no reliable records for administration.

---

## 💡 Proposed Solution

**LeaveFlow** digitizes the entire leave lifecycle:
- Students submit applications through a structured portal
- Faculty receive instant notifications and can approve/reject in one click
- All records are maintained digitally with real-time status tracking

---

## ✨ Key Features

### Student Portal
- Apply for leave by type (Medical, Academic, Personal, Family, Sports)
- Auto-calculated duration from date range
- Faculty auto-assignment
- Live status tracking (Pending / Approved / Rejected)
- Leave history with filters
- Leave calendar with visual day markers
- Real-time notifications (submitted, approved, rejected)
- Attendance summary & quota tracker

### Faculty Portal
- Dashboard with pending requests count
- Review modal — approve or reject with remarks
- All requests view with status filter
- Student roster with attendance flags (⚠ High Absence)
- Reports & Analytics — leave type breakdown, approval rate, month-wise trends
- Notifications sent to student on every action

---

## 🛠 Technology Stack

| Layer | Technology |
|---|---|
| Structure | HTML5 (3 pages: login, student dashboard, faculty dashboard) |
| Styling | CSS3 — custom properties, glassmorphism, grid, flexbox, animations |
| Logic | Vanilla JavaScript ES6+ (modular — storage.js, student.js, faculty.js) |
| Storage | Browser `localStorage` (simulates backend DB) |
| Fonts | Google Fonts — Inter + Sora |
| Deployment | Static hosting (GitHub Pages / Netlify / any static host) |

---

## 🚀 Getting Started

```bash
# Clone the repo
git clone https://github.com/svishwas1224/AbsentAleart.git

# Open in browser — no install needed
open index.html
```

### Demo Credentials

| Role | Email | Password |
|---|---|---|
| Student | student@demo.com | 1234 |
| Faculty | faculty@demo.com | 1234 |

---

## 📁 Project Structure

```
├── index.html              ← Login page
├── student-dashboard.html  ← Student portal
├── faculty-dashboard.html  ← Faculty portal
├── css/
│   ├── main.css            ← Base styles, tokens, animations
│   ├── components.css      ← Buttons, cards, badges, tables, modals, toasts
│   └── dashboard.css       ← Sidebar, layout, calendar, responsive
└── js/
    ├── storage.js          ← localStorage helpers + seed data
    ├── student.js          ← Student dashboard logic
    ├── faculty.js          ← Faculty dashboard logic
    └── auth.js             ← Login logic (used in index.html inline)
```

---

## 📊 Expected Impact

- Reduces leave processing time from **days → minutes**
- Eliminates lost paperwork and manual follow-ups
- Gives students **full transparency** into application status
- Gives faculty a **clean dashboard** to manage their entire mentee group
- Provides digital audit trail and attendance analytics for administration
- **Zero infrastructure cost** — runs entirely in the browser

---

## 🔮 Future Scope

- Node.js + MongoDB backend to replace localStorage
- JWT authentication & role-based access control
- Real email/SMS notifications via Nodemailer / Twilio
- Admin panel for HOD / Principal
- Mobile app (React Native)
- Multi-college / multi-tenant support

---

*Built for college hackathon — LeaveFlow team*
