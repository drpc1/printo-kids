---
change_id: gh117-sequence-lat7-ambiguity
title: Sekwencje, 7 lat: wiersz czasem ma więcej niż jedną odpowiedź
status: archived
created: 2026-10-30
updated: 2026-10-30
archived_at: 2026-10-30T16:06:06Z
---

## Notes

GitHub issue #117 (bug): https://github.com/drpc1/printo-kids/issues/117

Na poziomie `lat7` (`src/lib/sequence/levels.ts`) część wierszy wygląda, jakby pasowała do nich więcej niż jedna odpowiedź. `sequenceAnswers` w `src/lib/sequence/rules.ts` sprawdza tylko zaprogramowane reguły, a dziecko może widzieć regułę spoza tej listy. Trzeba znaleźć wiersze, które dziś przechodzą sprawdzenie, a na karcie są niejednoznaczne, i poprawić generator albo sprawdzenie. Poziomy 4–6 lat przejrzeć przy okazji tym samym okiem.

## Wyniki (2026-10-30)

- Reguły: `mixed` pokazuje co najmniej 2 liczby; lat7 losuje `mixed`, `down1`, `ABB` (zamiast `groups`); sprawdzenie zna rosnące grupy w wariantach (start od ABB, rośnie A albo B) i okres 5–6 widoczny w całości; dodatkowa luka trafia tylko do reguł, które ją udźwigną (na lat5 nie AAB).
- Pomiar 1000 kart na poziom: 0 kart bez wyniku na lat4–lat7; mediana 0,3–3,7 ms, p99 ≤ 25 ms (lat5).
- Układy luk ABB: 8/10 przy 2 lukach i 6/10 przy 3 lukach przechodzi walidator.
- Oracle w testach jest szerszy niż reguły karty (kroki liczb 1–3, grupy w wariantach, okres 5–6) i zgadza się z walidatorem.
