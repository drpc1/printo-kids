# Archive SHA repoint

- **Date**: 2026-10-27
- **Target**: origin/main @ `6ce9f2d7529a1695508fbec979eae56d6f8ab548`
- **PR**: https://github.com/drpc1/printo-kids/pull/156
- **Decision**: Update and archive
- **Rows**: 11

The Progress suffixes were the commits on local `main` before the change was cherry-picked onto `origin/main`. Those old commits are not ancestors of `origin/main`. The pull request merged the cherry-picks. Each phase's rows now point at that phase's commit on the merged branch.

| Row | Old suffix | New SHA |
| --- | --- | --- |
| 1.1 | c470cd9 (`c470cd94bf7f1e5f5e120f0146e691370d86ad40`) | `8fd3d2b04f594002b7ac1a46b957ab95e0dc2a80` feat(english-card-urls): Angielskie adresy kanoniczne (p1) |
| 1.2 | c470cd9 (`c470cd94bf7f1e5f5e120f0146e691370d86ad40`) | `8fd3d2b04f594002b7ac1a46b957ab95e0dc2a80` |
| 1.3 | c470cd9 (`c470cd94bf7f1e5f5e120f0146e691370d86ad40`) | `8fd3d2b04f594002b7ac1a46b957ab95e0dc2a80` |
| 1.4 | c470cd9 (`c470cd94bf7f1e5f5e120f0146e691370d86ad40`) | `8fd3d2b04f594002b7ac1a46b957ab95e0dc2a80` |
| 2.1 | e221215 (`e2212151fc77773debd9920afd9c2f3252a879bd`) | `3dcd226264a6aa8c49d2076c97460c2d59f1e795` feat(english-card-urls): Stare adresy przekierowują (p2) |
| 2.2 | e221215 (`e2212151fc77773debd9920afd9c2f3252a879bd`) | `3dcd226264a6aa8c49d2076c97460c2d59f1e795` |
| 2.3 | e221215 (`e2212151fc77773debd9920afd9c2f3252a879bd`) | `3dcd226264a6aa8c49d2076c97460c2d59f1e795` |
| 2.4 | e221215 (`e2212151fc77773debd9920afd9c2f3252a879bd`) | `3dcd226264a6aa8c49d2076c97460c2d59f1e795` |
| 3.1 | 8cabe69 (`8cabe69161bc3add24f89276d5fb61ea26f81378`) | `14afdf057ec257ca33c14aeaa8e5c4ac1d8f2e4d` docs(english-card-urls): Żywe dokumenty (p3) |
| 3.2 | 8cabe69 (`8cabe69161bc3add24f89276d5fb61ea26f81378`) | `14afdf057ec257ca33c14aeaa8e5c4ac1d8f2e4d` |
| 3.3 | 8cabe69 (`8cabe69161bc3add24f89276d5fb61ea26f81378`) | `14afdf057ec257ca33c14aeaa8e5c4ac1d8f2e4d` |

Phase 1's cherry-pick left `tests/e2e/profile-level.spec.ts` deleted, because `origin/main` had already removed that file. The page renames, catalog hrefs, smoke paths, and the other e2e path updates are in `8fd3d2b`.
