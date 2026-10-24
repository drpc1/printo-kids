---
change_id: parent-supplied-maze-image
title: Własny plik rodzica jako postać labiryntu
status: impl_reviewed
created: 2026-10-23
updated: 2026-10-24
archived_at: null
---

## Notes

Dodanie jako postaci swojego pliku. US-02: rodzic wskazuje własny obrazek, obrazek staje przy starcie labiryntu, plik zostaje w przeglądarce i nie idzie na serwer. S-12 zostaje przy Claude. US-02 jest w PRD, a bullet z Parked zszedł. Kamień M-2 nie dostał wiersza `parent-supplied-maze-image`.

## Ustalenia

Ustalone z użytkownikiem 2026-10-23.

- Wskazanie jest wierszem w oknie „Postać”, w tych samych miejscach co katalog: pasek, nowy profil, zapis ulubionej.
- Przyjmujemy JPEG, PNG i WebP. Inny plik, plik większy niż 8 MB albo plik, którego przeglądarka nie zdekoduje, nie podmienia już wybranej postaci.
- W przeglądarce zostaje zmniejszona kopia o dłuższym boku 512 px, obrócona tak, jak zdjęcie widać w galerii. Oryginał nie zostaje.
- Na kartce cały obrazek mieści się w kwadracie 30 mm. Do SVG wchodzi ta kopia, nie adres `blob:`.
- Kopia zostaje między wizytami. Na kartce pojawia się od razu. Do profilu wchodzi dopiero po „Zapisz”. Bez aktywnego profilu zapisuje się jak ostatnia postać. Bajty nie wchodzą w pole `character`.
- Wybór postaci z katalogu albo „Bez postaci” zdejmuje własne zdjęcie z kartki.
- Na nastolatku kartka go nie rysuje, tak jak postaci z katalogu. Issue #54 zostaje osobno.
