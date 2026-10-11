// @vitest-environment node
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import defaults from "../../config/defaults.json";

const entrypoint = readFileSync("docker/entrypoint.sh", "utf8");
const mapping = entrypoint.slice(
  entrypoint.indexOf('if [ -z "${AUTOMATION_POSTHOG_API_KEY:-}" ]'),
  entrypoint.indexOf("# AGENT_SERVER_URL"),
);

describe("Docker JSON analytics defaults", () => {
  it("maps the generated JSON settings to both backend services without overrides", () => {
    const result = spawnSync(
      "bash",
      [
        "-c",
        `${mapping}\nprintf '%s\\n' "$AUTOMATION_POSTHOG_API_KEY" "$AUTOMATION_POSTHOG_HOST" "$OH_TELEMETRY_POSTHOG_API_KEY" "$OH_TELEMETRY_POSTHOG_HOST" "$OH_TELEMETRY_EXPORTER"`,
      ],
      {
        encoding: "utf8",
        env: {
          PATH: process.env.PATH,
          CONFIG_POSTHOG_API_KEY: defaults.telemetry.posthogApiKey,
          CONFIG_POSTHOG_HOST: defaults.telemetry.posthogHost,
        },
      },
    );
    expect(result.status).toBe(0);
    expect(result.stdout.trim().split("\n")).toEqual([
      defaults.telemetry.posthogApiKey,
      "https://eu.i.posthog.com",
      defaults.telemetry.posthogApiKey,
      "https://eu.i.posthog.com",
      "posthog",
    ]);
  });
});
