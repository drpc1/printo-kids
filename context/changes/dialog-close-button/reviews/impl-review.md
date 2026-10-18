<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: Przycisk X zamyka dialog po polsku

- **Plan**: context/changes/dialog-close-button/plan.md
- **Scope**: Full plan
- **Reviewed phases**: 1, 2
- **Date**: 2026-10-18
- **Verdict**: NEEDS ATTENTION
- **Findings**: 0 critical, 3 warnings, 3 observations

## Verdicts

| Dimension           | Verdict |
| ------------------- | ------- |
| Plan Adherence      | PASS    |
| Scope Discipline    | PASS    |
| Safety & Quality    | WARNING |
| Architecture        | PASS    |
| Pattern Consistency | WARNING |
| Success Criteria    | WARNING |

HEAD `a4042c8` (`origin/main`); code from b420ab3, 4093934 (PR #34), later adjusted by 92202fa (`dialog-close-above-scrollbar`, `pt-14 pr-4`) and 7831563 (`phone-worksheet`, `dialog-body` scrollbar). Gates: `npm run lint` 0, `npx astro check` 0 errors, `npm test` 113/113. Plan drift: every planned change MATCH (sr-only „Zamknij”, footer „Zamknij”, no `showCloseButton={false}` left, X without own `onClick`, delete guard routes to `cancelDelete`, X outside the create form, `overflow-y-auto` moved off the element that positions the X, `print:hidden`, no English „Close” in `src/`).

Manual criteria were exercised by a throwaway Playwright script against `npm run preview` (Chromium, 1280×780 and 360×780 with touch, 2026-10-18), all green: 1.4 X named „Zamknij”, keeps the bar's character; 1.5 menu closes; 1.6 X drops a changed draft (stored character unchanged), „Anuluj” returns to the list; 1.7 typed name + X creates no profile (2 profiles exist); 1.8 X on the character list from edit and from the form closes the whole dialog; 1.9 X on „Usunąć profil Ala?” returns to the list, profile kept, dialog open; 1.10 Escape on delete returns to the list, Escape and outside click on the menu close; 2.3 X ends at y 308, first pencil/trash start at y 332; 2.4 X ends at y 49, first character row starts at y 73; 2.5 after scrolling the character list (scrollTop 82/126) and a 14-profile list (scrollTop 106) the X has not moved; 2.6 the same at 360 px. Not covered: a human look at the corner and WebKit/Firefox.

## Findings

### F1 — Ręczne kryteria 1.4–1.10 i 2.3–2.6 nie są odhaczone w Progress

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Success Criteria
- **Location**: context/changes/dialog-close-button/plan.md (Progress, Phase 1 i 2 Manual)
- **Detail**: Wszystkie 11 ręcznych pozycji jest `[ ]`, choć kod jest na `main` od PR #34. Skrypt z tego przeglądu potwierdził każdą z nich w Chromium (szczegóły wyżej); brak tylko oka człowieka i innych silników.
- **Fix**: Odhaczyć 1.4–1.10 i 2.3–2.6 z SHA `b420ab3` / `4093934` i notą „sprawdzone skryptem Playwright w Chromium, 1280 i 360 px, 2026-10-18”.
- **Decision**: FIXED (1.4–1.10 i 2.3–2.6 odhaczone z notą o skrypcie Playwright)

### F2 — Krzyżyk ma pole dotyku 16×16 px

- **Severity**: ⚠️ WARNING
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Safety & Quality
- **Location**: src/components/ui/dialog.tsx:83
- **Detail**: Cel kliknięcia to sama ikona `size-4` bez odstępu: poniżej 24 px z WCAG 2.5.8 i daleko od 44 px, które S-09 daje Generuj, Drukuj i wierszom. Plan przyjął „co najmniej tyle co ikona `size-4`”, więc to luka planu, nie dryf. Na telefonie X jest jedynym widocznym sposobem zamknięcia listy postaci bez wyboru.
- **Fix A ⭐ Recommended**: Osobna mała zmiana (`/10x-new`) na cele dotykowe: X jako `size-9`/`size-11` w `top-2 right-2` (np. `Button variant="ghost" size="icon"` przez `asChild`), razem z przyciskiem Profil (phone-worksheet F2).
  - Strength: Zmienia geometrię rogu, którą trzymają `pt-14 pr-4` i szyna paska przewijania; osobna zmiana ma własne sprawdzenie rogu na telefonie.
  - Tradeoff: Usterka zostaje na `main` do tej zmiany.
  - Confidence: HIGH — 44 px w `top-2` kończy się na 52 px, pod 56 px `pt-14`.
  - Blind spot: Nie sprawdzono, jak większy X wygląda przy szynie paska po prawej.
- **Fix B**: Poprawić teraz w tej gałęzi archiwizacyjnej.
  - Strength: Jeden PR mniej.
  - Tradeoff: PR „archiwizacja” niesie zmianę UI bez planu i bez sprawdzenia na iPhonie.
  - Confidence: MED — prosta klasa, ale róg ma już dwie wcześniejsze poprawki.
  - Blind spot: iOS Safari.
- **Decision**: DEFERRED (przeniesione do nowej zmiany `context/changes/touch-targets/`, decyzja użytkowniczki 2026-10-18)

### F3 — Brak testu, który pilnuje X na pytaniu o usunięcie

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Success Criteria
- **Location**: tests/e2e/ (brak pliku); plan „What We're NOT Doing”: „Nowy test UI, test Playwright tego krzyżyka”
- **Detail**: Najbardziej ryzykowne zachowanie (X na „Usunąć profil …?” wraca na listę i niczego nie kasuje) nie ma żadnego testu; plan świadomie go odłożył. Skrypt z tego przeglądu już to sprawdza, więc koszt jest mały.
- **Fix**: Dodać `tests/e2e/dialog-close.spec.ts` (tylko projekt `chromium`): X na usuwaniu zostawia profil i wraca na listę; X na liście postaci nie zmienia postaci na pasku.
- **Decision**: FIXED (`tests/e2e/dialog-close.spec.ts`; czerwony przy wyłączonej osłonie usuwania w `handleProfileOpenChange` dzięki asercji `data-state="open"`, bo w trakcie animacji zamykania okno jest jeszcze widoczne)

### F4 — Fokus krzyżyka w stylu `focus:`, inny niż w `button.tsx`

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Pattern Consistency
- **Location**: src/components/ui/dialog.tsx:83
- **Detail**: X ma `focus:ring-2 focus:ring-offset-2` i `opacity-70`, a reszta kontrolek `focus-visible:ring-ring/50 focus-visible:ring-[3px]`; obwódka pojawia się też po dotknięciu. Klasy `data-[state=open]:bg-accent data-[state=open]:text-muted-foreground` nigdy nie pasują (`data-state` jest na treści, nie na przycisku). To wzorzec z shadcn, nie z tej zmiany.
- **Fix**: Przy F2 przejść na wzorzec `focus-visible:` z `button.tsx` i usunąć martwe klasy.
- **Decision**: DEFERRED (przeniesione do nowej zmiany `context/changes/touch-targets/`, decyzja użytkowniczki 2026-10-18)

### F5 — Okno poziomu też dostało krzyżyk

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Scope Discipline
- **Location**: src/components/WorksheetGenerator.tsx:312
- **Detail**: Okno „Wybierz poziom” (S-07, później) dziedziczy `showCloseButton = true`. Spójne z planem (domyślnie włączony), ale plan go nie wymienia.
- **Fix**: Brak działania; zapisane dla porządku.
- **Decision**: ACCEPTED (bez działania, spójne z domyślnym `showCloseButton`)

### F6 — `pr-4` w oknie zależy od położenia X i szyny bez komentarza

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Pattern Consistency
- **Location**: src/components/ui/dialog.tsx:54
- **Detail**: `pr-4` działa, bo pasuje do `right-4` krzyżyka i przesunięcia szyny w `useScrollIndicator.ts`; związek opisuje tylko commit 92202fa.
- **Fix**: Jednozdaniowy komentarz w `dialog.tsx`, najlepiej razem z F2.
- **Decision**: DEFERRED (przeniesione do nowej zmiany `context/changes/touch-targets/`, decyzja użytkowniczki 2026-10-18)
