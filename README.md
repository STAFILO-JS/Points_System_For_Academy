# 🎓 Points System for Academy

A minimal full-stack academic portal built with **Express**, **Prisma 7**, and **PostgreSQL (Docker)**.

Teachers can:
- Create student accounts
- Create subjects
- Assign and update scores
- View a list of students with their IDs

Students can:
- Login securely
- View their scores per subject

---

## 🛠 Tech Stack

- Node.js
- Express 5
- Prisma 7
- PostgreSQL (Docker)
- JWT Authentication
- Vanilla HTML + JavaScript frontend

---

## 📦 Project Structure

```
points-system-for-academy/
│
├── prisma/
│   ├── schema.prisma
│   ├── seed.js
│   └── migrations/
│
├── public/
│   ├── index.html
│   └── app.js
│
├── src/
│   ├── server.js
│   ├── prisma.js
│   ├── middleware.js
│   ├── routes.admin.js
│   └── routes.me.js
│
├── docker-compose.yml
├── dontenvexample.txt make it into a .env duh
└── package.json
```

---

## 🚀 Setup Instructions

### 1) Install dependencies

```bash
npm install
```

### 2) Start PostgreSQL with Docker

```bash
docker compose up -d
```

Make sure Docker Desktop is running.

### 3) Create environment file

Copy the example:

```bash
cp .env.example .env
```

Then edit `.env`:

```
DATABASE_URL="postgresql://app:yourpassword@localhost:5433/teacher_portal"
JWT_ACCESS_SECRET="super-secret"
JWT_REFRESH_SECRET="another-secret"
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=7d
```

### 4) Generate Prisma Client

```bash
npx prisma generate
```

### 5) Run database migrations

```bash
npx prisma migrate dev --name init
```

### 6) Seed demo teacher (optional)

```bash
node prisma/seed.js
```

Default demo login:

```
Email: teacher@academy.com
Password: teacher123
```

### 7) Start the server

```bash
npm run dev
```

Open in browser:

```
http://localhost:3000
```

---

## 🔐 Authentication

Authentication is handled using JWT access tokens.

After login:
- Access token is stored in localStorage
- Protected routes require `Authorization: Bearer <token>`

---

## 📚 API Overview

### Auth
```
POST /auth/login
GET  /me
```

### Teacher (Protected)
```
GET    /admin/students
POST   /admin/students
GET    /admin/subjects
POST   /admin/subjects
PUT    /admin/scores
```

### Student (Protected)
```
GET /me/scores
```

---

## 🧠 Database Models

- User (TEACHER | STUDENT)
- Subject
- Score (unique studentId + subjectId pair)

---

## 🧹 Development Notes

- No inline scripts (CSP safe)
- Passwords hashed with bcrypt
- Role-based access control via middleware
- Prisma adapter used for PostgreSQL connection

---

## 📈 Possible Improvements

- Score averages and leaderboard
- Pagination
- Refresh tokens
- Password reset
- Dockerized Express app
- Production deployment

---

Made By Nika Zedginidze
Backed Dev/ ultimate gulav man
