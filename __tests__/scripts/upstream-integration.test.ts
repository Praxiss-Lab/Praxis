// @vitest-environment node
import { execFileSync } from "node:child_process";
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";

const sourceRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const temporary: string[] = [];
afterEach(() =>
  temporary
    .splice(0)
    .forEach((dir) => rmSync(dir, { recursive: true, force: true })),
);

function git(cwd: string, ...args: string[]): string {
  return execFileSync("git", args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}
function identify(cwd: string) {
  git(cwd, "config", "user.name", "Integration Test");
  git(cwd, "config", "user.email", "integration@example.invalid");
}
function fixture() {
  const root = mkdtempSync(path.join(tmpdir(), "praxis-upstream-"));
  temporary.push(root);
  const upstream = path.join(root, "upstream");
  const praxis = path.join(root, "praxis");
  const origin = path.join(root, "origin.git");
  mkdirSync(upstream);
  git(upstream, "init", "-b", "main");
  identify(upstream);
  writeFileSync(path.join(upstream, "shared.txt"), "baseline\n");
  git(upstream, "add", ".");
  git(upstream, "commit", "-m", "baseline");
  const baseline = git(upstream, "rev-parse", "HEAD");
  git(root, "clone", "--bare", upstream, origin);
  git(root, "clone", origin, praxis);
  identify(praxis);
  mkdirSync(path.join(praxis, "scripts/praxis"), { recursive: true });
  mkdirSync(path.join(praxis, "docs/upstream"), { recursive: true });
  for (const name of [
    "upstream-fetch.sh",
    "upstream-report.sh",
    "prepare-upstream-integration.sh",
  ]) {
    copyFileSync(
      path.join(sourceRoot, "scripts/praxis", name),
      path.join(praxis, "scripts/praxis", name),
    );
  }
  writeFileSync(
    path.join(praxis, "docs/upstream/LAST_REVIEWED"),
    baseline + "\n",
  );
  git(praxis, "add", ".");
  git(praxis, "commit", "-m", "Praxis setup");
  git(praxis, "push", "origin", "main");
  const published = git(praxis, "rev-parse", "HEAD");
  writeFileSync(path.join(upstream, "feature.txt"), "upstream feature\n");
  git(upstream, "add", ".");
  git(upstream, "commit", "-m", "upstream feature");
  const target = git(upstream, "rev-parse", "HEAD");
  function run(script: string, ...args: string[]) {
    return execFileSync(
      "bash",
      [path.join(praxis, "scripts/praxis", script), ...args],
      {
        cwd: praxis,
        encoding: "utf8",
        env: { ...process.env, UPSTREAM_URL: upstream },
        stdio: ["ignore", "pipe", "pipe"],
        timeout: 10000,
      },
    );
  }
  return { praxis, upstream, baseline, published, target, run };
}

describe("upstream integration preparation", () => {
  it("freezes the target on a branch from published main without importing code or moving local main", () => {
    const f = fixture();
    writeFileSync(path.join(f.praxis, "local-only.txt"), "local work\n");
    git(f.praxis, "add", ".");
    git(f.praxis, "commit", "-m", "unpublished local change");
    const localMain = git(f.praxis, "rev-parse", "main");
    f.run("prepare-upstream-integration.sh", "test");
    expect(git(f.praxis, "branch", "--show-current")).toBe(
      "integration/upstream-test",
    );
    expect(git(f.praxis, "rev-parse", "HEAD")).toBe(f.published);
    expect(git(f.praxis, "rev-parse", "main")).toBe(localMain);
    expect(git(f.praxis, "ls-files", "feature.txt")).toBe("");
    expect(
      readFileSync(
        path.join(f.praxis, "docs/upstream/LAST_REVIEWED"),
        "utf8",
      ).trim(),
    ).toBe(f.baseline);
    const report = readFileSync(
      path.join(f.praxis, "docs/upstream/reviews/test.md"),
      "utf8",
    );
    expect(report).toContain(f.target);
    expect(report).toContain("upstream feature");
    expect(report).toContain("PREPARED");
  });

  it("refuses dirty worktrees and an unexpected upstream remote before changing branches", () => {
    const f = fixture();
    writeFileSync(path.join(f.praxis, "untracked.txt"), "work\n");
    expect(() => f.run("prepare-upstream-integration.sh", "dirty")).toThrow(
      /working tree must be clean/,
    );
    rmSync(path.join(f.praxis, "untracked.txt"));
    git(
      f.praxis,
      "remote",
      "add",
      "upstream",
      "https://example.invalid/wrong.git",
    );
    expect(() => f.run("prepare-upstream-integration.sh", "wrong")).toThrow(
      /upstream remote points to/,
    );
    expect(git(f.praxis, "branch", "--show-current")).toBe("main");
  });

  it("keeps selectively integrated changes in the review interval and identifies equivalent patches", () => {
    const f = fixture();
    f.run("upstream-fetch.sh");
    git(f.praxis, "cherry-pick", f.target);
    const report = f.run("upstream-report.sh");
    expect(report).toContain("upstream feature");
    expect(report).toContain(`- ${f.target}`);
    expect(() => f.run("upstream-report.sh", "HEAD", "upstream/main")).toThrow(
      /not an ancestor/,
    );
  });
});
