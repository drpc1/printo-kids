# Cienie (S-47) — Plan Brief

> Full plan: `context/changes/shadows-card/plan.md`

## What & Why

Szesnasta karta: „Cienie” (`/shadows`). Po lewej kolorowe obrazki, po prawej ich czarne cienie w innej kolejności; dziecko łączy kreską obrazek z jego cieniem. Trudność rośnie z podobieństwa obrazków. Kolejna karta na właściwym poziomie na żądanie (M-7).

## Starting Point

Katalog ma piętnaście kart; wzorem kodu jest „Od najmniejszego” (losowanie bez solvera, rytm faz). PRD (US-41/42, FR-051/052) i makieta v2 z 14 przykładowymi rysunkami są na `main` (PR #440). Własnego katalogu obrazków jeszcze nie ma — to największa część pracy.

## Desired End State

Rodzic wybiera z katalogu „Cienie”, ustawia poziom (łatwy / średni / trudny), generuje i drukuje jedną stronę A4, także z telefonu. Katalog ma ok. 80 zaakceptowanych rysunków w 12 rodzinach, a test pilnuje, że cienie wyraźnie się różnią. Profil pamięta poziom, katalog pokazuje plakietkę, „Jak to działa” opisuje kartę.

## Key Decisions Made

| Decision         | Choice                                                                                                                   | Why                                                     | Source |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------- | ------ |
| Obrazki          | Własne rysunki wektorowe, prawdziwe uproszczone kolory, ok. 80 w 12 rodzinach                                            | Pikselowe sylwetki źle wyglądały                        | PRD    |
| Poziomy          | łatwy 4 pary z różnych rodzin, średni 5 z rodziny `rozne`, trudny 6 z rodziny `warianty`                                 | Trudność z podobieństwa, nie z liczby par               | PRD    |
| Rodziny          | 6 `warianty` (kubki, domki, ryby, auta, drzewa, klucze) + 6 `rozne` (owoce, warzywa, zwierzęta, ptaki, ubrania, zabawki) | Trudny i średni nie powtarzają się szybko               | Plan   |
| Zatwierdzanie    | Cały katalog w fazie 1 z arkuszem „obrazek + cień”, akceptacja przed logiką karty                                        | Poprawki rysunków zanim powstanie reszta                | Plan   |
| Rozróżnialność   | Maska cienia 64×64, test: każda para w katalogu różni się ≥ progu (wstępnie 8%)                                          | Gwarancja w katalogu; generator bez rasteryzacji wyboru | Plan   |
| Kolory           | Tokeny `--picture-*` w `global.css`; bez przełącznika                                                                    | Zakaz hexów w widokach; czarny obrazek byłby cieniem    | Plan   |
| `contentKey`     | Tylko poziom                                                                                                             | Jedyna kontrolka paska                                  | Plan   |
| Domyślny poziom  | Łatwy; bez „Pokaż rozwiązanie” (w PRD, do zmiany)                                                                        | Najprostszy start; parę widać na kartce                 | PRD    |
| Nazwy techniczne | id `cienie`, `/shadows`, `src/lib/shadows/`                                                                              | Wzór `odnajmniejszego` i `/size-order`                  | Plan   |
| Fazy             | Katalog, logika, strona, wydruk; `/10x-impl-review` przed PR każdej fazy                                                 | Reguła repo                                             | Plan   |

## Scope

**In scope:** katalog rysunków i paleta, maska cienia, logika i generator, układ A4, strona, pasek, arkusz SVG, miniatura, profil, „Jak to działa”, testy jednostkowe i e2e, wydruk próbny.

**Out of scope:** kategorie, przełącznik kolorów, „Pokaż rozwiązanie”, obrazki rastrowe, sylwetki z szablonów, ocena kresek, Stryker (S-50), tagi (S-43).

## Architecture / Approach

Moduł `src/lib/shadows/` (`picture-format`, `pictures/*`, `families`, `raster`, `levels`, `sheet`, `card`, `generate`, `layout`, `engine`) podłączony do kontraktu kart; `ShadowsGenerator` na `CardPage`, arkusz SVG z układu w mm, obrazki z kształtów w kolorach tokenów, cienie z tych samych kształtów bez detali.

## Phases at a Glance

| Phase                       | What it delivers                                  | Key risk                                        |
| --------------------------- | ------------------------------------------------- | ----------------------------------------------- |
| 1. Katalog rysunków         | ~80 rysunków, paleta, maska cienia, arkusz, testy | Warianty, których cienie różnią się wyraźnie    |
| 2. Logika karty             | Poziomy, generator, układ, silnik, podgląd z kodu | Próg różnicy cieni a reguła karty               |
| 3. Strona, katalog i profil | `/shadows`, rejestry, miniatura, e2e              | Kolory z tokenów w stronie i w miniaturze       |
| 4. Wydruk próbny            | Poprawki, zamknięcie Open Questions 21            | Warianty rozróżnialne na czarno-białej drukarce |

Prerequisites: PR #440 na `main` (jest). Estimated effort: większy niż „Od najmniejszego” przez katalog rysunków (faza 1 największa); fazy 1–3 w osobnych PR-ach, faza 4 po scaleniu.
