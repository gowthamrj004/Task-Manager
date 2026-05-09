# Team Task Manager - Project Summary & Setup

## ✅ What's Been Built

### Backend (Node.js + Express + PostgreSQL + Prisma)
- ✅ Authentication system (Register/Login with JWT)
- ✅ User model with roles (ADMIN/MEMBER)
- ✅ Project management (Create, Read, Update, Delete)
- ✅ Task management with status tracking (TODO/DOING/DONE)
- ✅ Dashboard statistics endpoint
- ✅ Role-based access control middleware
- ✅ Input validation with Zod
- ✅ Password hashing with bcryptjs
- ✅ CORS configuration
- ✅ Error handling

### Frontend (React + Vite + Tailwind CSS)
- ✅ Authentication pages (Login/Register)
- ✅ Dashboard with statistics
- ✅ Project list and management
- ✅ Kanban-style task board (TODO → DOING → DONE)
- ✅ Task creation and management
- ✅ Responsive design with Tailwind CSS
- ✅ JWT authentication with context API
- ✅ Protected routes
- ✅ Logout functionality

### Database Schema
- ✅ Users table with roles
- ✅ Projects table with owner relationship
- ✅ Tasks table with project and assignee relationships

### Documentation
- ✅ README.md with feature overview
- ✅ DEPLOYMENT.md with Railway setup guide
- ✅ DEVELOPMENT.md with development instructions
- ✅ Setup instructions and examples

### Additional Features
- ✅ Database seed script with demo data
- ✅ Demo accounts for testing
- ✅ Error handling and validation
- ✅ Responsive mobile-friendly UI

## 📁 Project Structure

```
ProjectETH/
├── backend/                 # Express.js API
│   ├── src/
│   │   ├── controllers/     # Business logic
│   │   ├── middleware/      # Auth middleware
│   │   ├── routes/          # API routes
│   │   └── utils/           # Helpers (JWT, passwords, validation)
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   ├── index.js             # Server entry point
│   ├── seed.js              # Demo data
│   ├── package.json
│   └── .env.example
│
├── frontend/                # React + Vite
│   ├── src/
│   │   ├── pages/           # Page components
│   │   ├── components/      # Reusable components
│   │   ├── context/         # Auth context
│   │   ├── utils/           # API client
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── package.json
│   └── .env.example
│
├── README.md                # Main documentation
├── DEPLOYMENT.md            # Railway deployment guide
├── DEVELOPMENT.md           # Development guide
├── .gitignore
└── app.json                 # Railway config

## 🚀 Quick Setup (5 minutes)

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` - set `DATABASE_URL` to your PostgreSQL connection:
```
DATABASE_URL=postgresql://user:password@localhost:5432/taskmanager
```

Then run:
```bash
npm run prisma:generate
npm run prisma:migrate
npm run seed
npm run dev
```

✅ Backend runs on `http://localhost:5000`

### 2. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

✅ Frontend runs on `http://localhost:5173`

### 3. Test the App

1. Open `http://localhost:5173`
2. Click "Register" and create a new account, OR
3. Use demo credentials after seeding:
   - Email: `admin@example.com`
   - Password: `password123`

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Projects
- `GET /api/projects` - List all user projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/members` - Add member

### Tasks
- `GET /api/tasks/:projectId` - List tasks in project
- `POST /api/tasks/:projectId` - Create task
- `PUT /api/tasks/:projectId/:taskId` - Update task status
- `DELETE /api/tasks/:projectId/:taskId` - Delete task
- `GET /api/tasks/stats` - Get dashboard stats

## 🧪 Demo Data

After running `npm run seed` in the backend, you have:

**Users:**
- Admin: admin@example.com / password123
- Member: member@example.com / password123

**Projects:**
- Website Redesign (with multiple tasks in different statuses)
- Mobile App (with sample tasks)

**Tasks:**
- Various tasks in TODO, DOING, and DONE statuses
- Different due dates for testing

## 🎯 Features Demo Flow

1. **Login**: Use admin@example.com / password123
2. **Dashboard**: View stats and projects
3. **Open Project**: Click "Website Redesign"
4. **Create Task**: Click "New Task" button
5. **Manage Tasks**: Move tasks between columns
6. **Update Status**: Click "Move →" to progress task
7. **Delete Task**: Click delete button
8. **View Stats**: Dashboard updates in real-time

## ⚙️ Environment Variables

### Backend
```env
DATABASE_URL=postgresql://user:password@localhost:5432/taskmanager
JWT_SECRET=your-secret-key-here
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Frontend
```env
VITE_API_URL=http://localhost:5000/api
```

## 📋 Database Schema

### Users
```sql
- id (PK)
- email (UNIQUE)
- password (HASHED)
- fullName
- role (ADMIN/MEMBER)
- createdAt, updatedAt
```

### Projects
```sql
- id (PK)
- name
- description
- ownerId (FK → Users)
- createdAt, updatedAt
```

### Tasks
```sql
- id (PK)
- title
- description
- status (TODO/DOING/DONE)
- dueDate
- projectId (FK → Projects)
- assigneeId (FK → Users)
- createdAt, updatedAt
```

## 🚀 Deployment to Railway

For detailed Railway deployment steps, see [DEPLOYMENT.md](DEPLOYMENT.md)

Quick summary:
1. Push code to GitHub
2. Connect GitHub repo to Railway
3. Add PostgreSQL database
4. Set environment variables
5. Deploy backend and frontend services
6. Run migrations and seed data

## 🔒 Security Features

✅ Password hashing with bcryptjs
✅ JWT authentication with expiration
✅ HttpOnly cookies (CSRF protection)
✅ Input validation with Zod
✅ CORS configured
✅ Role-based access control
✅ Protected API routes
✅ Secure password reset flow ready (extensible)

## 📱 Responsive Design

The frontend is fully responsive with:
- Mobile-first design
- Tailwind CSS grid system
- Responsive navigation
- Touch-friendly UI

## 🧪 Testing Checklist

- [ ] Register new user
- [ ] Login with correct credentials
- [ ] Reject login with wrong password
- [ ] Create project
- [ ] View projects list
- [ ] Open project board
- [ ] Create task
- [ ] Move task from TODO → DOING → DONE
- [ ] Update task details
- [ ] Delete task
- [ ] Delete project
- [ ] View dashboard statistics
- [ ] Logout and login again

## 📚 Documentation Files

- **README.md** - Main project documentation
- **DEPLOYMENT.md** - Complete Railway deployment guide
- **DEVELOPMENT.md** - Development setup and guidelines
- **SETUP.md** - This file (Quick setup guide)

## 🆘 Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
→ Make sure PostgreSQL is running and DATABASE_URL is correct

### CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```
→ Check FRONTEND_URL in backend .env

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
→ Change PORT in .env or kill the process using that port

## 📝 Next Steps

1. ✅ Backend implementation - DONE
2. ✅ Frontend implementation - DONE
3. ✅ Documentation - DONE
4. → Test locally with demo data
5. → Deploy to Railway
6. → Create demo video (2-5 minutes showing):
   - Login flow
   - Create project
   - Add tasks
   - Change task status
   - View dashboard
   - Logout

## 🎓 Learning Resources

- Prisma ORM: https://www.prisma.io/
- Express.js: https://expressjs.com/
- React Hooks: https://react.dev/reference/react/hooks
- Tailwind CSS: https://tailwindcss.com/
- Railway: https://railway.app/

---

**Ready to deploy?** Head to [DEPLOYMENT.md](DEPLOYMENT.md) for step-by-step Railway instructions.

**Questions?** Check [DEVELOPMENT.md](DEVELOPMENT.md) for more details.

**Happy coding!** 🚀
