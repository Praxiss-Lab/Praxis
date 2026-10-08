import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const image = "ghcr.io/praxiss-lab/praxis";
const version = process.env.RELEASE_VERSION;
if (version !== fs.readFileSync("PRAXIS_VERSION", "utf8").trim())
  throw new Error("Manifest version differs from the checked-out release");
if (
  execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim() !==
  process.env.RELEASE_SHA
)
  throw new Error("Manifest checkout differs from the verified release commit");

const digestDir = process.argv[2];
const architectures = ["amd64", "arm64"];
const digestPattern = /^sha256:[a-f0-9]{64}$/;
// Read only this run's explicitly named artifacts, never registry tags or cache.
const digests = architectures.map((arch) => {
  const digest = fs
    .readFileSync(path.join(digestDir, `${arch}.txt`), "utf8")
    .trim();
  if (!digestPattern.test(digest))
    throw new Error(`Invalid ${arch} image digest`);
  return digest;
});

function inspect(reference) {
  return JSON.parse(
    execFileSync(
      "docker",
      [
        "buildx",
        "imagetools",
        "inspect",
        reference,
        "--format",
        "{{json .Manifest}}",
      ],
      { encoding: "utf8" },
    ),
  );
}

function platforms(manifest) {
  return manifest.manifests
    .filter(
      (entry) =>
        entry.annotations?.["vnd.docker.reference.type"] !==
        "attestation-manifest",
    )
    .map((entry) => `${entry.platform.os}/${entry.platform.architecture}`)
    .sort();
}

const sources = digests.map((digest) => `${image}@${digest}`);
const children = new Set();
sources.forEach((source, index) => {
  const manifest = inspect(source);
  if (
    manifest.digest !== digests[index] ||
    JSON.stringify(platforms(manifest)) !==
      JSON.stringify([`linux/${architectures[index]}`])
  )
    throw new Error(`Unexpected native image for ${architectures[index]}`);
  for (const entry of manifest.manifests) children.add(entry.digest);
});

const tags = [`${image}:${version}`];
if (!version.includes("-")) tags.push(`${image}:latest`);
execFileSync(
  "docker",
  [
    "buildx",
    "imagetools",
    "create",
    ...tags.flatMap((tag) => ["--tag", tag]),
    ...sources,
  ],
  { stdio: "inherit" },
);

const combined = inspect(tags[0]);
if (
  !digestPattern.test(combined.digest) ||
  JSON.stringify(platforms(combined)) !==
    JSON.stringify(["linux/amd64", "linux/arm64"]) ||
  combined.manifests.length !== children.size ||
  combined.manifests.some((entry) => !children.has(entry.digest))
)
  throw new Error("Published manifest differs from the native build results");

fs.appendFileSync(process.env.GITHUB_OUTPUT, `digest=${combined.digest}\n`);
console.log(`Published ${tags.join(", ")} at ${combined.digest}`);
