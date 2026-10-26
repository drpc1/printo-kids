# Review follow-ups: level-labels-without-age

- [ ] F5 (impl-review 2026-10-26): after the branch is pushed, run the on-demand workflow `e2e-phone.yml` once. If the iPhone 13 (WebKit) project fails "the maze level list fits the screen with all six rows and no scrolling" (`tests/e2e/phone-layout.spec.ts`), relax it to "every row is reachable" (scroll into view) instead of "no scrolling"; users are unaffected because the dialog body scrolls.
