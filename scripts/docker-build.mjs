#!/usr/bin/env node
/**
 * Local Docker build helper.
 *
 * Reads version pins from config/defaults.json and invokes `docker build`
 * with the correct --build-arg values so developers never need to remember
 * (or hardcode) version strings.
 *
 * Usage:
 *   node scripts/docker-build.mjs                      # defaults
 *   node scripts/docker-build.mjs --tag my-tag          # custom tag
 *   node scripts/docker-build.mjs -- --no-cache         # extra docker args
 */
import { readFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");

const config = JSON.parse(
  readFileSync(join(projectRoot, "config", "defaults.json"), "utf-8"),
);

const praxisVersion = readFileSync(
  join(projectRoot, "PRAXIS_VERSION"),
  "utf8",
).trim();
const agentServerImage = `${config.images.agentServer}:sha-${config.sources.sdk.ref}-python`;
const agentServerVersion = config.versions.agentServer;
const automationVersion = config.versions.automation;
const canvasBasePath = config.paths.canvasBasePath;

// Parse CLI: --tag <name> and everything after -- is passed to docker build
let tag = "agent-canvas:local";
const extraArgs = [];
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--tag" && i + 1 < args.length) {
    tag = args[++i];
  } else if (args[i] === "--") {
    extraArgs.push(...args.slice(i + 1));
    break;
  } else {
    extraArgs.push(args[i]);
  }
}

const cmd = [
  "docker",
  "build",
  "-f",
  "docker/Dockerfile",
  "--build-arg",
  `AGENT_SERVER_IMAGE=${agentServerImage}`,
  "--build-arg",
  `AGENT_SERVER_VERSION=${agentServerVersion}`,
  "--build-arg",
  `AUTOMATION_VERSION=${automationVersion}`,
  "--build-arg",
  `VITE_BASE_PATH=${canvasBasePath}`,
  "--build-arg",
  `PRAXIS_VERSION=${praxisVersion}`,
  "--build-arg",
  `AGENT_CANVAS_VERSION=${config.versions.agentCanvas}`,
  "-t",
  tag,
  ...extraArgs,
  ".",
];

console.log(`Agent Server image      : ${agentServerImage}`);
console.log(`Automation version      : ${automationVersion}`);
console.log(`Canvas base path        : ${canvasBasePath}`);
console.log(`Tag                     : ${tag}`);
console.log(`\n$ ${cmd.join(" ")}\n`);

let temporaryCheckout;
try {
  let sdkRoot = process.env.PRAXIS_SDK_LOCAL_PATH;
  if (!sdkRoot) {
    temporaryCheckout = mkdtempSync(join(tmpdir(), "praxis-sdk-build-"));
    sdkRoot = temporaryCheckout;
    execFileSync(
      "git",
      ["clone", "--no-checkout", config.sources.sdk.repository, sdkRoot],
      { stdio: "inherit" },
    );
    execFileSync("git", ["checkout", "--detach", config.sources.sdk.ref], {
      cwd: sdkRoot,
      stdio: "inherit",
    });
  }
  sdkRoot = resolve(sdkRoot);
  const actualRef = execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: sdkRoot,
    encoding: "utf8",
  }).trim();
  if (actualRef !== config.sources.sdk.ref) {
    throw new Error(
      `Praxis SDK checkout must be at ${config.sources.sdk.ref}; found ${actualRef}`,
    );
  }
  execFileSync(
    "docker",
    [
      "build",
      "--target",
      "source",
      "-f",
      join(
        sdkRoot,
        "openhands-agent-server/openhands/agent_server/docker/Dockerfile",
      ),
      "-t",
      agentServerImage,
      sdkRoot,
    ],
    { stdio: "inherit" },
  );
  execFileSync(cmd[0], cmd.slice(1), {
    cwd: projectRoot,
    stdio: "inherit",
  });
} catch (err) {
  console.error(err.message);
  process.exitCode = err.status || 1;
} finally {
  if (temporaryCheckout)
    rmSync(temporaryCheckout, { recursive: true, force: true });
}
