<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: Własny plik rodzica jako postać labiryntu

- **Plan**: context/changes/parent-supplied-maze-image/plan.md
- **Scope**: Phase 1 of 3
- **Reviewed phases**: 1
- **Date**: 2026-10-23
- **Verdict**: NEEDS ATTENTION
- **Findings**: 0 critical, 2 warnings, 1 observation

## Verdicts

| Dimension           | Verdict |
| ------------------- | ------- |
| Plan Adherence      | PASS    |
| Scope Discipline    | PASS    |
| Safety & Quality    | WARNING |
| Architecture        | PASS    |
| Pattern Consistency | PASS    |
| Success Criteria    | PASS    |

## Findings

### F1 — Full bitmap before the 512 px scale

- **Severity**: ⚠️ WARNING
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Safety & Quality
- **Location**: src/lib/sheet/own-image.ts:45
- **Detail**: Files over 8 × 1024 × 1024 bytes return `size` before decode. A file at or under that cap is passed whole to `createImageBitmap`. The 512 px scale runs only after that bitmap exists. A crafted JPEG or PNG under 8 MiB can still expand to a very large RGBA buffer on the page thread. The plan's performance note accepts one under-cap decode on that thread and does not set a pixel cap.
- **Fix A ⭐ Recommended**: Pass `resizeWidth` and `resizeHeight` from the same scale formula into `createImageBitmap`, and keep `scaleToMaxEdge` as the size the function returns.
  - Strength: Browsers that honor those options decode closer to 512 px. Returned width, height, and the alpha choice stay on the production path the tests already lock.
  - Tradeoff: The Node polyfill ignores resize options, so this session's tests will not go red if the resize math is wrong and `scaleToMaxEdge` is still applied afterwards.
  - Confidence: MED — `ImageBitmapOptions` includes `resizeWidth` / `resizeHeight`, and this file already passes `imageOrientation`.
  - Blind spot: Not checked whether Safari applies gallery orientation and resize together.
- **Fix B**: Leave the decode-then-scale order. The 8 MiB cap remains the only guard.
  - Strength: Matches the phase contract and the plan's performance note without an untested browser option.
  - Tradeoff: A hostile file under 8 MiB can still allocate a huge bitmap.
  - Confidence: HIGH — that is what the code and the plan say today.
  - Blind spot: No measurement of a real phone photo (about 12 MP) on the page thread.
- **Decision**: FIXED via Fix A

### F2 — Header read can reject the promise

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Safety & Quality
- **Location**: src/lib/sheet/own-image.ts:30
- **Detail**: The size check and the header `arrayBuffer()` sit outside `encodeCopy`'s `try`. A failed header read rejects `copyOwnImage`. Decode failures inside `encodeCopy` return `{ reason: "decode" }`. The contract for this function is a copy or a refusal, not a rejection. `ImageBitmap.close()` in `finally` is fine.
- **Fix**: Wrap the header read in the same failure path and return `{ reason: "decode" }`.
- **Decision**: FIXED

### F3 — Scale and alpha edges the listed fixtures do not lock

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Adherence
- **Location**: src/lib/sheet/own-image.test.ts:15
- **Detail**: The phase fixtures lock 1024×512 → 512×256, 200×100 unchanged, one alpha-128 PNG pixel, GIF as `type`, the 8 MiB threshold, and EXIF orientation 6. They stay green if short-side `Math.round` or the 1 px floor is dropped, if a portrait image over 512 px is not scaled, or if the alpha cutoff moves from 255 to 129. The plan's testing strategy assigns Stryker on the threshold and scale boundaries to a review of this change, not to the phase gate.
- **Fix**: No code change in this review. Kill those mutants in the Stryker pass the plan already names.
- **Decision**: SKIPPED
