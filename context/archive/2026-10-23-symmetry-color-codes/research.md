---
date: 2026-10-23T15:30:00+02:00
researcher: Claude (sesja z makietą kolorów)
git_commit: f5fb4fd8b617c3c47f3e5874ade27b701cbbc371
branch: claude/competent-gould-c2ba22
repository: printo-kids
topic: "S-15 symmetry-color-codes: kolory na karcie symetrii, niezależnie od poziomu"
tags: [research, symmetry, templates, colors, print]
status: complete
last_updated: 2026-10-23
last_updated_by: Claude
---

# Research: kolory na karcie symetrii (S-15)

## Research Question

Co w kodzie trzeba zmienić, żeby rodzic mógł niezależnie od poziomu włączyć kolory na karcie symetrii (PRD US-09, FR-018), po decyzjach z makiety z 2026-10-23.

## Decyzje z makiety (użytkownik, 2026-10-23)

Makieta pokazywała litery w kratkach i legendę dla rakiety, robota i truskawki na poziomach 4–7 lat. Użytkownik ją odrzucił na rzecz **prawdziwych kolorów**:

1. **Kolor to kolor, nie litera.** Kratki lewej połowy drukują się w prawdziwych kolorach. Dawna decyzja PRD „druk czarny, kolor literą w kratce, legenda pod kratką” odpada. Pytanie o litery (Z/Ż, Cz) znika razem z nią.
2. **Brak legendy.** Kolor widać wprost; dziecko dorysowuje odbicie i koloruje je kredkami według wzoru. Układ strony (`layout.ts`) zostaje bez zmian.
3. **Detale dziś puste** (okno rakiety, oczy robota, pestki truskawki) **dostają prawdziwy kolor**, tylko przy włączonych kolorach.
4. **Przełącznik „Kolory” stoi na pasku obok przycisku Poziom**, niezależny od poziomu, domyślnie wyłączony (czarna sylwetka jak dziś).
5. **Kolory włączone: kratka podpowiedzi i odpowiedź też mają kolor kratki** (odpowiedź = odbicie wraz z kolorem, już tak liczy `mirrorAnswer`).
6. Margines: z legendą blok 7 lat miał 267 mm z 277 mm; bez legendy zostaje obecne 257 mm (`layout.ts:35`). Nie ma więc nic do mierzenia na A4.

Skutek dla dokumentów: US-09, FR-018, NFR „czarny druk także przy włączonych kolorach”, sekcja Business Logic „Kolory” i roadmapa S-15 muszą zostać poprawione w tej zmianie (patrz Open Questions: druk czarno-biały).

## Summary

Katalog już niesie kolor każdej wypełnionej kratki (`SymmetryCell.color`, `templates.ts:7-11`), generator zachowuje go w `cells`, `hints` i `mirrorAnswer` (`generate.ts:90,111,187`), a walidator sprawdza paletę (`generate.ts:131`). Strona dziś rysuje wszystko jednym `fill="var(--foreground)"` i ignoruje kolor (`SymmetryGenerator.tsx:205-216`). Brakują cztery rzeczy:

1. **Tokeny kolorów** w `global.css` (AGENTS.md zakazuje hexów i palety Tailwinda na stronach; nowy kolor to nowy token).
2. **Kolor detali**: kratki-dziury nie istnieją w danych; są wyłącznie „.” wewnątrz sylwetki.
3. **Stan i przełącznik** na stronie; `src/components/ui` nie ma Switch.
4. **Rysowanie i druk w kolorze**: `fill` z tokenu koloru, `print-color-adjust: exact` na SVG.

Miniatura katalogu (`scripts/build-thumbnails.mjs`) rysuje kartę bez kolorów i zostaje bez zmian.

## Detailed Findings

### Model karty i kolor

- `SYMMETRY_COLORS = red, green, yellow, blue, gray, black` — sześć kolorów w katalogach 4, 5/6 i 7 lat ([templates.ts:3](src/lib/symmetry/templates.ts:3)). Użyte: rakieta r/s/y, robot s/k/y, truskawka r/g (na rysunkach liter `r g y b s k`, `templates.ts:29-36`). Niebieski jest w palecie, ale w żadnym szablonie go nie ma (sprawdzono `templates.ts:63-478`: litera `b` nie występuje w żadnym `drawing`). Okno rakiety i oczy robota mogą być niebieskie bez zmiany palety.
- `composeSymmetryCard` składa `base` + po jednym wariancie każdej części ([generate.ts:74-101](src/lib/symmetry/generate.ts:74)); kolor przechodzi do `cells`. `pickHints` kopiuje kolor kratki osi do podpowiedzi ([generate.ts:104-112](src/lib/symmetry/generate.ts:104)).
- `symmetryCardProblems` sprawdza `unknown-color`, ale nie sprawdza, czy kolor ma sens; kolor nie wpływa na żadną regułę poza równością odpowiedzi i podpowiedzi (`generate.ts:167-175`).
- Odpowiedź (`mirrorAnswer`, [generate.ts:186-188](src/lib/symmetry/generate.ts:186)) już zawiera kolor. PRD wymaga „odbicie razem z kolorem kratki”: spełnione dla kratek sylwetki; kratki detali trzeba dopisać (patrz niżej).

### Detale będące dziś pustymi kratkami

- Szablon mówi to komentarzem: dziury „.” wewnątrz obrysu są częścią kształtu, bo karta drukuje czarną sylwetkę ([templates.ts:60-61](src/lib/symmetry/templates.ts:60)). Przykłady: okno rakiety (część `window`, [templates.ts:90-92](src/lib/symmetry/templates.ts:90)), oczy robota (część `eyes`, `templates.ts:126-129`), pestki truskawki (część `seeds`, pełne „.” w 8 wierszach, `templates.ts:166-172`), a w 7 latach też usta robota i panel piersi.
- **Wariant potrafi zmienić dziurę w kratkę.** Rakieta 4 lat: wariant 0 części `window` to `drawing([])` (kratka (3,4) zostaje pusta), wariant 1 to wypełniona szara kratka ([templates.ts:202-205](src/lib/symmetry/templates.ts:202)). Dane detali muszą więc podążać za wariantem, a nie za szablonem.
- Dwie drogi (rozstrzyga plan):
  - **A. Wykrycie.** Dziura = pusta kratka, której nie osiąga zalanie od zewnątrz ramki na pełnej (odbitej) sylwetce. Kolor z jednego pola `holeColor` szablonu. Mało danych, nie rozjeżdża się z wariantami; makieta (`flood fill`) pokazała, że obejmuje okno, oczy, usta i pestki. Wada: jeden kolor na szablon (usta robota dostaną kolor oczu).
  - **B. Jawne kratki.** Każda część/wariant ma dopisane kratki z flagą (np. `detail: true`), pokazywane tylko przy kolorach. Pełna kontrola koloru, ale ręczny zapis w 12 katalogach (3 obiekty × 4 katalogi, w tym 5/6 lat wspólny) i ryzyko, że wariant „wypełnione okno” dostanie detal na wypełnionej kratce (walidator musi to złapać).
- Oś: detal na kolumnie osi jest dopuszczalny, bo „żadna zamalowana kratka nie leży na osi” dotyczy osi samej (kolumna środkowa nieparzystej siatki), a nie ostatniej kolumny połowy; podpowiedzi 4 lat wybierane są z kratek sylwetki, więc detal nie może być podpowiedzią (do pilnowania w teście: kolor podpowiedzi = kolor kratki).

### Strona i rysowanie

- Wszystkie kratki wzoru i podpowiedzi to jedna grupa `<g fill="var(--foreground)">` ([SymmetryGenerator.tsx:205-216](src/components/SymmetryGenerator.tsx:205)); komentarz w kodzie już zapowiada kolory w S-15 (linia 205). Zmiana: `fill` per kratka z tokenu koloru, gdy `colors === true`; klucz kratki `col,row` zostaje.
- Siatka rysuje się po wypełnieniu, więc linie kratek zostają widoczne na kolorze (`SymmetryGenerator.tsx:217-224`).
- Stan strony: `levelId`, `levelOpen`, `card` żyją w komponencie ([SymmetryGenerator.tsx:29-33](src/components/SymmetryGenerator.tsx:29)). Dodanie `colors` obok jest zgodne z decyzją „stan tylko na stronie; profil w S-14”. Przełączenie kolorów **nie powinno generować nowej karty**: ten sam wzór zmienia tylko rysowanie (inaczej niż zmiana poziomu, która generuje od razu, `SymmetryGenerator.tsx:63-68`).
- Pasek: `SymmetryLevelChoice` stoi w wierszu `flex flex-wrap` razem z `failedNote` ([SymmetryGenerator.tsx:109-112, 133](src/components/SymmetryGenerator.tsx:109)), więc drugi element obok „Poziom” zawinie się na telefonie bez nachodzenia; sprawdza to e2e `phone-layout.spec.ts:95-131`.
- `src/components/ui` ma `button`, `dialog`, `input`, `tooltip`; **nie ma Switch**. Pakiet `radix-ui` ^1.6.7 jest w zależnościach (`package.json:31`), więc `npx shadcn@latest add switch` nie dodaje nowej zależności; alternatywa: `Button` z `aria-pressed`, jak wybór poziomu (`SymmetryLevelChoice.tsx:42`). Wybór komponentu to decyzja planu.

### Tokeny kolorów i druk

- AGENTS.md: strony i komponenty nie dodają hexów ani klas palety; nowy kolor to nowy token w `src/styles/global.css`. Są tylko role (`primary`, `destructive`, `chart-*`), żaden nie jest „czerwony/zielony/żółty”. Potrzeba sześciu tokenów (np. `--symmetry-red` … `--symmetry-black`) w `:root`, użytych jako `var(--symmetry-red)` w SVG, jak dziś `var(--foreground)`.
- Papier to `var(--card)` ([SymmetryGenerator.tsx:193](src/components/SymmetryGenerator.tsx:193)), które w trybie `.dark` jest ciemne (`global.css:61-66`). Kolory kredek mają dobrze wyglądać na białym papierze; czy karta w trybie ciemnym jest dziś drukowana jako ciemna, to istniejące zachowanie spoza S-15. Jeśli token `black` ma być prawdziwą czernią, a `gray` prawdziwym szarym, nie mogą się odwracać w `.dark` (token tylko w `:root`).
- Druk: strona druku chowa wszystko poza SVG i zeruje tło ([GeneratorShell.astro:77-100](src/components/GeneratorShell.astro:77)). Wypełnienia SVG drukują się jako grafika, ale nie ma nigdzie `print-color-adjust`/`color-adjust` (grep po `src` nic nie zwrócił). Dla pewności na iOS Safari i Firefoksie plan powinien dodać `print-color-adjust: exact` na SVG karty i sprawdzić to na wydruku (faza ręczna, jak w S-13).
- Żółty na białym ma niski kontrast; ton tokenu trzeba dobrać na wydruk (ciemniejszy żółty/złoty), inaczej kratka gubi się na papierze.

### Testy, skrypty, dokumenty

- `npm test` wylicza pliki jawnie ([package.json:12](package.json:12)); `generate.test.ts` już zawiera testy palety, szablonów i podpowiedzi (`generate.test.ts:116-119, 151-163, 329`). Nowe testy kolorów można dodać do tego pliku; nowy plik wymaga dopisania do skryptu `test`.
- `print-contract.test.ts` czyta źródło `SymmetryGenerator.tsx` (klasy SVG, `print:hidden`, [print-contract.test.ts:80-103](src/lib/sheet/print-contract.test.ts:80)); dodane `print-color-adjust` na SVG i przełącznik w kontrolkach z `print:hidden` muszą się w nim zmieścić (lista `print:hidden` jest asercją `deepEqual`, więc nowy element z tą klasą zmienia oczekiwaną listę).
- Miniatura katalogu rysuje kartę 5 lat bez kolorów z `SYMMETRY_SHEET` (`scripts/build-thumbnails.mjs:111-114`) i zostaje bez zmian; `sheet.ts` bez zmian (brak legendy).
- Dokumenty do poprawy: `prd.md` (US-09, FR-018, NFR karty symetrii, Business Logic „Kolory”, Open Questions 5/7 niezmienione), `roadmap.md` (S-15 outcome, Unknowns, Risk; S-14 nadal „kolory symetrii jako dodatkowe ustawienie”), `change.md` tytuł zostaje zgodny z ID z roadmapy mimo że „codes” nie opisuje już liter.

## Code References

- `src/lib/symmetry/templates.ts:3-11,29-36,60-61,202-205` — paleta, litery rysunków, uwaga o dziurach, wariant okna 4 lat bez kratki
- `src/lib/symmetry/generate.ts:74-112,119-188` — kompozycja, podpowiedzi, walidator, odpowiedź
- `src/components/SymmetryGenerator.tsx:29-33,63-68,109-112,205-216` — stan strony, pasek, rysowanie czarne
- `src/components/SymmetryLevelChoice.tsx:20-56` — wzór przycisku paska i `aria-pressed`
- `src/styles/global.css:1-66,134-138` — tokeny ról, brak kolorów kredek
- `src/components/GeneratorShell.astro:77-100` — reguły druku
- `src/lib/sheet/print-contract.test.ts:80-103` — kontrakt źródła druku symetrii
- `tests/e2e/phone-layout.spec.ts:95-131` — układ paska na telefonie

## Architecture Insights

- Wzorzec projektu: dane w `levels.ts`/`templates.ts`, generator i walidator czyste i testowane na ręcznych oraklach, strona tylko rysuje. Kolor pasuje do tego: reguły (które kratki mają kolor, jaka jest odpowiedź) w `src/lib/symmetry`, tokeny i rysowanie w komponencie.
- Przełącznik kolorów nie zmienia karty ani klucza; to ustawienie widoku. Odpowiedź z kolorem to funkcja karty i flagi, nie osobne pole.

## Historical Context (from prior changes)

- `context/archive/2026-10-23-symmetry-difficulty-levels/research.md`, `plan.md`, `plan-brief.md` — S-13: poziomy w danych, `hints` jako osobne pole, `layout.ts` bez zmian; „kolory (S-15)” wprost poza zakresem. Format planu i planu-skrótu do naśladowania.
- Roadmapa S-12 Unknowns: „Co z detalami… W trybie kolorów zostałyby białe. Rekomendacja: szablon dostaje kolor dla tych kratek, który działa tylko przy włączonych kolorach” — odpowiada dokładnie drodze A lub B wyżej, decyzja użytkownika „dostają prawdziwy kolor”.

## Related Research

- `context/archive/2026-10-23-symmetry-first-printable/` (S-12) i S-13 powyżej.

## Open Questions

1. **Droga A (wykrywanie dziur + `holeColor`) czy B (jawne kratki detali w wariantach)?** Rekomendacja do planu: A z możliwością nadpisania koloru dla części, bo kolor detalu jest najmniejszą daną; test „każda dziura ma kolor”. Owner: plan.
2. **Które kolory dostają obiekty?** Dziś rakieta r/s/y, robot s/k/y, truskawka r/g; niebieski jest nieużyty. Prawdziwy kolor robota (szary/czarny) i rakiety (szary) może wyglądać mdło; czy zmienić kolory istniejących kratek (np. korpus rakiety), czy zostawić dane. Owner: user, Block: no.
3. **Druk czarno-biały.** Bez liter i legendy kolory na drukarce czarno-białej schodzą do odcieni szarości, a dziecko traci informację, jaki to kolor. Użytkownik wybrał ten kierunek z pełną świadomością (opcja „bez liter i legendy”); NFR „czarny druk” trzeba przeformułować w PRD (kolor tylko przy włączonym przełączniku, domyślnie czarna sylwetka). Owner: user, Block: no.
4. **Przełącznik: Switch z shadcn czy przycisk `aria-pressed`.** Rekomendacja: Switch (`npx shadcn@latest add switch`, bez nowej zależności), podpisany „Kolory”. Owner: plan.
5. **Wydruk kolorowy 7 lat (kratka 10 mm) i żółty/szary na papierze** potwierdza ręczny przegląd wydruku, jak w S-13 (PRD Open Questions 5). Owner: user, Block: no.
