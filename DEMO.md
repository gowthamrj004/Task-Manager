# Demo Video Script & Testing Guide

## 📹 Demo Video (2-5 minutes)

Create a quick screen recording showing these steps:

### Part 1: Authentication (30 seconds)
```
1. Open application in browser
2. Click "Register" 
3. Fill in email, password, full name
4. Click "Register" button
5. Show dashboard loads
```

**OR use demo account:**
```
1. Open login page
2. Enter: admin@example.com
3. Enter: password123
4. Click "Login"
5. Show dashboard loads
```

### Part 2: Create Project (45 seconds)
```
1. Click "New Project" button
2. Enter project name: "My New Project"
3. Enter description: "This is a test project"
4. Click "Create Project"
5. Show project appears in list
```

### Part 3: Create Tasks (1 minute)
```
1. Click on the project
2. Click "New Task" button
3. Enter title: "Design mockups"
4. Enter description: "Create UI mockups"
5. Set due date (tomorrow)
6. Click "Create Task"
7. Show task appears in TODO column
```

### Part 4: Task Management (1 minute)
```
1. Show the Kanban board with three columns
2. Click "Move →" button on a task
3. Show task moves to "In Progress" column
4. Click "Move →" again
5. Show task moves to "Done" column
6. Create another task and show the full workflow
```

### Part 5: Dashboard (30 seconds)
```
1. Click "Back" to return to dashboard
2. Show updated statistics:
   - Total Tasks
   - To Do count
   - In Progress count
   - Done count
   - Overdue count
3. Point out real-time updates
```

### Part 6: Logout (15 seconds)
```
1. Click "Logout" button
2. Show redirect to login page
3. Show login page ready for next user
```

## 📊 Demo Data Talking Points

During demo, mention:

✅ **Authentication**: Secure login with JWT tokens
✅ **Project Management**: Create and manage multiple projects
✅ **Task Tracking**: Real-time task status updates
✅ **Dashboard**: Live statistics showing task overview
✅ **Responsive Design**: Works on desktop and mobile
✅ **Database**: PostgreSQL with Prisma ORM
✅ **API**: RESTful API with proper validation
✅ **Deployment**: Ready for Railway deployment

## 🧪 Pre-Demo Checklist

Run these commands before recording demo:

### Backend Setup
```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run seed
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Verify Everything Works
- [ ] Backend server running on port 5000
- [ ] Frontend app running on port 5173
- [ ] Database migrations completed
- [ ] Seed data created (check demo accounts work)
- [ ] Can access http://localhost:5173 in browser
- [ ] Login page displays correctly

## 🎬 Recording Tips

1. **Zoom Level**: Set browser zoom to 125% for readability in video
2. **Speed**: Record at normal speed (not too fast)
3. **Audio**: Clear narration explaining what you're doing
4. **Pauses**: Brief pause after each action (1-2 seconds)
5. **Errors**: If error occurs, restart from that section
6. **Total Time**: Aim for 2-5 minutes, not longer

## 📝 Script Example

```
"Here's the Team Task Manager application. Let me show you the key features.

First, I'll log in with the demo account. Email: admin@example.com, Password: password123.

Great! The dashboard shows all my task statistics at a glance:
- Total tasks across all projects
- Tasks by status: Todo, In Progress, Done
- Overdue tasks that need attention

Let me create a new project. I'll click the 'New Project' button and add a sample project.

Now I'll open this project and create some tasks. 

Here's the Kanban board showing three columns: Todo, In Progress, and Done.

I can move tasks between columns by clicking the Move button. Each task progresses through the workflow from Todo to Done.

As you can see, the dashboard updates in real-time with the new statistics.

Finally, I can logout, and the system securely clears the session.

This application demonstrates:
- Full user authentication
- Project and task management
- Real-time status tracking
- Role-based access control
- Production-ready database design

The app is built with React, Node.js, PostgreSQL, and is ready to deploy on Railway."
```

## 🎥 Video Submission Format

- **Format**: MP4 or WebM
- **Resolution**: 1080p minimum (1920x1080)
- **Duration**: 2-5 minutes
- **Audio**: Clear (no background noise)
- **Subtitles**: Optional but helpful
- **File Size**: Keep under 100MB for easy sharing

## 🎭 Alternative Demo Scenarios

### Scenario 1: Team Project Management
- Create "Website Redesign" project
- Add multiple tasks
- Show team member assignment (if implemented)

### Scenario 2: Sprint Planning
- Create "Q1 Sprint" project
- Add user stories as tasks
- Show status progression throughout sprint

### Scenario 3: Bug Tracking
- Create "Bug Fixes" project
- Add high-priority bugs
- Show resolution workflow

## 📸 Screenshots to Include

1. **Login Page**: Clean authentication interface
2. **Dashboard**: Statistics overview
3. **Project List**: Multiple projects
4. **Kanban Board**: Tasks organized by status
5. **New Task Form**: Task creation interface
6. **Completed Project**: All tasks in Done column

## 🗣️ Key Selling Points to Mention

1. **Authentication**: Secure JWT-based auth
2. **RBAC**: Role-based access control (Admin/Member)
3. **Real-time Updates**: Dashboard updates as you change tasks
4. **Responsive Design**: Works on all devices
5. **Database Design**: Proper relationships and constraints
6. **Scalable**: Built with production frameworks
7. **Deployed**: Live on Railway
8. **API Documentation**: Full REST API

---

**Tips for Success:**
- Practice the demo flow once before recording
- Have all terminals ready (Backend + Frontend running)
- Use demo accounts so demo is smooth
- Speak clearly and explain what's happening
- Show the full user journey from login to logout
- Highlight role-based access control if testing with different users

Good luck with your demo! 🎬
