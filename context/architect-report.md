---
title: Raport architektoniczny — moduł 4 (10xArchitect), PrintoKids
created: 2026-11-03
type: architect-report
---

# Raport architektoniczny: PrintoKids (moduł 4)

Raport opiera się na artefaktach L2–L5 (D01–D03 = `context/domain/01…03`). 

## 1. Opisane projekty

**printo-kids** (L2–L5): Astro 7 SSR (Cloudflare Workers), React 19, TypeScript, Tailwind 4; bez backendu, dane w `localStorage`. Ok. 6 tygodni historii, 257 commitów kodu produktu, jeden autor; 188 modułów TS, 0 cykli; 7 rodzajów kart w kodzie; projekt jest w fazie rozwoju, następny etap to 10 kart (zakres PRD), potem kolejne. Ok. 13 900 linii w `src` (pomiar spoza artefaktów, z Cursora, niezweryfikowany).

## 2. Mapa projektu (L2)

1. **Strefa ryzyka nr 1: profil dziecka.** 21% poprawek w piątce najaktywniejszych obszarów (12 z 58 commitów), trend rosnący. `card-settings.ts` zbiera poziomy kart, `ProfileCorner.tsx` ma stożek 31 modułów.
2. **`localStorage` jest poza grafem importów.** Wołają go wprost 6 plików TS/TSX i `CardCatalog.astro`; cruiser tej krawędzi nie widzi.
3. **Lokalne centra:** `symmetry/templates.ts` (20 importerów, także dyktando i nonogram) oraz druk A4 + labirynt (24 commity).
4. **Entry pointy:** `cards.ts` (`CARD_KINDS`), `pages/index.astro`, `CardPage.tsx`, `GeneratorShell.astro`.
5. **Unknowns:** warstwa `.astro`, CSS i SVG poza grafem; skutek zmiany szablonów symetrii na wydruk; brak danych z recenzji PR.

## 3. Analiza ficzera (L3)

**Przepływ:** zapis i odczyt ustawień kart oraz ulubionej postaci profilu (strefa ryzyka nr 1, pkt 1–2).

**Overview.** Przy otwarciu strony `useChildProfileVisit` czyta cztery klucze `localStorage`. `useCardSettings.persist` przy aktywnym profilu robi odczyt-modyfikację-zapis listy profili, bez profilu zapisuje `last-used`; ulubioną zapisują osobno `useFavoriteCharacter` i `ProfileCorner`. Wynik wraca do paska, notatki „Zapamiętane dla {imię}” i miniatur katalogu.

**Dług techniczny:**
- **TD-1 (potwierdzone ast-grepem).** `writeChildProfiles` ma 5 wywołań w kodzie nietestowym, tylko 3 poprzedza świeży odczyt. Usuwanie (`ProfileCorner.tsx:187`) i tworzenie profilu (`:300`) zapisują listę ze stanu Reacta, więc stara zakładka może cofnąć zmianę z innej. Nie sprawdzono w przeglądarce.
- **TD-3.** Porażka zapisu (kwota, zablokowany storage) przy ustawieniach karty jest cicha i nietestowana.
- **TD-6/TD-12.** Logika paska postaci zduplikowana między labiryntem a `useBarCharacter`; skrypt `test` wylicza pliki ręcznie i po cichu pominął `analytics.test.ts`. Nowa karta to 12 miejsc zmian.

## 4. Plan refaktoryzacji (L4)

**Co.** Jedna funkcja `updateProfiles` w `src/lib/child-profiles.ts` (świeży odczyt → transformacja → zapis → `{ok}`) dla wszystkich 5 zapisów profili, widoczny komunikat o porażce zapisu i strażnik rejestru kart. Format danych bez zmian.

**Nie robimy:** labiryntu na `useCardPage`, scalenia writerów `last-used`, migracji `level`, nasłuchu `storage`, rozbicia `ProfileCorner.tsx`, reguły ESLint na `localStorage`, nowych zależności testowych.

**Fazy** (osobne commity):
1. Naprawa skryptu `test`, strażnik `summaryParts`. Auto: `npm test`, lint, depcruise, build.
2. `updateProfiles` bez wołających, testy na `memoryStorage`. Auto.
3. Przepięcie 5 zapisów + e2e dwóch zakładek (TD-1). Auto: e2e; ręcznie: dwie zakładki.
4. Komunikat o porażce zapisu i zdanie w PRD (US-22). Auto: e2e + smoke; ręcznie: telefon.

Wdrożenia brak (pola `Progress` nieodznaczone). Priorytet: plan wart wykonania, ale po D02 (sekcja 6); wyjątek to faza 1 (skrypt `test`), bo D02 dopisuje nowe testy do tej samej listy, więc najlepiej przed D02 albo razem z nim. Strażnik rejestru kart z L4 częściowo pokrywa się z `CARD_ENGINES` z D02, więc po D02 może być zbędny.

## 5. Domena wg DDD (L5)

**Język (D01):** *rodzaj karty* vs *karta*; *poziom* (per karta, bez wspólnej skali); *profil dziecka* z *ulubioną postacią*; *ostatnie parametry*; *jedna sprawdzalna odpowiedź*. Rozjazdy:
- **R-8:** analityka Cloudflare na produkcji, a PRD i `AGENTS.md` mówią „dane nie opuszczają urządzenia”.
- **R-4:** przy ≥2 profilach Generuj jest zablokowane, PRD milczy.
- **Nazewnictwo:** `lat5` to cztery różne poziomy w różnych kartach, „kształt” ma 4 znaczenia.

**Niezmiennik #1 (D02):** każda karta ma odpowiedź, którą aplikacja zna i sprawdza; karta łamiąca regułę swojego rodzaju nie jest pokazana. **Agregat:** `VerifiedCard<C>` + rejestr `CARD_ENGINES` wymuszony kompilatorem. Dziś 6 z 7 kart ma `*Problems`, labirynt nie. Sonda przyjęła 5 z 5 zmutowanych labiryntów; to luka strażnika, nie dowód zepsutych kartek.

**ACL (D03):** przecieka **Web Storage** przez **4 warstwy**: 36 wywołań w 7 plikach, 4 zduplikowane interfejsy `*Storage`, klucze `printo-kids:*` w 10 specach e2e, reguła „czytaj tuż przed zapisem” w 3 kopiach. Żaden dokument nie deklaruje wymienialności magazynu, więc to raczej konsolidacja niż klasyczny ACL.

**Zależności planów:** `updateProfiles` (L4) naprawia TD-1 bez portu z D03; D02 i D03 są większe i niewdrożone.

## 6. Decyzje, które należą do mnie
Agenci w kilku miejscach podpowiadali mi, że powinnam się skupić na profilach, bo tam było sporo poprawek, bo wszystkie karty z tego korzystają, bo są tam jakieś wycieki i błędy, ale prawda jest taka, że to nie jest krytyczna funkcjonalność i bez działających profili strona dalej jest funkcjonalna. Najważniejszą wartością są prawidłowo wygenerowane wszystkie karty - aktualne i przyszłe, które już są w drodze (a nie tylko labirynt jak podpowiadało AI na którymś etapie, bo było pierwszą kartą MVP). Sugestie o przerobienie profili, żeby były przenaszalne pomiędzy urządzeniami też odrzuciłam, bo typowy flow ma być szybki - użytkownik wchodzi na strone, wybiera karte, generuje (opcjonalnie zmienia dostepne parametry) i drukuje. Żadnego logowania. Dodatkową zaletą aktualnego rozwiazania jest to, że postacie własne zostają na urządzeniu użytkownika i nie generują u nas ryzyk związanych z RODO czy prawami autorskimi.