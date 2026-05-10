/**
 * Railway: Postgres may still be starting when migrate runs.
 * Retries prisma migrate deploy, then starts the API.
 */
import { spawnSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.join(__dirname, "..");

function sleepSeconds(s) {
  if (process.platform === "win32") {
    spawnSync("timeout", ["/t", String(s), "/nobreak"], { stdio: "ignore", shell: false });
  } else {
    spawnSync("sleep", [String(s)], { stdio: "ignore", shell: false });
  }
}

function migrateOnce() {
  const r = spawnSync("npx", ["prisma", "migrate", "deploy"], {
    cwd: backendRoot,
    encoding: "utf8",
    shell: true,
    env: process.env,
  });
  const out = `${r.stderr || ""}\n${r.stdout || ""}`;
  return { ok: r.status === 0, out };
}

for (let attempt = 0; attempt < 20; attempt++) {
  const { ok, out } = migrateOnce();
  if (ok) break;
  const retryable = /starting up|the database system is starting|ECONNREFUSED|Connection refused|P1001/i.test(
    out
  );
  if (!retryable || attempt === 19) {
    console.error(out);
    process.exit(1);
  }
  console.warn(
    `[start] migrate failed (attempt ${attempt + 1}/20), DB may still be starting. Retrying in 3s…`
  );
  sleepSeconds(3);
}

const server = spawnSync("node", ["index.js"], {
  cwd: backendRoot,
  stdio: "inherit",
  env: process.env,
});
process.exit(server.status ?? 1);
