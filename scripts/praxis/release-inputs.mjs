import fs from "node:fs";
import { execFileSync } from "node:child_process";

const version = fs.readFileSync("PRAXIS_VERSION", "utf8").trim();
const requested = process.env.RELEASE_VERSION;
if (
  requested !== version ||
  !/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z]+(?:[.-][0-9A-Za-z]+)*)?$/.test(
    version,
  )
) {
  throw new Error(
    "Requested version must match the supported semantic version in PRAXIS_VERSION",
  );
}
if (process.env.GITHUB_REF !== "refs/heads/main") {
  throw new Error("Release must be dispatched from main");
}
const sha = execFileSync("git", ["rev-parse", "HEAD"], {
  encoding: "utf8",
}).trim();
if (sha !== process.env.GITHUB_SHA)
  throw new Error("Checkout differs from the dispatched commit");
fs.appendFileSync(
  process.env.GITHUB_OUTPUT,
  `version=${version}\nsha=${sha}\n`,
);
fs.appendFileSync(
  process.env.GITHUB_ENV,
  `PRAXIS_RELEASE_VERSION=${version}\n`,
);
