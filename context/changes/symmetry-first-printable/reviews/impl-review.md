<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: Karta symetrii na A4 (S-12)

- **Plan**: `context/changes/symmetry-first-printable/plan.md`
- **Scope**: Full plan
- **Reviewed phases**: 1, 2, 3, 4
- **Date**: 2026-10-23
- **Verdict**: APPROVED
- **Findings**: 0 critical, 2 warnings, 3 observations

## Verdicts

| Dimension           | Verdict |
| ------------------- | ------- |
| Plan Adherence      | PASS    |
| Scope Discipline    | PASS    |
| Safety & Quality    | PASS    |
| Architecture        | PASS    |
| Pattern Consistency | WARNING |
| Success Criteria    | WARNING |

Zakres `ba64029..HEAD`. Fazy 1–3 miały osobne przeglądy (`impl-review-phase-{1,2,3}.md`), ich poprawki są w commitach i nie są tu powtarzane. Faza 4 zgodna z kontraktem (wpis w katalogu, miniatura z generatora ze stałym ziarnem i tymi samymi stałymi rysowania, e2e katalogu i telefonu bez `waitForTimeout` i lokatorów CSS). Stan końcowy osiągnięty: katalog → `/symetria` → Generuj → karta → druk, ten sam profil, labirynt bez zmian zachowania. Jedyna zmiana poza listą plików planu (`ProfileCorner.tsx`, `src/lib/sheet/character.ts`) pochodzi z poprawki F1 przeglądu fazy 2 i jest tam opisana. Automatyka teraz: `npm test` 175/175, lint, `npx astro check` 0 błędów, build, e2e 44 zielone / 28 pominięte (WebKit na Windows, testy tylko dla Chromium). Ręczne 1.4, 2.6, 3.5–3.7, 4.5–4.8 potwierdzone przez użytkownika.

## Findings

### F1 — Stałe rysowania kartki skopiowane do skryptu miniatur

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Pattern Consistency
- **Location**: `scripts/build-thumbnails.mjs:99-107`, `src/components/SymmetryGenerator.tsx:10-20`
- **Detail**: Skrypt kopiuje stałe strony, polecenia (tekst, rozmiar, odstęp), grubości siatki, ramki i osi oraz kreskę osi. Gdy ktoś zmieni wygląd kartki w komponencie, miniatura cicho się rozjedzie: żaden test ich nie porównuje. Plan dopuścił lokalne kopie stałych przycisku i strony, ale nie przewidział, że miniatura symetrii będzie powtarzać rysunek.
- **Fix**: Przenieść te stałe do czystego modułu w `src/lib/symmetry/` (importy względne z `.ts`) i importować je w komponencie i skrypcie.
- **Decision**: FIXED — stałe kartki w src/lib/symmetry/sheet.ts, import w SymmetryGenerator.tsx i build-thumbnails.mjs; symetria.svg bajtowo bez zmian

### F2 — E2E nie sprawdzają blokady Generuj ani nowej karty po kliknięciu

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Success Criteria
- **Location**: `tests/e2e/catalog.spec.ts:57-109`
- **Detail**: Test powrotu z profilem sprawdza, że okno otwiera się samo przy dwóch profilach, ale nie że Generuj jest wtedy zablokowany. Żaden test w przeglądarce nie sprawdza, że kolejne Generuj zmienia kartę na ekranie; pokrywa to tylko test jednostkowy generatora, nie przekazanie klucza z komponentu. Oba zachowania potwierdził tylko ręczny test 3.5 i 3.7.
- **Fix**: W teście powrotu dopisać `toBeDisabled()` dla Generuj przed wyborem dziecka i dodać test: dwa kliknięcia Generuj dają różną zawartość kartki „Symetria”.
- **Decision**: FIXED — toBeDisabled() dla Generuj po zamknięciu okna bez wyboru dziecka i test „każde Generuj rysuje inną kartę”; sprawdzian zepsucia czerwony dla obu

### F3 — Wydruk jest ciemnoszary, nie czarny

- **Severity**: OBSERVATION
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Safety & Quality
- **Location**: `src/components/SymmetryGenerator.tsx` (`var(--foreground)`), `src/styles/global.css:8`
- **Detail**: Kartka rysuje kratki i linie tokenem `--foreground` = `oklch(0.329 0.0147 71.555)`, ciemny brązowoszary, a PRD mówi „druk jest czarny”. Labirynt robi tak samo od początku, więc to nie jest regresja tej zmiana, ale karta symetrii ma pełne zamalowane kratki, gdzie odcień jest bardziej widoczny. Miniatura używa czystego `#000`.
- **Fix**: Osobna zmiana dla obu kart: token druku (np. `--print-ink`) albo `print:`-owe nadpisanie na czerń, rozstrzygnięte razem z ręcznym przeglądem przeglądarek (`print-browser-coverage`).
- **Decision**: SKIPPED — użytkownik uznał ciemnoszary druk za wystarczający

### F4 — Podsumowanie przeglądu fazy 2 przeczy jego poprawce

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Adherence
- **Location**: `context/changes/symmetry-first-printable/reviews/impl-review-phase-2.md` (akapit pod tabelą)
- **Detail**: Akapit mówi „`ProfileCorner.tsx` nietknięty”, a poprawka F1 tego samego raportu zmieniła `ProfileCorner.tsx` (wspólne helpery postaci). Ktoś czytający samo podsumowanie dostanie nieprawdę.
- **Fix**: Dopisać w akapicie, że `ProfileCorner.tsx` zmienił się potem tylko przez poprawkę F1 (import helperów, bez zmiany zachowania).
- **Decision**: FIXED — akapit raportu fazy 2 opisuje zmianę ProfileCorner przez F1

### F5 — Hook profilu bez testu jednostkowego

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Success Criteria
- **Location**: `src/hooks/useChildProfileVisit.ts`
- **Detail**: Logika profilu przeniesiona do hooka jest chroniona tylko przez e2e, które w CI nie chodzą. Czyste reguły (`openingVisit`, `visitAfterDelete`) mają testy w `child-profiles.test.ts`; hook to cienka warstwa stanu React.
- **Fix**: Zostawić; jeśli S-14 rozbuduje hook, wynieść czyste przejścia do `src/lib/` z testem.
- **Decision**: ACCEPTED — wróci przy S-14
