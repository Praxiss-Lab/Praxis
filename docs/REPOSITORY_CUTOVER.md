# Repository cutover

The replacement repository has stable GitHub ID `1413862562`. Its temporary
name is `Praxiss-Lab/Praxis-2`; its final name is `Praxiss-Lab/Praxis`. The original
repository has ID `1407000350`. Names are insufficient to identify these two
repositories once the original is deleted and the replacement is renamed.

## Prepared automatically

- `main` preserves original tree `5f33e0690f71c2b4f88348bd1c3bc5971940abee` at
  replacement commit `1b42070bed450ae13e98bcee48b90c1c6ef8be38`.
- All four original additional branch snapshots were copied with identical trees.
- The SDK migration is preserved as a draft PR on `chore/praxis-sdk-independence`.
  Its seven PR workflows passed at `8fdddfefde1faf1c47f8099a27c2bb66607d80b6`.
  This does not authorize merging or publishing the SDK changes.
- The release snapshot lives on `migration/release-v1.25.0` at
  `d637a5accd855588260207922fa25c0490350504`, preserving tree
  `16f93ab2e8bebe409add8fc3ed654accedd8dcc6` without original commit ancestry.
- `migration/history-archive` preserves original PR records, comments/reviews,
  release metadata and repository metadata separately from the application.

The final repository URLs and Docker image name already use `Praxis`; do not
replace them with the temporary name. The migration restoration renders its
release download links using the current repository name. After the rename,
GitHub redirects the temporary `Praxis-2` URLs to `Praxis`; keep that temporary
name unused so these new links continue to resolve.

## Maintainer steps, in order

1. Review and merge the repository-cutover PR after its checks pass. No application
   dependencies or SDK changes are included in that PR.
2. While the original repository still exists, open Actions in the replacement,
   choose **Praxis Migration Restore**, run it on `main` and enter `RESTORE`.
   It verifies both original asset digests, creates the tag on the preserved
   snapshot, uploads a draft, verifies the uploaded digests and publishes it.
   It never builds or pushes a Docker image and never moves an existing tag.
   An identical published release is a no-op; a matching partial draft can resume.
3. Under the organization's `praxis` package settings, connect the package to
   the replacement repository and add that repository under **Manage Actions
   access** with **Write** permission. Preserve the existing visibility and image
   name `ghcr.io/praxiss-lab/praxis`. Package connection and Actions access are
   separate controls.
4. Compare General, Actions policies, team access, rules/protection, custom
   secrets/variables, environments, webhooks and Pages with the original. Copy
   configured entries only; `GITHUB_TOKEN` is automatically supplied by GitHub.
   The copied workflows do not require a custom publishing PAT.
5. Verify the restored release downloads, original image pull and current app
   startup. Preserve any old CI artifacts still needed: native workflow histories
   and historical PR identities are not copied by a repository snapshot.
6. Only after the above, delete the original repository and rename the replacement
   to `Praxis`. Check repository ID `1413862562`, default branch `main`, package
   connection, release links and team access again. Update local Git remotes.

Repository administration, GHCR package access and deletion/rename are not exposed
by the current connector. A repository's automatic workflow token cannot be used
to grant itself those administrative permissions.

## Continue SDK work

Use the replacement repository's SDK migration PR, together with the companion
`Praxiss-Lab/praxis-sdk` PR. Review their exact heads and checks before approving
the merges. Do not merge unrelated Dependabot updates as part of cutover.

The unchanged baseline `main` had six Mock-LLM E2E failures in run `38107237910`.
Core CI, Docker Check, Smoke and SDK Version Sync passed. The copied SDK branch
passed seven PR workflows; those do not include the push-only full Mock-LLM suite.
The E2E failure is an unresolved application/test concern, not evidence that the
snapshot copy lost files. Investigate it before treating application validation
as complete.
