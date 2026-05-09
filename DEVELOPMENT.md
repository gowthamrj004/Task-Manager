# Development Guide

## Project Structure

```
project-eth/
├── backend/                    # Express API server
│   ├── src/
│   │   ├── controllers/        # Business logic
│   │   ├── middleware/         # Express middleware (auth, etc)
│   │   ├── routes/            # API routes
│   │   └── utils/             # Helper functions (JWT, password, validation)
│   ├── prisma/
│   │   └── schema.prisma      # Database schema
│   ├── index.js               # Server entry point
│   ├── seed.js                # Database seeding script
│   └── package.json
│
├── frontend/                   # React + Vite application
│   ├── src/
│   │   ├── pages/             # Page components
│   │   ├── components/        # Reusable components
│   │   ├── context/           # React Context (Auth)
│   │   ├── utils/             # Helper functions (API client)
│   │   ├── App.jsx            # Main app component
│   │   ├── main.jsx           # React entry point
│   │   └── index.css          # Global styles
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── README.md                   # Project documentation
├── DEPLOYMENT.md               # Deployment guide
└── .gitignore
```

## Running Locally

### Terminal 1 - Backend

```bash
cd backend
npm install
cp .env.example .env

# Edit .env with your PostgreSQL connection
# DATABASE_URL=postgresql://user:password@localhost:5432/taskmanager

npm run prisma:generate
npm run prisma:migrate
npm run seed
npm run dev
```

Backend runs on `http://localhost:5000`

### Terminal 2 - Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs on `http://localhost:5173`

## Key Files

### Authentication
- **Backend**: `src/middleware/auth.js` - JWT verification
- **Backend**: `src/controllers/authController.js` - Register/Login logic
- **Frontend**: `src/context/AuthContext.jsx` - Auth state management

### Database
- **Schema**: `prisma/schema.prisma` - User, Project, Task models
- **Migrations**: Generated automatically by Prisma
- **Seed**: `seed.js` - Creates demo data

### API Endpoints
- **Auth**: `GET/POST /api/auth/*`
- **Projects**: `GET/POST/PUT/DELETE /api/projects/*`
- **Tasks**: `GET/POST/PUT/DELETE /api/tasks/*`

## Common Development Tasks

### Add a New Field to User Model

1. Update `prisma/schema.prisma`:
```prisma
model User {
  // ... existing fields
  newField String?
}
```

2. Run migration:
```bash
npm run prisma:migrate
```

3. Update validation in `src/utils/validation.js`

### Add a New API Route

1. Create controller in `src/controllers/newController.js`
2. Create route in `src/routes/new.js`
3. Import and use in `index.js`:
```javascript
import newRoutes from "./src/routes/new.js";
app.use("/api/new", newRoutes);
```

### Add a New React Page

1. Create file in `src/pages/NewPage.jsx`
2. Add route in `src/App.jsx`:
```jsx
<Route path="/new" element={<NewPage />} />
```
3. Navigate to it with React Router

## Testing

### Manual Testing Checklist

- [ ] Register new user
- [ ] Login with credentials
- [ ] Create project
- [ ] Create task in project
- [ ] Update task status
- [ ] Delete task
- [ ] Delete project
- [ ] View dashboard stats
- [ ] Logout

### Using Prisma Studio

View and manage database records graphically:
```bash
npm run prisma:studio
```

## Environment Variables

### Backend `.env`
```
DATABASE_URL=postgresql://user:password@localhost:5432/taskmanager
JWT_SECRET=development_secret_key_change_this
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Frontend `.env`
```
VITE_API_URL=http://localhost:5000/api
```

## Debugging

### Backend
- Check logs in terminal running `npm run dev`
- Use Prisma Studio to view database: `npm run prisma:studio`
- Add console.log statements in controllers

### Frontend
- Open DevTools (F12) in browser
- Check Network tab for API calls
- Check Console for JavaScript errors
- Use React DevTools extension

## Performance Tips

1. **Database Queries**: Use `include` in Prisma only when needed
2. **Frontend**: Use React.memo for expensive components
3. **API**: Add pagination for large datasets
4. **Caching**: Consider Redis for session management

## Security Checklist

- [ ] JWT_SECRET is strong (32+ characters)
- [ ] Passwords are hashed with bcryptjs
- [ ] CORS allows only your frontend domain
- [ ] Sensitive data not logged
- [ ] Input validation with Zod
- [ ] HTTP-only cookies for auth tokens
- [ ] Environment variables not committed to git

## Deployment Preparation

Before deploying to Railway:

1. Update `.env.example` with all required variables
2. Verify all tests pass
3. Build frontend: `npm run build`
4. Check that backend starts: `npm start`
5. Update `README.md` with live URLs
6. Commit all changes

## Resources

- Prisma Docs: https://www.prisma.io/docs/
- Express.js: https://expressjs.com/
- React Router: https://reactrouter.com/
- Tailwind CSS: https://tailwindcss.com/
- Railway Docs: https://docs.railway.app/
