---
change_id: refactor-opportunities
title: Które długi techniczne ustawień kart warto naprawić i w jakiej kolejności
status: implemented
created: 2026-11-03
updated: 2026-11-08
archived_at: null
---

## Notes

Intencja: mamy analizę tego repozytorium, która dokumentuje dług techniczny
i ryzyka strukturalne: context/changes/profile-settings-flow/research.md. Ta zmiana odpowiada na pytanie, które tamta analiza celowo zostawiła otwarte:
KTÓRE z tych problemów warto naprawić, w jakim docelowym kształcie i w jakiej kolejności. Eksplorujemy każdy zapisany problem w kodzie i historii, a potem porządkujemy je jako refactor opportunities.
Zmiana przebiega etapami: eksploracja → decyzja i plan → implementacja. Na etapie eksploracji nie dzieje się żaden refaktor i nie zapada żadna decyzja.
Wynik eksploracji: research.md tej zmiany, zakończony rankingiem opcji z trade-offami. Najpierw przeczytam raport; decyzja, co realizujemy, zapada na etapie planowania, a refaktor rusza dopiero według przyjętego planu.

Issue: [#284](https://github.com/drpc1/printo-kids/issues/284) (zapis profili: updateProfiles i cichy błąd zapisu); powiązane [#280](https://github.com/drpc1/printo-kids/issues/280) (zamknięte).
