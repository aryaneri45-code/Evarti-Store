import { spawn } from "node:child_process";

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const pythonCommand = process.env.PYTHON || (process.platform === "win32" ? "python" : "python3");
const frontendPort = Number(process.env.FRONTEND_PORT || 5500);
const frontendUrl = `http://127.0.0.1:${frontendPort}`;
const backendUrl = "http://127.0.0.1:3000/api/health";
const children = [];
let stopping = false;

async function isFrontendRunning() {
  try {
    const response = await fetch(`${frontendUrl}/`, { signal: AbortSignal.timeout(1200) });
    return response.ok && (await response.text()).includes('data-page="home"');
  } catch {
    return false;
  }
}

async function isBackendRunning() {
  try {
    const response = await fetch(backendUrl, { signal: AbortSignal.timeout(1200) });
    const result = await response.json();
    return response.ok && result.success === true && result.status === "healthy";
  } catch {
    return false;
  }
}

function stopAll(exitCode = 0) {
  if (stopping) return;
  stopping = true;
  process.exitCode = exitCode;

  for (const child of children) {
    if (child.exitCode === null) child.kill("SIGTERM");
  }

  const forceStop = setTimeout(() => {
    for (const child of children) {
      if (child.exitCode === null) child.kill("SIGKILL");
    }
  }, 3000);
  forceStop.unref();
}

function launch(label, command, args) {
  const child = spawn(command, args, {
    cwd: process.cwd(),
    env: process.env,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  children.push(child);

  child.on("error", error => {
    console.error(`${label} failed to start: ${error.message}`);
    stopAll(1);
  });

  child.on("exit", (code, signal) => {
    if (stopping) return;
    console.error(`${label} stopped${signal ? ` (${signal})` : ` with exit code ${code}`}. Stopping the other service.`);
    stopAll(code || 1);
  });
}

process.on("SIGINT", () => stopAll(0));
process.on("SIGTERM", () => stopAll(0));

const [frontendRunning, backendRunning] = await Promise.all([
  isFrontendRunning(),
  isBackendRunning(),
]);

console.log(`Frontend: http://localhost:${frontendPort}${frontendRunning ? " (already running)" : ""}`);
console.log(`Backend:  http://localhost:3000${backendRunning ? " (already running)" : ""}`);
if (!frontendRunning) {
  launch("Frontend", pythonCommand, ["-m", "http.server", String(frontendPort), "--directory", "frontend"]);
}
if (!backendRunning) {
  launch("Backend", npmCommand, ["run", "dev", "--prefix", "backend"]);
}
