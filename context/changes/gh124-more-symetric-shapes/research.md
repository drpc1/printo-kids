---
date: 2026-10-30T21:09:43+01:00
researcher: Claude (Sonnet 5.5)
git_commit: 9bf1d1b5a2223fba4ab5b78152b3acbdb67f64fb
branch: claude/gh124-symmetric-shapes-bf9a26
repository: printo-kids
topic: "GH #124: więcej wariantów istniejących obiektów symetrii oraz nowe obiekty (kotwica, cukierek, korona)"
tags: [research, symmetry, nonogram, dictation, template-catalog]
status: complete
last_updated: 2026-10-30
last_updated_by: Claude (Sonnet 5.5)
---

# Research: więcej wariantów obiektów i nowe obiekty (kotwica, cukierek, korona)

**Date**: 2026-10-30T21:09:43+01:00 · **Commit**: 9bf1d1b · **Branch**: claude/gh124-symmetric-shapes-bf9a26

## Research Question

Jak dziś zbudowany jest katalog szablonów obiektów, ile wariantów ma każdy obiekt, co ogranicza dodawanie wariantów i nowych obiektów (symetria, nonogram, dyktando) i do której istniejącej kategorii pasują kotwica, cukierek i korona?

## Summary

- Katalog ma 24 obiekty w trzech rozmiarach połowy (`half4`, `half6`, `half9`) w pięciu plikach `src/lib/symmetry/objects/*.ts`. W każdym z 72 szablonów (24 × 3) każda część ma dokładnie 2 warianty (skrypt na `symmetryTemplatesFor` dla `lat4`, `lat5`, `lat7`). Liczba kombinacji na obiekt to 4–16.
- Trzeci wariant części albo nowa część nie wymaga zmian w generatorach: symetria, nonogram i dyktando losują lub wyliczają kombinacje z `part.variants.length` ([symmetry/generate.ts:61](src/lib/symmetry/generate.ts:61), [nonogram/generate.ts:50](src/lib/nonogram/generate.ts:50), [nonogram/generate.ts:107-120](src/lib/nonogram/generate.ts:107), [dictation/generate.ts:113](src/lib/dictation/generate.ts:113)). Test wymaga `>= 2` wariantów części ([symmetry/generate.test.ts:273](src/lib/symmetry/generate.test.ts:273)).
- Nowy wariant jest wart tyle, ile zmienia sylwetkę. Dyktando deduplikuje karty po obrysie ([dictation/generate.ts:116-118](src/lib/dictation/generate.ts:116)), więc wariant zmieniający tylko dziury (okno, oko, pestka) daje nową kartę symetrii i nonogramu, ale nie dyktanda.
- Zmierzona przepustowość: dyktando przepuszcza około połowy kombinacji (np. `choinka` 2 z 8 na lat5, `latarnia` 1 z 4 na lat5, `robot` 2 z 16 na lat7). Nonogram trudny nie ma żadnej przechodzącej kombinacji dla `kot` (0 z 16) i `tulipan` (0 z 8); średni ma `tulipan` 1 z 4. Nowe warianty tych obiektów mogą to poprawić, ale wynik trzeba zmierzyć.
- Kategorie: kotwica pasuje do „Kosmos i maszyny” (statek i łódka dyktanda są tam już) albo „Domy i budowle” (latarnia); cukierek do „Jedzenie”; korona do żadnej z pięciu. PRD zapisuje koronę, cukierek i kotwicę pod kategorią „Kształty” czekającą w GH #198.

## Detailed Findings

### Struktura szablonu

- `SymmetryTemplate`: `id`, `width`, `height`, `base`, `parts[]`, `holeColor`, `categories` ([template-format.ts](src/lib/symmetry/template-format.ts)). `SymmetryPart.variants` to wymienne rysunki; karta używa dokładnie jednego wariantu każdej części.
- Pięć kategorii: `zwierzeta`, `jedzenie`, `przyroda`, `kosmos`, `budowle` (`OBJECT_CATEGORIES`, [template-format.ts:6](src/lib/symmetry/template-format.ts:6)). `categories` to tablica, więc obiekt może należeć do kilku.
- Rysowanie: `drawing(lines, top, left)`, litery kolorów r g y b o s k n. Wzorzec części: rakieta ma `nose`, `window`, `fins` po 2 warianty ([kosmos.ts:8-45](src/lib/symmetry/objects/kosmos.ts:8)).
- Rejestr: `CATALOG = [ZWIERZETA, JEDZENIE, PRZYRODA, KOSMOS, BUDOWLE]` ([templates.ts:30](src/lib/symmetry/templates.ts:30)). Nowy obiekt to wpis w `half4/half6/half9` pliku kategorii, bez zmian w `templates.ts`.

### Inwentarz wariantów (zmierzony)

- 4×12: 2–3 części, 4–8 kombinacji na obiekt. 6×15: 2–3 części, 4–8. 9×24: 3–4 części, 8–16 (16 mają rakieta, robot, sowa, kot, królik).
- Obiekty z 4 kombinacjami na 4×12 i 6×15 (np. gruszka, ananas, tulipan, kaktus, domek, latarnia) są najuboższe.

### Ograniczenia dla nowego wariantu lub obiektu

- Symetria: każdy zestaw wariantów i przesunięcie daje poprawną kartę, a obiekt ma więcej niż jedną kartę ([generate.test.ts:309](src/lib/symmetry/generate.test.ts:309)); różne zestawy wariantów muszą rysować różne kratki ([generate.test.ts:327](src/lib/symmetry/generate.test.ts:327)); 4×12 ma miejsce na 3 podpowiedzi ([generate.test.ts:291](src/lib/symmetry/generate.test.ts:291)); 9×24 ma co najmniej 3 części ([generate.test.ts:302](src/lib/symmetry/generate.test.ts:302)).
- Katalog: te same obiekty i kategorie w każdym rozmiarze; co najmniej 4 obiekty na kategorię w każdym rozmiarze; każdy obiekt poza truskawką ma co najmniej jeden zestaw wariantów z sylwetką w jednym kawałku bez styku rogiem ([templates.test.ts](src/lib/symmetry/templates.test.ts)). Cienkie elementy stykające się rogiem (koniuszki kotwicy, skręcone końce cukierka) łamią to.
- Nonogram: średni wymaga jednego przechodzącego wariantu każdego obiektu; trudny dopuszcza martwe `kot` i `tulipan` ([nonogram/generate.test.ts:122-153](src/lib/nonogram/generate.test.ts:122)). Nowy wariant, który ożywi te obiekty na trudnym, wymaga zmiany listy wyjątków w teście.
- Dyktando: obrys w limicie poleceń poziomu, bez styku i przecięć; limit poleceń grozi bogatym wariantom na lat5 i lat6.

### Przepustowość na commicie 9bf1d1b (zmierzona skryptem)

- Nonogram łatwy: przechodzą wszystkie kombinacje wszystkich 24 obiektów. Średni: wszystkie poza `pingwin` (6 z 8) i `tulipan` (1 z 4). Trudny: wszystkie poza `pingwin` 4 z 8, `ananas` 4 z 8, `kot` 0 z 16, `tulipan` 0 z 8.
- Dyktando (różne przepuszczone obrysy na obiekt): od 1 (`truskawka`, `latarnia` na lat5) do 8 (`rakieta`, `gruszka`, `auto`, `autobus` na lat7).

### Nowe obiekty a kategorie

- PRD, „Karta dyktanda graficznego”: kategoria „Kształty” z figurami geometrycznymi (serce, korona, cukierek, kotwica) czeka w GitHub 198 ([prd.md](context/foundation/prd.md)). Treść GH #198 wymienia serce, gwiazdę, koło, trójkąt, księżyc i chmurkę, bez korony, kotwicy i cukierka.
- GH #124 mówi o nowych wariantach istniejących obrazków („Obiekt zostaje w swojej kategorii”); kotwica i cukierek rozszerzają zakres z tej rozmowy.
- Kotwica: pionowa i symetryczna lewo–prawo. „Kosmos i maszyny” zawiera już statek i łódkę (kształty dyktanda, [shapes.ts](src/lib/dictation/shapes.ts)); „Domy i budowle” ma latarnię.
- Cukierek: „Jedzenie”. Lizak jest pionowy, zgodny z regułą. Cukierek w papierku jest szeroki i niski, jak auto i autobus (wyjątek PRD z GH #118).
- Korona: szeroka, PRD wyklucza ją z listy startowej („Szerokie obiekty (motyl, korona) odpadły”); żadna z pięciu kategorii nie pasuje. Zostaje do #198.

## Code References

- `src/lib/symmetry/template-format.ts` – kategorie, typy szablonu, `drawing()`
- `src/lib/symmetry/templates.ts:30` – rejestr katalogu
- `src/lib/symmetry/objects/kosmos.ts:8-45` – wzorzec obiektu z częściami
- `src/lib/symmetry/generate.ts:61` – losowanie wariantów
- `src/lib/nonogram/generate.ts:107-120` – enumeracja kombinacji
- `src/lib/dictation/generate.ts:113-118` – dedupe po obrysie
- `src/lib/nonogram/generate.test.ts:122-153` – martwe obiekty trudnego nonogramu

## Architecture Insights

- Katalog to czyste dane; generatory są generyczne wobec liczby wariantów i części, więc zmiana to głównie rysowanie (po jednym rysunku na rozmiar) i testy.
- Poprzedni precedens dodania obiektów (GH #118, auto i autobus) szedł z makietą zatwierdzaną przed kodem (`context/archive/2026-10-30-gh118-car-bus/mockup-drawings.json`) i aktualizacją PRD.
- Trzeci wariant mnoży kombinacje (z 2 do 3 na część); dla obiektu z 4 częściami to 81 zamiast 16. Czas pełnej enumeracji w teście trudnego nonogramu (PRD: do 3 s) trzeba zmierzyć po pierwszej partii.

## Historical Context (from prior changes)

- `context/archive/2026-10-25-template-object-catalog/plan.md` – powstanie katalogu, kryteria „pasuje do katalogu”.
- `context/archive/2026-10-30-gh118-car-bus/plan-brief.md` – dodanie dwóch obiektów do istniejącej kategorii, wyjątek od „pionowy”.
- `context/changes/gh115-non-symetric-shapes/` – kształty bez osi tylko w dyktandzie; korona, cukierek i kotwica odłożone do #198.

## Related Research

Brak.

## Open Questions

1. **Zakres nowych obiektów** – wpiąć kotwicę i cukierek w istniejące kategorie teraz (kotwica → Kosmos i maszyny, cukierek lub lizak → Jedzenie) czy zostawić je z koroną do #198? Wpięcie wymaga zmiany zapisu w PRD.
2. **Skala wariantów** – które obiekty i części dostają trzeci wariant. Propozycja z danych: najpierw obiekty z 4 kombinacjami na 4×12 i 6×15 oraz te słabe w nonogramie (`tulipan`, `kot`, `pingwin`, `ananas`) i dyktandzie (`choinka`, `latarnia`, `truskawka`), z wariantami zmieniającymi sylwetkę.
3. **Cukierek: lizak czy w papierku** – papierek wymaga kolejnego wyjątku od „pionowy”.
4. **Czy kotwica jest czytelna w połowie 4×12** bez styku rogiem – do sprawdzenia na makiecie przed kodem.
5. **Czas testu trudnego nonogramu** po zwiększeniu liczby kombinacji.
