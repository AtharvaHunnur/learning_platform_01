# Antigravity LMS - Project Documentation

## 📝 Overview
Antigravity LMS is a full-stack Learning Management System designed for high performance and seamless user experience. It follows a modern architecture with a decoupled frontend and backend, ensuring scalability and ease of maintenance. The platform allows admins to manage courses (subjects), sections, and videos, while students can enroll, track their progress, and make payments.

**Repository**: [AtharvaHunnur/learning_platform_01](https://github.com/AtharvaHunnur/learning_platform_01)

---

## 🏗️ Technical Architecture

### Frontend
- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Networking**: [Axios](https://axios-http.com/)
- **Video Player**: [React YouTube](https://www.npmjs.com/package/react-youtube) (YouTube IFrame Player API)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Database**: MySQL (hosted on Aiven)
- **Authentication**: JWT (JSON Web Tokens) with Secure Cookie-based Refresh Token rotation
- **Password Hashing**: [Bcryptjs](https://www.npmjs.com/package/bcryptjs)

---

## ✨ Core Features & Implementation Details

### 🔐 Authentication System
- **JWT-Based**: Access tokens are used for stateless authentication.
- **Refresh Token Rotation**: Implemented to enhance security by rotating tokens on each refresh.
- **Role-Based Access Control (RBAC)**: Distinguishes between `STUDENT` and `ADMIN` roles.
- **Secure Storage**: Tokens are handled via HTTP-only cookies to prevent XSS attacks.

### 📚 Course Management & Editor
- **Hierarchy**: Subjects -> Sections -> Videos.
- **Rich Content & Media**: Supports descriptions, custom ordering, and video thumbnails. Course and video thumbnails can be configured via direct image URLs or automatically extracted from YouTube URLs.
- **Advanced Editing**: Admins can seamlessly edit existing video details (title, URLs, thumbnails) via an interactive dialog-based UI.
- **Publication Workflow**: Allows drafting content before making it public.

### ⚙️ Admin Experience
- **Admin Dashboard**: Centralized hub for managing the entire platform.
- **Persistent Navigation**: Consistent navigation bar across all admin pages for easy context switching and seamless return to the main dashboard.

### 🎓 Student Experience
- **Course Enrollment**: Students can enroll in subjects and access exclusive video content.
- **Progress Tracking**: Automatic tracking of video completion and last-watched position.
- **Profile Management**: Personal dashboard for students to manage their account.

### 💳 Payment Integration
- **Transaction Tracking**: Comprehensive logging of payments including status (Pending, Completed, Failed).
- **History**: Both admins and students can view payment histories.

---

## 🗄️ Data Model (Prisma Schema)
The system uses a relational database with the following key entities:
- **`User`**: Stores identity, credentials, and roles.
- **`Subject`**: The top-level category for learning content.
- **`Section`**: Organizes videos within a subject.
- **`Video`**: Individual lessons linked to YouTube content.
- **`Enrollment`**: Many-to-many relationship between Users and Subjects.
- **`VideoProgress`**: Tracks per-user activity on specific videos.
- **`Payment`**: Records financial transactions.

---

## 🛠️ Key Technical Achievements & Bug Fixes
Throughout the development process, several critical issues were addressed:
- **Hydration Errors**: Fixed complex React hydration mismatches caused by nested interactive elements (e.g., buttons inside dialog triggers).
- **Dynamic Routing**: Resolved 404 errors in Next.js catch-all and dynamic segments for video playback.
- **Schema Refinement**: Fixed mismatches between application logic and Prisma schema (e.g., field naming consistency during user creation).
- **TypeScript Strictness**: Addressed unknown type errors in authentication catch blocks and missing NodeJS `process` types for database seed scripts.
- **Build Optimization**: Resolved extensive linting and TypeScript errors to ensure smooth Vercel deployments.
- **Environment Configuration**: Set up robust environment variable handling for cross-origin communication between frontend and backend.

---

## 🚀 Deployment
- **Frontend**: Deployed on [Vercel](https://vercel.com/).
- **Backend**: Deployed with CORS configured for the frontend domain.
- **Database**: Managed MySQL instance.

---

## 📖 Setup Instructions

### Prerequisites
- Node.js (v18+)
- MySQL Database

### Backend Setup
1. `cd backend`
2. `npm install`
3. Create `.env` from `.env.example` and fill in `DATABASE_URL`, `JWT_SECRET`, etc.
4. `npx prisma db push`
5. `npm run dev`

### Frontend Setup
1. `cd frontend`
2. `npm install`
3. Create `.env` with `NEXT_PUBLIC_API_URL` pointing to the backend.
4. `npm run dev`
