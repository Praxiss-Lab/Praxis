# Praxis repository migration archive

This branch preserves source GitHub metadata separately from the byte-identical application snapshots.

`source-metadata.json` contains the source repository configuration returned by GitHub, all 16 original pull request records, their retrieved comments/reviews, release metadata and asset URLs, and the old-to-new snapshot mapping. Author identities and timestamps inside these records are historical data, not imported Git commits.

The open SDK pull request was recreated as a draft in Praxis-2. Closed pull requests and past CI runs were not recreated as native GitHub objects. Release assets, the release/tag, repository administration settings, secret/variable configuration, and GHCR linkage still require migration/verification before deleting Praxis. Secrets are not included in this archive.

All four additional source branches have identical Git trees in Praxis-2. The v1.25.0 source tree is preserved on migration/release-v1.25.0; it is not yet a release or tag.

Do not delete the source repository until outstanding items are verified. The original commit history has deliberately not been copied into the new repository.
