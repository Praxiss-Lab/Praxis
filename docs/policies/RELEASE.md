# Praxis Release Policy

Status: active

Praxis continues the Agent Canvas version line, starting at `1.25.0`.
Release publication remains independent from OpenHands.

## Repository migration restoration

The one-time `Praxis Migration Restore` workflow preserves the original 1.25.0
release assets without rebuilding. It is restricted to replacement repository
ID `1413862562`, its preserved release snapshot and recorded asset SHA-256
digests. Run it manually on `main` with `RESTORE`, while the original repository
still exists. It refuses conflicting tags/assets and verifies uploads before
publishing; a partial matching draft can resume. This is a restoration of an
existing release, not verification or publication of a new application build.
Do not use the normal release workflow for this operation, because that would
rebuild and publish images. See [repository cutover](../REPOSITORY_CUTOVER.md)
for GHCR permissions and the deletion/rename order.

## Source of version truth

The Praxis product version is stored in:

`PRAXIS_VERSION`

Keep the native package version in `package.json` / `package-lock.json` and
`versions.agentCanvas` in `config/defaults.json` aligned with `PRAXIS_VERSION`.
Agent Server and Automation retain their own dependency versions.

## Release tag

A Praxis release uses:

`v<PRAXIS_VERSION>`

Examples:

- `v1.25.0`
- `v1.25.1`
- `v1.26.0-alpha.1`

## Release authority

A release is never created automatically merely because OpenHands publishes a
new version or because an upstream integration lands.

The release workflow is explicitly dispatched by a maintainer and requires the
requested version to match `PRAXIS_VERSION`.

## Pre-release behavior

Any version containing a hyphen is treated as a pre-release.

Stable releases are versions without pre-release metadata.

## Verification before release

The release workflow must run the repository static checks and core
application verification before creating a tag/release.

After verification, the release workflow calls the reusable Docker workflow
directly for the same exact commit. Image publication completes before GitHub
Release creation; no tag-event cascade is required. The registry target is:

`ghcr.io/praxiss-lab/praxis`

The image belongs to `Praxiss-Lab`, matching the repository owner. Both native
build jobs and the manifest job authenticate with the repository `GITHUB_TOKEN`
and `packages: write`; no personal publishing token is required. The previous
`ghcr.io/emilio-01-t/praxis` package is a legacy distribution and is not updated
by this workflow. Existing installations must explicitly switch image addresses.
Keep the old package until the organization image has been published and tested.
The historical `vm-verify-runtime.sh` baseline remains pinned to the original
image and digest; it is not the verification procedure for new releases.

## Upstream relationship

The release notes and upstream sync log should identify material OpenHands
changes adopted since the previous Praxis release.

The first Praxis release retains the source baseline version `1.25.0`. Future
Praxis versions follow semantic versioning; an upstream release does not
automatically publish or advance Praxis.

## Published artifacts

Each release builds amd64 and arm64 in parallel on native runners, using
separate BuildKit cache scopes. Architecture results are pushed by digest without
architecture tags; a dependent job combines their exact digests into one
multi-architecture image tagged with the Praxis version. Stable releases additionally update `latest`. No PR, branch, SHA
or architecture-suffixed package tags are published. `main` pushes only validate.
The image supports complete, backend-only and frontend-only launch modes.

The release attaches the native npm archive and `image.txt` containing the source
commit and image digest. The inherited package identity is retained inside the
archive; there is no publication to the upstream npm namespace.

Publication is sequential, not transactional: if GitHub Release creation fails
after GHCR publication, inspect the existing image before retrying. Do not move
a released version tag to a different commit. See
[distribution](../distribution/README.md) for commands and workflow responsibilities.

## Desktop builds

Desktop workflows remain available for Linux (AppImage and deb), Windows (NSIS
installer), and macOS (native PR builds and a universal DMG for manual/release
builds). PR builds are filtered to desktop-related paths. Build availability does
not establish that an installer has been tested on its target platform.

Praxis Release creates the GitHub release using `GITHUB_TOKEN`. GitHub does not
cascade the resulting release event into other workflows; see
[GitHub's workflow-trigger rules](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow).
Desktop files therefore are not part of the automatic Praxis Release pipeline.
A maintainer can dispatch the required desktop workflow on the published
`v<version>` tag. Manual runs produce Actions artifacts; after platform testing,
approved files can be attached separately to the existing release. The retained
`release: published` handlers apply when a release is published through an
identity that can trigger another workflow, such as a maintainer publishing it
through GitHub. No additional publishing credential is configured by this policy.

The desktop application's inherited technical names and packaging paths are
retained until a separate branding migration. They do not change the Docker
image's Praxis registry namespace or its complete/backend/frontend launch modes.

## Release installation notes

The release description starts with `.github/release-installation.md`, rendered
by `scripts/praxis/release-notes.mjs` from the verified release commit. The version,
repository and actual attached archive filename are substituted at publication;
GitHub's generated changelog follows the installation instructions. Keep Docker,
native, split-mode, persistence and troubleshooting commands aligned with the
distribution guide. Instructions and artifacts use the same release version.

For an existing release, update its description without deleting its tag or
rebuilding its images. Render the installation section locally, prepend it to
the existing changelog, and edit the GitHub release description. This maintenance
operation needs release-description authorization and does not dispatch publication.
The package must be public for the documented anonymous Docker pull to work;
visibility is an organization/package setting, not inherited from a public repo.
