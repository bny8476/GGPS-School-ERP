# GGPS School — School Management ERP

> Production-ready, enterprise-grade School Management System powering **GGPS School**.

---

## 🌟 Overview

**GGPS School ERP** is a unified digital platform built for administration, principals, teachers, parents, guardians, accountants, HR, librarians, and transport managers. 

Built with Next.js 16 (App Router) on the frontend and Express 5 + Mongoose on the backend, it features dynamic role-based workspaces, data-level authorization, real-time messaging, comprehensive academic tracking, and financial workflows.

---

## 🚀 Key Features & Modules

- 👨‍🎓 **Student 360° Profile & Academic History:** Academic, attendance, fee ledger, exam results, medical history, transport, and activity timeline.
- 🏫 **Academic Management & Conflict-Free Timetable:** Classrooms, sections, subjects, syllabus progress, and routine conflict detection.
- 💳 **Fee Collection & Automated Receipts:** Multiple payment methods (Cash, Card, UPI, Gateway), discounts, late fees, and computer-generated PDF receipts.
- 📊 **Multi-Role Dashboards:** Dynamic views tailored for Admin, Teacher, and Parent roles.
- 🔒 **Enterprise RBAC & Security:** JWT authentication, fail-fast env validation, role-based data filtering, and central audit logging (`AuditLog`).
- 💬 **Communication Suite:** Real-time Socket.IO chat, announcements, events calendar, and notification center.
- 📚 **Operations & HR:** Library book cataloging, hostel room occupancy, transport vehicle routing, staff payroll lifecycle, and support tickets.

---

## 🛠 Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, TailwindCSS, `react-hot-toast`, Lucide Icons
- **Backend:** Express 5, Node.js, TypeScript, Mongoose, Socket.IO, PDFKit, Zod, Helmet, Express-Rate-Limit
- **Database:** MongoDB
- **Testing:** Jest, Supertest

---

## 📂 Environment Setup

Create `.env` inside `backend/`:

```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/ggps_school_erp
JWT_SECRET=your_super_secret_jwt_key
FRONTEND_URL=http://localhost:3000
```

---

## ⚡ Quick Start

```bash
# Install dependencies at root, backend, and frontend
npm install
npm run dev
```

---

## 🏥 Health Check API

```http
GET /api/health
```

**Response:**
```json
{
  "status": "ok",
  "service": "GGPS School ERP",
  "database": "connected",
  "timestamp": "2026-10-01T16:00:00.000Z"
}
```

---

## 📜 License

© 2026 **GGPS School ERP**. All rights reserved.
