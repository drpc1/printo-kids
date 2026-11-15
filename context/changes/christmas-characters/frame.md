# Frame Brief: Świąteczne postacie (S-39)

> Rama przed /10x-plan. Oddziela to, co jest faktycznie do zrobienia, od tego, co założono na początku.
> Kod czytany z `origin/main` (8bf0b00, po S-38); lokalny `main` był 29 commitów za nim.

## Reported Observation

Katalog postaci ma 11 postaci i „Brak”, żadnej świątecznej. Rodzic chce wybrać świąteczną postać (np. Mikołaj, renifer, bałwanek) przy poleceniu na każdej karcie, w oknie profilu jako ulubioną i na labiryncie przy starcie. Postać drukuje się w kolorze jak pozostałe, a lista postaci jest cała widoczna także przy niskiej rozdzielczości (roadmap S-39, issue drpc1/printo-kids#370).

## Initial Framing (preserved)

- **User's stated cause or approach**: trzeba je narysować. Rysunki i prawa do nich są blokadą (roadmap: „Blockers: rysunki w tym samym stylu co jedenaście istniejących”, PRD Open Questions 3).
- **User's proposed direction**: najpierw rama, potem makiety PNG do akceptacji, potem plan i kod; postacie zachowują styl istniejących (dopisek użytkowniczki 2026-11-15).
- **Pre-dispatch narrowing**: cztery pytania z briefu zadane po kolei, odpowiedzi w Narrowing Signals.

## Dimension Map

1. **Rysunki** — plik, styl, marginesy; poza kodem. ← rama wyjściowa
2. **Katalog w kodzie** — czy dopisanie wierszy wystarcza dla paska, profilu, labiryntu i dymku.
3. **Okno dat i zapisana postać** — co dzieje się z ulubioną i ostatnią postacią poza sezonem.
4. **Lista w UI** — czy 15 wierszy mieści się „bez ucięcia” na telefonie.
5. **Liczba 11 w dokumentach i testach** — PRD, glosariusz, test kontraktu.

## Hypothesis Investigation

| Hipoteza | Dowód | Werdykt |
| --- | --- | --- |
| 1. Rysunki są wąskim gardłem | Postać to `public/characters/{id}.webp`, 512×512, z alfą (`file public/characters/*.webp`). Styl: płaska ilustracja, ciepłe płaskie kolory, ciemnobrązowy kontur, prosta sylwetka „chibi”, przezroczyste tło (obejrzane `kot.webp`, `strazak.webp`). Każdy wiersz ma ręcznie zmierzone `contentLeft`/`contentRight` (`src/lib/sheet/character.ts:5-50`), których używa Poziom 6 labiryntu (`WorksheetGenerator.tsx:216`) i dymek (`SpeechBand.tsx:93`). Rysunki powstały z pomocą AI (PRD OQ 3). | STRONG |
| 2. Jedna lista zasila wszystko | `CHARACTER_CHOICES` (`character.ts:3`) daje listę (`ProfileCorner.tsx:645`), `ALLOWED_CHARACTER_IDS` zapisu, `characterSheetSrc` dla labiryntu i dymku. Dopisanie wiersza wystarcza, żeby postać była wszędzie. Nie ma osobnej listy dla profilu. | STRONG (koszt kodu mały) |
| 3. Okno dat dotyka zapisu | `characterChoice` (`character.ts`) zamienia id spoza katalogu na `"none"`. Jeśli postać zniknie z katalogu poza oknem, profil z ulubionym Mikołajem po cichu dostanie „Brak”. Okno dat istnieje w S-38: `CategoryWindow`, `OBJECT_CATEGORIES` (`symmetry/template-format.ts:11-36`), prywatne `inWindow` i `objectCategoryChoicesOn` w `symmetry/templates.ts:78-97`, `useToday` (`src/hooks/useToday.ts`). Funkcja okna jest dziś prywatna w module symetrii. | STRONG |
| 4. Lista się utnie | Lista to pionowa kolumna wierszy 40 px w oknie `max-h-[calc(100dvh-2rem)]` (`ProfileCorner.tsx:339`); S-08 ustalił przewijanie w oknie jako „nie ucięta” (`archive/2026-10-11-full-character-catalog/plan.md:52`). 15 wierszy + „Własny obrazek” mieści się w tym samym mechanizmie. | WEAK (sprawdzić na telefonie, nie przebudowywać) |
| 5. Liczba 11 na sztywno | PRD:41, 113, 612, 712; `glossary.md:61`; `01-domain-distillation.md:50`; `character.test.ts:35`; roadmap Baseline. | STRONG (dokumenty i jeden test) |

## Narrowing Signals

- **Postacie (decyzja 2026-11-15):** Mikołaj, renifer, bałwanek, czyli 3 nowe. Lista w oknie ma 15 wierszy z „Brak” (i „Własny obrazek” pod nimi).
- **Źródło rysunków (decyzja 2026-11-15):** użytkowniczka generuje je sama (AI), tak jak jedenaście istniejących. Po stronie kodu: opis stylu i prompty, pomiar marginesów, makieta PNG z postaciami na karcie i na liście. Prawa ma użytkowniczka (OQ 3). Postacie mają być ogólne: bez Rudolfa z czerwonym nosem i bez wzorów znaków towarowych (np. Mikołaj z reklam napojów).
- **Okno dat (decyzja 2026-11-15):** postacie są na liście tylko 15.11–6.01, tym samym zegarem co kategoria „Boże Narodzenie” z S-38. Poza oknem lista ma znów 11 postaci.
- **Zapisana postać poza oknem (decyzja 2026-11-15):** zostaje. Ulubiony Mikołaj w profilu (i, dla spójności, ostatnio użyta postać bez profilu) dalej działa i jest widoczny po 6.01. Poza oknem nie da się go tylko nowo wybrać z listy. To inaczej niż w kategorii S-38, gdzie kategoria spoza okna czyta się jako „Wszystkie”: postać jest ozdobą, a nie treścią, i zniknięcie ulubionej postaci bez wiedzy rodzica byłoby zaskoczeniem. Postać zostaje więc w katalogu (dozwolone id), a okno filtruje tylko listę wyboru.
- **Powtórki z S-38 (decyzja 2026-11-15):** osobne rysunki. Postać to kolorowa ilustracja, a obiekt bałwanka i kształt renifera to sylwetki na kratce. Nazwa jest wspólna, rzeczy różne, bez łączenia w kodzie i bez zmian w S-38.

## Cross-System Convention

S-08 dodał 8 postaci tak samo: pliki na dysku, wiersze w `CHARACTER_CHOICES`, test kontraktu pilnuje listy i istnienia plików. S-38 ustanowił okno dat jako dane przy pozycji katalogu plus czystą funkcję z datą w argumencie. S-39 łączy oba wzorce. Nowością jest tylko reguła, że okno filtruje listę, a nie dozwolone id.

## Reframed (or Confirmed) Problem Statement

> **The actual problem to plan around is**: trzy nowe rysunki postaci w stylu istniejących, generowane przez użytkowniczkę, plus postać z oknem dat. Okno 15.11–6.01 ukrywa ją na liście wyboru poza sezonem, ale zostawia ją w katalogu, więc zapisana ulubiona albo ostatnia postać nie znika.

Rama wyjściowa („trzeba je narysować”) się trzyma: rysunki są blokadą, a kod katalogu to kilka wierszy. Dochodzi jedno, czego rama nie nazwała. Okno dat na postaci zachowuje się odwrotnie niż na kategorii z S-38: kategoria spoza okna jest czytana jako „Wszystkie”, a postać spoza okna zostaje. Do tego funkcję okna trzeba wyjąć z modułu symetrii, żeby postacie z niej korzystały.

## Confidence

**HIGH**: mechanizm (jedna lista, okno z S-38, przewijana lista z S-08) i decyzje użytkowniczki są jednoznaczne. Ryzyko leży poza kodem: czy wygenerowane rysunki będą w tym samym stylu. Rozstrzyga to makieta PNG przed kodem.

## What Changes for /10x-plan

Plan zaczyna się od fazy rysunków bez kodu: opis stylu i prompty, trzy pliki webp 512×512 od użytkowniczki, pomiar `contentLeft/Right` i makieta PNG (postać przy poleceniu, przy starcie Poziomu 6 labiryntu, lista 15 wierszy na telefonie) do akceptacji. Potem kod:
- pole okna przy wierszu postaci;
- wspólna funkcja okna, wyjęta z `symmetry/templates.ts`;
- lista wyboru filtrowana datą, przy czym aktualnie wybrana postać spoza okna nadal ma swój wiersz;
- dozwolone id bez zmian.

Na końcu dokumenty: PRD US-03, FR-012, Business Logic, OQ 3, glosariusz z pojęciem „postać z oknem dat”, distillation i test kontraktu.

## References

- `src/lib/sheet/character.ts:3-125` — katalog, marginesy, `characterChoice`, `ALLOWED_CHARACTER_IDS`
- `src/components/ProfileCorner.tsx:339,645` — okno z limitem wysokości, wiersze listy
- `src/components/WorksheetGenerator.tsx:216`, `src/components/SpeechBand.tsx:93` — użycie marginesów
- `src/lib/symmetry/template-format.ts:11-36`, `src/lib/symmetry/templates.ts:78-97`, `src/hooks/useToday.ts` — okno dat S-38
- `src/lib/sheet/character.test.ts:35` — test „eleven characters”
- `context/changes/christmas-objects/frame.md` (origin/main) — Mikołaj odesłany do S-39, bałwanek i renifer w S-38
- `context/archive/2026-10-11-full-character-catalog/plan.md:52` — przewijana lista jako „nie ucięta”
