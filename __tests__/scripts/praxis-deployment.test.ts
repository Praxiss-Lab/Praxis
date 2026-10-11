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

describe("Praxis target deployment safety contract", () => {
  it("requires an immutable Praxis image and recreates only the application service", () => {
    const script = read("scripts/praxis/deploy-compose.sh");

    expect(script).toContain("ghcr.io/praxiss-lab/praxis:sha-*");
    expect(script).toContain("ghcr.io/praxiss-lab/praxis@sha256:*");
    expect(script).toContain("--no-deps --force-recreate");
    expect(script).toContain("OLD_IMAGE_REF");
    expect(script).toContain("OLD_IMAGE_ID");
    expect(script).toContain("OLD_REPO_DIGEST");
    expect(script).not.toContain("docker compose down");
    expect(script).not.toContain("docker volume rm");
    expect(script).not.toContain("docker system prune");
  });

  it("rolls back from recorded image identity without destructive cleanup", () => {
    const script = read("scripts/praxis/rollback-compose.sh");

    expect(script).toContain("OLD_REPO_DIGEST");
    expect(script).toContain("OLD_IMAGE_ID");
    expect(script).toContain("OLD_IMAGE_REF");
    expect(script).toContain("--no-deps --force-recreate");
    expect(script).not.toContain("docker compose down");
    expect(script).not.toContain("docker volume rm");
  });

  it("verifies the running container and HTTP endpoint", () => {
    const script = read("scripts/praxis/target-smoke.sh");

    expect(script).toContain("{{.State.Running}}");
    expect(script).toContain("{{.Config.Image}}");
    expect(script).toContain("curl -k -L");
    expect(script).toContain("TARGET_SMOKE=PASS");
  });
});
