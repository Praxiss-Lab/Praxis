import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";

const image = process.argv[2];
if (!image) throw new Error("Usage: docker-modes-smoke.mjs <local-image>");
const suffix = randomBytes(6).toString("hex");
const network = "praxis-smoke-" + suffix;
const names = [];
const key = randomBytes(32).toString("hex");
const docker = (...args) =>
  execFileSync("docker", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
async function request(url, path, authenticated = false) {
  return fetch(url + path, {
    headers: authenticated ? { "X-Session-API-Key": key } : {},
    signal: AbortSignal.timeout(5000),
  });
}
async function capture(url, mode) {
  const dir = process.env.DOCKER_EVIDENCE_DIR;
  if (!dir) return;
  mkdirSync(dir, { recursive: true });
  const { chromium } = await import("@playwright/test");
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      recordVideo: { dir },
    });
    const page = await context.newPage();
    const consent = page.getByTestId("telemetry-consent-form");
    await page.addLocatorHandler(consent, async () => {
      await consent.getByRole("checkbox").uncheck();
      await consent.getByTestId("confirm-telemetry-preferences").click();
      await consent.waitFor({ state: "hidden" });
    });
    await page.goto(url + "/canvas/", { waitUntil: "networkidle" });
    await page.locator("body").waitFor();
    const backendForm = page.getByTestId("onboarding-step-check-backend");
    if (await backendForm.isVisible()) {
      await page.getByTestId("onboarding-backend-host").fill(url);
      await page.getByTestId("onboarding-backend-api-key").fill(key);
      await page.getByTestId("onboarding-backend-next").click();
      await page.getByTestId("onboarding-step-choose-agent").waitFor();
    }
    const skip = page.getByTestId("onboarding-skip");
    if (await skip.isVisible()) await skip.click();
    await page.getByTestId("home-chat-launcher").waitFor();
    const browserStatus = await page.evaluate(
      async ({ key }) => {
        const response = await fetch("/api/settings", {
          headers: { "X-Session-API-Key": key },
        });
        return response.status;
      },
      { key },
    );
    assert.equal(
      browserStatus,
      200,
      "Browser must authenticate through the frontend proxy",
    );
    assert.ok(
      (await page.locator("body").innerText()).trim(),
      "Canvas must render",
    );
    await page.screenshot({
      path: path.join(dir, mode + ".png"),
      fullPage: true,
    });
    await context.close();
  } finally {
    await browser.close();
  }
}
async function start(mode, extra = []) {
  const name = "praxis-" + mode + "-" + suffix;
  names.push(name);
  docker(
    "run",
    "-d",
    "--name",
    name,
    "--network",
    network,
    ...(mode === "backend" ? ["--network-alias", "backend"] : []),
    "-p",
    "127.0.0.1::8000",
    "-e",
    "PRAXIS_MODE=" + mode,
    "-e",
    "VITE_DO_NOT_TRACK=1",
    ...(mode === "frontend" ? [] : ["-e", "OH_SESSION_API_KEYS_0=" + key]),
    ...extra,
    image,
  );
  const inspect = JSON.parse(docker("inspect", name))[0];
  const url =
    "http://127.0.0.1:" + inspect.NetworkSettings.Ports["8000/tcp"][0].HostPort;
  const deadline = Date.now() + 120000;
  while (Date.now() < deadline) {
    try {
      const res = await request(
        url,
        mode === "frontend" ? "/canvas/" : "/health",
      );
      if (res.status === 200) return { name, url };
    } catch {}
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(mode + " did not become ready");
}
try {
  docker("network", "create", network);
  const backend = await start("backend");
  assert.equal((await request(backend.url, "/canvas/")).status, 503);
  const unauthenticated = await request(backend.url, "/api/settings");
  assert.ok(
    [401, 403].includes(unauthenticated.status),
    "Backend must enforce authentication",
  );
  assert.equal((await request(backend.url, "/api/settings", true)).status, 200);
  assert.equal(
    (await request(backend.url, "/api/automation/openapi.json")).status,
    200,
  );
  const info = await (await request(backend.url, "/server_info", true)).json();
  assert.equal(info.runtime_services.mode, "docker:backend");
  assert.ok(info.runtime_services.services.automation);
  assert.equal(info.runtime_services.services.frontend, undefined);

  const frontend = await start("frontend", [
    "-e",
    "PRAXIS_BACKEND_URL=http://backend:8000",
  ]);
  await capture(frontend.url, "frontend-proxy");
  const html = await (await request(frontend.url, "/canvas/")).text();
  assert.ok(
    !html.includes(key),
    "Frontend must not expose the backend session key",
  );
  assert.equal(
    (await request(frontend.url, "/api/settings", true)).status,
    200,
  );
  assert.equal(
    (await request(frontend.url, "/api/automation/openapi.json")).status,
    200,
  );
  const proxied = await (
    await request(frontend.url, "/server_info", true)
  ).json();
  assert.equal(
    proxied.runtime_services.mode,
    "docker:backend",
    "Frontend must preserve backend metadata",
  );
  const frontendProcesses = docker("top", frontend.name, "-eo", "pid,args");
  assert.ok(
    !/openhands-agent-server|uvicorn openhands\.automation/.test(
      frontendProcesses,
    ),
  );

  docker("restart", backend.name);
  const deadline = Date.now() + 120000;
  let recovered = false;
  while (Date.now() < deadline) {
    try {
      if ((await request(frontend.url, "/api/settings", true)).status === 200) {
        recovered = true;
        break;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 1000));
  }
  assert.ok(recovered, "Frontend must reconnect after backend restart");
  const all = await start("all", [
    "-e",
    "AGENT_CANVAS_ALLOW_LAN_SESSION_KEY=true",
  ]);
  assert.equal((await request(all.url, "/canvas/")).status, 200);
  await capture(all.url, "all");
  assert.equal((await request(all.url, "/api/settings", true)).status, 200);
  assert.equal(
    (await request(all.url, "/api/automation/openapi.json")).status,
    200,
  );
  console.log(
    "DOCKER_MODES_SMOKE=PASS (all, backend, frontend proxy, auth, metadata, restart)",
  );
} finally {
  for (const name of names.reverse()) {
    try {
      docker("rm", "-f", "-v", name);
    } catch {}
  }
  try {
    docker("network", "rm", network);
  } catch {}
}
