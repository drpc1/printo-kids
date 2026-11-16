<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: Świąteczne obiekty w katalogu szablonów (S-38)

- **Plan**: context/changes/christmas-objects/plan.md
- **Scope**: Phase 1 of 5
- **Reviewed phases**: 1
- **Date**: 2026-11-14
- **Verdict**: APPROVED
- **Findings**: 0 critical, 1 warning, 3 observations

Zakres: commit 0c7f3de (`mockup-drawings.json`, `check-mockup.mts`, `render-preview.mts`, `mockup-measure.txt`, 4× `preview-*.png`, Progress w `plan.md`, `change.md`, S-38 → in-progress w roadmapie). Nie zmieniono `src/`.

Weryfikacja: `node --experimental-strip-types context/changes/christmas-objects/check-mockup.mts` z katalogu repo kończy się `RESULT: 0 errors`, a wygenerowany `mockup-measure.txt` jest identyczny z zacommitowanym (diff pusty). Każdy z 6 obiektów ma ≥1 przechodzącą kombinację nonogramu średniego i trudnego (aniołek 6/12 i 12/24, reszta wszystkie); 5 kształtów daje poprawny obrys zwykły i odbity na każdym narysowanym poziomie. Pole `approved` = 2026-11-14.

Zgodność reguł skryptu z `src/`:

- Styk rogiem: `cleanOutline` w skrypcie jest kopią `isCleanOutline` z `templates.test.ts`, a warunek „≥1 czysta kombinacja” odpowiada testowi „some set” (`templates.test.ts:105-115`). Dodatkowy warunek na każdą kombinację (obrys zewnętrzny z wypełnionymi dziurami) jest ostrzejszy niż test, więc poluzowanie względem planu (styk wokół dziur dozwolony) nie obniża poprzeczki tam, gdzie liczy się dla dyktanda.
- Symetria: `composeSymmetryCard` + `symmetryCardProblems` z `generate.ts` (kod produkcyjny, nie kopia). Podpowiedź: skrypt wymaga ≥3 kratek na osi na half4 (zgodne z `pickHints`, `generate.ts:119-127`, które bierze kratki osi z bazy i części).
- Nonogram: produkcyjne `nonogramCardProblems` / `simpleNonogramProblems`, rozmiary z `NONOGRAM_SIZES`.
- Dyktando: obiekty przez `dictationCardFor`; kształty przez `outlineProblems`, `dictationCardFromSilhouette`, `dictationCardProblems`, limit poleceń, odbicie i warunek „lustro to inny obrys” — to te same sprawdzenia co `shapes.test.ts` plus dopasowanie do siatki z wolnym pierścieniem (ostrzejsze).

Odstępstwa od planu (zapisane świadomie) — ocena:

- 6 zamiast 7 obiektów (bez świecy), 5 zamiast 6 kształtów (bez rękawiczki): uzasadnione, plan (Implementation Note fazy 1) wprost pozwala odpaść bez zastępstwa. Zob. F1 — plan nie został jednak zaktualizowany.
- Styk rogiem wokół dziur: uzasadnione (patrz wyżej), rygor dla obrysu zachowany.
- Kolor w częściach zamiast w bazie (bombka, prezent): uzasadnione technicznie (`pickHints` i tak bierze kratki osi z bazy i części, a skrypt to sprawdza).
- Piernik `holeColor: black` zamiast `null` i brak lukru na rękach: zmiana na życzenie użytkowniczki; patrz F1.

## Verdicts

| Dimension           | Verdict |
| ------------------- | ------- |
| Plan Adherence      | WARNING |
| Scope Discipline    | PASS    |
| Safety & Quality    | PASS    |
| Architecture        | PASS    |
| Pattern Consistency | PASS    |
| Success Criteria    | PASS    |

## Findings

### F1 — Plan nie odzwierciedla zatwierdzonej makiety; wejście do faz 3–4 opiera się na notatce poza repo

- **Severity**: ⚠️ WARNING
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Plan Adherence
- **Location**: context/changes/christmas-objects/plan.md:5, 100, 253, 292
- **Detail**: Po akceptacji `plan.md` zmienił się tylko w Progress. Overview („7 nowych obiektów… świeca”, „6 nowych kształtów… rękawiczka”), Phase 1 Contract (piernik „lukier jako białe dziury, `holeColor: null`”), Phase 3 Contract (id `…swieca`), Phase 4 Contract (id `rekawiczka`, „sześć kształtów”, Overview fazy 4) nadal opisują stan sprzed akceptacji. Decyzje (bałwanek/prezent/bombka: kolor w częściach, baza prezentu pusta, bombki z dziur z `holeColor: yellow`, piernik `holeColor: black` z czerwonym uśmiechem, kształty po poziomach) są tylko w komunikacie commita i w notatce `side-session-notes/.../christmas-phase1.md` poza repo. Faza 3/4 implementowana „z planu” przepisze świecę i rękawiczkę albo `holeColor: null` dla piernika; test obecności z fazy 3 ma sprawdzać „zatwierdzone nowe obiekty”, więc lista musi być w repo. Ponadto brak zapisu, że kolor bałwanka/prezentu/bombki jest w `parts`, co zmienia wymóg „≥2 warianty części”.
- **Fix**: Dopisać do `plan.md` krótki addendum „Wynik fazy 1” (6 obiektów, 5 kształtów z poziomami, kategorie, `holeColor` każdego obiektu, decyzja o kolorze w częściach, odpadłe: świeca i rękawiczka) i poprawić Overview oraz kontrakty faz 3–4 (`swieca`, `rekawiczka`); w `mockup-drawings.json` jest już `approved`, więc źródłem rysunków pozostaje on.
  - Strength: Fazy 3–4 mają jedno źródło prawdy w repo; kolejne `/10x-impl-review` porówna z aktualnym planem.
  - Tradeoff: Edycja planu po akceptacji (kilka linii).
  - Confidence: HIGH — rozbieżności widać wprost w tekście planu.
  - Blind spot: Czy użytkowniczka woli zostawić plan nietknięty i trzymać decyzje w change.md; efekt ten sam.
- **Decision**: FIXED — addendum „Wynik fazy 1” oraz poprawione Overview i kontrakty faz 3–4 w plan.md

### F2 — Skrypt nie pilnuje kategorii poza obecnością „boze-narodzenie”

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Adherence
- **Location**: context/changes/christmas-objects/check-mockup.mts:184-191, 288-291
- **Detail**: Plan (po korekcie 2026-11-14: dzwonek NIE jest w budowlach): tylko renifer = `boze-narodzenie`+`zwierzeta`, reszta tylko `boze-narodzenie`. Skrypt sprawdza tylko, że id są znane i że jest `boze-narodzenie`; błędna lub dodatkowa kategoria przeszłaby. Dane w JSON są poprawne po korekcie, więc to luka kontroli, nie błąd.
- **Fix**: Opcjonalnie dodać mapę oczekiwanych kategorii (id → lista) i porównać; albo zostawić, bo fazy 3–4 i tak sprawdzą kategorie testami `templates.test.ts` / `shapes.test.ts`.
- **Decision**: SKIPPED — dane w JSON są poprawne, kategorie pilnują testy z faz 3–4

### F3 — Czarny wydruk prezentu i części bombek niemal się nie różni; „różne obrazki” liczone z kolorem

- **Severity**: 💡 OBSERVATION
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Success Criteria
- **Location**: context/changes/christmas-objects/check-mockup.mts:222-230, preview-4x12.png
- **Detail**: Kontrola „pictures” dodaje kolory kredek do klucza, więc 12 wariantów prezentu to „12 różnych obrazków”, a w czerni (nonogram, czarny „Skopiuj obrazek”, dyktando) widać na podglądzie 2–3 sylwetki (różni się tylko wcięcie u góry); pas i kokardka są kolorowymi kratkami, w czerni niewidoczne (świadomy wybór użytkowniczki). Podobnie bombki 9–11. Dyktando: bombka i prezent mają po 2 obrysy na każdym rozmiarze. Kategoria ma wystarczająco dużo obiektów (≥2 karty testem), więc to ryzyko powtarzalności, nie błąd.
- **Fix**: Zostawić; ewentualnie dopisać do pomiaru liczbę różnych sylwetek (bez koloru) na obiekt/rozmiar, żeby faza 5 ocenała powtórki z wydruku.
- **Decision**: SKIPPED — prezent i bombki zostają jak zatwierdzone; ocena na wydruku w fazie 5

### F4 — Zmiana change.md na impl_reviewed przy fazach 2–5 w toku

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Scope Discipline
- **Location**: context/changes/christmas-objects/change.md
- **Detail**: Skill stamuje `status: impl_reviewed` po każdym przeglądzie, także fazowym; przy 4 niezrobionych fazach status mówi więcej, niż jest prawdą. Niezacommitowany wpis SHA 0c7f3de w Progress 1.1–1.4 zostawiony zgodnie z poleceniem.
- **Fix**: Po wejściu w fazę 2 przywrócić `status: implementing` (zrobi to `/10x-implement`).
- **Decision**: SKIPPED — status wraca do implementing przy wejściu w fazę 2
