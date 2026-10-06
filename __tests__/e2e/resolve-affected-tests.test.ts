// @vitest-environment node
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

const resolverPath = path.join(
  repoRoot,
  "tests/e2e/mock-llm/scripts/resolve-affected-tests.mjs",
);
const workflowPath = path.join(repoRoot, ".github/workflows/mock-llm-e2e.yml");
const dockerWorkflowPath = path.join(
  repoRoot,
  ".github/workflows/mock-llm-docker-e2e.yml",
);
const ciWorkflowPath = path.join(repoRoot, ".github/workflows/ci.yml");

function resolveAffectedTests(files: string[]) {
  const output = execFileSync(
    process.execPath,
    [resolverPath, "--files", files.join(",")],
    { cwd: repoRoot, encoding: "utf-8" },
  ).trim();

  return output.length > 0 ? output.split(/\s+/) : [];
}

describe("mock-LLM E2E affected test resolver", () => {
  it("selects mapped source shards plus regressions", () => {
    expect(
      resolveAffectedTests(["src/components/features/settings/llm-form.tsx"]),
    ).toEqual([
      "tests/e2e/mock-llm/regressions",
      "tests/e2e/mock-llm/settings",
    ]);
  });

  it("runs the full suite for cross-cutting source changes", () => {
    expect(resolveAffectedTests(["src/api/agent-server-adapter.ts"])).toEqual([
      "__ALL__",
    ]);
  });

  it("runs the full suite for unmapped source changes", () => {
    expect(resolveAffectedTests(["src/utils/some-new-helper.ts"])).toEqual([
      "__ALL__",
    ]);
  });

  it("selects the containing feature subset for a test-only new spec change", () => {
    expect(
      resolveAffectedTests([
        "tests/e2e/mock-llm/mcp/mock-llm-new-marketplace.spec.ts",
      ]),
    ).toEqual(["tests/e2e/mock-llm/mcp", "tests/e2e/mock-llm/regressions"]);
  });

  it("selects the exact root spec path defensively for misplaced new specs", () => {
    expect(
      resolveAffectedTests(["tests/e2e/mock-llm/mock-llm-new-root.spec.ts"]),
    ).toEqual([
      "tests/e2e/mock-llm/regressions",
      "tests/e2e/mock-llm/mock-llm-new-root.spec.ts",
    ]);
  });

  it.each([
    ["public/favicon.ico"],
    [".github/workflows/mock-llm-e2e.yml"],
    ["tailwind.config.js"],
    ["hero.ts"],
    ["tests/e2e/mock-llm/test-mapping.json"],
  ])("runs the full suite for relevant trigger path %s", (file) => {
    expect(resolveAffectedTests([file])).toEqual(["__ALL__"]);
  });

  it("runs browser mock E2E after main updates or manual dispatch", () => {
    const workflow = readFileSync(workflowPath, "utf-8");

    expect(workflow).toContain("push:\n    branches: [main]");
    expect(workflow).toContain("workflow_dispatch:");
    expect(workflow).not.toContain("pull_request:");
    expect(workflow).not.toContain("detect-pr-changes:");
    expect(workflow).toContain("npm run test:e2e:mock-llm &");
  });

  it("runs Docker mock E2E only for explicitly selected images", () => {
    const dockerWorkflow = readFileSync(dockerWorkflowPath, "utf-8");
    expect(dockerWorkflow).toContain("workflow_dispatch:");
    expect(dockerWorkflow).not.toMatch(/^  workflow_run:/m);
    expect(dockerWorkflow).toContain("required: true");
    expect(dockerWorkflow).not.toContain("sha-${SHORT_SHA}-amd64");
  });

  it("keeps inherited compatibility CI manual-only in Praxis", () => {
    const ciWorkflow = readFileSync(ciWorkflowPath, "utf-8");

    expect(ciWorkflow).toContain("name: Upstream Compatibility CI");
    expect(ciWorkflow).toContain("workflow_dispatch:");
    expect(ciWorkflow).not.toContain("pull_request:");
    expect(ciWorkflow).not.toContain("push:");
    expect(ciWorkflow).not.toContain("live-e2e:");
  });
});
