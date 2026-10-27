# Archive SHA repoint

- **Date**: 2026-10-26
- **Target**: origin/main @ `4517fefa08329c8f32cd00871801472e158077f2`
- **Integration**: pull request https://github.com/drpc1/printo-kids/pull/134, merged
- **Decision**: Update and archive (2026-10-26)
- **Rows repointed**: 7

The Progress suffixes were the pre-rebase commits. Rebase rewrote them before the pull request. `git range-diff` shows phase 1 as the same patch. Phase 2 is the same sequence-card edit; the only hunk difference is open question 12, which `main` had already closed. Both new commits are ancestors of `origin/main`.

| Row | Old suffix | Resolved old OID | New SHA |
|-----|------------|------------------|---------|
| 1.1 | e0c5d4f | e0c5d4fa17d7ebd6310b80fd05cfdbd5d37c845c | 7546fdf |
| 1.2 | e0c5d4f | e0c5d4fa17d7ebd6310b80fd05cfdbd5d37c845c | 7546fdf |
| 1.3 | e0c5d4f | e0c5d4fa17d7ebd6310b80fd05cfdbd5d37c845c | 7546fdf |
| 1.4 | e0c5d4f | e0c5d4fa17d7ebd6310b80fd05cfdbd5d37c845c | 7546fdf |
| 1.5 | e0c5d4f | e0c5d4fa17d7ebd6310b80fd05cfdbd5d37c845c | 7546fdf |
| 2.1 | 56ede97 | 56ede97dc7c4c7842f81e9b3525c931e9e8eceb9 | 989193b |
| 2.2 | 56ede97 | 56ede97dc7c4c7842f81e9b3525c931e9e8eceb9 | 989193b |

New commit titles:

- `7546fdf` feat(sequence-age6-shapes-only): Pula reguł Poziomu 3 (p1)
- `989193b` docs(sequence-age6-shapes-only): Kontrakt w PRD (p2)
