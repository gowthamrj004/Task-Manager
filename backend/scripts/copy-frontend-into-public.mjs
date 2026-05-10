/**
 * After `frontend` build, copy `dist` into `backend/public` so the API container
 * always finds the SPA next to `index.js` (Railway / monorepo friendly).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.join(__dirname, "..");
const repoRoot = path.join(backendRoot, "..");
const src = path.join(repoRoot, "frontend", "dist");
const dest = path.join(backendRoot, "public");

const index = path.join(src, "index.html");
if (!fs.existsSync(index)) {
  console.error("copy-frontend-into-public: missing", index, "— run Vite build in frontend/ first");
  process.exit(1);
}

fs.rmSync(dest, { recursive: true, force: true });
fs.mkdirSync(dest, { recursive: true });
fs.cpSync(src, dest, { recursive: true });
console.log("copy-frontend-into-public: copied SPA to", dest);
