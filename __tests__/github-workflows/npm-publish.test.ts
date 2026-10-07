// @vitest-environment node
import { existsSync, readFileSync } from "node:fs";
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

describe("Praxis repository and publishing policy", () => {
  it("uses the Praxis GitHub repository in release/container metadata", () => {
    const packageJson = JSON.parse(read("package.json"));
    const dockerfile = read("docker/Dockerfile");
    const dockerWorkflow = read(".github/workflows/docker.yml");

    expect(packageJson.repository.url).toBe(
      "https://github.com/Emilio-01-T/Praxis",
    );
    expect(packageJson.homepage).toBe(
      "https://github.com/Emilio-01-T/Praxis#readme",
    );
    expect(packageJson.bugs.url).toBe(
      "https://github.com/Emilio-01-T/Praxis/issues",
    );
    expect(dockerfile).toContain(
      'LABEL org.opencontainers.image.source="https://github.com/Emilio-01-T/Praxis"',
    );
    expect(dockerWorkflow).toContain("ghcr.io/emilio-01-t/praxis");
    expect(dockerWorkflow).toContain("ghcr.io/emilio-01-t/praxis");
  });

  it("does not let electron-builder auto-publish during desktop builds", () => {
    const packageJson = JSON.parse(read("package.json"));

    expect(packageJson.scripts["build:desktop"]).toContain("--publish never");
    expect(packageJson.scripts["build:desktop:universal"]).toContain(
      "--publish never",
    );
  });

  it("has no inherited npm publication workflow", () => {
    expect(
      existsSync(path.join(repoRoot, ".github/workflows/npm-publish.yml")),
    ).toBe(false);
  });

  it("passes the selected PostHog key through Docker's supported build arg", () => {
    const workflow = read(".github/workflows/docker.yml");
    const dockerfile = read("docker/Dockerfile");

    expect(workflow).toContain(
      "VITE_POSTHOG_API_KEY=${{ vars.POSTHOG_PROD_KEY }}",
    );
    expect(workflow).not.toContain("VITE_POSTHOG_CLIENT_KEY");
    expect(workflow).not.toContain("vite_app_env");
    expect(dockerfile).toContain('ARG VITE_POSTHOG_API_KEY=""');
    expect(dockerfile).toContain(
      "ENV VITE_POSTHOG_API_KEY=${VITE_POSTHOG_API_KEY}",
    );
    expect(dockerfile).not.toContain("VITE_APP_ENV");
  });
});
