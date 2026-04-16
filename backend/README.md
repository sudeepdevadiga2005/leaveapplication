# AbsentAlert — Backend

> Current implementation uses browser `localStorage` as the data layer (prototype/demo).
> This folder contains the data schema and seed data for future Flask + MongoDB/SQLite integration.

## Current Storage
All data is persisted in the browser via `localStorage` using three keys:
- `lf_user`   — logged-in user session
- `lf_leaves` — all leave applications
- `lf_notifs` — all notifications

## Seed Data
`data/seed.json` — contains the initial demo data structure including users, students, leaves, and notifications.

## Planned Backend Stack

```
backend/
├── app.py                  ← Flask entry point
├── requirements.txt        ← Flask, pymongo, flask-cors, python-dotenv
├── config.py               ← DB_URI, SECRET_KEY, env config
├── routes/
│   ├── auth.py             ← POST /api/login, POST /api/logout
│   ├── leaves.py           ← GET/POST /api/leaves, PATCH /api/leaves/:id
│   └── notifications.py    ← GET /api/notifications
├── models/
│   ├── user.py             ← User schema (MongoDB / SQLite)
│   ├── leave.py            ← Leave schema
│   └── notification.py     ← Notification schema
├── middleware/
│   └── auth.py             ← JWT token verification
├── data/
│   └── seed.json           ← Seed data
└── .env                    ← MONGO_URI / DB_PATH, SECRET_KEY, PORT
```

## Tech Stack
| Layer | Technology |
|---|---|
| Runtime | Python 3.x |
| Framework | Flask |
| Database | MongoDB Atlas (cloud) or SQLite (local) |
| Auth | JWT via PyJWT |
| Email Alerts | Flask-Mail |
| CORS | Flask-CORS |
| Deployment | Render / Railway |

## Quick Start (once implemented)
```bash
pip install -r requirements.txt
python app.py
# API runs at http://localhost:5000
```
