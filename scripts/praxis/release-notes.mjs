import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const templatePath = new URL(
  "../../.github/release-installation.md",
  import.meta.url,
);

export function renderInstallationNotes({ version, repository, archive }) {
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version ?? "")) {
    throw new Error("A valid Praxis release version is required");
  }
  if (!/^[\w.-]+\/[\w.-]+$/.test(repository ?? "")) {
    throw new Error("A valid owner/repository is required");
  }
  if (!/^[\w.-]+\.tgz$/.test(archive ?? "")) {
    throw new Error("A native archive filename is required");
  }
  const values = { VERSION: version, REPOSITORY: repository, ARCHIVE: archive };
  return readFileSync(templatePath, "utf8").replace(
    /\{\{(\w+)\}\}/g,
    (_, key) => {
      if (!(key in values))
        throw new Error(`Unknown release notes placeholder: ${key}`);
      return values[key];
    },
  );
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const assetDirectory = process.argv[2] ?? "release-assets";
  const archives = readdirSync(assetDirectory).filter((name) =>
    name.endsWith(".tgz"),
  );
  if (archives.length !== 1)
    throw new Error("Expected exactly one native release archive");
  process.stdout.write(
    renderInstallationNotes({
      version: process.env.PRAXIS_RELEASE_VERSION,
      repository: process.env.GH_REPO,
      archive: archives[0],
    }),
  );
}
