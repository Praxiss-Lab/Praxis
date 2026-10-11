import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { validateManifest, verifyAsset, assertDestination, inspectRelease, restore } from "../restore-migration-release.mjs";

const manifest = JSON.parse(readFileSync(new URL("../migration-release.json", import.meta.url), "utf8"));
const repository = { id: manifest.targetRepositoryId };
const commit = { sha: manifest.targetCommit, tree: { sha: manifest.targetTree } };
const tag = { object: { type: "commit", sha: manifest.targetCommit } };
const assets = manifest.assets.map(asset => ({ name: asset.name, state: "uploaded", size: asset.size, digest: `sha256:${asset.sha256}` }));
const release = { tag_name: manifest.tag, name: manifest.title, prerelease: false, draft: false, assets };

test("accepts the recorded manifest and blocks substituted download paths", () => {
  validateManifest(manifest);
  const bad = structuredClone(manifest);
  bad.assets[0].name = "../package.tgz";
  assert.throws(() => validateManifest(bad), /Unexpected migration asset/);
});
test("blocks restoration into the original repository or a changed snapshot", () => {
  assertDestination(manifest, repository, commit, tag);
  assert.throws(() => assertDestination(manifest, { id: manifest.originalRepositoryId }, commit, tag), /restricted/);
  assert.throws(() => assertDestination(manifest, repository, { ...commit, tree: { sha: "0".repeat(40) } }, tag), /snapshot/);
});
test("never moves an existing tag to the imported snapshot", () => {
  assert.throws(() => assertDestination(manifest, repository, commit, { object: { type: "commit", sha: manifest.originalTagCommit } }), /refusing to move/);
});
test("detects changed bytes even when the byte length matches", () => {
  const bytes = Buffer.from("original");
  const asset = { name: "fixture", size: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex") };
  verifyAsset(bytes, asset);
  assert.throws(() => verifyAsset(Buffer.from("modified"), asset), /Checksum/);
});
test("accepts a completed import and can resume a partial draft", () => {
  assert.deepEqual(inspectRelease(manifest, release), { missing: [], complete: true });
  assert.deepEqual(inspectRelease(manifest, { ...release, draft: true, assets: [assets[0]] }), { missing: [manifest.assets[1]], complete: false });
});
test("refuses overwritten assets and an incomplete published release", () => {
  assert.throws(() => inspectRelease(manifest, { ...release, assets: [{ ...assets[0], digest: "sha256:changed" }] }), /differs/);
  assert.throws(() => inspectRelease(manifest, { ...release, assets: [assets[0]] }), /incomplete/);
});

test("restoration verifies downloads before writes and uploads before publication", async () => {
  const previousRepo = process.env.GH_REPO;
  const previousToken = process.env.GH_TOKEN;
  process.env.GH_REPO = "Praxiss-Lab/Praxis-2";
  process.env.GH_TOKEN = "test-fixture";
  try {
    const writes = [];
    const api = route => {
      if (route.endsWith(`/git/commits/${manifest.targetCommit}`)) return commit;
      if (route.includes("/git/ref/tags/")) return tag;
      if (route.includes("/releases/tags/")) return { ...release, draft: true, assets: [] };
      return repository;
    };
    await assert.rejects(restore(manifest, {
      api, releaseCommand: args => writes.push(args),
      download: async () => { throw new Error("Checksum mismatch"); },
    }), /Checksum mismatch/);
    assert.deepEqual(writes, []);

    let uploaded = false;
    let published = false;
    const resumeApi = route => {
      const current = { ...release, draft: !published, assets: uploaded ? assets : [assets[0]] };
      if (route.includes("/releases?")) return [[current]];
      if (route.includes("/releases/tags/")) return published ? current : null;
      return api(route);
    };
    const commands = [];
    await restore(manifest, {
      api: resumeApi,
      download: async (_manifest, missing) => {
        assert.deepEqual(missing, [manifest.assets[1]]);
        return { directory: "/unused", files: new Map([["image.txt", "/fixture/image.txt"]]) };
      },
      releaseCommand: args => {
        commands.push(args[0]);
        if (args[0] === "upload") uploaded = true;
        if (args[0] === "edit") {
          assert.equal(uploaded, true);
          published = true;
        }
      },
    });
    assert.deepEqual(commands, ["upload", "edit"]);

    await assert.rejects(restore(manifest, {
      api, download: async () => ({ directory: "/unused", files: new Map() }),
      releaseCommand: () => assert.fail("An incomplete upload must not be published"),
    }), /keeping the draft/);
  } finally {
    if (previousRepo === undefined) delete process.env.GH_REPO;
    else process.env.GH_REPO = previousRepo;
    if (previousToken === undefined) delete process.env.GH_TOKEN;
    else process.env.GH_TOKEN = previousToken;
  }
});
