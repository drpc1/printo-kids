# Jak to działa po czterech nowych kartach — research

- Strona `src/pages/how-it-works.astro` bierze opisy rodzajów z `CARD_KINDS` (`src/lib/cards.ts`); wszystkie dziesięć wpisów, w tym cztery nowe (pieniadze, niepasuje, kopiuj, szlaczki), ma już `description` z poziomami. Opisy są zgodne z PRD (US-23–US-30).
- Nieaktualna jest tylko sekcja „Poziomy” (tablica `sections`): mówi „karty z trzema poziomami mają łatwy, średni i trudny, z większą liczbą numery” i że wiek mają labirynt, symetria, sekwencje i dyktando, „sudoku i nonogram wieku nie mają”. Nie wymienia, które karty mają które poziomy; po M-5 trzy poziomy mają też „Kto ma więcej?”, „Który nie pasuje”, „Skopiuj rysunek na kratce”, a szlaczki mają Poziom 1–4. Cztery nowe karty nie mają wieku (PRD US-22, Business Logic „Poziomy”).
- Sekcja „Profil dziecka” („poziom, kolory, kategorię i inne”) pozostaje prawdziwa (waluta, linie to „inne”).
- Testy: `tests/e2e/how-it-works.spec.ts` sprawdza nagłówki i frazy (nie „Poziomy”); `src/lib/cards.test.ts` sprawdza niepusty opis.
