# SkillForge LMS

A production-ready Learning Management System similar to Udemy, built with modern full-stack technologies.

**Repository**: [AtharvaHunnur/learning_platform_01](https://github.com/AtharvaHunnur/learning_platform_01)

---

## 🚀 Key Features

- **Decoupled Architecture**: Next.js 15 Frontend and Node.js/Express Backend.
- **Authentication**: Secure JWT authentication with Refresh Token rotation.
- **Course Hierarchy**: Manage Subjects, Sections, and Videos with ease.
- **Video Resumption & Progress Tracking**: Automatic tracking of student learning progress, allowing students to resume videos exactly where they left off.
- **Certificate Generation**: Automatically generated certificates of completion for students who finish a course.
- **Admin Dashboard**: Comprehensive tools for content management and payment tracking.
- **Deployment Ready**: Optimized for Vercel and production databases.

---

## 📖 Documentation

For a detailed breakdown of the technical architecture, core features, and technical achievements, please refer to the full [Project Documentation](project_documentation.md).

---

## 🛠️ Tech Stack

**Frontend**: Next.js (App Router), Tailwind CSS 4, Zustand, Lucide React, Axios.  
**Backend**: Node.js, Express, TypeScript, Prisma ORM, MySQL (Aiven).

---

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

---

## 🔑 Demo Credentials
- **Student**: `student@lms.com` / `student123`
- **Admin**: `admin@lms.com` / `admin123`
