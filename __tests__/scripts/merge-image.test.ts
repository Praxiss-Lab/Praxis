// @vitest-environment node
import { spawnSync } from "node:child_process";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

const image = "ghcr.io/praxiss-lab/praxis";
const digest = (character: string) => `sha256:${character.repeat(64)}`;
const script = path.resolve("scripts/praxis/merge-image.mjs");

function run(version: string, failure?: string) {
  const dir = mkdtempSync(path.join(tmpdir(), "praxis-manifest-"));
  mkdirSync(path.join(dir, "bin"));
  mkdirSync(path.join(dir, "digests"));
  writeFileSync(path.join(dir, "PRAXIS_VERSION"), version);
  for (const [arch, character] of [
    ["amd64", "a"],
    ["arm64", "b"],
  ]) {
    if (failure !== `missing-${arch}`)
      writeFileSync(
        path.join(dir, "digests", `${arch}.txt`),
        digest(character),
      );
  }
  const manifest = (arch: string, runtime: string, attestation: string) => [
    { digest: digest(runtime), platform: { os: "linux", architecture: arch } },
    {
      digest: digest(attestation),
      platform: { os: "unknown", architecture: "unknown" },
      annotations: { "vnd.docker.reference.type": "attestation-manifest" },
    },
  ];
  const amd = manifest("amd64", "1", "2");
  const arm = manifest(
    failure === "wrong-architecture" ? "amd64" : "arm64",
    "3",
    "4",
  );
  const registry = {
    [`${image}@${digest("a")}`]: { digest: digest("a"), manifests: amd },
    [`${image}@${digest("b")}`]: { digest: digest("b"), manifests: arm },
    [`${image}:${version}`]: {
      digest: digest("c"),
      manifests:
        failure === "lost-attestation" ? [...amd, arm[0]] : [...amd, ...arm],
    },
  };
  writeFileSync(path.join(dir, "registry.json"), JSON.stringify(registry));
  writeFileSync(path.join(dir, "calls"), "");
  writeFileSync(
    path.join(dir, "bin", "git"),
    "#!/bin/sh\nprintf verified-commit",
    { mode: 0o755 },
  );
  writeFileSync(
    path.join(dir, "bin", "docker"),
    `#!${process.execPath}
const fs = require('node:fs');
const args = process.argv.slice(2);
fs.appendFileSync('calls', JSON.stringify(args) + '\\n');
if (args[2] === 'inspect') {
  const manifest = JSON.parse(fs.readFileSync('registry.json'))[args[3]];
  if (!manifest) process.exit(1);
  process.stdout.write(JSON.stringify(manifest));
} else if (args[2] !== 'create') process.exit(1);
`,
    { mode: 0o755 },
  );
  const result = spawnSync(process.execPath, [script, "digests"], {
    cwd: dir,
    env: {
      ...process.env,
      PATH: `${path.join(dir, "bin")}:${process.env.PATH}`,
      RELEASE_VERSION: version,
      RELEASE_SHA: "verified-commit",
      GITHUB_OUTPUT: path.join(dir, "output"),
    },
    encoding: "utf8",
  });
  const calls = readFileSync(path.join(dir, "calls"), "utf8")
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line));
  let output = "";
  if (result.status === 0)
    output = readFileSync(path.join(dir, "output"), "utf8");
  rmSync(dir, { recursive: true, force: true });
  return { result, calls, output };
}

describe("Native release manifest publication", () => {
  it.each(["1.25.0", "1.25.1-rc.1"])(
    "publishes %s from both build digests",
    (version) => {
      const { result, calls, output } = run(version);
      expect(result.status, result.stderr).toBe(0);
      const create = calls.find((args) => args[2] === "create");
      expect(create.slice(-2)).toEqual([
        `${image}@${digest("a")}`,
        `${image}@${digest("b")}`,
      ]);
      expect(create.includes(`${image}:latest`)).toBe(!version.includes("-"));
      expect(create).toContain(`${image}:${version}`);
      expect(output).toBe(`digest=${digest("c")}\n`);
    },
  );

  it.each(["missing-arm64", "wrong-architecture"])(
    "rejects %s before publishing tags",
    (failure) => {
      const { result, calls } = run("1.25.0", failure);
      expect(result.status).not.toBe(0);
      expect(calls.some((args) => args[2] === "create")).toBe(false);
    },
  );

  it("withholds the release digest if the combined image loses attestations", () => {
    const { result, output } = run("1.25.0", "lost-attestation");
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("Published manifest differs");
    expect(output).toBe("");
  });
});
