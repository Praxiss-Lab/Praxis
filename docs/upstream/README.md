# Upstream review and selective integration

Praxis receives upstream changes through an explicit integration branch and pull
request. There is no scheduled import, automatic merge into `main`, or release
triggered by an upstream update. `origin` is Praxis; `upstream` is the repository
recorded in [BASELINE.md](BASELINE.md).

## Prepare a review

Use a full-history clone with a clean working tree. For a shallow clone, first run
`git fetch --unshallow origin`. From the repository root:

```bash
bash scripts/praxis/prepare-upstream-integration.sh 2026-10-07
```

Choose a different date or suffix for each review. The script validates the
upstream remote, fetches upstream and Praxis `main`, creates
`integration/upstream-2026-10-07` from `origin/main`, and writes
`docs/upstream/reviews/2026-10-07.md`. It does not modify local `main` or import
upstream code. The review records the exact upstream target SHA; keep using that
SHA even if upstream advances during review. The generated review is untracked
until you add and commit it.

To download changes or inspect a report without creating a branch:

```bash
bash scripts/praxis/upstream-fetch.sh
bash scripts/praxis/upstream-report.sh
```

`git fetch` downloads history without integrating it. Do not use
`git pull upstream main` on Praxis `main` or GitHub's fork-sync operation as a
replacement for this review process.

## Select and integrate on the review branch

Inspect commits and changed files in the snapshot. For every commit or coherent
group, record ACCEPT, PARTIAL, REJECT, or DEFER. Review runtime contracts,
dependency pins, persistence, security, workflow permissions and Praxis-specific
behavior. A conflict-free merge does not establish compatibility.

For a full trial integration, merge the frozen target on the integration branch
with `git merge --no-commit --no-ff <target-sha>`, resolve conflicts, inspect the
result, then commit. To select commits, use `git cherry-pick <commit-sha>` in
source order. For part of a commit, use `git cherry-pick --no-commit <commit-sha>`,
retain only the intended changes and commit after review. These operations apply
only to the integration branch. Use `git merge --abort` or `git cherry-pick
--abort` when abandoning an operation in progress.

Do not merge the entire upstream target after selecting only some commits: that
would also bring in the changes you excluded. Never merge upstream CI, publishing
credentials, package destinations, or branding without reviewing the resulting
Praxis configuration. Record the source SHA and resulting Praxis commit for
selective changes.

## Publish the branch and run checks

Commit the intended changes and review record, then push the integration branch:

```bash
git push -u origin integration/upstream-2026-10-07
```

Open a draft PR from that branch to Praxis `main`. A branch push alone does not
start the main PR checks. Opening a draft PR does start applicable PR workflows,
unless GitHub cannot merge the PR or the workflow's path filters exclude it.
Do not use `[skip ci]` on integration commits that need automatic verification.

| Workflow | Before integration into main |
| --- | --- |
| Praxis CI | Automatic on PRs to `main`, except documentation-only changes. |
| Praxis Smoke | Automatic on PRs to `main`, except documentation-only changes. |
| Docker Check | Automatic when matching runtime, Docker or configuration paths change. |
| SDK Version Sync | Automatic when its version-related paths change. |
| Desktop builds | Automatic only when desktop paths match. |
| Upstream Compatibility CI | Manual: Actions → workflow → Run workflow → select the integration branch. Repeats core build checks; use when an explicit upstream compatibility run is needed. |
| Mock-LLM E2E Tests | Manual on the integration branch before merge when relevant; also automatic on eligible pushes to `main`. |
| Mock-LLM Docker E2E Tests | Manual against an explicitly selected published image. It does not verify unpublished branch code. |

Existing automatic CI runs on the PR; no additional duplicate CI pipeline is
needed. Check the run's branch, commit SHA and outcome. Manual runtime tests on a
laptop or VM must be recorded separately and must not be claimed from static or
mock checks. A green check does not decide which upstream changes Praxis should
adopt.

## Complete the review

The maintainer decides whether to merge all selected changes, narrow the PR, or
reject it. No workflow in this process enables auto-merge. Repository branch
protection and required approvals are separate GitHub settings; these scripts do
not configure them.

When a whole upstream interval has been examined and every change has an explicit
decision, update [LAST_REVIEWED](LAST_REVIEWED) to the frozen target SHA and add an
entry to [SYNC_LOG.md](SYNC_LOG.md) in the same reviewed PR. This checkpoint means
**reviewed**, not **fully merged**. If only part of the interval has been examined,
keep the checkpoint unchanged. Track DEFER decisions by source SHA and revisit
them explicitly: advancing the checkpoint excludes them from the next interval.
After a rejected PR, the review record and decisions may be preserved in a
separate documentation PR; never advance the checkpoint simply because a fetch
or branch preparation succeeded.

Example sync-log entry:

```text
Date / upstream range / review PR / integration commit
Decisions: ACCEPT ...; PARTIAL ...; REJECT ...; DEFER ...
Automatic verification: workflow names, tested SHAs and outcomes
Manual verification: exercised behavior and observed results
Maintainer decision: approved selection or rejected integration
```

The initial checkpoint remains the original fork baseline until the first review
is completed. Preparing this mechanism does not import a newer upstream version.
