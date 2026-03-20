# Antigravity LMS

A production-ready Learning Management System similar to Udemy.

## 🚀 Quick Start

### 1. Backend
```bash
cd backend
npm install
npm run dev
```
The database is already configured via the `.env` file and seeded with sample data.

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` to start learning.

## 🔑 Demo Credentials
- **Student**: `student@lms.com` / `student123`
- **Admin**: `admin@lms.com` / `admin123`

## 🔷 Technology Stack
- **Frontend**: Next.js 14 (App Router), Tailwind CSS, Zustand, Axios
- **Backend**: Node.js, Express, Prisma ORM, MySQL (Aiven)
- **Auth**: JWT with cookie-based Refresh Token rotation
- **Video**: YouTube IFrame Player API
