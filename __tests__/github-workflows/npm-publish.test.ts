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
      "https://github.com/Praxiss-Lab/Praxis",
    );
    expect(packageJson.homepage).toBe(
      "https://github.com/Praxiss-Lab/Praxis#readme",
    );
    expect(packageJson.bugs.url).toBe(
      "https://github.com/Praxiss-Lab/Praxis/issues",
    );
    expect(dockerfile).toContain(
      'LABEL org.opencontainers.image.source="https://github.com/Praxiss-Lab/Praxis"',
    );
    expect(dockerWorkflow).toContain("ghcr.io/praxiss-lab/praxis");
    expect(JSON.parse(read("config/defaults.json")).images.agentCanvas).toBe(
      "ghcr.io/praxiss-lab/praxis",
    );
    expect(read("scripts/praxis/merge-image.mjs")).toContain(
      'const image = "ghcr.io/praxiss-lab/praxis"',
    );
    expect(read(".github/workflows/praxis-release.yml")).toContain(
      "Image: ghcr.io/praxiss-lab/praxis:%s",
    );
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

  it("keeps explicit custom Docker build arguments optional", () => {
    const workflow = read(".github/workflows/docker.yml");
    const dockerfile = read("docker/Dockerfile");

    expect(workflow).not.toContain("VITE_POSTHOG_API_KEY=");
    expect(workflow).not.toContain("VITE_POSTHOG_CLIENT_KEY");
    expect(workflow).not.toContain("vite_app_env");
    expect(dockerfile).toContain('ARG VITE_POSTHOG_API_KEY=""');
    expect(dockerfile).toContain(
      "ENV VITE_POSTHOG_API_KEY=${VITE_POSTHOG_API_KEY}",
    );
    expect(dockerfile).not.toContain("VITE_APP_ENV");
  });
  it.each([
    "docker.yml",
    "desktop-linux.yml",
    "desktop-macos.yml",
    "desktop-windows.yml",
  ])("%s uses JSON analytics defaults without repository variables", (file) => {
    const workflow = read(`.github/workflows/${file}`);
    for (const field of ["API_KEY", "HOST", "UI_HOST"]) {
      expect(workflow).not.toContain(`vars.PRAXIS_POSTHOG_${field}`);
    }
    expect(workflow).not.toContain("vars.POSTHOG_PROD_KEY");
    expect(workflow).not.toContain("vars.POSTHOG_STAGING_KEY");
  });
});
