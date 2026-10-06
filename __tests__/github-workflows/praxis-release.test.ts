// @vitest-environment node
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

function read(rel: string): string {
  return readFileSync(path.join(repoRoot, rel), "utf-8");
}

describe("Praxis release workflow", () => {
  it("is explicit, Praxis-owned, and version-gated", () => {
    const workflow = read(".github/workflows/praxis-release.yml");

    expect(workflow).toContain("name: Praxis Release");
    expect(workflow).toContain("workflow_dispatch:");
    expect(workflow).toContain("Type RELEASE to confirm");
    expect(workflow).toContain("node scripts/praxis/release-inputs.mjs");
    expect(workflow).toContain("uses: ./.github/workflows/docker.yml");
    expect(workflow).toContain("needs: [verify, image]");
    expect(workflow).toContain("inputs.version");
    expect(workflow).toContain('tag="v$PRAXIS_RELEASE_VERSION"');
    expect(workflow).toContain('gh release create "$tag"');
    expect(workflow).toContain('--title "Praxis $PRAXIS_RELEASE_VERSION"');
    expect(workflow).not.toContain("OpenHands/release-actions");
    expect(workflow).not.toContain("@openhands/agent-canvas");
    expect(workflow).not.toContain("npm publish");
  });

  it("verifies the repository before creating a release", () => {
    const workflow = read(".github/workflows/praxis-release.yml");

    expect(workflow).toContain("bash scripts/praxis/repository-check.sh");
    expect(workflow).toContain("npm run typecheck");
    expect(workflow).toContain("npm run lint");
    expect(workflow).toContain("npm test");
    expect(workflow).toContain("npm run build");
    expect(workflow).toContain("Ensure tag does not already exist");
  });
});
