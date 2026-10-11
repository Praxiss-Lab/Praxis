# Repository cutover

The replacement repository is `Praxiss-Lab/praxis-2`, stable GitHub ID
`1414005964`. The current source is `Praxiss-Lab/Praxis`, ID `1413862562`.
Its intended final replacement name is `Praxis`. Identify repositories by ID
when names are reused.

## Preserved content

Git branch and tag refs were copied intact. Active main has independent ancestry;
complete historical ancestry and original PR/release metadata are kept on the
single branch `archive/legacy-history`, with metadata under `.migration`.
The already-copied `v1.25.0` tag points to
`d637a5accd855588260207922fa25c0490350504`, source tree
`16f93ab2e8bebe409add8fc3ed654accedd8dcc6`.
Native PR identities and Actions execution histories are not copied.

## Release restoration

Review and merge the release restoration PR, then run **Praxis Migration Restore**
from `main` with confirmation `RESTORE` while the source repository exists.
The workflow verifies the replacement repository ID and existing tag, downloads
both recorded assets, validates their sizes and SHA-256 digests, copies the source
release description with destination links, uploads a draft, verifies the uploaded
assets, then publishes. No image is rebuilt or pushed. Conflicting tags or assets
are rejected; a matching partial draft can resume and an identical published
release is a no-op.

After publication, verify both asset digests, the release tag and download links.
Then remove `.github/workflows/praxis-migration.yml`,
`scripts/praxis/migration-release.json`,
`scripts/praxis/restore-migration-release.mjs` and its dedicated test file through
a cleanup PR. Update the release guide, policy and workflow inventory in that PR.
Retain the normal release workflow and its release-notes renderer/template.

## Administrative cutover

Connect the existing GHCR `praxis` package to the replacement and grant it
Manage Actions access with Write (Admin is also sufficient). Preserve package
visibility and `ghcr.io/praxiss-lab/praxis` image names/digests. Package connection
and Actions permission are distinct settings.

Compare repository access, branch rules, Actions policies, configured secrets,
variables, environments, webhooks and Pages. These are not copied by Git.
Do not copy historical contributors into active main ancestry.

Only after release/package verification and settings comparison should the source
repository be deleted and the replacement renamed to `Praxis`. Keep the temporary
`praxis-2` name unused so links redirect after rename. Recheck repository ID,
package connection, team access and links; update local Git remotes.

The current connector does not expose workflow dispatch, release writes,
repository administration or branch deletion. A maintainer dispatches the
restoration workflow and performs administrative operations. Do not delete the
source before restoration succeeds. Existing application test failures remain
separate from migration content checks; restoration is not a new build or runtime
verification.
