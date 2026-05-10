import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./src/routes/auth.js";
import projectRoutes from "./src/routes/projects.js";
import taskRoutes from "./src/routes/tasks.js";
import { handleApplicationErrors, logIncomingRequests } from "./src/middleware/errorHandling.js";
import prisma from "./src/utils/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================

// Logging middleware - tracks all incoming requests
app.use(logIncomingRequests);

// CORS configuration - enables cross-origin requests from frontend
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing middleware - handles JSON and cookies
app.use(express.json());
app.use(cookieParser());

// ============================================
// API ROUTES
// ============================================

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);

// Health check endpoint - useful for monitoring and deployment verification
app.get("/api/health", (req, res) => {
  res.status(200).json({ 
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ============================================
// ERROR HANDLING & STARTUP
// ============================================

// Centralized error handler - must be last middleware
app.use(handleApplicationErrors);

// Server startup function
const startServer = async () => {
  try {
    // Verify database connectivity before starting server
    await prisma.$queryRaw`SELECT 1`;
    console.log("✓ Database connection verified");

    app.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT}`);
      console.log(`✓ CORS enabled for: ${FRONTEND_URL}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error("✗ Failed to start server:", error.message);
    console.error("Make sure PostgreSQL is running and DATABASE_URL is correct");
    process.exit(1);
  }
};

startServer();

// Graceful shutdown - closes database connection when server stops
process.on("SIGINT", async () => {
  console.log("\n✓ Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

export default app;
