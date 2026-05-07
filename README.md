# TaskFlow — Team Task Management Application

![TaskFlow Banner](https://img.shields.io/badge/TaskFlow-Team%20Task%20Management-6366f1?style=for-the-badge)
[![Node.js](https://img.shields.io/badge/Node.js-v22-green?style=flat-square)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-v18-blue?style=flat-square)](https://reactjs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=flat-square)](https://mongodb.com/atlas)

A **production-grade full-stack Team Task Management** web application inspired by Trello & Asana. Built with React + Vite on the frontend and Node.js + Express + MongoDB on the backend.

---

## ✨ Features

### 🔐 Authentication
- JWT-based secure authentication
- Password hashing with bcrypt
- Persistent sessions (localStorage)
- Protected routes
- Auto-logout on token expiry

### 👥 Role-Based Access Control (RBAC)
| Feature | Admin | Member |
|---------|-------|--------|
| Create projects | ✅ | ❌ |
| Delete projects | ✅ | ❌ |
| Create/delete tasks | ✅ | ❌ |
| Assign tasks | ✅ | ❌ |
| Update task status | ✅ | ✅ |
| View analytics | ✅ | ✅ (own) |
| Manage users | ✅ | ❌ |
| Add/remove members | ✅ | ❌ |

### 📁 Project Management
- Create, view, update, delete projects
- Invite and remove team members
- Project progress tracking with visual progress bars
- Color-coded projects with deadline tracking

### ✅ Task Management
- Kanban board (Todo / In Progress / Done)
- Priority levels (High / Medium / Low)
- Task assignment with due dates
- Overdue task detection
- Task comments
- Search and multi-filter

### 📊 Analytics Dashboard
- Total / completed / pending / overdue task stats
- Tasks by status (bar chart)
- Tasks by priority (pie chart)
- Team productivity chart (tasks per user)
- Project completion percentages
- Upcoming deadlines view

### 🛡️ Admin Panel (separate `/admin` section)
- System-wide analytics dashboard
- User management (role change, activate/deactivate, delete)
- Full project and task oversight

---

## 🏗️ Tech Stack

### Frontend
| Tech | Purpose |
|------|---------|
| React 18 + Vite | Core framework |
| React Router DOM v6 | Client-side routing |
| Tailwind CSS v4 | Styling |
| Framer Motion | Animations |
| Recharts | Charts & analytics |
| React Hook Form | Form handling |
| React Toastify | Notifications |
| Axios | HTTP client |
| Lucide React | Icons |
| Context API | Global state |

### Backend
| Tech | Purpose |
|------|---------|
| Node.js + Express v5 | REST API |
| MongoDB + Mongoose | Database |
| JWT | Authentication |
| bcryptjs | Password hashing |
| express-validator | Input validation |
| cors + dotenv | Security & config |

---

## 📁 Project Structure

```
Task Manager/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js     # Auth logic
│   │   ├── projectController.js  # Project CRUD
│   │   ├── taskController.js     # Task CRUD
│   │   └── adminController.js    # Admin actions
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT verification
│   │   └── roleMiddleware.js     # Role-based guards
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── projectRoutes.js
│   │   ├── taskRoutes.js
│   │   └── adminRoutes.js
│   ├── utils/
│   │   └── responseHandler.js    # Standardized API responses
│   ├── server.js
│   └── .env
│
└── frontend/
    └── src/
        ├── context/
        │   ├── AuthContext.jsx
        │   └── ThemeContext.jsx
        ├── layouts/
        │   └── DashboardLayout.jsx
        ├── pages/
        │   ├── LandingPage.jsx
        │   ├── LoginPage.jsx
        │   ├── SignupPage.jsx
        │   ├── DashboardPage.jsx
        │   ├── ProjectsPage.jsx
        │   ├── ProjectDetailPage.jsx
        │   ├── TasksPage.jsx
        │   ├── ProfilePage.jsx
        │   └── admin/
        │       ├── AdminDashboard.jsx  ← ADMIN ONLY
        │       └── UserManagement.jsx  ← ADMIN ONLY
        ├── services/
        │   ├── api.js
        │   ├── authService.js
        │   ├── projectService.js
        │   ├── taskService.js
        │   └── adminService.js
        └── components/
            └── ProtectedRoute.jsx
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)

### 1. Clone and Setup Backend

```bash
cd backend
npm install
```

Create `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/taskmanager
JWT_SECRET=your_super_secret_key_here
NODE_ENV=development
```

Start backend:
```bash
npm run dev
```

### 2. Setup Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

Start frontend:
```bash
npm run dev
```

### 3. Access the App

| URL | Description |
|-----|-------------|
| http://localhost:5173 | Landing page |
| http://localhost:5173/signup | Register (first user = admin) |
| http://localhost:5173/login | Login |
| http://localhost:5173/dashboard | User dashboard |
| http://localhost:5173/projects | Projects list |
| http://localhost:5173/tasks | Tasks table |
| http://localhost:5173/admin | Admin panel |
| http://localhost:5173/admin/users | User management |

> **Note:** The **first user to register** automatically gets the **Admin** role.

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register user |
| POST | `/api/auth/login` | ❌ | Login & get JWT |
| GET | `/api/auth/me` | ✅ | Get current user |
| PUT | `/api/auth/profile` | ✅ | Update profile |
| PUT | `/api/auth/change-password` | ✅ | Change password |

### Projects
| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| GET | `/api/projects` | ✅ | any |
| POST | `/api/projects` | ✅ | admin |
| GET | `/api/projects/:id` | ✅ | member |
| PUT | `/api/projects/:id` | ✅ | admin |
| DELETE | `/api/projects/:id` | ✅ | admin |
| POST | `/api/projects/:id/members` | ✅ | admin |
| DELETE | `/api/projects/:id/members/:uid` | ✅ | admin |

### Tasks
| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| GET | `/api/tasks` | ✅ | any |
| POST | `/api/tasks` | ✅ | admin |
| GET | `/api/tasks/:id` | ✅ | any |
| PUT | `/api/tasks/:id` | ✅ | admin (all), member (status only) |
| DELETE | `/api/tasks/:id` | ✅ | admin |
| POST | `/api/tasks/:id/comments` | ✅ | any |

### Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/analytics` | ✅ admin | System analytics |
| GET | `/api/admin/users` | ✅ admin | All users |
| PUT | `/api/admin/users/:id/role` | ✅ admin | Change role |
| PUT | `/api/admin/users/:id/status` | ✅ admin | Toggle active |
| DELETE | `/api/admin/users/:id` | ✅ admin | Delete user |

---

## 🌍 Deployment

### Frontend → Vercel
```bash
cd frontend
npm run build
# Deploy dist/ to Vercel
```
Set env var: `VITE_API_URL=https://your-backend.render.com/api`

### Backend → Render / Railway
- Set root to `backend/`
- Start command: `node server.js`
- Add all env vars from `.env`

### Database → MongoDB Atlas
- Use your cluster URI in `MONGO_URI`
- Whitelist IPs in Atlas network settings

---

## 🔒 Security Features

- JWT with 7-day expiry
- Passwords hashed with bcrypt (12 rounds)
- Role-based middleware on every protected route
- CORS configured for specific origins
- Input validation with express-validator
- Global error handler
- Standardized API responses

---

## 📄 License

MIT © TaskFlow
