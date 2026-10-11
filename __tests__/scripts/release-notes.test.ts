// @vitest-environment node
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

const script = path.resolve("scripts/praxis/release-notes.mjs");

function generate(version: string, archives: string[]) {
  const directory = mkdtempSync(
    path.join(os.tmpdir(), "praxis-release-notes-"),
  );
  try {
    for (const archive of archives)
      writeFileSync(path.join(directory, archive), "fixture");
    return execFileSync(process.execPath, [script, directory], {
      encoding: "utf8",
      env: {
        ...process.env,
        PRAXIS_RELEASE_VERSION: version,
        GH_REPO: "Praxiss-Lab/Praxis",
      },
      stdio: ["ignore", "pipe", "pipe"],
    });
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

describe("release installation notes", () => {
  it.each(["1.25.0", "1.26.0-alpha.1"])(
    "pins download, image and documentation links to %s",
    (version) => {
      const archive = `praxis-native-${version}.tgz`;
      const notes = generate(version, [archive]);
      expect(notes).toContain(`ghcr.io/praxiss-lab/praxis:${version}`);
      expect(notes).toContain(`/releases/download/v${version}/${archive}`);
      expect(notes).toContain(`/blob/v${version}/docs/SELF_HOSTING.md`);
      expect(notes).toContain(`npm install -g ./praxis-${version}.tgz`);
      expect(notes).toContain("PRAXIS_MODE=backend");
      expect(notes).toContain("PRAXIS_MODE=frontend");
      expect(notes).toContain("127.0.0.1:18080:8000");
      expect(notes).not.toMatch(/\{\{\w+\}\}/);
    },
  );

  it.each([{ archives: [] }, { archives: ["first.tgz", "second.tgz"] }])(
    "refuses missing or ambiguous native artifacts: %j",
    ({ archives }) => {
      expect(() => generate("1.25.0", archives)).toThrow();
    },
  );

  it("rejects a version containing shell syntax instead of publishing executable instructions", () => {
    expect(() => generate("1.25.0;echo injected", ["native.tgz"])).toThrow();
  });
});
