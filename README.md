# Team Task Manager

A full-stack web application for managing team projects and tasks with role-based access control.

## 🚀 Features

- **Authentication**: Secure signup/login with JWT
- **Project Management**: Create and manage projects
- **Task Management**: Create, update, and track tasks
- **Status Tracking**: Move tasks between TODO, DOING, and DONE
- **Dashboard**: Overview of all tasks and statistics
- **Role-Based Access**: Admin and Member roles

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Auth**: JWT with HttpOnly cookies
- **Validation**: Zod

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js 16+
- PostgreSQL 12+
- npm or yarn

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- PostgreSQL 12+
- Git

### Backend Setup

```bash
cd backend
npm install

# Create .env file and configure database
cp .env.example .env
# Edit .env and set: DATABASE_URL=postgresql://user:password@localhost:5432/taskmanager

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# (Optional) Seed demo data
npm run seed

# Start the server
npm run dev
# Server runs on http://localhost:5000
```

### Frontend Setup

```bash
cd frontend
npm install

# Create .env file
cp .env.example .env

# Start the development server
npm run dev
# Frontend runs on http://localhost:5173
```

## 🧪 Demo Accounts (After Seeding)

```
Admin User:
  Email: admin@example.com
  Password: password123

Team Member:
  Email: member@example.com
  Password: password123
```

## 📚 API Routes

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create a new project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/members` - Add member to project

### Tasks
- `GET /api/tasks/:projectId` - Get all tasks in a project
- `POST /api/tasks/:projectId` - Create a new task
- `PUT /api/tasks/:projectId/:taskId` - Update task
- `DELETE /api/tasks/:projectId/:taskId` - Delete task
- `GET /api/tasks/stats` - Get task statistics

## 🗄 Database Schema

### Users
```sql
- id (Primary Key)
- email (Unique)
- password (Hashed)
- fullName
- role (ADMIN/MEMBER)
- createdAt
- updatedAt
```

### Projects
```sql
- id (Primary Key)
- name
- description
- ownerId (Foreign Key → Users)
- createdAt
- updatedAt
```

### Tasks
```sql
- id (Primary Key)
- title
- description
- status (TODO/DOING/DONE)
- dueDate
- projectId (Foreign Key → Projects)
- assigneeId (Foreign Key → Users)
- createdAt
- updatedAt
```

## 🔐 Security Features

- Password hashing with bcryptjs
- JWT token-based authentication
- HttpOnly cookies (CSRF protection)
- Role-based access control
- Input validation with Zod

## 📦 Deployment

### Deploy on Railway (Recommended)

Railway offers a simple way to deploy full-stack applications with PostgreSQL support.

**Step 1: Prepare Repository**
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit"

# Push to GitHub
git push origin main
```

**Step 2: Create Railway Project**
1. Go to [railway.app](https://railway.app)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub"
5. Connect your GitHub account and select this repository

**Step 3: Add PostgreSQL Database**
1. In your Railway project, click "+ Add Service"
2. Select "PostgreSQL"
3. Railway will create a PostgreSQL database automatically

**Step 4: Configure Environment Variables**
In the Railway dashboard, go to your project settings and add:

```env
DATABASE_URL=<auto-set by Railway PostgreSQL>
JWT_SECRET=<generate-a-random-secure-string>
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://<your-railway-app-url>
```

**Step 5: Deploy Backend**
1. In Railway, create a new service for the backend
2. Connect your GitHub repo
3. Set the "Start Command" to:
   ```
   cd backend && npm install && npx prisma migrate deploy && npm start
   ```
4. Deploy

**Step 6: Deploy Frontend**
1. Create another service for the frontend
2. Set the build command:
   ```
   cd frontend && npm install && npm run build
   ```
3. Set the start command:
   ```
   cd frontend && npm run preview
   ```
4. Deploy

**Step 7: Run Database Migrations**
```bash
# Run this once after deployment to set up the database
npm run prisma:migrate
npm run seed
```

### Environment Variables for Production

**Backend (.env)**
```env
DATABASE_URL=postgresql://username:password@host:port/dbname
JWT_SECRET=your-very-secure-random-string-min-32-chars
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-railway-domain.railway.app
```

**Frontend (.env)**
```env
VITE_API_URL=https://your-backend-railway-domain.railway.app/api
```

### Post-Deployment Checklist

- [ ] Database migrations ran successfully
- [ ] Seed data created (admin@example.com / password123)
- [ ] Login page is accessible
- [ ] Can create a new project
- [ ] Can create tasks within a project
- [ ] Status changes work (TODO → DOING → DONE)
- [ ] Dashboard shows correct stats
- [ ] Logout functionality works

## 🎯 Usage Example

1. **Register**: Create a new account at `/register`
2. **Login**: Access your dashboard
3. **Create Project**: Click "New Project" button
4. **Create Task**: Open a project and click "New Task"
5. **Update Status**: Move tasks between TODO → DOING → DONE columns
6. **View Stats**: Dashboard shows real-time task statistics

## 📝 Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/taskmanager
JWT_SECRET=your_super_secret_key_change_this
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## 🧪 Testing

Create a test user:
```bash
# Register with your email
# Then check the tasks/stats endpoint
```

## 📄 License

MIT

## 👨‍💼 Author

Team Task Manager Team

---

**Live Demo**: [Coming soon - Railway deployment URL]
**GitHub**: [Your repository URL]
"# Task-Manager" 
