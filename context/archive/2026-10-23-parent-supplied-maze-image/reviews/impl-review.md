<!-- IMPL-REVIEW-REPORT -->
# Implementation Review: Własny plik rodzica jako postać labiryntu

- **Plan**: context/changes/parent-supplied-maze-image/plan.md
- **Scope**: Full plan
- **Reviewed phases**: 1, 2, 3
- **Date**: 2026-10-24
- **Verdict**: NEEDS ATTENTION
- **Findings**: 0 critical, 1 warning, 0 observations

## Verdicts

| Dimension | Verdict |
|-----------|---------|
| Plan Adherence | PASS |
| Scope Discipline | PASS |
| Safety & Quality | WARNING |
| Architecture | PASS |
| Pattern Consistency | PASS |
| Success Criteria | PASS |

## Findings

### F1 — WebP and HEIC skip the decode resize cap

- **Severity**: ⚠️ WARNING
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Safety & Quality
- **Location**: src/lib/sheet/own-image.ts:82
- **Detail**: JPEG and PNG whose pixel size is parsed pass `resizeWidth` and `resizeHeight` into `createImageBitmap` when the long edge is over 512 (`resizeForDecode`, lines 82–94, call site 50–54). The size check still returns `size` before any read (lines 26–28). A failed header read returns `{ reason: "decode" }` (lines 31–34). `resizeForDecode` returns `undefined` when neither `jpegGallerySize` nor `pngSize` returns a size (lines 84–87). That is every WebP and every HEIC, which `canDecode` accepts (lines 43–44). Those files are still under the 8 MiB cap and are decoded at full pixel size on the page thread. The canvas scale to 512 px runs only after that bitmap exists. The Node test double does not read the resize options, so dropping them stays green. A phone HEIC, which phase 2 accepts when the browser can open it, is the common case.
- **Fix A ⭐ Recommended**: Read the display size of WebP and HEIC the same way as JPEG and PNG, and pass `resizeWidth` / `resizeHeight` when the long edge is over 512. If the pixel size still cannot be read, return `{ reason: "decode" }` instead of calling `createImageBitmap` at native size.
  - Strength: Closes the gap the phase-1 review already fixed for measured JPEG and PNG, on the formats a phone actually picks.
  - Tradeoff: WebP and HEIC dimension parsing is extra code, and a file whose size cannot be read is refused even if the browser could decode it.
  - Confidence: MED — the JPEG/PNG path already shows the resize options work; WebP and HEIC parsers are not in the file today.
  - Blind spot: Not measured on a real 12 MP HEIC in Safari.
- **Fix B**: Leave the decode-then-scale order for WebP and HEIC. The plan's performance note accepts one under-cap decode on the page thread.
  - Strength: Matches the written plan. JPEG and PNG over 512 px already resize at decode.
  - Tradeoff: A WebP or HEIC under 8 MiB can still allocate a full-size bitmap on the page thread.
  - Confidence: HIGH — that is what `resizeForDecode` returns today.
  - Blind spot: No measurement of a camera HEIC on the page thread.
- **Decision**: FIXED via Fix A
