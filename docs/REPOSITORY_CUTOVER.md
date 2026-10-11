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

## Release restoration completed

Release `v1.25.0` is published on the replacement repository. Both uploaded assets
have the same sizes and SHA-256 digests as the source:

| Asset | Bytes | SHA-256 |
| --- | ---: | --- |
| `image.txt` | 184 | `b669133c8c072e7954414c3158e5690952c15a302f9c1c1d9c2d1826678f706e` |
| `openhands-agent-canvas-1.25.0.tgz` | 18106048 | `29884ed98adeee408edcfbeb3b62905092368b3133274ce6a8449e9668c3aa61` |

The source release description was copied with destination/archive links adjusted.
No image was rebuilt or pushed. The temporary migration workflow, manifest,
restoration script and dedicated tests are removed after verification. Keep the
normal release workflow and its release-notes renderer/template. Historical tool
versions remain recoverable from Git; deleted workflows can retain Actions run
history without remaining active on main.

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

The current connector does not expose repository administration or branch deletion. A maintainer performs the
remaining administrative operations after verifying package access and settings. Existing application test failures remain
separate from migration content checks; restoration is not a new build or runtime
verification.
