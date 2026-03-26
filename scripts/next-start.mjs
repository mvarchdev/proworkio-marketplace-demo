import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import path from "node:path";

const packageDir = process.cwd();
const requireFromPackage = createRequire(path.join(packageDir, "package.json"));
const nextBin = requireFromPackage.resolve("next/dist/bin/next");

const rawArgs = process.argv.slice(2);
const normalizedArgs = rawArgs[0] === "--" ? rawArgs.slice(1) : rawArgs;

if (!normalizedArgs.includes("--port") && process.env.PORT) {
  normalizedArgs.push("--port", process.env.PORT);
}

if (!normalizedArgs.includes("--hostname") && process.env.HOSTNAME) {
  normalizedArgs.push("--hostname", process.env.HOSTNAME);
}

const child = spawn(process.execPath, [nextBin, "start", ...normalizedArgs], {
  cwd: packageDir,
  env: process.env,
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});

