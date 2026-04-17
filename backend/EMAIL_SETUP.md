# AbsentAlert — Email Setup Guide

## How Email Works in AbsentAlert

AbsentAlert uses **Gmail SMTP** via Flask-Mail to send automatic notifications:

| Trigger | Who receives email |
|---|---|
| Student applies leave | Class mentor (lecturer) |
| Lecturer approves leave | Student |
| Lecturer rejects leave | Student |
| Management approves lecturer leave | Lecturer |
| Management rejects lecturer leave | Lecturer |

---

## Step-by-Step Gmail Setup

### Step 1 — Enable 2-Step Verification
1. Go to [myaccount.google.com](https://myaccount.google.com)
2. Click **Security** in the left sidebar
3. Under "How you sign in to Google", click **2-Step Verification**
4. Follow the steps to enable it

### Step 2 — Generate an App Password
1. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Select app: **Mail**
3. Select device: **Other (Custom name)** → type "AbsentAlert"
4. Click **Generate**
5. Copy the **16-character password** shown (e.g. `abcd efgh ijkl mnop`)

### Step 3 — Configure AbsentAlert
1. Copy `.env.example` to `.env`:
   ```
   copy .env.example .env
   ```
2. Open `.env` and fill in:
   ```
   MAIL_USERNAME=yourname@gmail.com
   MAIL_PASSWORD=abcdefghijklmnop
   ```
   (paste the 16-char app password without spaces)

### Step 4 — Install python-dotenv
```bash
pip install python-dotenv
```

### Step 5 — Restart Flask
```bash
python app.py
```

---

## Security Notes

- **Never commit `.env` to GitHub** — it's in `.gitignore`
- App Password is different from your Gmail password — it only works for this app
- You can revoke it anytime from Google Account settings
- The app sends emails silently — if SMTP fails, the leave action still works

---

## Testing Email

To test if email works, apply a leave as a student. Check:
1. Flask terminal — should show `[MAIL] Sent to lecturer@email.com: [AbsentAlert] New Leave Request`
2. Lecturer's inbox — should receive the notification email

If you see `[MAIL ERROR]` in the terminal, check:
- App password is correct (no spaces)
- 2-Step Verification is enabled
- Less secure app access is NOT needed (App Password bypasses this)

---

## Alternative: Use a Different Email Provider

If you don't want to use Gmail, update `app.py`:

**Outlook/Hotmail:**
```python
app.config['MAIL_SERVER'] = 'smtp-mail.outlook.com'
app.config['MAIL_PORT']   = 587
```

**Yahoo Mail:**
```python
app.config['MAIL_SERVER'] = 'smtp.mail.yahoo.com'
app.config['MAIL_PORT']   = 587
```
