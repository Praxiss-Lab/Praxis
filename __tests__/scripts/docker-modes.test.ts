// @vitest-environment node
import { spawnSync } from "node:child_process";
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
describe("Docker mode selection", () => {
  it.each([
    [["--frontend-only", "--backend-only"], {}, "usage:"],
    [["--unknown"], {}, "Unknown mode argument"],
    [[], { PRAXIS_MODE: "invalid" }, "PRAXIS_MODE must be"],
  ])(
    "rejects invalid mode configuration before starting services",
    (args, env, error) => {
      const result = spawnSync("bash", ["docker/entrypoint.sh", ...args], {
        cwd: root,
        encoding: "utf8",
        env: { ...process.env, ...env },
      });
      expect(result.status).toBe(2);
      expect(result.stderr).toContain(error);
    },
  );

  it.each([
    [
      { PRAXIS_BACKEND_URL: "https://user:secret@example.com" },
      "without credentials",
    ],
    [
      { PRAXIS_BACKEND_URL: "http://backend:8000", PRAXIS_EDITOR_PATH: "/api" },
      "non-reserved",
    ],
    [{ PRAXIS_EDITOR_PATH: "/vscode" }, "requires a backend"],
  ])("rejects invalid frontend proxy configuration", (env, error) => {
    const result = spawnSync("bash", ["docker/frontend-entrypoint.sh"], {
      encoding: "utf8",
      env: { ...process.env, ...env },
    });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain(error);
  });

  it("frontend selection delegates before touching backend state", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "praxis-mode-"));
    try {
      const frontend = path.join(dir, "frontend.sh");
      writeFileSync(frontend, "printf 'frontend-started'");
      const script = readFileSync("docker/entrypoint.sh", "utf8").replace(
        "/opt/agent-canvas/frontend-entrypoint.sh",
        frontend,
      );
      const entry = path.join(dir, "entrypoint.sh");
      writeFileSync(entry, script);
      const result = spawnSync("bash", [entry, "--frontend-only"], {
        encoding: "utf8",
      });
      expect(result.status).toBe(0);
      expect(result.stdout).toBe("frontend-started");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
