# 🎓 AbsentAlert — Automated Leave Intimation System for Colleges

> A fully functional, browser-based leave management system that eliminates manual paperwork and automates the entire leave lifecycle for students and faculty.

---

## 👥 Team Members

| Name | Role |
|---|---|
| Sudeep | Frontend & UI Design |
| Bhagyaraj | Logic & Integration |
| Vishwas | Backend Architecture & Storage |
| Sumukha | Testing & Documentation |

---

## 🚨 Problem Statement

In many colleges, leave management is still handled manually. Students submit handwritten applications and wait for approval without knowing the status. This leads to delays, confusion, and sometimes loss of records. Faculty also face difficulty in tracking student leave and attendance due to the lack of a centralized system.

---

## 💡 Proposed Solution

**AbsentAlert** is a web-based system that simplifies and automates the leave application process. Students can apply for leave online, and faculty can easily approve or reject requests. The system provides real-time updates and stores all records digitally, making the process faster, transparent, and easy to manage.

---

## ✨ Key Features

- 🎓 **Student portal** to apply for leave online
- 👨‍🏫 **Faculty dashboard** to approve or reject requests
- 🔔 **Real-time status tracking** with instant notifications
- 📅 **Leave calendar view** with visual day markers
- 📊 **Simple dashboard** for monitoring leave data
- 🗂️ **Digital record** of all leave requests with filters
- 📈 **Reports & Analytics** — leave type breakdown, approval rate, month-wise trends
- ⚠️ **Attendance alerts** — flags students with high absenteeism

---

## 🛠 Technology Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3 (Grid, Flexbox, Glassmorphism, Animations) |
| Styling | CSS Custom Properties, Responsive Design |
| Logic | Vanilla JavaScript ES6+ (Modular) |
| Storage | Browser `localStorage` (prototype) → MongoDB Atlas / SQLite (production) |
| Backend *(planned)* | Flask (Python) |
| Deployment | Render / Railway / Static Hosting |
| Fonts | Google Fonts — Inter + Sora |

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
| 🎓 Student | student@demo.com | 1234 |
| 👨‍🏫 Faculty | faculty@demo.com | 1234 |

---

## 📁 Project Structure

```
AbsentAlert/
├── index.html                          ← Login page (entry point)
├── README.md
├── frontend/
│   ├── pages/
│   │   ├── student-dashboard.html      ← Student portal
│   │   └── faculty-dashboard.html      ← Faculty portal
│   └── assets/
│       ├── styles/
│       │   ├── main.css                ← Design tokens, variables, animations
│       │   ├── components.css          ← Buttons, cards, badges, tables, modals, toasts
│       │   └── dashboard.css           ← Sidebar, layout, calendar, responsive
│       └── scripts/
│           ├── storage.js              ← localStorage data layer + seed data
│           ├── student.js              ← Student dashboard logic
│           └── faculty.js              ← Faculty dashboard logic
└── backend/
    ├── README.md                       ← Flask + MongoDB backend roadmap
    └── data/
        └── seed.json                   ← Mock data schema
```

---

## 📊 Expected Impact

- Reduces leave processing time from **days → minutes**
- Eliminates lost paperwork and manual follow-ups
- Gives students **full transparency** into application status
- Gives faculty a **clean dashboard** to manage their entire mentee group
- Provides digital audit trail and attendance analytics for administration
- **Zero infrastructure cost** for prototype — runs entirely in the browser

---

## 🔮 Future Scope (Backend Roadmap)

- **Flask (Python)** REST API replacing localStorage
- **MongoDB Atlas / SQLite** for persistent data storage
- JWT authentication & role-based access control
- Real email/SMS notifications via Flask-Mail / Twilio
- Admin panel for HOD / Principal
- Deployment on **Render / Railway**
- Mobile-responsive PWA

---

*Built for college hackathon — Team AbsentAlert (Sudeep, Bhagyaraj, Vishwas, Sumukha)*
