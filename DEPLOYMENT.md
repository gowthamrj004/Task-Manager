# Team Task Manager - Deployment Guide

Complete guide to deploy the Team Task Manager application on Railway.

## 📋 Checklist Before Starting

- [ ] GitHub account created
- [ ] Repository pushed to GitHub
- [ ] Railway account created (https://railway.app)
- [ ] Node.js 16+ and PostgreSQL installed locally for testing

## 🚀 Step-by-Step Deployment

### Step 1: Prepare Your Code

```bash
# Make sure all code is committed
git status

# Push to GitHub
git push origin main
```

### Step 2: Create Railway Account

1. Go to https://railway.app
2. Click "Get Started"
3. Sign up with GitHub
4. Authorize Railway to access your GitHub account

### Step 3: Create New Project

1. In Railway dashboard, click "New Project"
2. Select "Deploy from GitHub repo"
3. Search and select your team-task-manager repository
4. Click "Deploy"

### Step 4: Add PostgreSQL Database

1. Click "Add Service" → select "Database" → choose "PostgreSQL"
2. Railway creates a PostgreSQL instance automatically
3. The `DATABASE_URL` will be set automatically

### Step 5: Configure Backend Service

#### Backend Container Settings:

1. In Railway, go to your project
2. Click on the service that will run your backend
3. Go to the "Settings" tab
4. Under "Deploy" section:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npm start`

#### Set Environment Variables:

Go to the "Variables" tab and add:

```
JWT_SECRET=your-secure-random-string-here-min-32-chars
NODE_ENV=production
PORT=5000
FRONTEND_URL=$RAILWAY_DOMAIN_FRONTEND
```

**Note**: Replace `$RAILWAY_DOMAIN_FRONTEND` with your actual frontend Railway domain (you'll get this in Step 6)

### Step 6: Configure Frontend Service

1. Click "Add Service" → select "GitHub Repo" → select your repo again
2. Configure frontend container:

#### Frontend Container Settings:

1. Go to "Settings" tab
2. Under "Deploy" section:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run preview -- --host 0.0.0.0 --port $PORT`
   - **Publish directory**: `dist`

#### Set Environment Variables:

Go to "Variables" tab and add:

```
VITE_API_URL=$RAILWAY_DOMAIN_BACKEND/api
```

### Step 7: Deploy and Test

1. Both services should start deploying automatically
2. Wait for both deployments to complete (check logs)
3. Get the Railway domains:
   - Backend: Click the backend service, copy the domain
   - Frontend: Click the frontend service, copy the domain

### Step 8: Run Database Migrations

Use Railway's CLI or access the running backend:

```bash
# Option 1: Using Railway CLI
railway run npm run prisma:migrate

# Option 2: Using SSH in Railway dashboard
# Go to backend service → Shell tab, then run:
npm run prisma:migrate
npm run seed
```

### Step 9: Test Your Application

1. Open `https://<frontend-railway-domain>`
2. You should see the login page
3. Try logging in with demo credentials:
   - Email: `admin@example.com`
   - Password: `password123`
4. Create a project and add tasks
5. Verify all features work

## 🔧 Troubleshooting

### Database Connection Issues

```
Error: Can't reach database server at `localhost`
```

**Solution**: Make sure `DATABASE_URL` is correctly set in Railway variables. It should be something like:
```
postgresql://user:password@host:port/database
```

### Frontend Can't Connect to Backend

```
Error: Failed to fetch from API
```

**Solution**: 
1. Check `VITE_API_URL` is correctly set in frontend variables
2. Ensure backend service is running (check logs)
3. Verify CORS is enabled in backend

### Build Failures

```
Error: npm ERR! code ENOENT
```

**Solution**:
1. Check if package.json exists in the root directory of each service
2. Verify all dependencies are listed in package.json
3. Check the build logs for more details

## 📊 Monitoring

To monitor your deployed application:

1. Go to Railway dashboard
2. Click on your project
3. View logs:
   - Backend logs: Click backend service → "Logs" tab
   - Frontend logs: Click frontend service → "Logs" tab
4. Monitor resource usage: Click "Deployments" tab

## 🔄 Updating the Application

To update your live application:

```bash
# Make changes locally
git add .
git commit -m "Update features"

# Push to GitHub
git push origin main

# Railway automatically redeploys when you push
# Check the deployment status in Railway dashboard
```

## 💾 Backup and Export Data

```bash
# Export database
pg_dump $DATABASE_URL > backup.sql

# Import data to local database
psql $LOCAL_DATABASE_URL < backup.sql
```

## 🆘 Getting Help

1. Check Railway documentation: https://docs.railway.app
2. Review application logs in Railway dashboard
3. Check database connection with Prisma Studio:
   ```bash
   npm run prisma:studio
   ```

## ✅ Final Checklist

- [ ] Backend service deployed and running
- [ ] Frontend service deployed and running
- [ ] PostgreSQL database connected
- [ ] Database migrations completed
- [ ] Demo data seeded
- [ ] Login works with demo credentials
- [ ] Can create projects and tasks
- [ ] Dashboard shows statistics
- [ ] All CRUD operations working
- [ ] Live URL is accessible

---

**Deployment Complete!** 🎉

Your application is now live and ready for use.

**URLs to Share**:
- Frontend: `https://<frontend-railway-domain>`
- Backend API: `https://<backend-railway-domain>/api`
