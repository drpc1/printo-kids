# Frame Brief: Dialog close button on phone

> Framing step before /10x-plan. This document captures what is *actually*
> at issue, separated from what was initially assumed.

## Reported Observation

Na iPhonie, w Chrome i w Brave, krzyżyk zamykający okno profilu ma wyraźnie mniejszy margines z prawej niż z góry. Wygląda, jakby przykleił się do prawej krawędzi.

## Initial Framing (preserved)

- **User's stated cause or approach**: Krzyżyk jest we wspólnym `DialogContent` w `src/components/ui/dialog.tsx`. Na ekranie dotykowym (`pointer-coarse`) dostaje `right-[3px]`, a od góry zostaje `top-2` (8 px). Ten sam komponent otwiera profil, listy poziomów i pozostałe okna dialogowe.
- **User's proposed direction**: Na telefonie prawy margines krzyżyka jest zbliżony do górnego, tak że róg okna wygląda równo. Zamykanie okna, obszar kliknięcia i pasek przewijania w oknie dalej działają.
- **Pre-dispatch narrowing**: Tylko okno profilu. „krzyzyk powinien byc przesuniety w gore tak aby margines prawy i gorny był taki sam.” Pasek przewijania wygląda dobrze. Na komputerze wszystko wygląda dobrze. Widziane na iPhonie w Chrome i w Brave.

The issue and the narrowing both want the two margins equal. They do not name the same edge: the issue grows the right margin toward the top; the narrowing moves the glyph up. That choice is not settled here.

## Dimension Map

The observation could originate at any of these dimensions:

1. **Hit-box insets** — `top-2` (8 px) versus `pointer-coarse:right-[3px]` (3 px) are the visible margins. ← initial framing
2. **Visible glyph versus the touch-target contract** — the 16 px icon sits inside a shifted 36 px plate, so its top gap and right gap are not the hit box’s insets. A prior plan set those gaps on purpose so the glyph’s right edge meets the drawn track.
3. **Profile dialog markup** — only the profile window shifts this corner.
4. **iOS clipping or safe area** — WebKit eats the right side past the authored inset, which is why Chrome and Brave on iPhone agree and the computer does not.

## Hypothesis Investigation

| Hypothesis | Evidence | Verdict |
| --- | --- | --- |
| Hit-box `top-2` vs `right-[3px]` is the visible gap | `dialog.tsx:88` is the 44 px hit box (top 8 px, coarse right 3 px). The plate at `dialog.tsx:93` (`-top-0.5 -right-2.5`, `size-9`) centers a 16 px icon. Glyph gaps: top 16 px, coarse right 3 px, precise right 12 px. `right-[3px]` matches the glyph’s right edge; `top-2` does not match its top. | WEAK |
| Unequal margins are the shipped touch-target corner | `context/archive/2026-10-18-touch-targets/plan.md` Desired End State and Phase 2 contract: glyph y 16–32 on both pointers; coarse right edge 3 px, meeting the track at 3–9 px; precise right edge 12 px. Comment at `dialog.tsx:83-87` and track `left` at `useScrollIndicator.ts:35` still implement it. `tests/e2e/phone-layout.spec.ts:464-467` locks the hit area’s right edge to the track. Desktop 12 px vs 16 px does not read as stuck; coarse 3 px vs 16 px does. Scrollbar left in place matches “pasek wygląda dobrze”. | STRONG |
| Only the profile dialog produces the corner | `ProfileCorner.tsx:338-339` adds `max-h-[calc(100dvh-2rem)]` only. Level, character, sudoku, and worksheet dialogs use the same close button and the same max-height. | NONE |
| iOS clipping or safe area past the authored inset | No `env(safe-area-*)` under `src/`. Viewport is `width=device-width, initial-scale=1` (`Layout.astro`). `overflow-hidden` clips the transparent plate (~7 px past the padding edge), not the glyph at 3 px. The track ends on that same 3 px line, so a clip that ate the glyph would eat the track the reporter says looks fine. | NONE |

## Narrowing Signals

Step 3 found strong evidence for the shipped corner and none for a profile-only corner or for iOS clipping. The hit-box comparison is weak and does not compete, because `top-2` is not the visible top. Questioning after that was skipped.

- Profile window only, iPhone, Chrome and Brave. Markup for the corner is shared, so the look is not a profile-only rule.
- Scrollbar looks good and the computer looks good. Both match the contract: the track was the ruler, and a precise pointer keeps a 12 px right gap against a 16 px top.
- A blind pass, given only the observation, landed on the same mechanism: glyph 16 px from the top and 3 px from the right so its right edge meets the drawn track (`dialog.tsx:88`, `dialog.tsx:93`).

## Cross-System Convention

This corner was specified on purpose in `context/archive/2026-10-18-touch-targets/plan.md` (Implementation Approach and Critical Implementation Details). On a coarse pointer the glyph moves right until its right edge meets the track; its top stays at y 16–32. The leading hypothesis is that convention, still in the tree. The new report is that this convention reads as stuck to the right edge on an iPhone.

## Reframed (or Confirmed) Problem Statement

> **The actual problem to plan around is**: on a coarse pointer the visible close glyph is 16 px from the top padding edge and 3 px from the right, by the approved touch-target contract, and on an iPhone that reads as stuck to the right edge.

Issue #165 compares the hit box (`top-2` = 8 px, `right-[3px]` = 3 px). The 3 px figure is the glyph’s right edge. The 8 px figure is not its top. The profile dialog is where this was seen; every dialog shares the control. The initial framing was not correct as an account of the visible gap.

## Confidence

**HIGH** — the class math, the archived contract, the track comment, the phone test, and a blind re-read agree. The reporter’s scrollbar and desktop notes match what that contract predicts. No fresh iPhone measurement was taken in this pass; the report itself is that measurement.

## What Changes for /10x-plan

Plan the phone look of this shared corner, as seen on the profile dialog. The 16 px top and the 3 px right edge are one contract with the drawn track and with the desktop glyph on the native scrollbar (`phone-layout.spec.ts`, `dialog-close.spec.ts`). Do not plan a profile-only close button, and do not treat `top-2` as the visible top margin. Which edge moves so the two gaps match is still open.

## References

- Source files: `src/components/ui/dialog.tsx:52-99`, `src/hooks/useScrollIndicator.ts:33-35`, `src/components/ProfileCorner.tsx:338-339`, `tests/e2e/phone-layout.spec.ts:464-467`
- Related research: none
- Prior contract: `context/archive/2026-10-18-touch-targets/plan.md` (Desired End State, Implementation Approach, Phase 2)
- Investigation tasks: [hit-box insets](28b3fe99-ba5a-4edd-8b2f-bbddebb66c78), [touch-target contract](2da2ec9d-8b25-473c-8207-fef3daecdf4b), [profile markup](e5e0b6c8-4a55-43c8-bbf4-e8bb18f9d64c), [iOS clipping](550befc7-732e-4554-a0b4-28be9621ad15), [blind re-read](ad6629cf-526a-4a0e-9c19-96779c981acf)
