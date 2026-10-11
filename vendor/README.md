# Controlled dependency snapshots

- `automation/`: OpenHands Automation 1.19.3 source snapshot, adapted for local Praxis deployment. Original sdist SHA-256: `9cea5b3b67d417458348d6eee9652ad2cffab780791307b5223e227dfef2c19c`.
- `praxis-typescript-client-1.54.0.tgz`: built from the Praxis SDK migration source. Technical npm package name retained for compatibility.
- `praxis-extensions-0.29.0.tgz`: controlled snapshot of extensions 0.29.0, with ownership metadata updated. Original licenses and notices are preserved.

These archives are installed locally rather than resolved from OpenHands package releases. Rebuild the client when changing the SDK and update the lockfile. See `docs/SDK_INDEPENDENCE.md`.

Client build source: `Praxiss-Lab/praxis-sdk@a8903a40374bea313c44f0256db69bbe5f7b7058`.

Archive SHA-256 checksums:

- `praxis-typescript-client-1.54.0.tgz`: `179597569747dc8f9fb1df9c17d20aa8773be419686d0628eb25dccf8e8d4b0a`
- `openhands-typescript-client-1.54.0.tgz`: `ddab9352aee724a5db33dfa38648e070945d142d3ed9be968fae8bf784e68258`
- `praxis-extensions-0.29.0.tgz`: `0e7cdcebb2a9450041c1fb35d8a2103d02ffecca515707815c4fc82fe8ae228e`
