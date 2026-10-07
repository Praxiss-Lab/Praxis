// @vitest-environment node
import { execFileSync } from "node:child_process";
import {
  chmodSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, expect, it } from "vitest";
const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const dirs: string[] = [];
afterEach(() =>
  dirs.splice(0).forEach((p) => rmSync(p, { recursive: true, force: true })),
);
function fixture(withUv = true) {
  const dir = mkdtempSync(path.join(tmpdir(), "praxis setup "));
  dirs.push(dir);
  mkdirSync(path.join(dir, "scripts/praxis"), { recursive: true });
  mkdirSync(path.join(dir, ".openhands"));
  for (const name of ["scripts/praxis/setup.sh", ".openhands/setup.sh"])
    copyFileSync(path.join(root, name), path.join(dir, name));
  writeFileSync(path.join(dir, ".env.sample"), "SAMPLE=example\n");
  const bin = path.join(dir, "bin");
  mkdirSync(bin);
  function executable(name: string, content: string) {
    const p = path.join(bin, name);
    writeFileSync(p, content);
    chmodSync(p, 0o755);
  }
  executable(
    "node",
    `#!/bin/bash\nif [ "$1" = --version ]; then echo v24.0.0; else exec '${process.execPath}' "$@"; fi\n`,
  );
  executable(
    "npm",
    '#!/bin/bash\necho "$*" >> "$SETUP_LOG"\nif [ "${FAIL_NPM:-}" = 1 ]; then exit 7; fi\n',
  );
  if (withUv) executable("uvx", "#!/bin/bash\nexit 0\n");
  const log = path.join(dir, "npm.log");
  function run(args: string[] = [], fail = false) {
    return execFileSync(
      "/bin/bash",
      [path.join(dir, ".openhands/setup.sh"), ...args],
      {
        cwd: dir,
        encoding: "utf8",
        env: {
          PATH: bin + ":/usr/bin:/bin",
          SETUP_LOG: log,
          FAIL_NPM: fail ? "1" : "",
        },
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
  }
  return { dir, log, run };
}
it("prepares a checkout repeatedly and preserves existing env values", () => {
  const f = fixture();
  writeFileSync(path.join(f.dir, ".env"), "CUSTOM=keep\n");
  f.run();
  const env = readFileSync(path.join(f.dir, ".env"), "utf8");
  f.run();
  expect(env).toContain("CUSTOM=keep");
  expect(env).toContain(`VITE_WORKING_DIR=${JSON.stringify(f.dir)}`);
  expect(readFileSync(path.join(f.dir, ".env"), "utf8")).toBe(env);
  expect(readFileSync(f.log, "utf8").trim().split("\n")).toEqual([
    "ci",
    "run make-i18n",
    "ci",
    "run make-i18n",
  ]);
});
it("fails without uvx before installing and permits explicit frontend-only preparation", () => {
  const f = fixture(false);
  expect(() => f.run()).toThrow(/uvx/);
  expect(existsSync(f.log)).toBe(false);
  f.run(["--frontend-only"]);
  expect(readFileSync(path.join(f.dir, ".env"), "utf8")).toContain(
    "SAMPLE=example",
  );
});
it("stops at an npm failure without preparing configuration", () => {
  const f = fixture();
  expect(() => f.run([], true)).toThrow();
  expect(existsSync(path.join(f.dir, ".env"))).toBe(false);
  expect(readFileSync(f.log, "utf8").trim()).toBe("ci");
});
it("refuses env symlinks instead of modifying a file outside the checkout", () => {
  const f = fixture();
  const target = path.join(f.dir, "outside");
  writeFileSync(target, "unchanged");
  symlinkSync(target, path.join(f.dir, ".env"));
  expect(() => f.run()).toThrow(/symlink/);
  expect(readFileSync(target, "utf8")).toBe("unchanged");
  expect(existsSync(f.log)).toBe(false);
});
