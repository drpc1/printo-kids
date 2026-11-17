# Zegar (S-41) — Plan Brief

> Full plan: `context/changes/clock-card/plan.md`

## What & Why

Dwunasta karta PrintoKids: tarcze zegara z liczbami 1–12 i wskazówkami. Dziecko odczytuje godzinę (Odczytaj), dorysowuje wskazówki (Dorysuj) albo łączy tarczę z zegarem cyfrowym (Połącz). Rodzic dostaje nową kartę do nauki zegara na właściwym poziomie na żądanie, ten sam problem, który rozwiązują pozostałe karty (PRD US-33, US-34, FR-043, FR-044; issue drpc1/printo-kids#372).

## Starting Point

Jedenaście kart przechodzi tę samą drogę rejestracji; ostatnia, krzyżówka matematyczna (S-40), jest wzorem. Reguły zegara są w PRD, a makieta w skali `mockup.mts` (zaakceptowana 2026-11-16) zawiera losowanie godzin, pory dnia, kąty wskazówek i rozmieszczenie trzech trybów w mm. Ustalenia leżą niezacommitowane na gałęzi, która jest za `main` (święta zmieniły PRD, roadmapę i glosariusz).

## Desired End State

Rodzic otwiera „Zegar” (`/clock`), wybiera Poziom 1–5, tryb i 24 h, generuje i drukuje jedną stronę A4; każda zmiana ustawienia przy pokazanej karcie układa nową kartę. Profil pamięta poziom, tryb i 24 h, katalog pokazuje „poz. N”, okno profilu np. „Zegar: Poziom 4 · Połącz · 24 h”, a „Jak to działa” opisuje kartę.

## Key Decisions Made

| Decision                     | Choice                                                             | Why (1 sentence)                                                                | Source             |
| ---------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------- | ------------------ |
| Tryby, poziomy, 24 h         | Odczytaj/Dorysuj/Połącz; Poziom 1–5; 24 h z porą dnia słowami      | Ustalone z użytkowniczką na interaktywnej makiecie                              | PRD (2026-11-15)   |
| Liczby a wskazówki           | Liczby nad wskazówkami z białą obwódką                             | Długa wskazówka zakrywała „12” i „6”                                            | Makieta 2026-11-16 |
| Pola odpowiedzi              | Dwie kratki 18 × 13 mm z dwukropkiem                               | Wybór użytkowniczki zamiast linii                                               | Makieta 2026-11-16 |
| Minuty nowe dla poziomu      | Od Poziomu 2 co najmniej połowa tarcz                              | Karta Poziomu 2 nie wyjdzie z samych pełnych godzin                             | Makieta 2026-11-16 |
| Godziny po północy przy 24 h | Wykluczone (0:xx)                                                  | Dziecko łatwo wpisze 12:30 albo 24:30 zamiast 0:30                              | Makieta 2026-11-16 |
| Wybór trybu na pasku         | Lista „Tryb: Odczytaj ▾” z opisem, jak Poziom                      | Ten sam wzór co reszta paska i testy e2e; opis mówi, co robi dziecko            | Plan               |
| Podsumowanie w profilu       | „Poziom N · tryb”, „· 24 h” gdy włączone; tryb zawsze              | Tryb zmienia całe zadanie, więc rodzic widzi go zawsze                          | Plan               |
| Nowa karta przy zmianie      | `contentKey` = poziom, tryb, 24 h; wszystkie przez `applySettings` | Wzór waluty w „Kto ma więcej”; karta nie ma ustawień tylko zmieniających wygląd | Plan               |
| Zapis ustawień               | Gałęzie `mode` i `h24` w `fieldValue`                              | Bez nich zapisany tryb i 24 h wracałyby do domyślnych przy każdym wczytaniu     | Plan               |

## Scope

**In scope:** dokumenty na świeżym `main` (PRD, roadmapa, glosariusz, makieta); moduł `src/lib/clock/` z testami i podglądem; rejestracja, strona `/clock`, pasek, arkusz, miniatura, „Jak to działa”, testy e2e; wydruk próbny.

**Out of scope:** tarcza bez liczb, zapis słowny, wskazówka sekundowa, obliczenia zegarowe, „Pokaż rozwiązanie”, kolory, kategorie, przyciski trybu obok siebie, tagi (S-43), przepisanie „Jak to działa” (S-44), Stryker (S-45), `test-plan.md` (S-46).

## Architecture / Approach

Moduł karty za kontraktem kart (`CardSpec`/`CardEngine`): `levels`/`sheet` (tabele i stałe druku), `card` (typ, kąty wskazówek, pora dnia, kody problemów), `generate`, `layout` (mm, margines 10 mm), `engine`. Strona to wyspa React na `CardPage`/`useCardPage`; ustawienia w `CardSettingsMap.zegar` przez `useCardSettings`, każda zmiana przez `remember` + `applySettings`. Arkusz SVG używa wspólnego pasa postaci (`CharacterInstruction`).

## Phases at a Glance

| Phase                       | What it delivers                                              | Key risk                                                      |
| --------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------- |
| 1. Dokumenty                | Ustalenia zegara na `main`, glosariusz, opisy trybów          | Konflikty z PRD/roadmapą po świętach; nie cofnąć ich zmian    |
| 2. Logika karty             | `src/lib/clock/` z testami i podglądem z prawdziwego kodu     | Rozjazd wymiarów z makietą; tekst w SVG na telefonach         |
| 3. Strona, katalog i profil | Karta w katalogu, strona, pasek, profil, „Jak to działa”, e2e | Zapis `mode`/`h24` w profilu; tabele kart w wielu testach e2e |
| 4. Wydruk próbny            | Potwierdzenie na papierze w trzech przeglądarkach iOS         | Wielkość tarczy z 24 h (38–54 mm) i granice pór dnia          |

**Prerequisites:** zaakceptowana makieta (jest); praca na nowych gałęziach z `origin/main`, nie na `claude/new-cards-ideas-a182e7`.
**Estimated effort:** ~3–4 sesje w 4 fazach (faza 4 po scaleniu, krótka).

## Open Risks & Assumptions

- Wymiary tarcz, kratek i zegara cyfrowego są startowe; potwierdza je wydruk (faza 4).
- Granice pór dnia i wykluczenie godzin granicznych to niewiadoma S-41 (Owner: user); zamyka ją wydruk.
- Na Poziomie 2 wpół do może być za trudne (wskazówka godzinowa między liczbami); PRD dopuszcza przesunięcie po wydruku.

## Success Criteria (Summary)

- Rodzic drukuje kartę „Zegar” w każdym trybie, poziomie i z 24 h jako jedną stronę A4, także z telefonu.
- Profil pamięta poziom, tryb i 24 h; katalog i okno profilu pokazują je poprawnie.
- Każda karta ma jedną sprawdzalną odpowiedź przy każdej tarczy, a generator nie pokazuje karty łamiącej reguły.
