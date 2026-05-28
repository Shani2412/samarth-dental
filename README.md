# 🦷 Samarth Dental Care — Full Stack Web App

**Next.js 14 + Express.js + PostgreSQL + Prisma**  
Vijapur, Mehsana, Gujarat

---

## 📁 Project Structure

```
samarth-dental-final/
├── frontend/         → Next.js 14 (Port 3000)
├── backend/          → Express.js API (Port 5000)
├── package.json      → Root scripts (run both together)
└── README.md
```

---

## ⚡ Quick Start (Step by Step)

### Step 1 — Install Dependencies

```bash
npm run install:all
```

This installs packages for root, backend, and frontend.

---

### Step 2 — Setup Database

1. Install PostgreSQL on your machine (if not already)
2. Create a database:
   ```sql
   CREATE DATABASE samarth_dental;
   ```
3. Edit `backend/.env`:
   ```
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/samarth_dental"
   ```
   Replace `YOUR_PASSWORD` with your PostgreSQL password.

---

### Step 3 — Run Prisma Migration

```bash
npm run db:generate
npm run db:migrate
```

This creates all database tables and auto-creates the admin user.

---

### Step 4 — Start Both Servers Together

```bash
npm run dev
```

This runs **backend** (port 5000) and **frontend** (port 3000) simultaneously.

- 🌐 Website: http://localhost:3000
- 🔧 API: http://localhost:5000
- ❤️ Health check: http://localhost:5000/health

---

## 🔑 Default Login Credentials

| Role  | Email                    | Password     |
|-------|--------------------------|--------------|
| Admin | admin@samarthdental.com  | samarth@123  |

You can change these in `backend/.env`.

---

## 📧 Email Setup (Optional)

To enable email notifications for appointments:

1. Go to: https://myaccount.google.com/apppasswords
2. Create an app password for "Mail"
3. Edit `backend/.env`:
   ```
   EMAIL_USER=yourgmail@gmail.com
   EMAIL_PASS=xxxx xxxx xxxx xxxx   ← 16 char app password
   CLINIC_EMAIL=doctor@yourmail.com
   ```

---

## 🗺️ App Pages

| URL                      | Who Sees It        |
|--------------------------|--------------------|
| `/login`                 | Everyone           |
| `/signup`                | Everyone           |
| `/website`               | Logged-in patients |
| `/dashboard`             | Patients only      |
| `/dashboard/book`        | Book appointment   |
| `/dashboard/appointments`| My appointments    |
| `/dashboard/review`      | Leave a review     |
| `/admin`                 | Admin only         |
| `/admin/appointments`    | Admin only         |
| `/admin/reviews`         | Admin only         |
| `/admin/users`           | Admin only         |

---

## 🚀 Production Build

```bash
# Build frontend
npm run build

# Start both in production mode
npm run start
```

---

## 🛠️ Useful Commands

```bash
npm run db:studio      # Open Prisma Studio (visual DB viewer)
npm run dev:backend    # Run only backend
npm run dev:frontend   # Run only frontend
```

---

## 🔧 Environment Variables

### `backend/.env`
| Variable        | Description                         |
|-----------------|-------------------------------------|
| `PORT`          | Backend port (default: 5000)        |
| `DATABASE_URL`  | PostgreSQL connection string        |
| `JWT_SECRET`    | Secret key for JWT tokens           |
| `ADMIN_EMAIL`   | Admin account email                 |
| `ADMIN_PASS`    | Admin account password              |
| `EMAIL_USER`    | Gmail address for sending emails    |
| `EMAIL_PASS`    | Gmail App Password (16 chars)       |
| `CLINIC_EMAIL`  | Email where booking alerts go       |
| `FRONTEND_URL`  | Frontend URL for CORS (port 3000)   |

### `frontend/.env.local`
| Variable                   | Description               |
|----------------------------|---------------------------|
| `NEXT_PUBLIC_API_URL`      | Backend URL (port 5000)   |
| `NEXT_PUBLIC_CLINIC_PHONE` | WhatsApp number           |

---

Made with ❤️ for Samarth Dental Care, Vijapur, Mehsana, Gujarat
