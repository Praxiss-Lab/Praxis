import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { renderInstallationNotes } from "./release-notes.mjs";

const manifestUrl = new URL("./migration-release.json", import.meta.url);

export function validateManifest(manifest) {
  if (
    manifest.targetRepositoryId !== 1413862562 ||
    manifest.originalRepositoryId !== 1407000350 ||
    manifest.tag !== "v1.25.0" ||
    manifest.title !== "Praxis 1.25.0" ||
    !/^[a-f0-9]{40}$/.test(manifest.originalTagCommit) ||
    !/^[a-f0-9]{40}$/.test(manifest.targetCommit) ||
    !/^[a-f0-9]{40}$/.test(manifest.targetTree) ||
    manifest.assets.length !== 2
  ) throw new Error("Unexpected migration manifest");
  const names = new Set();
  for (const asset of manifest.assets) {
    if (
      !["openhands-agent-canvas-1.25.0.tgz", "image.txt"].includes(asset.name) ||
      names.has(asset.name) || !/^[a-f0-9]{64}$/.test(asset.sha256) ||
      !Number.isSafeInteger(asset.size) || asset.size <= 0 ||
      asset.url !== `https://github.com/Praxiss-Lab/Praxis/releases/download/${manifest.tag}/${asset.name}`
    ) throw new Error("Unexpected migration asset");
    names.add(asset.name);
  }
}

export function verifyAsset(bytes, asset) {
  if (
    bytes.length !== asset.size ||
    createHash("sha256").update(bytes).digest("hex") !== asset.sha256
  ) throw new Error(`Checksum or size mismatch: ${asset.name}`);
}

export function assertDestination(manifest, repository, commit, tag) {
  if (repository.id !== manifest.targetRepositoryId)
    throw new Error("This operation is restricted to the new repository ID");
  if (commit.sha !== manifest.targetCommit || commit.tree.sha !== manifest.targetTree)
    throw new Error("The preserved release snapshot does not match");
  if (tag && (tag.object.type !== "commit" || tag.object.sha !== manifest.targetCommit))
    throw new Error("Existing release tag points elsewhere; refusing to move it");
}

export function inspectRelease(manifest, release) {
  if (!release) return { missing: manifest.assets, complete: false };
  if (release.tag_name !== manifest.tag || release.name !== manifest.title || release.prerelease)
    throw new Error("Existing release identity does not match");
  const expected = new Map(manifest.assets.map(asset => [asset.name, asset]));
  for (const asset of release.assets) {
    const original = expected.get(asset.name);
    if (!original || asset.state !== "uploaded" || asset.size !== original.size || asset.digest !== `sha256:${original.sha256}`)
      throw new Error(`Existing release asset differs: ${asset.name}`);
    expected.delete(asset.name);
  }
  if (!release.draft && expected.size)
    throw new Error("Published release is incomplete; manual review is required");
  return { missing: [...expected.values()], complete: !release.draft };
}

function ghApi(route, args = [], optional = false) {
  const result = spawnSync("gh", ["api", route, ...args], { encoding: "utf8" });
  if (optional && result.status !== 0 && /HTTP 404/.test(result.stderr ?? "")) return null;
  if (result.status !== 0) throw new Error(`GitHub API operation failed: ${route}`);
  return result.stdout.trim() ? JSON.parse(result.stdout) : null;
}

function ghRelease(args) {
  const result = spawnSync("gh", ["release", ...args], { encoding: "utf8" });
  if (result.status !== 0) throw new Error("GitHub release operation failed; inspect the draft before retrying");
}

function findRelease(api, base, tag) {
  // The tag endpoint is for published releases. List with the authenticated
  // token as a fallback so interrupted draft uploads can be resumed reliably.
  const published = api(`${base}/releases/tags/${tag}`, [], true);
  if (published) return published;
  const pages = api(`${base}/releases?per_page=100`, ["--paginate", "--slurp"]);
  const matches = pages.flat().filter(release => release.tag_name === tag);
  if (matches.length > 1) throw new Error("Multiple releases use this tag; manual review is required");
  return matches[0] ?? null;
}

async function downloadAssets(manifest, assets = manifest.assets) {
  const directory = await mkdtemp(path.join(tmpdir(), "praxis-release-migration-"));
  const files = new Map();
  await Promise.all(assets.map(async asset => {
    const response = await fetch(asset.url, { signal: AbortSignal.timeout(120_000) });
    if (!response.ok) throw new Error(`Download failed (${response.status}): ${asset.name}; preserve the original repository until restoration completes`);
    const bytes = Buffer.from(await response.arrayBuffer());
    verifyAsset(bytes, asset);
    const filename = path.join(directory, asset.name);
    await writeFile(filename, bytes);
    files.set(asset.name, filename);
  }));
  return { directory, files };
}

export async function restore(manifest, dependencies = {}) {
  const api = dependencies.api ?? ghApi;
  const releaseCommand = dependencies.releaseCommand ?? ghRelease;
  const download = dependencies.download ?? downloadAssets;
  const repositoryName = process.env.GH_REPO;
  if (!/^[\w.-]+\/[\w.-]+$/.test(repositoryName ?? "") || !process.env.GH_TOKEN)
    throw new Error("GH_REPO and the workflow GH_TOKEN are required");
  const base = `repos/${repositoryName}`;
  const repository = api(base);
  const commit = api(`${base}/git/commits/${manifest.targetCommit}`);
  let tag = api(`${base}/git/ref/tags/${manifest.tag}`, [], true);
  assertDestination(manifest, repository, commit, tag);
  let release = findRelease(api, base, manifest.tag);
  if (release && !tag) throw new Error("A release exists without its expected tag; manual review is required");
  const state = inspectRelease(manifest, release);
  if (state.complete) {
    console.log(`Original release assets already restored: ${release.html_url}`);
    return;
  }
  const { directory, files } = await download(manifest, state.missing);
  if (!tag) {
    api(`${base}/git/refs`, ["--method", "POST", "-f", `ref=refs/tags/${manifest.tag}`, "-f", `sha=${manifest.targetCommit}`]);
    tag = api(`${base}/git/ref/tags/${manifest.tag}`);
    assertDestination(manifest, repository, commit, tag);
  }
  if (!release) {
    const notes = renderInstallationNotes({ version: "1.25.0", repository: repositoryName, archive: manifest.assets[0].name }) +
      `\n## Migration provenance\n\nOriginal published assets were copied without rebuilding and verified against recorded SHA-256 digests. The tag uses the preserved original source tree with independent Git history.\n\nOriginal tag commit: \`${manifest.originalTagCommit}\`. Restored snapshot: \`${manifest.targetCommit}\`. \`image.txt\` records the original image build, not a new build. GHCR remains \`ghcr.io/praxiss-lab/praxis:1.25.0\`.\n\nHistorical pull requests and release metadata: [migration archive](https://github.com/${repositoryName}/tree/migration/history-archive/.migration).\n`;
    const notesPath = path.join(directory, "release-notes.md");
    await writeFile(notesPath, notes);
    releaseCommand(["create", manifest.tag, "--repo", repositoryName, "--verify-tag", "--draft", "--title", manifest.title, "--notes-file", notesPath]);
  }
  for (const filename of files.values())
    releaseCommand(["upload", manifest.tag, filename, "--repo", repositoryName]);
  release = findRelease(api, base, manifest.tag);
  const checked = inspectRelease(manifest, release);
  if (checked.missing.length) throw new Error("Release assets are incomplete; keeping the draft");
  releaseCommand(["edit", manifest.tag, "--repo", repositoryName, "--draft=false"]);
  release = findRelease(api, base, manifest.tag);
  if (!inspectRelease(manifest, release).complete) throw new Error("Release publication is not complete");
  console.log(`Original release restored: ${release.html_url}`);
}

async function main() {
  const manifest = JSON.parse(await readFile(manifestUrl, "utf8"));
  validateManifest(manifest);
  if (process.argv[2] === "--verify-downloads") {
    const result = await downloadAssets(manifest);
    console.log(`Verified original assets in ${result.directory}`);
  } else if (process.argv[2] === "--restore") {
    if (process.env.MIGRATION_CONFIRM !== "RESTORE" || process.env.GITHUB_REF !== "refs/heads/main")
      throw new Error("Restoration requires manual RESTORE confirmation from main");
    await restore(manifest);
  } else throw new Error("Use --verify-downloads or the authorized --restore workflow");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
