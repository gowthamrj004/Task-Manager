import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import authRoutes from "./src/routes/auth.js";
import projectRoutes from "./src/routes/projects.js";
import taskRoutes from "./src/routes/tasks.js";
import { handleApplicationErrors, logIncomingRequests } from "./src/middleware/errorHandling.js";
import prisma from "./src/utils/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** Where Vite build output lives (Railway may set cwd or root differently) */
function resolveFrontendDist() {
  const envDir = process.env.FRONTEND_DIST_DIR?.trim();
  if (envDir && fs.existsSync(path.join(envDir, "index.html"))) {
    return envDir;
  }
  const candidates = [
    path.join(__dirname, "..", "frontend", "dist"),
    path.join(process.cwd(), "frontend", "dist"),
    path.join(process.cwd(), "..", "frontend", "dist"),
    path.join(process.cwd(), "dist"),
  ];
  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, "index.html"))) return dir;
  }
  return null;
}

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

/** Comma-separated origins; trailing slashes stripped (browser Origin has none) */
function parseAllowedOrigins() {
  const raw =
    process.env.FRONTEND_URL ||
    process.env.ALLOWED_ORIGINS ||
    "http://localhost:5173";
  const set = new Set();
  for (const s of raw.split(",")) {
    let o = s.trim();
    if (!o) continue;
    while (o.endsWith("/")) o = o.slice(0, -1);
    set.add(o);
  }
  return [...set];
}

// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================

// Logging middleware - tracks all incoming requests
app.use(logIncomingRequests);

// CORS — single FRONTEND_URL breaks local dev against a deployed API; allow multiple origins
const allowedOrigins = parseAllowedOrigins();
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      const normalized = origin.replace(/\/$/, "");
      if (allowedOrigins.includes(normalized) || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

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

// Built React app — serve static files + SPA fallback for /register, /dashboard, etc.
const frontendDist = resolveFrontendDist();
const apiOnlyHelpHtml = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"/><title>Team Task Manager API</title></head>
<body style="font-family:system-ui,sans-serif;max-width:42rem;margin:2rem auto;padding:0 1rem">
  <h1>Team Task Manager — API only</h1>
  <p><strong>frontend/dist</strong> was not found on this server, so routes like <code>/register</code> cannot load the UI.</p>
  <ul>
    <li><a href="/api/health">GET /api/health</a></li>
    <li>API: <code>/api/...</code></li>
  </ul>
  <p><strong>Fix on Railway:</strong> Service <strong>Root Directory</strong> = repository root (empty). Build must run <code>frontend</code> build and produce <code>frontend/dist</code>. Optional env: <code>FRONTEND_DIST_DIR</code> = absolute path to dist.</p>
  <p>Use <code>npm run dev</code> locally with <code>VITE_API_PROXY_TARGET</code> pointing here until the SPA is deployed.</p>
</body></html>`;

if (frontendDist) {
  const frontendIndex = path.join(frontendDist, "index.html");
  app.use(express.static(frontendDist));
  app.use((req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") return next();
    if (req.path.startsWith("/api")) return next();
    if (path.extname(req.path)) return next();
    res.sendFile(frontendIndex, (err) => (err ? next(err) : undefined));
  });
} else {
  app.use((req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") return next();
    if (req.path.startsWith("/api")) return next();
    res.status(404).type("html").send(apiOnlyHelpHtml);
  });
}

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
      console.log(
        frontendDist
          ? `✓ Serving SPA from ${frontendDist}`
          : "✗ SPA not found — only /api/* (set Root Directory to repo root or FRONTEND_DIST_DIR)"
      );
      console.log(`✓ CORS allowed origins: ${allowedOrigins.join(", ")}`);
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
