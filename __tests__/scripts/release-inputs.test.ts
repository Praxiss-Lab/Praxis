// @vitest-environment node
import { spawnSync } from "node:child_process";
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("Release input validation", () => {
  it.each(["0.1.0", "0.1.0-alpha.1"])(
    "pins validated release %s to its checked-out commit",
    (version) => {
      const dir = mkdtempSync(path.join(tmpdir(), "praxis-release-"));
      try {
        writeFileSync(path.join(dir, "PRAXIS_VERSION"), version);
        spawnSync("git", ["init", "-q", dir]);
        spawnSync("git", ["-C", dir, "add", "."]);
        spawnSync("git", [
          "-C",
          dir,
          "-c",
          "user.name=Test",
          "-c",
          "user.email=test@example.invalid",
          "commit",
          "-qm",
          "fixture",
        ]);
        const sha = spawnSync("git", ["-C", dir, "rev-parse", "HEAD"], {
          encoding: "utf8",
        }).stdout.trim();
        const output = path.join(dir, "outputs");
        const env = {
          ...process.env,
          RELEASE_VERSION: version,
          GITHUB_REF: "refs/heads/main",
          GITHUB_SHA: sha,
          GITHUB_OUTPUT: output,
          GITHUB_ENV: path.join(dir, "env"),
        };
        const script = path.resolve("scripts/praxis/release-inputs.mjs");
        const result = spawnSync(process.execPath, [script], {
          cwd: dir,
          env,
          encoding: "utf8",
        });
        expect(result.status).toBe(0);
        expect(readFileSync(output, "utf8")).toBe(
          `version=${version}\nsha=${sha}\n`,
        );
        for (const override of [
          { RELEASE_VERSION: "0.2.0" },
          { GITHUB_REF: "refs/heads/feature" },
          { GITHUB_SHA: "wrong-commit" },
          { RELEASE_VERSION: "0.1.0; echo injected" },
        ]) {
          const invalid = spawnSync(process.execPath, [script], {
            cwd: dir,
            env: { ...env, ...override },
            encoding: "utf8",
          });
          expect(invalid.status).not.toBe(0);
        }
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    },
  );
});
